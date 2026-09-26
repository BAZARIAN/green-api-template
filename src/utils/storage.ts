import {
  CREDENTIALS_STORAGE_KEY,
  LEGACY_CHAT_STORAGE_PREFIX,
} from '../constants'
import type { Credentials } from '../types/chat'

export function readStoredCredentials(): Credentials | null {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CREDENTIALS_STORAGE_KEY) || 'null',
    ) as Partial<Credentials> | null

    if (!parsed?.apiUrl?.trim() || !parsed.idInstance?.trim() || !parsed.apiTokenInstance?.trim()) {
      return null
    }

    return {
      apiUrl: parsed.apiUrl.trim(),
      idInstance: parsed.idInstance.trim(),
      apiTokenInstance: parsed.apiTokenInstance.trim(),
    }
  } catch {
    return null
  }
}

export function saveCredentials(credentials: Credentials) {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(LEGACY_CHAT_STORAGE_PREFIX)) localStorage.removeItem(key)
  }

  localStorage.setItem(
    CREDENTIALS_STORAGE_KEY,
    JSON.stringify({
      apiUrl: credentials.apiUrl.trim().replace(/\/$/, ''),
      idInstance: credentials.idInstance.trim(),
      apiTokenInstance: credentials.apiTokenInstance.trim(),
    }),
  )
}

export function clearStoredCredentials() {
  localStorage.removeItem(CREDENTIALS_STORAGE_KEY)
}
