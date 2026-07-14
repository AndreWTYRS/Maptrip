import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnnotationMode, MapPoint, MapRoute } from '../types/annotations'
import { districtKey, districtKeysForCoords } from '../utils/districtKey'

interface RouteDraftPoint {
  lat: number
  lon: number
  districtKey: string
}

interface AnnotationsState {
  points: MapPoint[]
  routes: MapRoute[]
  revealedDistrictKeys: string[]
  annotationMode: AnnotationMode
  routeDraft: RouteDraftPoint[] | null
  addPoint: (userId: string, lat: number, lon: number) => void
  addRouteWaypoint: (lat: number, lon: number) => void
  finishRoute: (userId: string) => void
  cancelRouteDraft: () => void
  setAnnotationMode: (mode: AnnotationMode) => void
  clearUserAnnotations: (userId: string) => void
  getRevealedDistricts: () => Set<string>
}

function revealDistricts(keys: string[], existing: string[]): string[] {
  return [...new Set([...existing, ...keys])]
}

function recomputeRevealedDistricts(
  points: MapPoint[],
  routes: MapRoute[],
  userId: string,
): string[] {
  const keys = new Set<string>()
  for (const point of points) {
    if (point.userId === userId) keys.add(point.districtKey)
  }
  for (const route of routes) {
    if (route.userId === userId) {
      for (const key of route.districtKeys) keys.add(key)
    }
  }
  return [...keys]
}

export const useAnnotationsStore = create<AnnotationsState>()(
  persist(
    (set, get) => ({
      points: [],
      routes: [],
      revealedDistrictKeys: [],
      annotationMode: 'none',
      routeDraft: null,

      addPoint: (userId, lat, lon) => {
        const key = districtKey(lat, lon)
        const point: MapPoint = {
          id: crypto.randomUUID(),
          userId,
          lat,
          lon,
          label: `Point ${get().points.filter((p) => p.userId === userId).length + 1}`,
          districtKey: key,
          createdAt: Date.now(),
        }
        set((state) => ({
          points: [...state.points, point],
          revealedDistrictKeys: revealDistricts([key], state.revealedDistrictKeys),
          annotationMode: 'none',
        }))
      },

      addRouteWaypoint: (lat, lon) => {
        const waypoint: RouteDraftPoint = { lat, lon, districtKey: districtKey(lat, lon) }
        set((state) => ({
          routeDraft: state.routeDraft ? [...state.routeDraft, waypoint] : [waypoint],
        }))
      },

      finishRoute: (userId) => {
        const draft = get().routeDraft
        if (!draft || draft.length < 2) return

        const route: MapRoute = {
          id: crypto.randomUUID(),
          userId,
          name: `Route ${get().routes.filter((r) => r.userId === userId).length + 1}`,
          points: draft,
          districtKeys: districtKeysForCoords(draft),
          createdAt: Date.now(),
        }

        set((state) => ({
          routes: [...state.routes, route],
          routeDraft: null,
          annotationMode: 'none',
          revealedDistrictKeys: revealDistricts(route.districtKeys, state.revealedDistrictKeys),
        }))
      },

      cancelRouteDraft: () => set({ routeDraft: null, annotationMode: 'none' }),

      setAnnotationMode: (mode) =>
        set({
          annotationMode: mode,
          routeDraft: mode === 'route' ? [] : null,
        }),

      clearUserAnnotations: (userId) =>
        set((state) => {
          const points = state.points.filter((p) => p.userId !== userId)
          const routes = state.routes.filter((r) => r.userId !== userId)
          return {
            points,
            routes,
            routeDraft: null,
            annotationMode: 'none',
            revealedDistrictKeys: recomputeRevealedDistricts(points, routes, userId),
          }
        }),

      getRevealedDistricts: () => new Set(get().revealedDistrictKeys),
    }),
    { name: 'maptrip-annotations' },
  ),
)
