import type { ArchConfidence, ArchitectureModel, ArchNode, ArchNodeKind } from '../../lib/repository/architecture-model'

/**
 * Pure, deterministic layered layout for the repository architecture graph.
 *
 * Coordinates are computed in a fixed pixel space so the SVG connector lines and
 * the absolutely-positioned node cards share one coordinate system — no runtime
 * DOM measurement. The model is small (a handful of nodes), so a simple layered
 * (top-to-bottom) layout reads cleanly.
 */

export const CARD_W = 210
export const CARD_H = 76
export const GAP_X = 36
export const ROW_H = 150
export const PAD = 24

export type PositionedNode = { node: ArchNode; x: number; y: number }

export type PositionedEdge = {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  midX: number
  midY: number
  label?: string
  confidence: ArchConfidence
}

export type GraphLayout = {
  nodes: PositionedNode[]
  edges: PositionedEdge[]
  width: number
  height: number
}

function layerOf(kind: ArchNodeKind): number {
  if (kind === 'user') return 0
  if (kind === 'application') return 1
  if (kind === 'deployment_target') return 3
  return 2 // database, authentication, storage, email, queue, external_service
}

export function layoutArchitecture(model: ArchitectureModel): GraphLayout {
  // Bucket nodes into their conceptual layers.
  const buckets: ArchNode[][] = [[], [], [], []]
  for (const n of model.nodes) buckets[layerOf(n.kind)].push(n)

  // Compact: keep only non-empty layers, preserving order, so sparse repos
  // don't leave empty rows.
  const usedLayers = buckets.filter((b) => b.length > 0)

  const layerWidth = (count: number) => count * CARD_W + Math.max(0, count - 1) * GAP_X
  const canvasInner = Math.max(CARD_W, ...usedLayers.map((b) => layerWidth(b.length)))

  const pos = new Map<string, { x: number; y: number }>()
  const nodes: PositionedNode[] = []

  usedLayers.forEach((layer, rowIndex) => {
    const w = layerWidth(layer.length)
    const startX = PAD + (canvasInner - w) / 2
    const y = PAD + rowIndex * ROW_H
    layer.forEach((node, i) => {
      const x = startX + i * (CARD_W + GAP_X)
      pos.set(node.id, { x, y })
      nodes.push({ node, x, y })
    })
  })

  const edges: PositionedEdge[] = []
  for (const e of model.edges) {
    const a = pos.get(e.from)
    const b = pos.get(e.to)
    if (!a || !b) continue // drop edges whose endpoints aren't placed
    const from = { x: a.x + CARD_W / 2, y: a.y + CARD_H }
    const to = { x: b.x + CARD_W / 2, y: b.y }
    edges.push({
      id: `${e.from}->${e.to}`,
      from,
      to,
      midX: (from.x + to.x) / 2,
      midY: (from.y + to.y) / 2,
      label: e.label,
      confidence: e.confidence,
    })
  }

  const width = canvasInner + PAD * 2
  const height = PAD * 2 + Math.max(0, usedLayers.length - 1) * ROW_H + CARD_H

  return { nodes, edges, width, height }
}

/** Cubic bezier path string for a top-to-bottom connector. */
export function edgePath(e: PositionedEdge): string {
  const dy = (e.to.y - e.from.y) / 2
  return `M ${e.from.x} ${e.from.y} C ${e.from.x} ${e.from.y + dy}, ${e.to.x} ${e.to.y - dy}, ${e.to.x} ${e.to.y}`
}
