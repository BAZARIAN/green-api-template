import { useState, type FormEvent } from 'react'
import { DEFAULT_API_URL } from '../../constants'
import type { Credentials } from '../../types/chat'
import { requestApi } from '../../services/greenApi'
import { Icon } from '../common/Icon'
import { SettingsField } from '../common/SettingsField'

export function AuthForm({
  initialCredentials,
  onAuthorized,
}: {
  initialCredentials: Credentials | null
  onAuthorized: (credentials: Credentials) => void
}) {
  const [credentials, setCredentials] = useState<Credentials>(
    initialCredentials || {
      apiUrl: DEFAULT_API_URL,
      idInstance: '',
      apiTokenInstance: '',
    },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<React.ReactNode>('')

  const updateCredential = (key: keyof Credentials, value: string) => {
    setCredentials((current) => ({ ...current, [key]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = {
      apiUrl: credentials.apiUrl.trim().replace(/\/$/, ''),
      idInstance: credentials.idInstance.trim(),
      apiTokenInstance: credentials.apiTokenInstance.trim(),
    }

    if (!normalized.apiUrl || !normalized.idInstance || !normalized.apiTokenInstance) {
      setError('Заполните API URL, idInstance и apiTokenInstance')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await requestApi(normalized, 'getStateInstance')
      if (result.stateInstance !== 'authorized') {
        throw new Error(`Инстанс не авторизован: ${result.stateInstance || 'неизвестное состояние'}`)
      }
      onAuthorized(normalized)
    } catch (authError) {
      setError(<>Не удалось авторизоваться: <strong>{(authError as Error).message}</strong></>)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-layout bg-noise">
      <section className="auth-card">
        <div className="section-label">Войдите в Green-API: Chat</div>
        <div className='flex gap-1'>
          <span className='text-grey-450'>У Вас нет аккаунта?</span>
          <a className="link" href="https://console.green-api.com/auth" target="_blank">Создать</a>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <SettingsField
            label="API URL"
            value={credentials.apiUrl}
            onChange={(value) => updateCredential('apiUrl', value)}
            placeholder={DEFAULT_API_URL}
            inputMode="url"
          />
          <SettingsField
            label="idInstance"
            value={credentials.idInstance}
            onChange={(value) => updateCredential('idInstance', value)}
            placeholder="4100000000"
            inputMode="numeric"
          />
          <SettingsField
            label="apiTokenInstance"
            value={credentials.apiTokenInstance}
            onChange={(value) => updateCredential('apiTokenInstance', value)}
            placeholder="Введите токен инстанса"
            type="password"
          />
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Проверяем доступ…' : 'Продолжить'}
          </button>
          {
            error && 
              <div className="feedback feedback-error">{error}</div>
          }
        </form>
      </section>
    </main>
  )
}
