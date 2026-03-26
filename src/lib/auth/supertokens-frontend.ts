'use client'

import SuperTokens from 'supertokens-auth-react'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui'
import Session from 'supertokens-auth-react/recipe/session'
import { appInfo } from './app-info'

let isFrontendInitialized = false
export const preBuiltUiList = [EmailPasswordPreBuiltUI]

export function ensureFrontendSuperTokensInit() {
  if (isFrontendInitialized || typeof window === 'undefined') {
    return
  }

  SuperTokens.init({
    appInfo,
    recipeList: [EmailPassword.init(), Session.init()],
  })

  isFrontendInitialized = true
}
