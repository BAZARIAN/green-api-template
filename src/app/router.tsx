import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { Credentials } from '../types/chat'
import { LoginPage } from '../pages/LoginPage'
import { ChatRoute } from '../pages/ChatRoute'

export function createAppRouter({ credentials, onAuthorized, onLogout }: { credentials: Credentials | null; onAuthorized: (credentials: Credentials) => void; onLogout: () => void }) {
  return createBrowserRouter([
    { path: '/login', element: credentials ? <Navigate to="/chat" replace /> : <LoginPage initialCredentials={credentials} onAuthorized={onAuthorized} /> },
    { path: '/chat', element: <ChatRoute credentials={credentials} onLogout={onLogout} /> },
    { path: '*', element: <Navigate to={credentials ? '/chat' : '/login'} replace /> },
  ])
}
