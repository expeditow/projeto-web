import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const dadosValidos = {
  nome: 'Maria Teste',
  email: 'maria@teste.com',
  password: 'senha12345',
  passwordConfirmation: 'senha12345',
}

test.group('Cadastro (T05)', (group) => {
  // Cada teste roda dentro de uma transação desfeita no final: o banco volta limpo
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a página de cadastro abre em português', async ({ client }) => {
    const resposta = await client.get('/signup')
    resposta.assertStatus(200)
    resposta.assertTextIncludes('Crie sua conta')
  })

  test('cadastro válido cria o usuário e leva ao dashboard', async ({ client, assert }) => {
    const resposta = await client.post('/signup').form(dadosValidos).withCsrfToken().redirects(0)

    resposta.assertStatus(302)
    resposta.assertHeader('location', '/dashboard')

    const user = await User.findByOrFail('email', dadosValidos.email)
    assert.equal(user.nome, 'Maria Teste')
    assert.equal(user.papel, 'usuario')
    assert.notEqual(user.password, dadosValidos.password, 'a senha deve ser salva como hash')
  })

  test('e-mail repetido não cria outra conta', async ({ client, assert }) => {
    await User.create({ nome: 'Já existe', email: dadosValidos.email, password: 'senha12345' })

    const resposta = await client.post('/signup').form(dadosValidos).withCsrfToken().redirects(0)
    resposta.assertStatus(302)
    resposta.assertFlashMessage('inputErrorsBag', { email: ['Este e-mail já está em uso'] })

    const total = await User.query().where('email', dadosValidos.email).count('* as total')
    assert.equal(Number(total[0].$extras.total), 1)
  })

  test('senhas diferentes e campos curtos mostram erros em português', async ({ client }) => {
    const resposta = await client
      .post('/signup')
      .form({ nome: 'M', email: 'sem-arroba', password: '123', passwordConfirmation: 'outra12345' })
      .withCsrfToken()
      .redirects(0)

    resposta.assertStatus(302)
    resposta.assertFlashMessage('inputErrorsBag', {
      nome: ['O campo nome deve ter pelo menos 2 caracteres'],
      email: ['Informe um e-mail válido'],
      password: ['O campo senha deve ter pelo menos 8 caracteres'],
      passwordConfirmation: ['As senhas não conferem'],
    })
  })
})

test.group('Login (T05)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('login correto leva ao dashboard', async ({ client }) => {
    await User.create({ nome: 'João', email: 'joao@teste.com', password: 'senha12345' })

    const resposta = await client
      .post('/login')
      .form({ email: 'joao@teste.com', password: 'senha12345' })
      .withCsrfToken()
      .redirects(0)

    resposta.assertStatus(302)
    resposta.assertHeader('location', '/dashboard')
  })

  test('senha errada mostra erro em português', async ({ client }) => {
    await User.create({ nome: 'João', email: 'joao@teste.com', password: 'senha12345' })

    const resposta = await client
      .post('/login')
      .form({ email: 'joao@teste.com', password: 'errada123' })
      .withCsrfToken()
      .redirects(0)

    resposta.assertStatus(302)
    resposta.assertFlashMessage('error', 'E-mail ou senha incorretos')
  })

  test('dashboard sem login manda para o login', async ({ client }) => {
    const resposta = await client.get('/dashboard').redirects(0)
    resposta.assertStatus(302)
    resposta.assertHeader('location', '/login')
  })
})
