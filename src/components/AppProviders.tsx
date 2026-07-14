import { GoogleOAuthProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { GOOGLE_CLIENT_ID, isGoogleAuthConfigured } from '../config/auth'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  if (isGoogleAuthConfigured) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="ru">{children}</GoogleOAuthProvider>
  }

  return children
}
