import { GlobeViewer } from './components/GlobeViewer'
import { BlurOverlay } from './components/BlurOverlay'
import { MapHud } from './components/MapHud'
import { ZoomLevelControls } from './components/ZoomLevelControls'
import './App.css'

function App() {
  return (
    <div className="app">
      <MapHud />
      <main className="globe-stage">
        <GlobeViewer className="globe-viewer" />
        <BlurOverlay />
        <ZoomLevelControls />
      </main>
    </div>
  )
}

export default App
