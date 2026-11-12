import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useArena } from '../context/ArenaContext.jsx';

const GROUP_COLORS = {
  config: '#a78bfa',
  security: '#38bdf8',
  tournament: '#10b981',
  matchmaking: '#34d399',
  ruedo: '#f59e0b',
  betting: '#fbbf24',
  cockhouse: '#2dd4bf',
  logistics: '#94a3b8',
  core: '#cbd5e1'
};

export function DatabaseRelationshipGraph() {
  const { arenaState } = useArena();
  const canvasRef = useRef(null);

  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'schema' | 'records'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('table:fights');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const rawGraph = arenaState?.databaseGraph || { nodes: [], edges: [] };

  const filteredGraph = useMemo(() => {
    const allowedNodes = rawGraph.nodes.filter((n) => {
      if (filterMode === 'schema') return n.kind === 'table';
      if (filterMode === 'records') return n.kind === 'record';
      return true;
    });
    const nodeIds = new Set(allowedNodes.map((n) => n.id));
    const allowedEdges = rawGraph.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );
    return { nodes: allowedNodes, edges: allowedEdges };
  }, [rawGraph, filterMode]);

  const simRef = useRef({
    nodes: [],
    edges: [],
    panX: 0,
    panY: 0,
    zoom: 1,
    draggingNode: null,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // Synchronize graph topology into physics simulation state while preserving positions
  useEffect(() => {
    const sim = simRef.current;
    const prevMap = new Map(sim.nodes.map((n) => [n.id, n]));
    const count = filteredGraph.nodes.length || 1;

    const degreeMap = new Map();
    for (const edge of filteredGraph.edges) {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    }

    sim.nodes = filteredGraph.nodes.map((n, idx) => {
      const existing = prevMap.get(n.id);
      const angle = (idx / count) * Math.PI * 2;
      const radiusSpread = n.kind === 'table' ? 145 : 220;
      const deg = degreeMap.get(n.id) || 1;
      const baseRadius =
        n.kind === 'table'
          ? Math.min(20, 9 + Math.sqrt(deg) * 2.4 + Math.min(5, n.rowCount || 0))
          : 7.5;

      return {
        ...n,
        degree: deg,
        radius: baseRadius,
        x: existing ? existing.x : Math.cos(angle) * radiusSpread + (Math.random() - 0.5) * 25,
        y: existing ? existing.y : Math.sin(angle) * radiusSpread + (Math.random() - 0.5) * 25,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0
      };
    });

    sim.edges = filteredGraph.edges.map((e) => ({ ...e }));
  }, [filteredGraph]);

  // Run 60fps Obsidian-style Force-Directed Physics & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animId;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stepPhysicsAndDraw = () => {
      const sim = simRef.current;
      const nodes = sim.nodes;
      const edges = sim.edges;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      // 1. Repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distSq = dx * dx + dy * dy;
          if (distSq < 9) {
            dx = (Math.random() - 0.5) * 4;
            dy = (Math.random() - 0.5) * 4;
            distSq = dx * dx + dy * dy;
          }
          const dist = Math.sqrt(distSq);
          const repulsion = 2100 / distSq;
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;

          if (sim.draggingNode !== a.id) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (sim.draggingNode !== b.id) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // 2. Spring attraction along relational edges
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetLen = edge.kind === 'data' ? 88 : 132;
        const force = (dist - targetLen) * 0.028;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (sim.draggingNode !== src.id) {
          src.vx += fx;
          src.vy += fy;
        }
        if (sim.draggingNode !== tgt.id) {
          tgt.vx -= fx;
          tgt.vy -= fy;
        }
      }

      // 3. Mild centering gravity & velocity damping
      for (const n of nodes) {
        if (sim.draggingNode === n.id) continue;
        n.vx += -n.x * 0.008;
        n.vy += -n.y * 0.008;
        n.vx *= 0.84;
        n.vy *= 0.84;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Determine active focus node (hovered or selected) and its direct neighbors
      const focusId = hoveredNodeId || selectedNodeId;
      const connectedNodeIds = new Set();
      if (focusId) {
        connectedNodeIds.add(focusId);
        for (const e of edges) {
          if (e.source === focusId) connectedNodeIds.add(e.target);
          if (e.target === focusId) connectedNodeIds.add(e.source);
        }
      }

      const normSearch = searchTerm.trim().toLowerCase();

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + sim.panX, height / 2 + sim.panY);
      ctx.scale(sim.zoom, sim.zoom);

      // Draw Edges
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;

        const isHighlighted =
          focusId && (edge.source === focusId || edge.target === focusId);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isHighlighted) {
          ctx.strokeStyle = edge.kind === 'data' ? '#f59e0b' : '#34d399';
          ctx.lineWidth = 1.9;
        } else {
          ctx.strokeStyle = hoveredNodeId
            ? 'rgba(161, 161, 170, 0.12)'
            : 'rgba(161, 161, 170, 0.28)';
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
      }

      // Draw Nodes & Labels
      for (const n of nodes) {
        const isFocused = n.id === focusId;
        const isNeighbor = connectedNodeIds.has(n.id);
        const matchesSearch =
          normSearch &&
          (n.label.toLowerCase().includes(normSearch) ||
            (n.gate && n.gate.toLowerCase().includes(normSearch)));

        const dimmed =
          (hoveredNodeId && !isNeighbor) || (normSearch && !matchesSearch);

        const baseColor =
          n.kind === 'record'
            ? '#f59e0b'
            : GROUP_COLORS[n.group] || '#10b981';

        ctx.save();
        ctx.globalAlpha = dimmed ? 0.22 : 1;

        // Outer glow for focused or searched node
        if (isFocused || matchesSearch) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = matchesSearch
            ? 'rgba(250, 204, 21, 0.28)'
            : 'rgba(16, 185, 129, 0.26)';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? '#e2e8f0' : baseColor;
        ctx.fill();
        ctx.lineWidth = isFocused ? 2.2 : 1.2;
        ctx.strokeStyle = isFocused ? '#10b981' : 'rgba(24, 24, 27, 0.8)';
        ctx.stroke();

        // Label below node (Obsidian style)
        ctx.font =
          n.kind === 'table'
            ? '600 11.5px Inter, sans-serif'
            : '500 10.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isFocused ? '#ffffff' : '#d4d4d8';
        ctx.fillText(n.label, n.x, n.y + n.radius + 5);

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(stepPhysicsAndDraw);
    };

    animId = requestAnimationFrame(stepPhysicsAndDraw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hoveredNodeId, selectedNodeId, searchTerm]);

  // Coordinate helper: Screen -> World space
  const screenToWorld = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sim = simRef.current;
    const sx = clientX - rect.left - rect.width / 2 - sim.panX;
    const sy = clientY - rect.top - rect.height / 2 - sim.panY;
    return { x: sx / sim.zoom, y: sy / sim.zoom };
  };

  const findNodeAt = (wx, wy) => {
    const nodes = simRef.current.nodes;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = wx - n.x;
      const dy = wy - n.y;
      if (dx * dx + dy * dy <= (n.radius + 5) ** 2) {
        return n;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const hit = findNodeAt(x, y);
    const sim = simRef.current;
    sim.lastMouseX = e.clientX;
    sim.lastMouseY = e.clientY;

    if (hit) {
      sim.draggingNode = hit.id;
      setSelectedNodeId(hit.id);
    } else {
      sim.isPanning = true;
    }
  };

  const handleMouseMove = (e) => {
    const sim = simRef.current;
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (sim.draggingNode) {
      const node = sim.nodes.find((n) => n.id === sim.draggingNode);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
      }
      return;
    }

    if (sim.isPanning) {
      sim.panX += e.clientX - sim.lastMouseX;
      sim.panY += e.clientY - sim.lastMouseY;
      sim.lastMouseX = e.clientX;
      sim.lastMouseY = e.clientY;
      return;
    }

    const hit = findNodeAt(x, y);
    setHoveredNodeId(hit ? hit.id : null);
  };

  const handleMouseUp = () => {
    const sim = simRef.current;
    sim.draggingNode = null;
    sim.isPanning = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const sim = simRef.current;
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    sim.zoom = Math.max(0.45, Math.min(2.6, sim.zoom * factor));
  };

  const adjustZoom = (multiplier) => {
    const sim = simRef.current;
    if (multiplier === 0) {
      sim.zoom = 1;
      sim.panX = 0;
      sim.panY = 0;
    } else {
      sim.zoom = Math.max(0.45, Math.min(2.6, sim.zoom * multiplier));
    }
  };

  const selectedNode =
    filteredGraph.nodes.find((n) => n.id === selectedNodeId) ||
    filteredGraph.nodes[0] ||
    null;

  const selectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return filteredGraph.edges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
  }, [filteredGraph, selectedNode]);

  return (
    <div className="db-graph-shell">
      <div className="db-graph-stage">
        <div className="db-graph-toolbar">
          <div className="db-graph-toolbar-group">
            <button
              type="button"
              className={`db-graph-filter-btn ${filterMode === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All Nodes ({rawGraph.nodes.length})
            </button>
            <button
              type="button"
              className={`db-graph-filter-btn ${filterMode === 'schema' ? 'is-active' : ''}`}
              onClick={() => setFilterMode('schema')}
            >
              SQLite Tables
            </button>
            <button
              type="button"
              className={`db-graph-filter-btn ${filterMode === 'records' ? 'is-active' : ''}`}
              onClick={() => setFilterMode('records')}
            >
              Live Records
            </button>
          </div>

          <div className="db-graph-toolbar-group">
            <input
              type="text"
              className="db-graph-search"
              placeholder="Filter graph nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className="db-graph-filter-btn"
              onClick={() => adjustZoom(1.2)}
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              className="db-graph-filter-btn"
              onClick={() => adjustZoom(0.85)}
              title="Zoom Out"
            >
              &minus;
            </button>
            <button
              type="button"
              className="db-graph-filter-btn"
              onClick={() => adjustZoom(0)}
              title="Reset Camera"
            >
              Reset
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="db-graph-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        <div className="db-graph-legend">
          <span className="legend-item">
            <span className="legend-dot is-table" />
            SQLite Table Node
          </span>
          <span className="legend-item">
            <span className="legend-dot is-security" />
            Gate 0 Security / Audit
          </span>
          <span className="legend-item">
            <span className="legend-dot is-record" />
            Live Enrolled Record
          </span>
        </div>

        <div className="db-graph-watermark">
          Cockpit OS Relational Graph Engine • Drag nodes to explore connections
        </div>
      </div>

      {/* Right-Hand Relational Node Inspector */}
      <aside className="db-graph-inspector">
        <div className="workspace-panel-title">Node Connection Inspector</div>
        {!selectedNode ? (
          <div className="module-empty-state">
            <div className="module-empty-title">No Node Selected</div>
            <div className="module-empty-desc">
              Click any node in the graph canvas to inspect its foreign-key dependencies and live connected data.
            </div>
          </div>
        ) : (
          <>
            <div className="gate-status-card is-passed">
              <div className="gate-card-top">
                <span className="gate-id-tag">{selectedNode.gate}</span>
                <span className="status-badge is-passed">
                  {selectedNode.kind.toUpperCase()}
                </span>
              </div>
              <div className="gate-name-title">{selectedNode.label}</div>
              <div className="gate-metric-text">
                {selectedNode.kind === 'table'
                  ? `Live SQLite Rows: ${selectedNode.rowCount}`
                  : selectedNode.details}
              </div>
            </div>

            <div className="workspace-panel-title">
              Connected Nodes ({selectedEdges.length})
            </div>
            {selectedEdges.length === 0 ? (
              <div className="card-empty-state">
                <span className="card-empty-text">
                  No edges in current filter view.
                </span>
              </div>
            ) : (
              <div className="inspector-chip-list">
                {selectedEdges.map((edge) => {
                  const otherId =
                    edge.source === selectedNode.id ? edge.target : edge.source;
                  const direction =
                    edge.source === selectedNode.id ? 'OUTGOING →' : '← INCOMING';
                  return (
                    <div
                      key={edge.id}
                      className="inspector-relation-chip"
                      onClick={() => setSelectedNodeId(otherId)}
                    >
                      <span className="inspector-rel-target">
                        {direction} {otherId}
                      </span>
                      <span className="inspector-rel-desc">{edge.relation}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedNode.columns && selectedNode.columns.length > 0 && (
              <>
                <div className="workspace-panel-title">
                  Table Schema ({selectedNode.columns.length} cols)
                </div>
                <div className="inspector-chip-list">
                  {selectedNode.columns.map((col) => (
                    <div key={col.name} className="metric-row">
                      <span className="terminal-code">
                        {col.pk ? '🔑 ' : ''}
                        {col.name}
                      </span>
                      <span className="activity-time-tag">{col.type}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

