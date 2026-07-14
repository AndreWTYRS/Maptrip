import type { ZoomLevel } from './zoomLevels'

export type LocationNodeType = 'country' | 'city' | 'district'

export interface LocationTreeNode {
  id: string
  label: string
  type: LocationNodeType
  lat: number
  lon: number
  children?: LocationTreeNode[]
}

export const LOCATION_ZOOM: Record<LocationNodeType, ZoomLevel> = {
  country: 'country',
  city: 'city',
  district: 'district',
}

export const LOCATION_TREE: LocationTreeNode[] = [
  {
    id: 'ru',
    label: 'Russia',
    type: 'country',
    lat: 55.7558,
    lon: 37.6173,
    children: [
      {
        id: 'ru-moscow',
        label: 'Moscow',
        type: 'city',
        lat: 55.7558,
        lon: 37.6173,
        children: [
          { id: 'ru-moscow-arbat', label: 'Arbat', type: 'district', lat: 55.752, lon: 37.592 },
          { id: 'ru-moscow-tverskoy', label: 'Tverskoy', type: 'district', lat: 55.764, lon: 37.61 },
          { id: 'ru-moscow-kitay', label: 'Kitay-gorod', type: 'district', lat: 55.756, lon: 37.634 },
          {
            id: 'ru-moscow-zamoskvorechye',
            label: 'Zamoskvorechye',
            type: 'district',
            lat: 55.735,
            lon: 37.637,
          },
        ],
      },
      {
        id: 'ru-spb',
        label: 'Saint Petersburg',
        type: 'city',
        lat: 59.9343,
        lon: 30.3351,
        children: [
          {
            id: 'ru-spb-centro',
            label: 'Central District',
            type: 'district',
            lat: 59.9343,
            lon: 30.3351,
          },
          {
            id: 'ru-spb-vasileostrovsky',
            label: 'Vasileostrovsky',
            type: 'district',
            lat: 59.942,
            lon: 30.278,
          },
        ],
      },
    ],
  },
  {
    id: 'us',
    label: 'United States',
    type: 'country',
    lat: 40.7128,
    lon: -74.006,
    children: [
      {
        id: 'us-nyc',
        label: 'New York',
        type: 'city',
        lat: 40.7128,
        lon: -74.006,
        children: [
          {
            id: 'us-nyc-manhattan',
            label: 'Manhattan',
            type: 'district',
            lat: 40.758,
            lon: -73.9855,
          },
          {
            id: 'us-nyc-brooklyn',
            label: 'Brooklyn',
            type: 'district',
            lat: 40.6782,
            lon: -73.9442,
          },
        ],
      },
      {
        id: 'us-la',
        label: 'Los Angeles',
        type: 'city',
        lat: 34.0522,
        lon: -118.2437,
        children: [
          {
            id: 'us-la-hollywood',
            label: 'Hollywood',
            type: 'district',
            lat: 34.0928,
            lon: -118.3287,
          },
          {
            id: 'us-la-downtown',
            label: 'Downtown',
            type: 'district',
            lat: 34.0407,
            lon: -118.2468,
          },
        ],
      },
    ],
  },
  {
    id: 'gb',
    label: 'United Kingdom',
    type: 'country',
    lat: 51.5074,
    lon: -0.1278,
    children: [
      {
        id: 'gb-london',
        label: 'London',
        type: 'city',
        lat: 51.5074,
        lon: -0.1278,
        children: [
          {
            id: 'gb-london-westminster',
            label: 'Westminster',
            type: 'district',
            lat: 51.4975,
            lon: -0.1357,
          },
          {
            id: 'gb-london-camden',
            label: 'Camden',
            type: 'district',
            lat: 51.539,
            lon: -0.1426,
          },
        ],
      },
    ],
  },
  {
    id: 'fr',
    label: 'France',
    type: 'country',
    lat: 48.8566,
    lon: 2.3522,
    children: [
      {
        id: 'fr-paris',
        label: 'Paris',
        type: 'city',
        lat: 48.8566,
        lon: 2.3522,
        children: [
          {
            id: 'fr-paris-marais',
            label: 'Le Marais',
            type: 'district',
            lat: 48.8566,
            lon: 2.3622,
          },
          {
            id: 'fr-paris-montmartre',
            label: 'Montmartre',
            type: 'district',
            lat: 48.8867,
            lon: 2.3431,
          },
        ],
      },
    ],
  },
]
