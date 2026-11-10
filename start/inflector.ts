/*
|--------------------------------------------------------------------------
| Plurais em português
|--------------------------------------------------------------------------
|
| O Adonis usa regras de plural em inglês para derivar o nome das classes
| a partir das tabelas (ex.: "canais" viraria "Canai"). Estas regras
| corrigem os plurais irregulares das nossas tabelas.
|
*/

import string from '@adonisjs/core/helpers/string'

string.pluralize.addIrregularRule('canal', 'canais')
string.pluralize.addIrregularRule('interacao', 'interacoes')
string.pluralize.addIrregularRule('seguidor', 'seguidores')
