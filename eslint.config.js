import { configApp } from '@adonisjs/eslint-config'

export default [
  // gerado automaticamente por `node ace migration:run` — não editar nem lintar
  { ignores: ['database/schema.ts'] },
  ...configApp(),
]
