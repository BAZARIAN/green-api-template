import type { ChatMessage } from '../../types/chat'
import { formatTime } from '../../utils/formatters'
import { Icon } from '../common/Icon'

export function MessageBubble({ message }: { message: ChatMessage }) {
  const statusLabel = message.status === 'failed' ? 'Не отправлено' : message.status === 'sending' ? 'Отправка' : 'Отправлено'

  return (
    <div className={`message-row ${message.incoming ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`message-bubble ${message.incoming ? 'message-bubble-incoming' : 'message-bubble-outgoing'}`}
      >
        {message.text && <div className="whitespace-pre-wrap break-words">{message.text}</div>}
        {message.attachment?.url && (
          <a
            className="message-attachment"
            href={message.attachment.url}
            target="_blank"
            rel="noreferrer"
          >
            {message.attachment.name || 'Скачать вложение'}
          </a>
        )}
        {message.attachment && !message.attachment.url && (
          <div className="message-attachment">{message.attachment.name || 'Вложение'}</div>
        )}
        <div
          className={`message-meta ${message.incoming ? 'message-meta-incoming' : 'message-meta-outgoing'}`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {!message.incoming && (
            <span className="message-status" title={statusLabel}>
              {message.status === 'failed' && '!'}
              {message.status === 'sending' && '…'}
              {message.status !== 'failed' && message.status !== 'sending' && (
                <>
                  <Icon name="check" size={13} />
                  <span className="message-status-second-check">
                    <Icon name="check" size={13} />
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
