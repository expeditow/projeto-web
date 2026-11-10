import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'videos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('youtube_id', 32).notNullable().unique()
      table.string('titulo').notNullable()
      table.string('thumbnail', 500).nullable()
      table.integer('duracao_segundos').unsigned().nullable()
      table.string('categoria_youtube', 32).nullable()

      // Canal do vídeo (vem do metadado do YouTube)
      table
        .integer('canal_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('canais')
        .onDelete('SET NULL')

      // Relacionamento "Publica": quem adicionou o vídeo na plataforma
      table
        .integer('publicado_por')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['canal_id'])
      table.index(['publicado_por'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
