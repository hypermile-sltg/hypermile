'use client'

import { SessionProvider, getSession, signOut } from 'next-auth/react'
import { useEffect, useRef } from 'react'

function StaleSessionCleaner() {
  const cleaned = useRef(false)

  useEffect(() => {
    if (cleaned.current) return
    cleaned.current = true

    const hasAuthCookie =
      document.cookie.includes('next-auth.session-token') ||
      document.cookie.includes('__Secure-next-auth.session-token')

    if (!hasAuthCookie) return

    void getSession().then((session) => {
      if (!session) {
        void signOut({ redirect: false })
      }
    })
  }, [])

  return null
}

export default function AuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: React.ComponentProps<typeof SessionProvider>['session']
}) {
  return (
    <SessionProvider session={session}>
      <StaleSessionCleaner />
      {children}
    </SessionProvider>
  )
}
