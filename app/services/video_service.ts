import Canal from '#models/canal'
import Video from '#models/video'
import type User from '#models/user'
import type YoutubeClient from '#services/youtube_client'

export type ResultadoEnvio = { video: Video; jaExistia: boolean }

/**
 * Regra de "Enviar vídeo" (T09), fora do controller para dar para testar
 * sem HTTP. Não duplica vídeo (youtube_id é único) e reaproveita o canal.
 */
export async function enviarVideo(
  youtube: YoutubeClient,
  youtubeId: string,
  user: User
): Promise<ResultadoEnvio> {
  const existente = await Video.findBy('youtubeId', youtubeId)
  if (existente) return { video: existente, jaExistia: true }

  const dados = await youtube.buscarMetadados(youtubeId)

  const canal = await Canal.firstOrCreate(
    { youtubeId: dados.canal.youtubeId },
    { nome: dados.canal.nome }
  )

  const video = await Video.create({
    youtubeId: dados.youtubeId,
    titulo: dados.titulo,
    thumbnail: dados.thumbnail,
    canalId: canal.id,
    publicadoPor: user.id,
    // duracao_segundos e categoria_youtube: o oEmbed não traz (T24)
  })

  return { video, jaExistia: false }
}
