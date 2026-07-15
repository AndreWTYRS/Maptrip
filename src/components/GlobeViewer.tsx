import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CameraEventType,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  HeightReference,
  Ion,
  LabelStyle,
  Math as CesiumMath,
  VerticalOrigin,
  ScreenSpaceEventType,
  Terrain,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { getMapProvider } from '../providers/registry'
import { useAnnotationsStore } from '../store/annotationsStore'
import { useAuthStore } from '../store/authStore'
import { useGlobeStore } from '../store/globeStore'
import { useRevealStore } from '../store/revealStore'
import { getKrGuById, isKrGuDistrictKey, isValidLatLonRing, loadKrGuLookup, ringToCesiumDegrees } from '../config/districtsByCity/krGuLookup'
import { useGoogleLocationStore } from '../store/googleLocationStore'
import { countryFromCoords } from '../utils/countryFromCoords'
import {
  DISTRICT_BORDER_CSS,
  DISTRICT_BORDER_WIDTH,
  DISTRICT_FILL_RADIUS_M,
  isInSouthKorea,
} from '../utils/districtKey'
import { altitudeToZoomLevel, getAltitudeForLevel } from '../utils/zoomLevel'

const MIN_ZOOM_DISTANCE = 30
const MAX_ZOOM_DISTANCE = 40_000_000
const INITIAL_ALTITUDE = 15_000_000
const DISTRICT_BORDER_COLOR = Color.fromCssColorString(DISTRICT_BORDER_CSS)
const DISTRICT_OUTLINE_FILL = Color.fromCssColorString('#ffffff').withAlpha(0.01)

function addDistrictPolygon(
  viewer: Viewer,
  id: string,
  ring: Array<[number, number]>,
  options: {
    material: Color
    outlineColor: Color
    outlineWidth: number
  },
) {
  if (!isValidLatLonRing(ring)) return

  try {
    viewer.entities.add({
      id,
      polygon: {
        hierarchy: Cartesian3.fromDegreesArray(ringToCesiumDegrees(ring)),
        material: options.material,
        outline: true,
        outlineColor: options.outlineColor,
        outlineWidth: options.outlineWidth,
        height: 0,
        heightReference: HeightReference.CLAMP_TO_GROUND,
      },
    })
  } catch (error) {
    console.warn('Skipped invalid district polygon', id, error)
  }
}

interface GlobeViewerProps {
  className?: string
}

function pickCoords(viewer: Viewer, position: Cartesian2) {
  const cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid)
  if (!cartesian) return null

  const cartographic = Cartographic.fromCartesian(cartesian)
  return {
    lat: CesiumMath.toDegrees(cartographic.latitude),
    lon: CesiumMath.toDegrees(cartographic.longitude),
  }
}

