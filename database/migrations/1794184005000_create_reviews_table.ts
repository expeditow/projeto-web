import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      // Registro 1 ── 0..1 Review: unique garante no máximo uma review por registro
      table
        .integer('registro_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('registros')
        .onDelete('CASCADE')
      table.text('texto').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
