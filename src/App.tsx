import { GlobeViewer } from './components/GlobeViewer'
import { GlobeStage } from './components/GlobeStage'
import { MapHud } from './components/MapHud'
import { ZoomLevelControls } from './components/ZoomLevelControls'
import './App.css'

function App() {
  return (
    <div className="app">
      <MapHud />
      <GlobeStage>
        <GlobeViewer className="globe-viewer" />
        <ZoomLevelControls />
      </GlobeStage>
    </div>
  )
}

export default App
