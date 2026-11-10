import { TagSchema } from '#database/schema'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'

export default class Tag extends TagSchema {
  @manyToMany(() => Video, { pivotTable: 'video_tag' })
  declare videos: ManyToMany<typeof Video>
}
