/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * Mensagens de erro em português para todos os validators.
 * {{ field }} vira o nome amigável do campo (definido em `campos` abaixo).
 */
const mensagens = {
  'required': 'Preencha o campo {{ field }}',
  'string': 'O campo {{ field }} deve ser um texto',
  'email': 'Informe um e-mail válido',
  'minLength': 'O campo {{ field }} deve ter pelo menos {{ min }} caracteres',
  'maxLength': 'O campo {{ field }} deve ter no máximo {{ max }} caracteres',
  'sameAs': 'As senhas não conferem',
  'database.unique': 'Este {{ field }} já está em uso',
}

const campos = {
  nome: 'nome',
  email: 'e-mail',
  password: 'senha',
  passwordConfirmation: 'confirmação de senha',
}

vine.messagesProvider = new SimpleMessagesProvider(mensagens, campos)
