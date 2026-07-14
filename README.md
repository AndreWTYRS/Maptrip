# MapTrip — 3D Globe

Интерактивный 3D-глобус с размытой картой, зумом до уровня района и сменой провайдера карт по стране.

**Live demo:** https://andrewtyrs.github.io/Maptrip/

> Если ссылка отдаёт 404 — один раз включите Pages:  
> **Settings → Pages → Build and deployment → Source: Deploy from branch → `gh-pages` / `/ (root)`**  
> После этого сайт появится через 1–2 минуты.

## Возможности

- **3D-глобус** — вращение, pinch/scroll zoom, приближение до ~30 м (уровень района)
- **Blur по умолчанию** — карта скрыта, раскрывается после действий пользователя
- **Google Maps** — основной провайдер (через Map Tiles API)
- **Смена провайдера по стране** — например, Yandex для RU/BY/KZ (настраивается в `src/config/countryProviders.ts`)
- **Уровни зума** — кнопки «Страна / Город / Район» с плавным перелётом камеры
- **OAuth** — вход через Google и Meta (Facebook)

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

| Переменная | Описание |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | API-ключ Google Maps Platform |
| `VITE_GOOGLE_MAPS_SESSION_TOKEN` | Session token из [Map Tiles API](https://developers.google.com/maps/documentation/tile/session_tokens) |
| `VITE_YANDEX_MAPS_API_KEY` | API-ключ Yandex Maps (для RU/CIS) |
| `VITE_CESIUM_ION_TOKEN` | [Cesium Ion](https://ion.cesium.com/) token (terrain + fallback imagery) |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | OAuth 2.0 Client ID для Google Sign-In |
| `VITE_META_APP_ID` | App ID для Meta (Facebook) Login |

Без Google credentials используется спутниковая подложка Cesium Ion. Без Ion token terrain может не загрузиться.

### OAuth

**Google:** создайте OAuth Client ID (Web application) в [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Добавьте origins:
- `http://localhost:5173`
- `https://andrewtyrs.github.io`

**Meta:** создайте приложение в [Meta for Developers](https://developers.facebook.com/), включите Facebook Login, добавьте `localhost` и `andrewtyrs.github.io` в Valid OAuth Redirect URIs.

## Уровни зума

Кнопки внизу экрана переключают камеру на фиксированные высоты:

| Уровень | Высота камеры |
|---|---|
| Страна | ~600 км |
| Город | ~15 км |
| Район | ~800 м |

Настройка в `src/config/zoomLevels.ts`. При ручном зуме активная кнопка обновляется автоматически.

## Настройка действий для раскрытия карты

Файл `src/config/revealActions.ts`:

```ts
export const REVEAL_CONFIG = {
  requiredActions: ['globe_rotate'],
  mode: 'any',
}
```

Встроенные action id:

- `globe_rotate` — поворот глобуса
- `globe_zoom` — изменение масштаба
- `globe_tap` — клик/тап по карте

## Смена провайдера по стране

Файл `src/config/countryProviders.ts`:

```ts
export const COUNTRY_PROVIDER_MAP = {
  RU: 'yandex',
  BY: 'yandex',
  KZ: 'yandex',
}
```

Добавьте новый провайдер в `src/providers/` и зарегистрируйте в `src/providers/registry.ts`.

## Стек

- React 19 + TypeScript + Vite
- [CesiumJS](https://cesium.com/platform/cesiumjs/) — 3D globe & terrain
- Zustand — состояние blur и провайдера
