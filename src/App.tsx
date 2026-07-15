import { lazy, Suspense } from 'react'
import { MapHud } from './components/MapHud'
import './App.css'

const LocationTreeSidebar = lazy(() =>
  import('./components/LocationTreeSidebar').then((m) => ({ default: m.LocationTreeSidebar })),
)
const MarksListSidebar = lazy(() =>
  import('./components/MarksListSidebar').then((m) => ({ default: m.MarksListSidebar })),
)
const GlobeStage = lazy(() =>
  import('./components/GlobeStage').then((m) => ({ default: m.GlobeStage })),
)
const GlobeViewer = lazy(() =>
  import('./components/GlobeViewer').then((m) => ({ default: m.GlobeViewer })),
)
const MapAnnotationToolbar = lazy(() =>
  import('./components/MapAnnotationToolbar').then((m) => ({ default: m.MapAnnotationToolbar })),
)
const ZoomLevelControls = lazy(() =>
  import('./components/ZoomLevelControls').then((m) => ({ default: m.ZoomLevelControls })),
)

function SidebarFallback() {
  return <aside className="location-tree app-loading-sidebar" aria-hidden="true" />
}

function GlobeFallback() {
  return (
    <main className="globe-stage globe-stage--color">
      <div className="globe-viewer globe-viewer--loading" aria-busy="true" aria-label="Loading globe" />
    </main>
  )
}

function App() {
  return (
    <div className="app">
      <MapHud />
      <div className="app__body">
        <Suspense fallback={<SidebarFallback />}>
          <LocationTreeSidebar />
        </Suspense>
        <Suspense fallback={<GlobeFallback />}>
          <GlobeStage>
            <GlobeViewer className="globe-viewer" />
            <Suspense fallback={null}>
              <MapAnnotationToolbar />
              <ZoomLevelControls />
            </Suspense>
          </GlobeStage>
        </Suspense>
        <Suspense fallback={<SidebarFallback />}>
          <MarksListSidebar />
        </Suspense>
      </div>
    </div>
  )
}

export default App
