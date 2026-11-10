import { CanalSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'

export default class Canal extends CanalSchema {
  static table = 'canais'

  @hasMany(() => Video)
  declare videos: HasMany<typeof Video>
}
