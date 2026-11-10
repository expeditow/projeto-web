import { RegistroSchema } from '#database/schema'
import { belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Video from '#models/video'
import Review from '#models/review'

/**
 * Uma vez que o usuário assistiu um vídeo. Pode ter nota e, opcionalmente,
 * uma Review (texto). O mesmo usuário pode ter vários registros do mesmo vídeo
 * (rewatch).
 */
export default class Registro extends RegistroSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Video)
  declare video: BelongsTo<typeof Video>

  @hasOne(() => Review)
  declare review: HasOne<typeof Review>
}
