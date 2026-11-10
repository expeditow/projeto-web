import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'
import Registro from '#models/registro'
import Review from '#models/review'
import Comentario from '#models/comentario'
import Lista from '#models/lista'

/**
 * User model represents a user in the application.
 * It extends UserSchema and includes authentication capabilities
 * through the withAuthFinder mixin.
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * Get the user's initials from their name or email.
   * Returns the first letter of first and last name if available,
   * otherwise returns the first two characters of the email username.
   */
  get initials() {
    const [first, last] = this.nome ? this.nome.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  // ---- Criação de conteúdo ------------------------------------------------

  /** Vídeos que o usuário adicionou na plataforma (relacionamento "Publica"). */
  @hasMany(() => Video, { foreignKey: 'publicadoPor' })
  declare videosPublicados: HasMany<typeof Video>

  /** Cada vez que o usuário logou ter assistido um vídeo (com ou sem nota). */
  @hasMany(() => Registro)
  declare registros: HasMany<typeof Registro>

  @hasMany(() => Comentario)
  declare comentarios: HasMany<typeof Comentario>

  @hasMany(() => Lista)
  declare listas: HasMany<typeof Lista>

  // ---- Social -------------------------------------------------------------

  /** Quem este usuário segue. */
  @manyToMany(() => User, {
    pivotTable: 'seguidores',
    pivotForeignKey: 'seguidor_id',
    pivotRelatedForeignKey: 'seguido_id',
  })
  declare seguindo: ManyToMany<typeof User>

  /** Quem segue este usuário. */
  @manyToMany(() => User, {
    pivotTable: 'seguidores',
    pivotForeignKey: 'seguido_id',
    pivotRelatedForeignKey: 'seguidor_id',
  })
  declare seguidores: ManyToMany<typeof User>

  /** Reviews que o usuário curtiu. */
  @manyToMany(() => Review, { pivotTable: 'curtidas_review' })
  declare reviewsCurtidas: ManyToMany<typeof Review>

  // ---- Relação usuário x vídeo -------------------------------------------

  /** Estado do usuário no vídeo: `curtiu` e `momento_segundos` (retomar de onde parou). */
  @manyToMany(() => Video, {
    pivotTable: 'interacoes',
    pivotColumns: ['curtiu', 'momento_segundos'],
    pivotTimestamps: true,
  })
  declare interacoes: ManyToMany<typeof Video>

  /** Vitrine do perfil (máx. 5), ordenada por `posicao`. */
  @manyToMany(() => Video, {
    pivotTable: 'favoritos',
    pivotColumns: ['posicao'],
    pivotTimestamps: true,
  })
  declare favoritos: ManyToMany<typeof Video>

  /** Vídeos que o usuário quer assistir depois. */
  @manyToMany(() => Video, { pivotTable: 'watchlist' })
  declare watchlist: ManyToMany<typeof Video>
}
