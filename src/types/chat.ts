export type ConnectionState = 'idle' | 'connecting' | 'online' | 'error'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed'

export type Credentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type ChatMessage = {
  id: string
  text: string
  incoming: boolean
  timestamp: number
  status: MessageStatus
  attachment?: {
    url?: string
    name?: string
    mimeType?: string
    thumbnail?: string
  }
}

export type ChatSummary = {
  id: string
  name: string
  type: string
  avatarUrl: string
  lastMessageAt: number
  lastMessageText: string
  unreadCount: number
  messages: ChatMessage[]
}

export type ApiChat = {
  id?: string
  chatId?: string
  name?: string
  type?: string
  unreadCount?: number
  phoneNumber?: number
  username?: string
}

export type ApiHistoryMessage = {
  type?: 'incoming' | 'outgoing'
  idMessage?: string
  timestamp?: number
  statusMessage?: string
  textMessage?: string
  messageData?: {
    typeMessage?: string
    textMessageData?: { textMessage?: string }
    extendedTextMessageData?: { text?: string }
  }
  typeMessage?: string
  downloadUrl?: string
  caption?: string
  fileName?: string
  mimeType?: string
  jpegThumbnail?: string
}

export type ApiAvatar = { urlAvatar?: string }

export type ApiNotification = {
  receiptId?: number
  body?: {
    typeWebhook?: string
    idMessage?: string
    timestamp?: number
    status?: MessageStatus
    senderData?: { chatId?: string; senderPhoneNumber?: number; senderName?: string; senderContactName?: string }
    chatId?: string
    recipientData?: { chatId?: string }
    messageData?: {
      typeMessage?: string
      textMessage?: string
      caption?: string
      fileName?: string
      downloadUrl?: string
      mimeType?: string
      jpegThumbnail?: string
      textMessageData?: { textMessage?: string }
      extendedTextMessageData?: { text?: string }
      downloadUrl?: string
      fileName?: string
      caption?: string
      mimeType?: string
      jpegThumbnail?: string
    }
  }
}

export type ApiResponse = ApiNotification & {
  idMessage?: string
  stateInstance?: string
}

export type ApiCallOptions = {
  query?: string
  suffix?: string
  httpMethod?: 'GET' | 'POST' | 'DELETE'
  body?: Record<string, string | number | boolean | null>
}
