import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { GOOGLE_CLIENT_ID, isGoogleAuthConfigured, isMetaAuthConfigured, META_APP_ID } from '../config/auth'
import { useFacebookSdk } from '../hooks/useFacebookSdk'
import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../types/auth'

interface GoogleJwtPayload {
  sub: string
  name?: string
  email?: string
  picture?: string
}

export function AuthPanel() {
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)
  const logout = useAuthStore((s) => s.logout)
  const metaReady = useFacebookSdk(META_APP_ID)

  function handleGoogleSuccess(response: CredentialResponse) {
    if (!response.credential) return

    const payload = jwtDecode<GoogleJwtPayload>(response.credential)
    const authUser: AuthUser = {
      id: payload.sub,
      name: payload.name ?? 'Google user',
      email: payload.email ?? null,
      picture: payload.picture ?? null,
      provider: 'google',
    }

    setSession(authUser, response.credential)
  }

  function handleMetaLogin() {
    if (!metaReady || !window.FB) return

    window.FB.login(
      (response) => {
        if (!response.authResponse) return

        window.FB?.api(
          '/me',
          { fields: 'name,email,picture' },
          (profile) => {
            const authUser: AuthUser = {
              id: profile.id,
              name: profile.name,
              email: profile.email ?? null,
              picture: profile.picture?.data?.url ?? null,
              provider: 'meta',
            }
            setSession(authUser, response.authResponse!.accessToken)
          },
        )
      },
      { scope: 'email,public_profile' },
    )
  }

  function handleLogout() {
    if (user?.provider === 'meta' && window.FB) {
      window.FB.logout(() => logout())
      return
    }
    logout()
  }

  if (user) {
    return (
      <div className="auth-panel auth-panel--signed-in">
        {user.picture && (
          <img className="auth-panel__avatar" src={user.picture} alt="" />
        )}
        <div className="auth-panel__info">
          <span className="auth-panel__name">{user.name}</span>
          <span className="auth-panel__provider">
            {user.provider === 'google' ? 'Google' : 'Meta'}
          </span>
        </div>
        <button type="button" className="auth-panel__logout" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    )
  }

  const hasAnyProvider = isGoogleAuthConfigured || isMetaAuthConfigured

  return (
    <div className="auth-panel">
      {isGoogleAuthConfigured && GOOGLE_CLIENT_ID && (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.warn('Google sign-in failed')}
          useOneTap={false}
          theme="filled_black"
          size="medium"
          text="signin_with"
          shape="pill"
        />
      )}

      {isMetaAuthConfigured && (
        <button
          type="button"
          className="auth-panel__meta"
          disabled={!metaReady}
          onClick={handleMetaLogin}
        >
          Meta
        </button>
      )}

      {!hasAnyProvider && (
        <span className="auth-panel__hint">OAuth не настроен</span>
      )}
    </div>
  )
}
