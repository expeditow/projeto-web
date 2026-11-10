import Video from '#models/video'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Admin VideosController: listagem de vídeos no painel admin (T07).
 */
export default class VideosController {
  /**
   * Lista paginada, mais recentes primeiro, com canal e quem publicou
   */
  async index({ request, view }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const videos = await Video.query()
      .preload('canal')
      .preload('publicador')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(page, 20)

    videos.baseUrl('/admin/videos')
    return view.render('pages/admin/videos/index', { videos })
  }
}
