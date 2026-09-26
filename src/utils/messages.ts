import type { ApiHistoryMessage, ApiNotification, MessageStatus } from '../types/chat'

export function getHistoryText(message: ApiHistoryMessage) {
  if (message.textMessage) return message.textMessage

  if (message.caption) return message.caption

  const data = message.messageData
  if (data?.typeMessage === 'textMessage') return data.textMessageData?.textMessage || ''
  if (data?.typeMessage === 'extendedTextMessage') return data.extendedTextMessageData?.text || ''
  if (message.downloadUrl) return message.fileName || 'Вложение'
  return ''
}

export function getMessageText(body: ApiNotification['body']) {
  const data = body?.messageData
  if (data?.textMessage) return data.textMessage
  if (data?.caption) return data.caption
  if (data?.typeMessage === 'textMessage') return data.textMessageData?.textMessage || ''
  if (data?.typeMessage === 'extendedTextMessage') return data.extendedTextMessageData?.text || ''
  if (data?.typeMessage && data.typeMessage !== 'textMessage' && data.typeMessage !== 'extendedTextMessage') {
    return data.fileName || 'Вложение'
  }
  return ''
}

export function historyStatus(status?: string): MessageStatus {
  if (status === 'pending') return 'sending'
  if (status === 'failed') return 'failed'
  if (status === 'delivered' || status === 'read') return 'delivered'
  return 'sent'
}
