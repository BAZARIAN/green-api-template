import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { MAX_MESSAGE_LENGTH } from '../../constants'
import { normalizeApiChats, requestApi } from '../../services/greenApi'
import type {
  ApiAvatar,
  ApiCallOptions,
  ApiHistoryMessage,
  ChatMessage,
  ChatSummary,
  ConnectionState,
  Credentials,
} from '../../types/chat'
import { normalizeChatId } from '../../utils/chat'
import { getHistoryText, getMessageText, historyStatus } from '../../utils/messages'
import { ChatHeader } from './ChatHeader'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'
import { Sidebar } from './Sidebar'

function historyMessageId(chatId: string, item: ApiHistoryMessage, index: number) {
  if (item.idMessage) return item.idMessage

  return [
    'history',
    chatId,
    item.timestamp || 0,
    item.type || '',
    item.textMessage || getHistoryText(item),
    item.downloadUrl || '',
    index,
  ].join(':')
}

function mapHistoryMessages(chatId: string, history: ApiHistoryMessage[]) {
  return history
    .map((item, index) => ({
      id: historyMessageId(chatId, item, index),
      text: getHistoryText(item),
      incoming: item.type !== 'outgoing',
      timestamp: (item.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      status: item.type === 'incoming' ? ('delivered' as const) : historyStatus(item.statusMessage),
      attachment: item.downloadUrl
        ? {
            url: item.downloadUrl,
            name: item.fileName || item.caption || 'Вложение',
            mimeType: item.mimeType,
            thumbnail: item.jpegThumbnail,
          }
        : undefined,
    }))
    .filter((message) => message.text || message.attachment)
    .reverse()
}

export function ChatPage({
  credentials,
  onLogout,
}: {
  credentials: Credentials
  onLogout: () => void
}) {
  const [recipient, setRecipient] = useState('')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [isChatsLoading, setIsChatsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [accountLabel, setAccountLabel] = useState('')
  const [connection, setConnection] = useState<ConnectionState>('idle')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recipientRef = useRef('')
  const historyRequestRef = useRef(0)
  const recipientId = useMemo(() => normalizeChatId(recipient), [recipient])
  recipientRef.current = recipientId
  const lastMessage = messages.at(-1)
  const selectedChat = chats.find((chat) => chat.id === recipientId)

  const apiCall = useCallback(
    (method: string, options: ApiCallOptions = {}) => requestApi(credentials, method, options),
    [credentials],
  )

  const updateChat = useCallback((chatId: string, update: Partial<ChatSummary>) => {
    if (!chatId) return

    setChats((current) => {
      if (current.some((chat) => chat.id === chatId)) {
        return current.map((chat) => (chat.id === chatId ? { ...chat, ...update } : chat))
      }

      return [
        ...current,
        {
          id: chatId,
          name: chatId,
          type: chatId.includes('@g.us') ? 'group' : 'user',
          avatarUrl: '',
          lastMessageAt: 0,
          lastMessageText: '',
          unreadCount: 0,
          messages: [],
          ...update,
        },
      ]
    })
  }, [])

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) =>
      message.id && current.some((item) => item.id === message.id)
        ? current
        : [...current, message],
    )
  }, [])

  const mergeHistory = useCallback(
    (chatId: string, history: ApiHistoryMessage[]) => {
      const loadedMessages = mapHistoryMessages(chatId, history)
      if (!loadedMessages.length || recipientRef.current !== chatId) return

      setMessages((current) => {
        const merged = new Map(current.map((message) => [message.id, message]))
        for (const message of loadedMessages) {
          const existing = merged.get(message.id)
          merged.set(message.id, existing ? { ...existing, ...message } : message)
        }
        return [...merged.values()].sort((a, b) => a.timestamp - b.timestamp)
      })

      const latest = loadedMessages.at(-1)
      if (latest) {
        updateChat(chatId, {
          lastMessageAt: latest.timestamp,
          lastMessageText: latest.text,
        })
      }
    },
    [updateChat],
  )

  const refreshChats = useCallback(async () => {
    setIsChatsLoading(true)
    setError('')

    try {
      const [remoteChats, settings] = await Promise.all([
        apiCall('getChats'),
        apiCall('getSettings').catch(() => null),
      ])
      const settingsData = settings as {
        wid?: string
        webhookUrl?: string
        incomingWebhook?: string
      } | null
      setAccountLabel(settingsData?.wid || credentials.idInstance)
      if (settingsData?.webhookUrl) {
        setNotice('У инстанса задан webhookUrl: ReceiveNotification не будет получать сообщения')
      } else if (settingsData?.incomingWebhook !== 'yes') {
        setNotice('В настройках инстанса выключен incomingWebhook')
      }
      const baseChats = normalizeApiChats(remoteChats)
      const enrichedChats: ChatSummary[] = []

      for (const chat of baseChats) {
        const historyResult = await apiCall('getChatHistory', { httpMethod: 'POST', body: { chatId: chat.id, count: 1 } }).catch(() => null)
        const history = Array.isArray(historyResult) ? (historyResult as ApiHistoryMessage[]) : []
        const latest = history[0]
        const avatar = await apiCall('getAvatar', { httpMethod: 'POST', body: { chatId: chat.id } }).catch(() => null) as ApiAvatar | null

        enrichedChats.push({
          ...chat,
          avatarUrl: avatar?.urlAvatar || '',
          lastMessageAt: latest?.timestamp ? latest.timestamp * 1000 : 0,
          lastMessageText: latest ? getHistoryText(latest) : '',
        })
      }

      setChats(enrichedChats.sort((a, b) => b.lastMessageAt - a.lastMessageAt))
      setNotice(`Найдено чатов: ${enrichedChats.length}`)
    } catch (refreshError) {
      setError(`Не удалось загрузить чаты: ${(refreshError as Error).message}`)
    } finally {
      setIsChatsLoading(false)
    }
  }, [apiCall])

  const selectChat = useCallback(async (chat: ChatSummary) => {
    const requestId = ++historyRequestRef.current
    setRecipient(chat.id)
    setError('')
    setIsHistoryLoading(true)

    try {
      const historyResult = await apiCall('getChatHistory', {
        httpMethod: 'POST',
        body: { chatId: chat.id, count: 100 },
      })
      if (!Array.isArray(historyResult)) return

      const loadedMessages = mapHistoryMessages(chat.id, historyResult as ApiHistoryMessage[])

      if (requestId !== historyRequestRef.current) return
      setMessages(loadedMessages)
      updateChat(chat.id, {
        lastMessageAt: loadedMessages.at(-1)?.timestamp || chat.lastMessageAt,
        lastMessageText: loadedMessages.at(-1)?.text || chat.lastMessageText,
      })
    } catch (historyError) {
      setError(`Не удалось загрузить историю: ${(historyError as Error).message}`)
    } finally {
      if (requestId === historyRequestRef.current) setIsHistoryLoading(false)
    }
  }, [apiCall, updateChat])

  useEffect(() => {
    if (!recipientId) return

    let cancelled = false
    const refreshOpenChat = async () => {
      try {
        const result = await apiCall('getChatHistory', {
          httpMethod: 'POST',
          body: { chatId: recipientId, count: 100 },
        })
        if (!cancelled && Array.isArray(result)) {
          mergeHistory(recipientId, result as ApiHistoryMessage[])
        }
      } catch {
        
      }
    }

    const timer = window.setInterval(() => void refreshOpenChat(), 5000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [apiCall, mergeHistory, recipientId])

  const addChat = (value: string) => {
    const chatId = normalizeChatId(value)
    if (!chatId) return

    const chat = {
      id: chatId,
      name: chatId,
      type: chatId.startsWith('-') ? 'group' : 'user',
      avatarUrl: '',
      lastMessageAt: 0,
      lastMessageText: '',
      unreadCount: 0,
      messages: [],
    } satisfies ChatSummary

    updateChat(chatId, chat)
    void selectChat(chat)
  }

  useEffect(() => {
    void refreshChats()
  }, [refreshChats])

  useEffect(() => {
    let cancelled = false
    setConnection('connecting')

    const poll = async () => {
      while (!cancelled) {
        try {
          const notification = await apiCall('receiveNotification', {
            query: '?receiveTimeout=5',
          })
          if (cancelled) return

          setConnection('online')
          if (!notification) continue

          const body = notification.body
          const isIncoming = body?.typeWebhook === 'incomingMessageReceived'
          const isOutgoing =
            body?.typeWebhook === 'outgoingAPIMessageReceived' ||
            body?.typeWebhook === 'outgoingMessageReceived'
          const text = getMessageText(body)
          const senderChatId = normalizeChatId(String(body?.senderData?.chatId || body?.chatId || body?.recipientData?.chatId || ''))

          if ((isIncoming || isOutgoing) && senderChatId) {
            const message: ChatMessage = {
              id: body?.idMessage || `received-${body?.timestamp}-${Math.random()}`,
              text,
              incoming: isIncoming,
              timestamp: (body?.timestamp || Math.floor(Date.now() / 1000)) * 1000,
              status: 'delivered',
              attachment: body?.messageData?.typeMessage && !['textMessage', 'extendedTextMessage'].includes(body.messageData.typeMessage) ? {
                url: body.messageData.downloadUrl,
                name: body.messageData.fileName || body.messageData.caption || 'Вложение',
                mimeType: body.messageData.mimeType,
                thumbnail: body.messageData.jpegThumbnail,
              } : undefined,
            }
            updateChat(senderChatId, {
              ...(body?.senderData?.senderName || body?.senderData?.senderContactName
                ? { name: body.senderData.senderName || body.senderData.senderContactName }
                : {}),
              lastMessageAt: message.timestamp,
              lastMessageText: text,
            })
            if (senderChatId === recipientRef.current && (text || message.attachment)) addMessage(message)
          }

          if (body?.typeWebhook === 'outgoingMessageStatus' && body.idMessage) {
            setMessages((current) =>
              current.map((item) =>
                item.id === body.idMessage
                  ? { ...item, status: body.status || item.status }
                  : item,
              ),
            )
          }

          if (notification.receiptId !== undefined) {
            await apiCall('deleteNotification', {
              httpMethod: 'DELETE',
              suffix: `/${notification.receiptId}`,
            })
          }
        } catch (pollError) {
          if (cancelled) return
          setConnection('error')
          setError(`Получение сообщений: ${(pollError as Error).message}`)
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [addMessage, apiCall, updateChat])

  useEffect(() => {
    const container = messagesEndRef.current?.closest('.message-area') as HTMLElement | null
    container?.scrollTo({ top: container.scrollHeight, behavior: 'auto' })
  }, [messages])

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()

    if (!text || isSending) return
    if (text.length > MAX_MESSAGE_LENGTH) {
      setError(`Сообщение не должно превышать ${MAX_MESSAGE_LENGTH} символов`)
      return
    }
    if (!recipientId) {
      setError('Сначала добавьте чат слева')
      return
    }

    setIsSending(true)
    setError('')
    setNotice('')
    const localId = `local-${Date.now()}`
    addMessage({
      id: localId,
      text,
      incoming: false,
      timestamp: Date.now(),
      status: 'sending',
    })
    setDraft('')

    try {
      const result = await apiCall('sendMessage', {
        httpMethod: 'POST',
        body: { chatId: recipientId, message: text },
      })
      setMessages((current) =>
        current.map((item) =>
          item.id === localId
            ? { ...item, id: result.idMessage || localId, status: 'sent' }
            : item,
        ),
      )
      updateChat(recipientId, {
        lastMessageAt: Date.now(),
        lastMessageText: text,
      })
    } catch (sendError) {
      setMessages((current) =>
        current.map((item) =>
          item.id === localId ? { ...item, status: 'failed' } : item,
        ),
      )
      setError(`Не удалось отправить сообщение: ${(sendError as Error).message}`)
      setDraft(text)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="app-layout">
      <Sidebar
        chats={chats}
        isLoading={isChatsLoading}
        recipient={recipient}
        lastMessage={lastMessage}
        onSelectChat={selectChat}
        onRefresh={refreshChats}
        onAddChat={addChat}
        onLogout={onLogout}
        accountLabel={accountLabel}
      />
      <section className="chat-layout">
        <ChatHeader
          recipient={selectedChat?.name || recipient}
          avatarUrl={selectedChat?.avatarUrl}
          connection={connection}
        />
        <MessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          hasRecipient={Boolean(recipientId)}
          isLoading={isHistoryLoading}
        />
        <MessageComposer
          draft={draft}
          isSending={isSending}
          onDraftChange={setDraft}
          onSubmit={sendMessage}
        />
      </section>
    </main>
  )
}
