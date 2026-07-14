export type AuthProvider = 'google' | 'meta'

export interface AuthUser {
  id: string
  name: string
  email: string | null
  picture: string | null
  provider: AuthProvider
}
