interface FacebookAuthResponse {
  accessToken: string
  userID: string
  expiresIn: number
  signedRequest: string
  graphDomain: string
  data_access_expiration_time: number
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null
  status: 'connected' | 'not_authorized' | 'unknown'
}

interface FacebookUserProfile {
  id: string
  name: string
  email?: string
  picture?: {
    data?: {
      url?: string
    }
  }
}

interface FacebookStatic {
  init: (params: {
    appId: string
    cookie?: boolean
    xfbml?: boolean
    version: string
  }) => void
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope: string },
  ) => void
  logout: (callback: () => void) => void
  api: (
    path: string,
    params: { fields: string },
    callback: (response: FacebookUserProfile) => void,
  ) => void
  getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void
}

interface Window {
  FB?: FacebookStatic
  fbAsyncInit?: () => void
}
