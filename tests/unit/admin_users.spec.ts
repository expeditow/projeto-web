import Canal from '#models/canal'
import User from '#models/user'
import Video from '#models/video'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

/** Linhas de usuário da tabela */
const linhas = (html: string) => html.match(/data-user-row/g) ?? []

async function criarAdmin() {
  return User.create({
    nome: 'Ana Admin',
    email: 'admin@teste.com',
    password: 'senha12345',
    papel: 'admin',
  })
}

test.group('Admin: listar usuários (T06)', (group) => {
  group.setup(() => testUtils.httpServer().start())
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('não logado vai para o login', async ({ client }) => {
    const resposta = await client.get('/admin/usuarios').redirects(0)
    resposta.assertStatus(302)
    resposta.assertHeader('location', '/login')
  })

  test('logado sem ser admin recebe 403', async ({ client }) => {
    const user = await User.create({
      nome: 'Comum',
      email: 'comum@teste.com',
      password: 'senha12345',
    })
    const resposta = await client.get('/admin/usuarios').loginAs(user)
    resposta.assertStatus(403)
  })

  test('admin vê a lista com a contagem de vídeos', async ({ client, assert }) => {
    const admin = await criarAdmin()
    const outro = await User.create({
      nome: 'Bruno Publicador',
      email: 'bruno@teste.com',
      password: 'senha12345',
    })
    const canal = await Canal.create({ youtubeId: '@CanalU', nome: 'Canal U' })
    for (let i = 1; i <= 3; i++) {
      await Video.create({
        youtubeId: `usr${String(i).padStart(8, '0')}`,
        titulo: `V${i}`,
        canalId: canal.id,
        publicadoPor: outro.id,
      })
    }

    const resposta = await client.get('/admin/usuarios').loginAs(admin)
    resposta.assertStatus(200)
    const html = resposta.text()
    assert.match(html, /Bruno Publicador<\/td>\s*<td>bruno@teste\.com<\/td>\s*<td>\w+<\/td>\s*<td>3<\/td>/)
    assert.match(html, /Ana Admin<\/td>\s*<td>admin@teste\.com<\/td>\s*<td>admin<\/td>\s*<td>0<\/td>/)
    assert.notInclude(html, 'senha12345')
    assert.notInclude(html, outro.password)
  })

  test('pagina de 20 em 20, mais recentes primeiro', async ({ client, assert }) => {
    const admin = await criarAdmin()
    const base = DateTime.now().minus({ days: 30 })
    for (let i = 1; i <= 20; i++) {
      await User.create({
        nome: `Usuario ${i}`,
        email: `u${i}@teste.com`,
        password: 'senha12345',
        createdAt: base.plus({ days: i }),
      })
    }
    // admin criado agora é o mais recente; 21 no total

    const pagina1 = await client.get('/admin/usuarios').loginAs(admin)
    pagina1.assertStatus(200)
    assert.lengthOf(linhas(pagina1.text()), 20)
    assert.include(pagina1.text(), 'Ana Admin')
    assert.include(pagina1.text(), '/admin/usuarios?page=2')

    const pagina2 = await client.get('/admin/usuarios?page=2').loginAs(admin)
    pagina2.assertStatus(200)
    assert.lengthOf(linhas(pagina2.text()), 1)
    assert.match(pagina2.text(), /Usuario 1\s*</)
  })
})
