import Canal from '#models/canal'
import User from '#models/user'
import Video from '#models/video'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

/**
 * Cria `total` vídeos de um mesmo canal e publicador; o último criado é o mais recente.
 */
async function criarVideos(total: number, publicador: User) {
  const canal = await Canal.create({ youtubeId: '@CanalAdmin', nome: 'Canal Admin' })
  const base = DateTime.now().minus({ days: total })
  for (let i = 1; i <= total; i++) {
    await Video.create({
      youtubeId: `vid${String(i).padStart(8, '0')}`,
      titulo: `Vídeo ${i}`,
      canalId: canal.id,
      publicadoPor: publicador.id,
      createdAt: base.plus({ days: i }),
    })
  }
}

/** Links de vídeo da tabela: um por linha */
const linhas = (html: string) => html.match(/href="\/videos\/\d+"/g) ?? []

test.group('Admin: listar vídeos (T07)', (group) => {
  // A suíte unit não sobe o servidor HTTP: este arquivo faz requisições, então sobe aqui
  group.setup(() => testUtils.httpServer().start())
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('não logado vai para o login', async ({ client }) => {
    const resposta = await client.get('/admin/videos').redirects(0)
    resposta.assertStatus(302)
    resposta.assertHeader('location', '/login')
  })

  test('logado sem ser admin recebe 403', async ({ client }) => {
    const user = await User.create({
      nome: 'Comum',
      email: 'comum@teste.com',
      password: 'senha12345',
    })

    const resposta = await client.get('/admin/videos').loginAs(user)
    resposta.assertStatus(403)
    resposta.assertTextIncludes('Acesso negado')
  })

  test('admin vê a lista com canal e quem publicou', async ({ client }) => {
    const admin = await User.create({
      nome: 'Ana Admin',
      email: 'admin@teste.com',
      password: 'senha12345',
      papel: 'admin',
    })
    await criarVideos(2, admin)

    const resposta = await client.get('/admin/videos').loginAs(admin)
    resposta.assertStatus(200)
    resposta.assertTextIncludes('Vídeo 2')
    resposta.assertTextIncludes('Canal Admin')
    resposta.assertTextIncludes('Ana Admin')

    const video = await Video.findByOrFail('titulo', 'Vídeo 1')
    resposta.assertTextIncludes(`/videos/${video.id}`)
  })

  test('pagina de 20 em 20, mais recentes primeiro', async ({ client, assert }) => {
    const admin = await User.create({
      nome: 'Ana Admin',
      email: 'admin@teste.com',
      password: 'senha12345',
      papel: 'admin',
    })
    await criarVideos(21, admin)

    const pagina1 = await client.get('/admin/videos').loginAs(admin)
    pagina1.assertStatus(200)
    assert.lengthOf(linhas(pagina1.text()), 20)
    assert.include(pagina1.text(), 'Vídeo 21')
    assert.include(pagina1.text(), '/admin/videos?page=2')

    const pagina2 = await client.get('/admin/videos?page=2').loginAs(admin)
    pagina2.assertStatus(200)
    assert.lengthOf(linhas(pagina2.text()), 1)
    assert.match(pagina2.text(), /Vídeo 1\s*</)
    assert.notInclude(pagina2.text(), 'Vídeo 21')
  })
})
