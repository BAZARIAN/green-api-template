import type { Credentials } from '../types/chat'
import { AuthForm } from '../components/auth/AuthForm'

export function LoginPage({
  initialCredentials,
  onAuthorized,
}: {
  initialCredentials: Credentials | null
  onAuthorized: (credentials: Credentials) => void
}) {
  return <AuthForm initialCredentials={initialCredentials} onAuthorized={onAuthorized} />
}
