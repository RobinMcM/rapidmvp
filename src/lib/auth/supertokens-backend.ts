import SuperTokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import { appInfo, authEnv } from './app-info'

let isInitialized = false

export function ensureSuperTokensInit() {
  if (isInitialized) {
    return
  }

  SuperTokens.init({
    supertokens: {
      connectionURI: authEnv.supertokensConnectionUri,
      apiKey: authEnv.supertokensApiKey,
    },
    appInfo,
    recipeList: [
      EmailPassword.init(),
      Session.init({
        cookieDomain: authEnv.cookieDomain,
        cookieSecure: authEnv.apiDomain.startsWith('https://'),
        // Required for cross-site subdomain auth flows over HTTPS.
        antiCsrf: 'VIA_TOKEN',
      }),
    ],
  })

  isInitialized = true
}
