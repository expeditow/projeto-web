/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home').as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.on('/dashboard').render('pages/dashboard').as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])

    router.get('videos/novo', [controllers.Videos, 'create']).as('videos.create')
    router.post('videos', [controllers.Videos, 'store']).as('videos.store')
    router
      .get('videos/:id', [controllers.Videos, 'show'])
      .where('id', router.matchers.number())
      .as('videos.show')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('videos', [controllers.admin.Videos, 'index']).as('admin.videos.index')
    router.get('usuarios', [controllers.admin.Users, 'index']).as('admin.users.index')
  })
  .prefix('admin')
  .use([middleware.auth(), middleware.admin()])
