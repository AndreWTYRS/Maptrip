export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? ''
export const META_APP_ID = import.meta.env.VITE_META_APP_ID ?? ''

export const isGoogleAuthConfigured = GOOGLE_CLIENT_ID.length > 0
export const isMetaAuthConfigured = META_APP_ID.length > 0
