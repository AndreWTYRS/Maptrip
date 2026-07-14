import { useState } from 'react'
import {
  LOCATION_TREE,
  LOCATION_ZOOM,
  type LocationTreeNode,
} from '../config/locationTree'
import { useGlobeStore } from '../store/globeStore'
import { useAnnotationsStore } from '../store/annotationsStore'
import { districtKey } from '../utils/districtKey'

interface TreeNodeProps {
  node: LocationTreeNode
  depth: number
  selectedId: string | null
  revealedDistricts: Set<string>
  onSelect: (node: LocationTreeNode) => void
}

function TreeNode({ node, depth, selectedId, revealedDistricts, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = Boolean(node.children?.length)
  const isRevealed =
    node.type === 'district' && revealedDistricts.has(districtKey(node.lat, node.lon))

  return (
    <li className="location-tree__item">
      <div className="location-tree__row" style={{ paddingLeft: `${depth * 0.75 + 0.5}rem` }}>
        {hasChildren ? (
          <button
            type="button"
            className="location-tree__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="location-tree__toggle location-tree__toggle--spacer" />
        )}
        <button
          type="button"
          className={
            selectedId === node.id
              ? 'location-tree__label location-tree__label--selected'
              : 'location-tree__label'
          }
          onClick={() => onSelect(node)}
        >
          <span className={`location-tree__type location-tree__type--${node.type}`}>
            {node.type}
          </span>
          {node.label}
          {isRevealed && <span className="location-tree__revealed" title="Has points" />}
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className="location-tree__list">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              revealedDistricts={revealedDistricts}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function LocationTreeSidebar() {
  const requestFlyToLocation = useGlobeStore((s) => s.requestFlyToLocation)
  const selectedLocationId = useGlobeStore((s) => s.selectedLocationId)
  const setSelectedLocationId = useGlobeStore((s) => s.setSelectedLocationId)
  const points = useAnnotationsStore((s) => s.points)
  const revealedDistricts = new Set(points.map((p) => p.districtKey))

  function handleSelect(node: LocationTreeNode) {
    setSelectedLocationId(node.id)
    requestFlyToLocation(node.lat, node.lon, LOCATION_ZOOM[node.type])
  }

  return (
    <aside className="location-tree" aria-label="Countries, cities, and districts">
      <h2 className="location-tree__title">Locations</h2>
      <ul className="location-tree__list location-tree__list--root">
        {LOCATION_TREE.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedLocationId}
            revealedDistricts={revealedDistricts}
            onSelect={handleSelect}
          />
        ))}
      </ul>
    </aside>
  )
}
