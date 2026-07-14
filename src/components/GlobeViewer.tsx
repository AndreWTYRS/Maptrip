import { useEffect, useRef } from 'react'
import {
  Cartesian3,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventType,
  Terrain,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { resolveProviderForCountry } from '../config/countryProviders'
import { getMapProvider } from '../providers/registry'
import { useGlobeStore } from '../store/globeStore'
import { useRevealStore } from '../store/revealStore'
import { countryFromCoords } from '../utils/countryFromCoords'
import { altitudeToZoomLevel, getAltitudeForLevel } from '../utils/zoomLevel'

const MIN_ZOOM_DISTANCE = 30
const MAX_ZOOM_DISTANCE = 40_000_000
const INITIAL_ALTITUDE = 600_000

interface GlobeViewerProps {
  className?: string
}

export function GlobeViewer({ className }: GlobeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const recordAction = useRevealStore((s) => s.recordAction)
  const setProviderId = useGlobeStore((s) => s.setProviderId)
  const setCountryCode = useGlobeStore((s) => s.setCountryCode)
  const setAltitudeMeters = useGlobeStore((s) => s.setAltitudeMeters)
  const setCenter = useGlobeStore((s) => s.setCenter)
  const setZoomLevel = useGlobeStore((s) => s.setZoomLevel)
  const flyToLevelRequest = useGlobeStore((s) => s.flyToLevelRequest)
  const clearFlyToRequest = useGlobeStore((s) => s.clearFlyToRequest)
  const centerLat = useGlobeStore((s) => s.centerLat)
  const centerLon = useGlobeStore((s) => s.centerLon)

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
      terrain: Terrain.fromWorldTerrain(),
    })

    viewerRef.current = viewer
    viewer.scene.globe.enableLighting = true
    viewer.scene.fog.enabled = true

    const controller = viewer.scene.screenSpaceCameraController
    controller.minimumZoomDistance = MIN_ZOOM_DISTANCE
    controller.maximumZoomDistance = MAX_ZOOM_DISTANCE
    controller.enableCollisionDetection = true

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(37.6173, 55.7558, INITIAL_ALTITUDE),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
    })

    setAltitudeMeters(INITIAL_ALTITUDE)
    setZoomLevel('country')
    setCenter(55.7558, 37.6173)

    let lastHeading = viewer.camera.heading
    let lastHeight = viewer.camera.positionCartographic.height
    let providerSwitchToken = 0

    async function applyProviderForCoords(lat: number, lon: number) {
      const country = countryFromCoords(lat, lon)
      setCountryCode(country)

      const providerId = resolveProviderForCountry(country)
      setProviderId(providerId)

      const token = ++providerSwitchToken
      try {
        const provider = getMapProvider(providerId)
        const imagery = await provider.createImageryProvider()
        if (token !== providerSwitchToken) return

        viewer.imageryLayers.removeAll()
        viewer.imageryLayers.addImageryProvider(imagery)
      } catch (error) {
        console.warn(`Provider "${providerId}" failed, falling back to OSM`, error)
        if (token !== providerSwitchToken) return

        const fallback = getMapProvider('osm')
        const imagery = await fallback.createImageryProvider()
        viewer.imageryLayers.removeAll()
        viewer.imageryLayers.addImageryProvider(imagery)
        setProviderId('osm')
      }
    }

    const initialCarto = viewer.camera.positionCartographic
    void applyProviderForCoords(
      CesiumMath.toDegrees(initialCarto.latitude),
      CesiumMath.toDegrees(initialCarto.longitude),
    )

    const handler = viewer.screenSpaceEventHandler
    handler.setInputAction(() => recordAction('globe_tap'), ScreenSpaceEventType.LEFT_CLICK)

    const removeMoveEnd = viewer.camera.moveEnd.addEventListener(() => {
      const carto = viewer.camera.positionCartographic
      const lat = CesiumMath.toDegrees(carto.latitude)
      const lon = CesiumMath.toDegrees(carto.longitude)
      const height = carto.height

      setAltitudeMeters(height)
      setCenter(lat, lon)
      setZoomLevel(altitudeToZoomLevel(height))

      const headingDelta = Math.abs(viewer.camera.heading - lastHeading)
      const heightDelta = Math.abs(height - lastHeight)

      if (headingDelta > 0.01) recordAction('globe_rotate')
      if (heightDelta > height * 0.05) recordAction('globe_zoom')

      lastHeading = viewer.camera.heading
      lastHeight = height

      void applyProviderForCoords(lat, lon)
    })

    return () => {
      removeMoveEnd()
      viewer.destroy()
      viewerRef.current = null
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
    if (!viewer || !flyToLevelRequest) return

    const { level } = flyToLevelRequest
    const altitude = getAltitudeForLevel(level)

    setZoomLevel(level)
    setAltitudeMeters(altitude)
    recordAction('globe_zoom')

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(centerLon, centerLat, altitude),
      duration: 1.4,
      complete: () => clearFlyToRequest(),
      cancel: () => clearFlyToRequest(),
    })
  }, [
    flyToLevelRequest,
    centerLat,
    centerLon,
    clearFlyToRequest,
    recordAction,
    setAltitudeMeters,
    setZoomLevel,
  ])

  return <div ref={containerRef} className={className} />
}
