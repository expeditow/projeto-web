import Canal from '#models/canal'
import User from '#models/user'
import Video from '#models/video'
import YoutubeClient, { VideoNaoEncontradoError } from '#services/youtube_client'
import { enviarVideo } from '#services/video_service'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * `fetch` falso: responde como o oEmbed, sem acessar a rede.
 * Guarda as URLs chamadas para conferir quantas vezes o YouTube foi consultado.
 */
function fetchFalso(status = 200, autorUrl = 'https://www.youtube.com/@CanalTeste') {
  const chamadas: string[] = []
  const fn = (async (url: string) => {
    chamadas.push(url)
    return new Response(
      JSON.stringify({
        title: 'Vídeo de teste',
        thumbnail_url: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg',
        author_name: 'Canal Teste',
        author_url: autorUrl,
      }),
      { status }
    )
  }) as typeof globalThis.fetch
  return { fn, chamadas }
}

test.group('YoutubeClient: extrairId', () => {
  const youtube = new YoutubeClient(fetchFalso().fn)

  test('{$self}')
    .with([
      'abcdefghijk',
      'https://www.youtube.com/watch?v=abcdefghijk',
      'https://www.youtube.com/watch?list=PL1&v=abcdefghijk&t=30s',
      'youtube.com/watch?v=abcdefghijk',
      'https://m.youtube.com/watch?v=abcdefghijk',
      'https://youtu.be/abcdefghijk?si=xyz',
      'https://www.youtube.com/shorts/abcdefghijk',
      'https://www.youtube.com/embed/abcdefghijk',
      'https://www.youtube.com/live/abcdefghijk',
    ])
    .run(({ assert }, entrada) => {
      assert.equal(youtube.extrairId(entrada), 'abcdefghijk')
    })

  test('rejeita entrada inválida: {$self}')
    .with(['', 'abc', 'https://vimeo.com/123456', 'https://www.youtube.com/@canal', 'não é url'])
    .run(({ assert }, entrada) => {
      assert.isNull(youtube.extrairId(entrada))
    })
})

test.group('YoutubeClient: buscarMetadados', () => {
  test('lê título, thumbnail e canal do oEmbed', async ({ assert }) => {
    const { fn, chamadas } = fetchFalso()
    const dados = await new YoutubeClient(fn).buscarMetadados('abcdefghijk')

    assert.deepEqual(dados, {
      youtubeId: 'abcdefghijk',
      titulo: 'Vídeo de teste',
      thumbnail: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg',
      canal: { youtubeId: '@CanalTeste', nome: 'Canal Teste' },
    })
    assert.include(chamadas[0], 'https://www.youtube.com/oembed?url=')
    assert.include(chamadas[0], 'format=json')
  })

  test('canal antigo no formato /channel/UC... usa o UC... como id', async ({ assert }) => {
    const { fn } = fetchFalso(200, 'https://www.youtube.com/channel/UC1234567890')
    const dados = await new YoutubeClient(fn).buscarMetadados('abcdefghijk')
    assert.equal(dados.canal.youtubeId, 'UC1234567890')
  })

  test('vídeo inexistente/privado vira VideoNaoEncontradoError', async ({ assert }) => {
    const { fn } = fetchFalso(404)
    await assert.rejects(
      () => new YoutubeClient(fn).buscarMetadados('abcdefghijk'),
      VideoNaoEncontradoError
    )
  })
})

test.group('enviarVideo (T09)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('salva vídeo e canal, com publicado_por = usuário', async ({ assert }) => {
    const user = await User.create({ nome: 'Ana', email: 'ana@teste.com', password: 'senha12345' })
    const { video, jaExistia } = await enviarVideo(
      new YoutubeClient(fetchFalso().fn),
      'abcdefghijk',
      user
    )

    assert.isFalse(jaExistia)
    await video.refresh() // relê do banco para conferir as colunas null
    await video.load('canal')
    assert.equal(video.titulo, 'Vídeo de teste')
    assert.equal(video.publicadoPor, user.id)
    assert.equal(video.canal.youtubeId, '@CanalTeste')
    assert.isNull(video.duracaoSegundos)
    assert.isNull(video.categoriaYoutube)
  })

  test('vídeo repetido não duplica nem consulta o YouTube de novo', async ({ assert }) => {
    const user = await User.create({ nome: 'Ana', email: 'ana@teste.com', password: 'senha12345' })
    const { fn, chamadas } = fetchFalso()
    const youtube = new YoutubeClient(fn)

    const primeiro = await enviarVideo(youtube, 'abcdefghijk', user)
    const segundo = await enviarVideo(youtube, 'abcdefghijk', user)

    assert.isTrue(segundo.jaExistia)
    assert.equal(segundo.video.id, primeiro.video.id)
    assert.lengthOf(chamadas, 1)
    assert.lengthOf(await Video.query().where('youtubeId', 'abcdefghijk'), 1)
  })

  test('dois vídeos do mesmo canal reaproveitam o canal', async ({ assert }) => {
    const user = await User.create({ nome: 'Ana', email: 'ana@teste.com', password: 'senha12345' })
    const youtube = new YoutubeClient(fetchFalso().fn)

    const a = await enviarVideo(youtube, 'aaaaaaaaaaa', user)
    const b = await enviarVideo(youtube, 'bbbbbbbbbbb', user)

    assert.equal(a.video.canalId, b.video.canalId)
    assert.lengthOf(await Canal.query().where('youtubeId', '@CanalTeste'), 1)
  })
})
