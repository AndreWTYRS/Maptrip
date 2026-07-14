import { GlobeViewer } from './components/GlobeViewer'
import { GlobeStage } from './components/GlobeStage'
import { LocationTreeSidebar } from './components/LocationTreeSidebar'
import { MapAnnotationToolbar } from './components/MapAnnotationToolbar'
import { MapHud } from './components/MapHud'
import { ZoomLevelControls } from './components/ZoomLevelControls'
import './App.css'

function App() {
  return (
    <div className="app">
      <MapHud />
      <div className="app__body">
        <LocationTreeSidebar />
        <GlobeStage>
          <GlobeViewer className="globe-viewer" />
          <MapAnnotationToolbar />
          <ZoomLevelControls />
        </GlobeStage>
      </div>
    </div>
  )
}

export default App
