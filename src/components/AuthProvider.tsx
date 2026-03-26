'use client'

import { useEffect } from 'react'
import { SuperTokensWrapper } from 'supertokens-auth-react'
import { ensureFrontendSuperTokensInit } from '../lib/auth/supertokens-frontend'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureFrontendSuperTokensInit()
  }, [])

  return <SuperTokensWrapper>{children}</SuperTokensWrapper>
}
