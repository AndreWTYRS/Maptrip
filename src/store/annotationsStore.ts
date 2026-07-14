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
  removePoint: (userId: string, pointId: string) => void
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

function recomputeAllRevealedDistricts(points: MapPoint[]): string[] {
  return [...new Set(points.map((p) => p.districtKey))]
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

      removePoint: (userId, pointId) =>
        set((state) => {
          const point = state.points.find((p) => p.id === pointId && p.userId === userId)
          if (!point) return state

          const points = state.points.filter((p) => p.id !== pointId)
          return {
            points,
            revealedDistrictKeys: recomputeAllRevealedDistricts(points),
          }
        }),

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
            revealedDistrictKeys: recomputeAllRevealedDistricts(points),
          }
        }),

      getRevealedDistricts: () => new Set(get().revealedDistrictKeys),
    }),
    { name: 'maptrip-annotations' },
  ),
)
