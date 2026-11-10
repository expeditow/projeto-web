import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Canal from '#models/canal'
import Video from '#models/video'
import Tag from '#models/tag'
import Registro from '#models/registro'
import Review from '#models/review'
import Comentario from '#models/comentario'
import Lista from '#models/lista'

/**
 * Smoke test das relações do ER. Roda em transação global (rollback no fim),
 * então não suja o banco. Requer as migrations já aplicadas (node ace migration:run).
 */
test.group('Modelos e relações', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  async function cenario() {
    const ana = await User.create({ nome: 'Ana', email: 'ana@teste.com', password: 'senha1234' })
    const beto = await User.create({ nome: 'Beto', email: 'beto@teste.com', password: 'senha1234' })
    const canal = await Canal.create({ youtubeId: 'UC_canal', nome: 'Canal Teste' })
    const video = await Video.create({
      youtubeId: 'abc123',
      titulo: 'Vídeo Teste',
      canalId: canal.id,
      publicadoPor: ana.id,
    })
    return { ana, beto, canal, video }
  }

  test('canal tem vídeos e vídeo tem canal e publicador', async ({ assert }) => {
    const { ana, canal, video } = await cenario()
    await canal.load('videos')
    assert.equal(canal.videos.length, 1)
    await video.load('canal')
    await video.load('publicador')
    assert.equal(video.canal.nome, 'Canal Teste')
    assert.equal(video.publicador.id, ana.id)
  })

  test('registro → review (0..1) → comentário + curtida', async ({ assert }) => {
    const { ana, beto, video } = await cenario()
    const registro = await Registro.create({ userId: ana.id, videoId: video.id, nota: 4 })
    const review = await Review.create({ registroId: registro.id, texto: 'Muito bom' })
    await Comentario.create({ userId: beto.id, reviewId: review.id, texto: 'Concordo' })
    await beto.related('reviewsCurtidas').attach([review.id])

    await registro.load('review')
    assert.equal(registro.review.texto, 'Muito bom')
    await review.load('comentarios')
    await review.load('curtidores')
    assert.equal(review.comentarios.length, 1)
    assert.equal(review.curtidores[0].id, beto.id)
  })

  test('rewatch: mesmo usuário, mesmo vídeo, dois registros', async ({ assert }) => {
    const { ana, video } = await cenario()
    await Registro.createMany([
      { userId: ana.id, videoId: video.id, nota: 3 },
      { userId: ana.id, videoId: video.id, nota: 5 },
    ])
    await ana.load('registros')
    assert.equal(ana.registros.length, 2)
  })

  test('seguir: seguindo / seguidores e amizade (follow mútuo)', async ({ assert }) => {
    const { ana, beto } = await cenario()
    await ana.related('seguindo').attach([beto.id])
    await beto.related('seguindo').attach([ana.id])
    await ana.load('seguindo')
    await ana.load('seguidores')
    assert.equal(ana.seguindo[0].id, beto.id)
    assert.equal(ana.seguidores[0].id, beto.id)
  })

  test('tags, interação (curtiu + momento), favoritos, watchlist e listas', async ({ assert }) => {
    const { ana, video } = await cenario()
    const tag = await Tag.create({ nome: 'humor' })
    await video.related('tags').attach([tag.id])
    await ana.related('interacoes').attach({ [video.id]: { curtiu: true, momento_segundos: 42 } })
    await ana.related('favoritos').attach({ [video.id]: { posicao: 1 } })
    await ana.related('watchlist').attach([video.id])
    const lista = await Lista.create({ userId: ana.id, titulo: 'Melhores' })
    await lista.related('videos').attach({ [video.id]: { ordem: 1 } })

    await video.load('tags')
    assert.equal(video.tags[0].nome, 'humor')
    await ana.load('interacoes')
    assert.equal(ana.interacoes[0].$extras.pivot_momento_segundos, 42)
    await ana.load('favoritos')
    assert.equal(ana.favoritos[0].$extras.pivot_posicao, 1)
    await ana.load('watchlist')
    assert.equal(ana.watchlist.length, 1)
    await lista.load('videos')
    assert.equal(lista.videos[0].$extras.pivot_ordem, 1)
  })
})
