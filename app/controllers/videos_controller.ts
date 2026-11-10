import Video from '#models/video'
import YoutubeClient, { VideoNaoEncontradoError } from '#services/youtube_client'
import { enviarVideo } from '#services/video_service'
import { enviarVideoValidator } from '#validators/video'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * VideosController: enviar vídeo (T09).
 */
export default class VideosController {
  /**
   * Tela com o campo de URL ou ID
   */
  async create({ view }: HttpContext) {
    return view.render('pages/videos/create')
  }

  /**
   * Busca os dados no YouTube e salva; se já existir, só redireciona para ele
   */
  async store({ request, response, auth, session }: HttpContext) {
    const { url } = await request.validateUsing(enviarVideoValidator)
    const youtube = new YoutubeClient()

    const youtubeId = youtube.extrairId(url)
    if (!youtubeId) {
      session.flashAll()
      session.flash('inputErrorsBag', { url: ['URL ou ID do YouTube inválido'] })
      return response.redirect().back()
    }

    try {
      const { video, jaExistia } = await enviarVideo(youtube, youtubeId, auth.getUserOrFail())
      session.flash(
        'success',
        jaExistia ? 'Esse vídeo já estava no ytboxd' : 'Vídeo enviado com sucesso'
      )
      return response.redirect().toRoute('videos.show', { id: video.id })
    } catch (error) {
      if (!(error instanceof VideoNaoEncontradoError)) throw error
      session.flashAll()
      session.flash('inputErrorsBag', {
        url: ['Vídeo não encontrado, privado ou sem permissão de embed'],
      })
      return response.redirect().back()
    }
  }

  /**
   * Provisório: só para o redirecionamento ter destino. A página completa é a T08.
   */
  async show({ params, view }: HttpContext) {
    const video = await Video.query().where('id', params.id).preload('canal').firstOrFail()
    return view.render('pages/videos/show', { video })
  }
}
