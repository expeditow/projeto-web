import Canal from '#models/canal'
import User from '#models/user'
import Video from '#models/video'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function criarUsuario() {
  return User.create({ nome: 'Bia', email: 'bia@teste.com', password: 'senha12345' })
}

async function criarVideos(titulos: string[], publicador: User) {
  const canal = await Canal.create({ youtubeId: '@CanalBusca', nome: 'Canal Busca' })
  const base = DateTime.now().minus({ days: titulos.length })
  for (const [i, titulo] of titulos.entries()) {
    await Video.create({
      youtubeId: `bus${String(i).padStart(8, '0')}`,
      titulo,
      canalId: canal.id,
      publicadoPor: publicador.id,
      createdAt: base.plus({ days: i + 1 }),
    })
  }
}

const linhas = (html: string) => html.match(/href="\/videos\/\d+"/g) ?? []

test.group('Buscar vídeos (T10)', (group) => {
  group.setup(() => testUtils.httpServer().start())
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('não logado vai para o login', async ({ client }) => {
    const resposta = await client.get('/videos').redirects(0)
    resposta.assertStatus(302)
    resposta.assertHeader('location', '/login')
  })

  test('/videos/novo continua funcionando', async ({ client }) => {
    const user = await criarUsuario()
    const resposta = await client.get('/videos/novo').loginAs(user)
    resposta.assertStatus(200)
    resposta.assertTextIncludes('Enviar vídeo')
  })

  test('encontra por parte do título sem diferenciar maiúscula', async ({ client, assert }) => {
    const user = await criarUsuario()
    await criarVideos(['Aprendendo TypeScript', 'Receita de bolo'], user)

    const resposta = await client.get('/videos').qs({ q: 'typescr' }).loginAs(user)
    resposta.assertStatus(200)
    resposta.assertTextIncludes('Aprendendo TypeScript')
    resposta.assertTextIncludes('Canal Busca')
    assert.notInclude(resposta.text(), 'Receita de bolo')
    assert.lengthOf(linhas(resposta.text()), 1)
  })

  test('% e _ não viram curinga', async ({ client, assert }) => {
    const user = await criarUsuario()
    await criarVideos(['100% grátis', '100 reais', 'a_b', 'axb'], user)

    const pct = await client.get('/videos').qs({ q: '100%' }).loginAs(user)
    assert.include(pct.text(), '100% grátis')
    assert.notInclude(pct.text(), '100 reais')

    const und = await client.get('/videos').qs({ q: 'a_b' }).loginAs(user)
    assert.lengthOf(linhas(und.text()), 1)
    assert.notInclude(und.text(), 'axb')
  })

  test('sem resultado mostra a mensagem', async ({ client }) => {
    const user = await criarUsuario()
    await criarVideos(['Algo'], user)
    const resposta = await client.get('/videos').qs({ q: 'zzz' }).loginAs(user)
    resposta.assertStatus(200)
    resposta.assertTextIncludes('Nenhum vídeo encontrado')
    resposta.assertTextIncludes('0 resultados')
  })

  test('paginação mantém o q', async ({ client, assert }) => {
    const user = await criarUsuario()
    await criarVideos(
      [...Array.from({ length: 21 }, (_, i) => `Gato ${i + 1}`), 'Cachorro'],
      user
    )

    const p1 = await client.get('/videos').qs({ q: 'gato' }).loginAs(user)
    assert.lengthOf(linhas(p1.text()), 20)
    assert.include(p1.text(), '21 resultados')
    assert.match(p1.text(), /\/videos\?(q=gato&(amp;)?page=2|page=2&(amp;)?q=gato)/)

    const p2 = await client.get('/videos').qs({ q: 'gato', page: 2 }).loginAs(user)
    assert.lengthOf(linhas(p2.text()), 1)
    assert.match(p2.text(), /Gato 1\s*</)
  })
})
