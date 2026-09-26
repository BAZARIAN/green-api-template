import { useState, type FormEvent } from 'react'
import type { ChatMessage, ChatSummary } from '../../types/chat'
import { formatChatDate } from '../../utils/formatters'
import { normalizeChatId } from '../../utils/chat'
import { Avatar } from '../common/Avatar'
import { Icon } from '../common/Icon'
import { IconButton } from '../common/IconButton'
import { SettingsField } from '../common/SettingsField'
import { cn } from '../../hooks/cn'

type SidebarProps = {
  chats: ChatSummary[]
  isLoading: boolean
  recipient: string
  lastMessage?: ChatMessage
  onSelectChat: (chat: ChatSummary) => void
  onRefresh: () => void
  onAddChat: (value: string) => void
  onLogout: () => void
  accountLabel: string
}

export function Sidebar({ chats, isLoading, recipient, lastMessage, onSelectChat, onRefresh, onAddChat, onLogout, accountLabel }: SidebarProps) {
  const [newChat, setNewChat] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newChat.trim()) return
    onAddChat(newChat)
    setNewChat('')
  }

  return (
    <aside className="sidebar-wrap">
      <div className="sidebar">
        <div className="sidebar-section-heading">
          <div className="section-label sidebar-section-label">Чаты{chats.length ? ` · ${chats.length}` : ''}</div>
          <IconButton className={cn({"spinner": isLoading})} label="Обновить список чатов" icon="refresh" onClick={onRefresh} />
        </div>

        <form className="new-chat-form" onSubmit={submit}>
          <SettingsField
            value={newChat} 
            onChange={(value) => setNewChat(value)} 
            placeholder="chatId или номер" 
            inputMode="url"
          />
          <button className="primary-button w-[unset] aspect-square" type="submit" aria-label="Добавить чат" title="Добавить чат">
            <Icon name="plus" />
          </button>
        </form>

        <div className="chat-list">
          {!isLoading && chats.length === 0 && <div className="chat-list-state">Добавьте чат или обновите список</div>}
          {chats.map((chat) => (
            <button className={`chat-preview ${chat.id === normalizeChatId(recipient) ? 'chat-preview-active' : ''}`} type="button" onClick={() => onSelectChat(chat)} key={chat.id}>
              <Avatar src={chat.avatarUrl} name={chat.name} />
              <div className="min-w-0 flex-1">
                <div className="chat-preview-title"><strong className="block truncate text-sm text-grey-250">{chat.name || chat.id}</strong>{chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}</div>
                <span className="mt-1 block truncate text-xs text-grey-400">{chat.lastMessageText || chat.id}</span>
              </div>
              <span className="self-start whitespace-nowrap text-[10px] text-grey-400">{formatChatDate(chat.lastMessageAt)}</span>
            </button>
          ))}
        </div>

        {chats.length === 0 && recipient && (
          <button className="chat-preview chat-preview-active" type="button" onClick={() => onSelectChat({ id: normalizeChatId(recipient), name: recipient, type: 'user', avatarUrl: '', lastMessageAt: lastMessage?.timestamp || 0, lastMessageText: lastMessage?.text || '', unreadCount: 0, messages: [] })}>
            <Avatar />
            <div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-700">{recipient}</strong><span className="mt-1 block truncate text-xs text-slate-400">{lastMessage?.text || 'Новый чат'}</span></div>
          </button>
        )}

        <div className="sidebar-footer">
          <div className="divider-x"></div>
          <div className="flex gap-2 items-center">
            <span className='text-base text-grey-50 font-medium truncate'>{accountLabel || 'Аккаунт'}</span>
            <IconButton className="ml-auto" red icon="logout" onClick={onLogout} />
          </div>
        </div>
      </div>
    </aside>
  )
}
