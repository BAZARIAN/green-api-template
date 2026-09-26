export function normalizeChatId(value: string) {
  return value.trim().replace(/[\s()]/g, '')
}
