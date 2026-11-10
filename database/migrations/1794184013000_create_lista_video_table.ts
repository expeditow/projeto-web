import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lista_video'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('lista_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('listas')
        .onDelete('CASCADE')
      table
        .integer('video_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('videos')
        .onDelete('CASCADE')
      table.integer('ordem').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['lista_id', 'video_id'])
      table.index(['video_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
