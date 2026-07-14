export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? ''
export const META_APP_ID = import.meta.env.VITE_META_APP_ID ?? ''

export const isGoogleAuthConfigured = GOOGLE_CLIENT_ID.length > 0
export const isMetaAuthConfigured = META_APP_ID.length > 0

/** Production GitHub Pages URL — used in OAuth console setup */
export const PRODUCTION_ORIGIN = 'https://andrewtyrs.github.io'
export const PRODUCTION_SITE_URL = `${PRODUCTION_ORIGIN}/Maptrip/`
export const LOCAL_DEV_ORIGIN = 'http://localhost:5173'

/** Add these to Google Cloud Console → OAuth Client → Authorized JavaScript origins */
export const GOOGLE_OAUTH_ORIGINS = [LOCAL_DEV_ORIGIN, PRODUCTION_ORIGIN] as const

/** Meta for Developers → Facebook Login → Settings */
export const META_OAUTH_SITE_URL = PRODUCTION_SITE_URL
export const META_OAUTH_APP_DOMAIN = 'andrewtyrs.github.io'
