import { useEffect, useState } from 'react'

export function useFacebookSdk(appId: string): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!appId) {
      setReady(false)
      return
    }

    if (window.FB) {
      setReady(true)
      return
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v21.0',
      })
      setReady(true)
    }

    const existing = document.getElementById('facebook-jssdk')
    if (existing && window.FB) {
      setReady(true)
      return
    }
    if (existing) return

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/ru_RU/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [appId])

  return ready
}
