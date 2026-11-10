import { ListaSchema } from '#database/schema'
import { belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Video from '#models/video'

export default class Lista extends ListaSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Video, {
    pivotTable: 'lista_video',
    pivotColumns: ['ordem'],
    pivotTimestamps: true,
  })
  declare videos: ManyToMany<typeof Video>
}
