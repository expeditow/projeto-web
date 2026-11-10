import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'curtidas_review'

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
        .integer('review_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('reviews')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.primary(['user_id', 'review_id'])
      table.index(['review_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
