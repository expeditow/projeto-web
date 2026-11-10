import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'watchlist'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
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
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.primary(['user_id', 'video_id'])
      table.index(['video_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
