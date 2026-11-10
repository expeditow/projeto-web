import { ReviewSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Registro from '#models/registro'
import Comentario from '#models/comentario'
import User from '#models/user'

export default class Review extends ReviewSchema {
  @belongsTo(() => Registro)
  declare registro: BelongsTo<typeof Registro>

  @hasMany(() => Comentario)
  declare comentarios: HasMany<typeof Comentario>

  /** Usuários que curtiram esta review. */
  @manyToMany(() => User, { pivotTable: 'curtidas_review' })
  declare curtidores: ManyToMany<typeof User>
}
