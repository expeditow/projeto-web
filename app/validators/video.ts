import vine from '@vinejs/vine'

/**
 * Enviar vídeo: o formato (URL ou ID) é conferido depois pelo YoutubeClient.
 */
export const enviarVideoValidator = vine.create({
  url: vine.string().trim().maxLength(500),
})
