import { useMemo, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './app/router'
import type { Credentials } from './types/chat'
import { clearStoredCredentials, readStoredCredentials, saveCredentials } from './utils/storage'

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(() => readStoredCredentials())

  const router = useMemo(
    () =>
      createAppRouter({
        credentials,
        onAuthorized: (authorizedCredentials) => {
          saveCredentials(authorizedCredentials)
          setCredentials(authorizedCredentials)
        },
        onLogout: () => {
          clearStoredCredentials()
          setCredentials(null)
        },
      }),
    [credentials],
  )

  return <RouterProvider router={router} />
}

export default App
