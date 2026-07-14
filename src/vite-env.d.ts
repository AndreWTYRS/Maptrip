/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_MAPS_SESSION_TOKEN: string
  readonly VITE_YANDEX_MAPS_API_KEY: string
  readonly VITE_CESIUM_ION_TOKEN: string
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string
  readonly VITE_META_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
