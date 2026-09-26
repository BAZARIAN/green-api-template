import type {
  ApiCallOptions,
  ApiChat,
  ApiResponse,
  ChatSummary,
  Credentials,
} from '../types/chat'
import { getHistoryText } from '../utils/messages'

const nextAllowedAt = new Map<string, number>()
const methodIntervals: Record<string, number> = {
  getChats: 1000,
  getChatHistory: 1000,
  getAvatar: 100,
  receiveNotification: 50,
  deleteNotification: 50,
  getAccountSettings: 1000,
}

const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

async function waitForRateLimit(method: string, apiUrl: string, idInstance: string) {
  const key = `${apiUrl}|${idInstance}|${method}`
  const interval = methodIntervals[method] || 100
  const now = Date.now()
  const next = Math.max(now, nextAllowedAt.get(key) || now)
  nextAllowedAt.set(key, next + interval)
  if (next > now) await wait(next - now)
}

function buildApiUrl(apiUrl: string, idInstance: string, method: string, token: string) {
  return `${apiUrl.replace(/\/$/, '')}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(token)}`
}

export async function requestApi(
  credentials: Credentials,
  method: string,
  options: ApiCallOptions = {},
) {
  const requestUrl =
    buildApiUrl(credentials.apiUrl, credentials.idInstance, method, credentials.apiTokenInstance) +
    (options.suffix || '') +
    (options.query || '')

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await waitForRateLimit(method, credentials.apiUrl, credentials.idInstance)
    const response = await fetch(requestUrl, {
      method: options.httpMethod || 'GET',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    const responseText = await response.text()

    let data: unknown = null
    try {
      data = responseText ? JSON.parse(responseText) : null
    } catch {
      data = responseText
    }

    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get('Retry-After'))
      await wait((Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000 * (attempt + 1)))
      continue
    }

    if (!response.ok) {
      const parsed = data as { message?: string; error?: string } | null
      throw new Error(
        typeof data === 'string'
          ? data
          : parsed?.message || parsed?.error || `HTTP ${response.status}`,
      )
    }

    return data as ApiResponse
  }

  throw new Error('Слишком много запросов к API. Повторите попытку позже.')
}

export function normalizeApiChats(value: unknown): ChatSummary[] {
  const remoteChats = Array.isArray(value) ? (value as ApiChat[]) : []

  return remoteChats
    .map((chat) => {
      const id = String(chat.chatId || chat.id || '').trim()
      if (!id) return null

      return {
        id,
        name: chat.name || chat.username || (chat.phoneNumber ? `+${chat.phoneNumber}` : id),
        type: chat.type || 'user',
        avatarUrl: '',
        lastMessageAt: 0,
        lastMessageText: '',
        unreadCount: Number(chat.unreadCount || 0),
        messages: [],
      } satisfies ChatSummary
    })
    .filter((chat): chat is ChatSummary => Boolean(chat))
}

export { getHistoryText }
