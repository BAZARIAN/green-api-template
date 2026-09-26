import { Navigate } from 'react-router-dom'
import type { Credentials } from '../types/chat'
import { ChatPage } from '../components/chat/ChatPage'

export function ChatRoute({ credentials, onLogout }: { credentials: Credentials | null; onLogout: () => void }) {
  if (!credentials) return <Navigate to="/login" replace />
  return <ChatPage credentials={credentials} onLogout={onLogout} />
}
