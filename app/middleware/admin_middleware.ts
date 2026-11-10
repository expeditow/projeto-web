import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Admin middleware: só deixa passar usuários com papel "admin".
 * Não logado vai para o login; logado sem ser admin recebe 403.
 */
export default class AdminMiddleware {
  redirectTo = '/login'

  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticateUsing(undefined, { loginRoute: this.redirectTo })

    if (user.papel !== 'admin') {
      ctx.response.status(403)
      return ctx.response.send(await ctx.view.render('pages/errors/forbidden'))
    }

    return next()
  }
}
