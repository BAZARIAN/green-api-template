import type { ConnectionState } from '../../types/chat'
import { CONNECTION_DOT_CLASSES, CONNECTION_LABELS } from '../../constants'

export function ChatHeader({ recipient, avatarUrl, connection }: { recipient: string; avatarUrl?: string; connection: ConnectionState }) {
  return (
    <header className="chat-header">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="mb-1 text-[15px] font-extrabold text-grey-50">{recipient || 'Выберите чат'}</h1>
          <div className="flex items-center gap-1.5 text-xs text-grey-400">
            <span className={`size-1.5 rounded-full ${CONNECTION_DOT_CLASSES[connection]}`} />
            {CONNECTION_LABELS[connection]}
          </div>
        </div>
      </div>
    </header>
  )
}
