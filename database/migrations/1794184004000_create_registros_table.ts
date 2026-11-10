import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'registros'

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
      table.date('data_assistido').notNullable().defaultTo(this.now())
      // Nota opcional: um registro pode existir só como "assistido". Sem unique (user_id, video_id): rewatch.
      table.smallint('nota').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.check('nota between 1 and 5', [], 'registros_nota_check')
      table.index(['user_id', 'video_id'])
      table.index(['video_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
