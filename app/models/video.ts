import { VideoSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Canal from '#models/canal'
import Registro from '#models/registro'
import Tag from '#models/tag'
import Lista from '#models/lista'
import User from '#models/user'

export default class Video extends VideoSchema {
  @belongsTo(() => Canal)
  declare canal: BelongsTo<typeof Canal>

  /** Quem adicionou o vídeo na plataforma (relacionamento "Publica"). */
  @belongsTo(() => User, { foreignKey: 'publicadoPor' })
  declare publicador: BelongsTo<typeof User>

  @hasMany(() => Registro)
  declare registros: HasMany<typeof Registro>

  @manyToMany(() => Tag, { pivotTable: 'video_tag' })
  declare tags: ManyToMany<typeof Tag>

  /** Listas que contêm este vídeo; `ordem` é a posição dele na lista. */
  @manyToMany(() => Lista, {
    pivotTable: 'lista_video',
    pivotColumns: ['ordem'],
    pivotTimestamps: true,
  })
  declare listas: ManyToMany<typeof Lista>
}
