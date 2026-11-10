import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nome', 120).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('foto', 500).nullable()
      table.text('bio').nullable()
      // 'admin' libera o painel de back office (T06/T07 do backlog)
      table.enum('papel', ['usuario', 'admin']).notNullable().defaultTo('usuario')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
