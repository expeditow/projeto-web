import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seguidores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('seguidor_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('seguido_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())

      table.primary(['seguidor_id', 'seguido_id'])
      table.index(['seguido_id'])
      table.check('seguidor_id <> seguido_id', [], 'seguidores_nao_segue_a_si_mesmo')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
