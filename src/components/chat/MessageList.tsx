import type { RefObject } from 'react'
import type { ChatMessage } from '../../types/chat'
import { Icon } from '../common/Icon'
import { MessageBubble } from './MessageBubble'

type MessageListProps = {
  messages: ChatMessage[]
  messagesEndRef: RefObject<HTMLDivElement | null>
  hasRecipient: boolean
  isLoading: boolean
}

function dateLabel(timestamp: number) {
  const date = new Date(timestamp)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) return 'Сегодня'

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function EmptyChat({ hasRecipient }: { hasRecipient: boolean }) {
  return (
    <div className="empty-chat">
      <div className="empty-chat-icon">
        <Icon name="message" size={28} />
      </div>
      <h2>{hasRecipient ? 'Начните разговор' : 'Добавьте чат'}</h2>
      <p>
        {hasRecipient
          ? 'Отправьте первое текстовое сообщение.'
          : 'Введите chatId или номер телефона в поле слева.'}
      </p>
    </div>
  )
}

function LoadingIndicator({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className={overlay ? 'chat-loader chat-loader-overlay' : 'chat-loader'}
      aria-label="Загрузка истории"
      role="status"
    >
      {!overlay && <span />}
    </div>
  )
}

export function MessageList({
  messages,
  messagesEndRef,
  hasRecipient,
  isLoading,
}: MessageListProps) {
  const hasMessages = messages.length > 0

  return (
    <div className="message-area" aria-busy={isLoading}>
      <div className="message-list">
        {!hasMessages && isLoading && <LoadingIndicator />}
        {!hasMessages && !isLoading && <EmptyChat hasRecipient={hasRecipient} />}

        {hasMessages && (
          <div className="message-items">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1]
              const isNewDay =
                index === 0 ||
                new Date(previousMessage.timestamp).toDateString() !==
                  new Date(message.timestamp).toDateString()

              return (
                <div key={message.id}>
                  {isNewDay && <div className="date-divider">{dateLabel(message.timestamp)}</div>}
                  <MessageBubble message={message} />
                </div>
              )
            })}
          </div>
        )}

        <div ref={messagesEndRef} />
        {hasMessages && isLoading && <LoadingIndicator overlay />}
      </div>
      <div className="absolute self-center z-10 inset-0">
        {hasMessages && isLoading && <LoadingIndicator />}
      </div>
    </div>
  )
}
