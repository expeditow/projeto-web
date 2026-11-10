/**
 * Cliente do YouTube isolado (T04/T09).
 * Usa o oEmbed, que não precisa de chave de API, mas só devolve título,
 * thumbnail e canal (sem duração nem categoria).
 */

export type MetadadosVideo = {
  youtubeId: string
  titulo: string
  thumbnail: string | null
  canal: { youtubeId: string; nome: string }
}

export class VideoNaoEncontradoError extends Error {}

type Fetch = typeof globalThis.fetch

const ID_VALIDO = /^[A-Za-z0-9_-]{11}$/

export default class YoutubeClient {
  /** `fetch` pode ser trocado nos testes para não acessar a rede. */
  constructor(private fetchFn: Fetch = globalThis.fetch) {}

  /**
   * Aceita um ID (11 caracteres) ou URL do YouTube (watch, youtu.be, shorts,
   * embed, live) e devolve o ID. Retorna null se não reconhecer.
   */
  extrairId(entrada: string): string | null {
    const texto = entrada.trim()
    if (ID_VALIDO.test(texto)) return texto

    let url: URL
    try {
      url = new URL(texto.startsWith('http') ? texto : `https://${texto}`)
    } catch {
      return null
    }

    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '')
    let id: string | null = null

    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] ?? null
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const partes = url.pathname.split('/')
      id =
        url.pathname === '/watch'
          ? url.searchParams.get('v')
          : ['shorts', 'embed', 'live', 'v'].includes(partes[1])
            ? (partes[2] ?? null)
            : null
    }

    return id && ID_VALIDO.test(id) ? id : null
  }

  /** Busca título, thumbnail e canal no oEmbed. */
  async buscarMetadados(youtubeId: string): Promise<MetadadosVideo> {
    const urlVideo = `https://www.youtube.com/watch?v=${youtubeId}`
    const resposta = await this.fetchFn(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(urlVideo)}&format=json`
    )

    // 400/401/404: vídeo inexistente, privado ou com embed desativado
    if (!resposta.ok) throw new VideoNaoEncontradoError(`oEmbed respondeu ${resposta.status}`)

    const dados = (await resposta.json()) as {
      title: string
      thumbnail_url?: string
      author_name: string
      author_url: string
    }

    return {
      youtubeId,
      titulo: dados.title,
      thumbnail: dados.thumbnail_url ?? null,
      canal: { youtubeId: this.idDoCanal(dados.author_url), nome: dados.author_name },
    }
  }

  /**
   * O oEmbed não dá o ID oficial do canal: usamos o último trecho de
   * `author_url` (ex.: ".../@RickAstleyYT" → "@RickAstleyYT").
   */
  private idDoCanal(authorUrl: string): string {
    const partes = new URL(authorUrl).pathname.split('/').filter(Boolean)
    return decodeURIComponent(partes[partes.length - 1] ?? authorUrl)
  }
}
