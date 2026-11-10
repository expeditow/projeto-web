import Canal from '#models/canal'
import User from '#models/user'
import Video from '#models/video'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

async function criarVideo() {
  const user = await User.create({ nome: 'Pub', email: 'pub@teste.com', password: 'senha12345' })
  const canal = await Canal.create({ youtubeId: '@CanalDet', nome: 'Canal Detalhe' })
  const video = await Video.create({
    youtubeId: 'abcdefghijk',
    titulo: 'Vídeo Detalhe',
    canalId: canal.id,
    publicadoPor: user.id,
  })
  return { user, video }
}

test.group('Detalhe do vídeo (T08)', (group) => {
  group.setup(() => testUtils.httpServer().start())
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('não logado vai para o login', async ({ client }) => {
    const { video } = await criarVideo()
    const resposta = await client.get(`/videos/${video.id}`).redirects(0)
    resposta.assertStatus(302)
    resposta.assertHeader('location', '/login')
  })

  test('vídeo existente mostra o player e os metadados', async ({ client }) => {
    const { user, video } = await criarVideo()
    const resposta = await client.get(`/videos/${video.id}`).loginAs(user)
    resposta.assertStatus(200)
    resposta.assertTextIncludes('src="https://www.youtube.com/embed/abcdefghijk"')
    resposta.assertTextIncludes('Canal Detalhe')
    resposta.assertTextIncludes('Pub')
    resposta.assertTextIncludes('Em breve')
  })

  test('vídeo inexistente dá 404', async ({ client }) => {
    const { user } = await criarVideo()
    const resposta = await client.get('/videos/999999').loginAs(user)
    resposta.assertStatus(404)
  })
})
