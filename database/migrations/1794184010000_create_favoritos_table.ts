import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'favoritos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('video_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('videos')
        .onDelete('CASCADE')
      // Posição na vitrine do perfil (1 a 5). O limite de 5 vem do check + unique.
      table.smallint('posicao').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'video_id'])
      table.unique(['user_id', 'posicao'])
      table.check('posicao between 1 and 5', [], 'favoritos_posicao_check')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