export function GlobeViewer({ className }: GlobeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [viewerReady, setViewerReady] = useState(false)
  const [krBoundariesReady, setKrBoundariesReady] = useState(false)

  const user = useAuthStore((s) => s.user)
  const recordAction = useRevealStore((s) => s.recordAction)
  const setProviderId = useGlobeStore((s) => s.setProviderId)
  const setCountryCode = useGlobeStore((s) => s.setCountryCode)
  const setAltitudeMeters = useGlobeStore((s) => s.setAltitudeMeters)
  const setCenter = useGlobeStore((s) => s.setCenter)
  const setZoomLevel = useGlobeStore((s) => s.setZoomLevel)
  const flyToLevelRequest = useGlobeStore((s) => s.flyToLevelRequest)
  const flyToLocationRequest = useGlobeStore((s) => s.flyToLocationRequest)
  const clearFlyToRequest = useGlobeStore((s) => s.clearFlyToRequest)
  const countryCode = useGlobeStore((s) => s.countryCode)
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const activeDistrictCityId = useGlobeStore((s) => s.activeDistrictCityId)
  const activeDistrictId = useGlobeStore((s) => s.activeDistrictId)

  const districtsByCityId = useGoogleLocationStore((s) => s.districtsByCityId)

  const districtsToOutline = useMemo(() => {
    if (!activeDistrictCityId) return []
    const districts = districtsByCityId[activeDistrictCityId] ?? []
    if (activeDistrictId) return districts.filter((district) => district.id === activeDistrictId)
    return districts
  }, [activeDistrictCityId, activeDistrictId, districtsByCityId])

  const points = useAnnotationsStore((s) => s.points)
  const routes = useAnnotationsStore((s) => s.routes)
  const routeDraft = useAnnotationsStore((s) => s.routeDraft)
  const annotationMode = useAnnotationsStore((s) => s.annotationMode)
  const addPoint = useAnnotationsStore((s) => s.addPoint)
  const addRouteWaypoint = useAnnotationsStore((s) => s.addRouteWaypoint)

  const revealedDistrictKeys = useMemo(() => {
    const userId = user?.id
    const keys = new Set<string>()
    for (const point of points.filter((p) => !userId || p.userId === userId)) {
      keys.add(point.districtKey)
    }
    return [...keys]
  }, [points, user])

  useEffect(() => {
    const needsKr =
      countryCode === 'KR' ||
      revealedDistrictKeys.some((key) => isKrGuDistrictKey(key)) ||
      points.some((point) => isInSouthKorea(point.lat, point.lon))
    if (!needsKr) return

    void loadKrGuLookup().then(() => setKrBoundariesReady(true))
  }, [countryCode, points, revealedDistrictKeys])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN
    if (ionToken) Ion.defaultAccessToken = ionToken

    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      ...(ionToken ? { terrain: Terrain.fromWorldTerrain() } : {}),
    })

    viewerRef.current = viewer
    setViewerReady(true)
    viewer.scene.globe.enableLighting = true
    viewer.scene.fog.enabled = true

    const controller = viewer.scene.screenSpaceCameraController
    controller.minimumZoomDistance = MIN_ZOOM_DISTANCE
    controller.maximumZoomDistance = MAX_ZOOM_DISTANCE
    controller.enableCollisionDetection = true
    controller.enableZoom = true
    controller.zoomEventTypes = [CameraEventType.WHEEL, CameraEventType.PINCH]

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
    }
    container.addEventListener('wheel', onWheel, { passive: false })

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(37.6173, 55.7558, INITIAL_ALTITUDE),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
    })

    setAltitudeMeters(INITIAL_ALTITUDE)
    setZoomLevel('world')
    setCenter(55.7558, 37.6173)

    let lastHeading = viewer.camera.heading
    let lastHeight = viewer.camera.positionCartographic.height

    async function applyOsmProvider() {
      const provider = getMapProvider('osm')
      const imagery = await provider.createImageryProvider()
      viewer.imageryLayers.removeAll()
      viewer.imageryLayers.addImageryProvider(imagery)
      setProviderId('osm')
    }

    void applyOsmProvider()
    setCountryCode(countryFromCoords(55.7558, 37.6173))

    const removeMoveEnd = viewer.camera.moveEnd.addEventListener(() => {
      const carto = viewer.camera.positionCartographic
      const lat = CesiumMath.toDegrees(carto.latitude)
      const lon = CesiumMath.toDegrees(carto.longitude)
      const height = carto.height

      setAltitudeMeters(height)
      setCenter(lat, lon)
      setZoomLevel(altitudeToZoomLevel(height))
      setCountryCode(countryFromCoords(lat, lon))

      const headingDelta = Math.abs(viewer.camera.heading - lastHeading)
      const heightDelta = Math.abs(height - lastHeight)

      if (headingDelta > 0.01) recordAction('globe_rotate')
      if (heightDelta > height * 0.05) recordAction('globe_zoom')

      lastHeading = viewer.camera.heading
      lastHeight = height
    })

    return () => {
      container.removeEventListener('wheel', onWheel)
      removeMoveEnd()
      viewer.destroy()
      viewerRef.current = null
      setViewerReady(false)
    }
  }, [
    recordAction,
    setAltitudeMeters,
    setCenter,
    setCountryCode,
    setProviderId,
    setZoomLevel,
  ])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady) return

    const handler = viewer.screenSpaceEventHandler

    const onClick = (movement: { position: Cartesian2 }) => {
      recordAction('globe_tap')

      if (!user) return

      const coords = pickCoords(viewer, movement.position)
      if (!coords) return

      if (annotationMode === 'point') {
        void addPoint(user.id, coords.lat, coords.lon)
        return
      }

      if (annotationMode === 'route') {
        void addRouteWaypoint(coords.lat, coords.lon)
      }
    }

    handler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
    }
  }, [
    viewerReady,
    user,
    annotationMode,
    addPoint,
    addRouteWaypoint,
    recordAction,
  ])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady) return

    const stale = viewer.entities.values.filter(
      (entity) => typeof entity.id === 'string' && entity.id.startsWith('ann-'),
    )
    for (const entity of stale) {
      viewer.entities.remove(entity)
    }

    const userId = user?.id
    const fillColor = Color.fromCssColorString('#638cff').withAlpha(0.38)
    const outlineColor = DISTRICT_BORDER_COLOR

    for (const districtKeyValue of revealedDistrictKeys) {
      if (isKrGuDistrictKey(districtKeyValue)) {
        const gu = getKrGuById(districtKeyValue)
        const rings = gu?.rings ?? []
        if (rings.length) {
          for (const [ringIndex, ring] of rings.entries()) {
            addDistrictPolygon(viewer, `ann-district-${districtKeyValue}-${ringIndex}`, ring, {
              material: fillColor,
              outlineColor,
              outlineWidth: 2,
            })
          }
          continue
        }
      }

      const samplePoint = points.find((point) => point.districtKey === districtKeyValue)
      if (!samplePoint) continue

      viewer.entities.add({
        id: `ann-district-${districtKeyValue}`,
        position: Cartesian3.fromDegrees(samplePoint.lon, samplePoint.lat),
        ellipse: {
          semiMajorAxis: DISTRICT_FILL_RADIUS_M,
          semiMinorAxis: DISTRICT_FILL_RADIUS_M,
          material: fillColor,
          outline: true,
          outlineColor,
          outlineWidth: 2,
          height: 0,
        },
      })
    }

    if (userId) {
      for (const point of points.filter((p) => p.userId === userId)) {
        viewer.entities.add({
          id: `ann-point-${point.id}`,
          position: Cartesian3.fromDegrees(point.lon, point.lat),
          point: {
            pixelSize: 11,
            color: Color.WHITE,
            outlineColor: Color.fromCssColorString('#638cff'),
            outlineWidth: 2,
          },
          label: {
            text: point.label,
            font: '13px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: new Cartesian2(0, -18),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })
      }

      for (const route of routes.filter((r) => r.userId === userId)) {
        viewer.entities.add({
          id: `ann-route-${route.id}`,
          polyline: {
            positions: Cartesian3.fromDegreesArray(
              route.points.flatMap((p) => [p.lon, p.lat]),
            ),
            width: 4,
            material: Color.fromCssColorString('#ffd166'),
            clampToGround: true,
          },
        })
      }

      if (routeDraft && routeDraft.length > 0) {
        viewer.entities.add({
          id: 'ann-draft-polyline',
          polyline: {
            positions: Cartesian3.fromDegreesArray(
              routeDraft.flatMap((p) => [p.lon, p.lat]),
            ),
            width: 3,
            material: Color.fromCssColorString('#ffd166').withAlpha(0.7),
            clampToGround: true,
          },
        })

        for (const [index, waypoint] of routeDraft.entries()) {
          viewer.entities.add({
            id: `ann-draft-point-${index}`,
            position: Cartesian3.fromDegrees(waypoint.lon, waypoint.lat),
            point: {
              pixelSize: 9,
              color: Color.fromCssColorString('#ffd166'),
              outlineColor: Color.WHITE,
              outlineWidth: 1,
            },
          })
        }
      }
    }
  }, [viewerReady, user, points, routes, routeDraft, revealedDistrictKeys, krBoundariesReady])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady) return

    const stale = viewer.entities.values.filter(
      (entity) => typeof entity.id === 'string' && entity.id.startsWith('district-boundary-'),
    )
    for (const entity of stale) {
      viewer.entities.remove(entity)
    }

    if (!districtsToOutline.length) return
    if (zoomLevel !== 'city' && zoomLevel !== 'district') return

    const isKrSelection =
      activeDistrictCityId?.startsWith('kr-') ||
      countryCode === 'KR' ||
      Boolean(activeDistrictId?.startsWith('kr-gu-'))
    if (!isKrSelection) return

    for (const district of districtsToOutline) {
      const rings = district.boundaryRings
      if (!rings?.length) continue

      for (const [ringIndex, ring] of rings.entries()) {
        addDistrictPolygon(viewer, `district-boundary-${district.id}-${ringIndex}`, ring, {
          material: DISTRICT_OUTLINE_FILL,
          outlineColor: DISTRICT_BORDER_COLOR,
          outlineWidth: DISTRICT_BORDER_WIDTH,
        })
      }
    }
  }, [
    viewerReady,
    countryCode,
    zoomLevel,
    districtsToOutline,
    activeDistrictCityId,
    activeDistrictId,
  ])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady) return

    const levelTarget = flyToLevelRequest
      ? {
          lat: useGlobeStore.getState().centerLat,
          lon: useGlobeStore.getState().centerLon,
          level: flyToLevelRequest.level,
        }
      : null
    const target = flyToLocationRequest ?? levelTarget
    if (!target) return

    const altitude = getAltitudeForLevel(target.level)

    setCenter(target.lat, target.lon)
    setZoomLevel(target.level)
    setAltitudeMeters(altitude)
    recordAction('globe_zoom')

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(target.lon, target.lat, altitude),
      duration: 1.4,
      complete: () => clearFlyToRequest(),
      cancel: () => clearFlyToRequest(),
    })
  }, [
    viewerReady,
    flyToLevelRequest,
    flyToLocationRequest,
    clearFlyToRequest,
    recordAction,
    setAltitudeMeters,
    setCenter,
    setZoomLevel,
  ])

  return <div ref={containerRef} className={className} />
}
