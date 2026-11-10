import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Admin UsersController: listagem de usuários no painel admin (T06).
 */
export default class UsersController {
  /**
   * Lista paginada, mais recentes primeiro, com a contagem de vídeos publicados.
   * Seleciona colunas explícitas para nunca carregar a senha.
   */
  async index({ request, view }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const users = await User.query()
      .select('id', 'nome', 'email', 'papel', 'created_at')
      .withCount('videosPublicados')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(page, 20)

    users.baseUrl('/admin/usuarios')
    return view.render('pages/admin/users/index', { users })
  }
}
