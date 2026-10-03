import Pusher from 'pusher'

/**
 * Cliente de Pusher (servidor).
 * Se usa para emitir eventos en tiempo real (mensajes de chat).
 */
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'mt1',
  useTLS: true,
})

/**
 * Nombre del canal de chat para un evento.
 * Formato: chat-event-{eventId}
 */
export function chatChannel(eventId: string) {
  return `chat-event-${eventId}`
}

/**
 * Evento de nuevo mensaje.
 */
export const NEW_MESSAGE_EVENT = 'new-message'
