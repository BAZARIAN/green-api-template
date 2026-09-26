import type { ConnectionState } from './types/chat'

export const DEFAULT_API_URL = 'https://4100.api.green-api.com'
export const CREDENTIALS_STORAGE_KEY = 'green-api-max-chat:credentials'
export const LEGACY_CHAT_STORAGE_PREFIX = 'green-api-max-chat:chats:'
export const MAX_MESSAGE_LENGTH = 4000

export const CONNECTION_LABELS: Record<ConnectionState, string> = {
  idle: 'Ожидает подключения',
  connecting: 'Подключение к GREEN-API…',
  online: 'Получение сообщений включено',
  error: 'Ошибка подключения',
}

export const CONNECTION_DOT_CLASSES: Record<ConnectionState, string> = {
  idle: 'bg-grey-400',
  connecting: 'bg-amber-400',
  online: 'bg-emerald-400',
  error: 'bg-red-400',
}
