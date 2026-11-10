import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'video_tag'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('video_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('videos')
        .onDelete('CASCADE')
      table
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.primary(['video_id', 'tag_id'])
      table.index(['tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
