# MapTrip — 3D Globe

Interactive 3D globe with grayscale map coloring, neighborhood-level zoom, and country-based map provider switching.

**Live demo:** https://andrewtyrs.github.io/Maptrip/

> If the link returns 404, enable Pages once:  
> **Settings → Pages → Build and deployment → Source: Deploy from branch → `gh-pages` / `/ (root)`**  
> The site should appear within 1–2 minutes.

## Features

- **3D globe** — rotate, pinch/scroll zoom, down to ~30 m (district level)
- **Grayscale map** — full color at world zoom; country/city/district use gray tones until user input
- **Google Maps** — default provider (via Map Tiles API)
- **Country-based providers** — e.g. Yandex for RU/BY/KZ (configure in `src/config/countryProviders.ts`)
- **Zoom levels** — World / Country / City / District buttons with smooth camera fly-to
- **OAuth** — sign in with Google (Meta available on localhost only)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps Platform API key |
| `VITE_GOOGLE_MAPS_SESSION_TOKEN` | Session token from [Map Tiles API](https://developers.google.com/maps/documentation/tile/session_tokens) |
| `VITE_YANDEX_MAPS_API_KEY` | Yandex Maps API key (RU/CIS) |
| `VITE_CESIUM_ION_TOKEN` | [Cesium Ion](https://ion.cesium.com/) token (terrain + fallback imagery) |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | OAuth 2.0 Client ID for Google Sign-In |
| `VITE_META_APP_ID` | App ID for Meta (Facebook) Login |

Without Google credentials, OpenStreetMap is used as fallback. Without an Ion token, terrain may not load.

### OAuth

**Google:** create an OAuth Client ID (Web application) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add origins:
- `http://localhost:5173`
- `https://andrewtyrs.github.io`

**Meta:** create an app in [Meta for Developers](https://developers.facebook.com/), enable Facebook Login, add `localhost` and `andrewtyrs.github.io` to Valid OAuth Redirect URIs.

Add secrets in GitHub Actions: **Settings → Secrets and variables → Actions** → `VITE_GOOGLE_OAUTH_CLIENT_ID`, `VITE_META_APP_ID`.

## Zoom levels

Bottom toolbar switches the camera to fixed altitudes:

| Level | Camera height |
|---|---|
| World | ~15,000 km |
| Country | ~600 km |
| City | ~15 km |
| District | ~800 m |

Configure in `src/config/zoomLevels.ts`. The active button updates automatically when zooming manually.

## User input for color reveal

File `src/config/revealActions.ts`:

```ts
export const REVEAL_CONFIG = {
  requiredActions: [],
  mode: 'any',
}
```

Built-in action ids:

- `globe_rotate` — rotate the globe
- `globe_zoom` — change zoom level
- `globe_tap` — click/tap the map

## Country-based map providers

File `src/config/countryProviders.ts`:

```ts
export const COUNTRY_PROVIDER_MAP = {
  RU: 'yandex',
  BY: 'yandex',
  KZ: 'yandex',
}
```

Add a new provider in `src/providers/` and register it in `src/providers/registry.ts`.

## Stack

- React 19 + TypeScript + Vite
- [CesiumJS](https://cesium.com/platform/cesiumjs/) — 3D globe & terrain
- Zustand — map color and provider state
