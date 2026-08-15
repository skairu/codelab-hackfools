import React, { useMemo } from "react";
import type { BlockedEdge, CityGraph, Dinosaur, RouteData } from "../types/dinosaur";

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  latRange: number;
  lonRange: number;
}

interface PixelCoords {
  x: number;
  y: number;
}

type SelectedNodes = [string] | [string, string] | null;

type MapMode = "route" | "interdict";

interface TerrestrialMapProps {
  graph: CityGraph | null;
  dinosaurs: Dinosaur[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  route?: RouteData | null;
  selectedNodes?: SelectedNodes;
  interdictedEdges?: BlockedEdge[];
  mode?: MapMode;
  onNodeSelect?: (nodeId: string) => void;
  onEdgeToggle?: (nodeA: string, nodeB: string) => void;
}

/**
 * Converte coordenadas lat/lon para pixels no mapa
 */
function latLonToPixels(
  lat: number,
  lon: number,
  bounds: MapBounds,
  width: number,
  height: number
): PixelCoords {
  const padding = 40;
  const mapWidth = width - padding * 2;
  const mapHeight = height - padding * 2;

  const x = padding + ((lon - bounds.minLon) / bounds.lonRange) * mapWidth;
  const y = padding + ((bounds.maxLat - lat) / bounds.latRange) * mapHeight;

  return { x, y };
}

/**
 * Calcula as dimensões do mapa baseado no grafo
 */
function calculateMapBounds(graph: CityGraph | null): MapBounds | null {
  if (!graph || Object.keys(graph.nodes).length === 0) {
    return null;
  }

  const nodes = Object.values(graph.nodes);
  let minLat = nodes[0].lat;
  let maxLat = nodes[0].lat;
  let minLon = nodes[0].lon;
  let maxLon = nodes[0].lon;

  for (const node of nodes) {
    minLat = Math.min(minLat, node.lat);
    maxLat = Math.max(maxLat, node.lat);
    minLon = Math.min(minLon, node.lon);
    maxLon = Math.max(maxLon, node.lon);
  }

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
    latRange: maxLat - minLat,
    lonRange: maxLon - minLon,
  };
}

/**
 * Retorna a cor baseada no status do dinossauro
 */
function getStatusColor(status: string): string {
  switch (status) {
    case "calm":
      return "#52B788";
    case "stressed":
      return "#FFD60A";
    case "aggressive":
      return "#EF4444";
    default:
      return "#74C69D";
  }
}

/**
 * Retorna o ícone baseado no tipo do dinossauro
 */
function getSpeciesIcon(specie: string): string {
  if (specie.includes("Tyrannosaurus")) return "🦖";
  if (specie.includes("Velociraptor")) return "🦝";
  if (specie.includes("Triceratops")) return "🦏";
  if (specie.includes("Brachiosaurus")) return "🦒";
  if (specie.includes("Stegosaurus")) return "🦕";
  return "🦖";
}

function normalizeEdge(a: string, b: string): [string, string] {
  return [a, b].sort() as [string, string];
}

function getEdgeKey(a: string, b: string): string {
  const [first, second] = normalizeEdge(a, b);
  return `${first}|${second}`;
}

export const TerrestrialMap: React.FC<TerrestrialMapProps> = ({
  graph,
  dinosaurs,
  loading,
  error,
  wsConnected,
  route,
  selectedNodes,
  interdictedEdges = [],
  mode = "route",
  onNodeSelect,
  onEdgeToggle,
}) => {
  const mapBounds = useMemo(() => calculateMapBounds(graph), [graph]);
  const showGraphDebug = true;

  const svgDimensions = { width: 1200, height: 800 };

  const nodes = useMemo(() => {
    if (!graph || !mapBounds) return [];

    return Object.values(graph.nodes).map((node) => ({
      ...node,
      pixel: latLonToPixels(
        node.lat,
        node.lon,
        mapBounds,
        svgDimensions.width,
        svgDimensions.height
      ),
    }));
  }, [graph, mapBounds]);

  const edges = useMemo(() => {
    if (!graph || !mapBounds) return [];

    const nodeMap = Object.fromEntries(
      nodes.map((n) => [n.id, n])
    ) as Record<string, (typeof nodes)[0]>;

    return graph.edges.map((edge) => {
      const sourceNode = nodeMap[edge.source];
      const targetNode = nodeMap[edge.target];
      return {
        ...edge,
        sourcePixel: sourceNode?.pixel || { x: 0, y: 0 },
        targetPixel: targetNode?.pixel || { x: 0, y: 0 },
      };
    });
  }, [graph, nodes, mapBounds]);

  const dinosaurPixels = useMemo(() => {
    if (!mapBounds) return [];

    return dinosaurs.map((dino) => ({
      ...dino,
      pixel: latLonToPixels(
        dino.latitude,
        dino.longitude,
        mapBounds,
        svgDimensions.width,
        svgDimensions.height
      ),
    }));
  }, [dinosaurs, mapBounds]);

  const trafficByEdge = useMemo(() => {
    const counts: Record<string, number> = {};

    dinosaurs.forEach((dino) => {
      if (!dino.current_node || !dino.next_node || dino.current_node === dino.next_node) {
        return;
      }

      const key = getEdgeKey(dino.current_node, dino.next_node);
      counts[key] = (counts[key] ?? 0) + 1;
    });

    return counts;
  }, [dinosaurs]);

  const blockedSet = useMemo(() => {
    return new Set(
      interdictedEdges.map(([nodeA, nodeB]) => getEdgeKey(nodeA, nodeB))
    );
  }, [interdictedEdges]);

  const blockedRoads = useMemo(
    () => interdictedEdges.map(([nodeA, nodeB]) => `${nodeA} ↔ ${nodeB}`),
    [interdictedEdges]
  );

  const mostLoadedRoads = useMemo(() => {
    return [...edges]
      .map((edge) => ({
        label: `${edge.source} ↔ ${edge.target}`,
        load: trafficByEdge[getEdgeKey(edge.source, edge.target)] ?? 0,
      }))
      .filter((item) => item.load > 0)
      .sort((a, b) => b.load - a.load)
      .slice(0, 4);
  }, [edges, trafficByEdge]);

  const simulatedRoutes = useMemo(() => {
    if (!graph || !mapBounds) return [];

    return dinosaurs
      .filter((dino) => dino.current_node && dino.next_node)
      .map((dino) => {
        const source = graph.nodes[dino.current_node!];
        const target = graph.nodes[dino.next_node!];

        if (!source || !target) return null;

        const start = latLonToPixels(source.lat, source.lon, mapBounds, svgDimensions.width, svgDimensions.height);
        const end = latLonToPixels(target.lat, target.lon, mapBounds, svgDimensions.width, svgDimensions.height);
        const progress = dino.edge_progress ?? 0;
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;

        return {
          id: dino.id,
          status: dino.status,
          start,
          end,
          current: { x: currentX, y: currentY },
          width: 2 + (trafficByEdge[getEdgeKey(dino.current_node!, dino.next_node!)] ?? 0) * 1.5,
        };
      })
      .filter(Boolean) as Array<{
        id: number;
        status: string;
        start: PixelCoords;
        end: PixelCoords;
        current: PixelCoords;
        width: number;
      }>;
  }, [dinosaurs, graph, mapBounds, trafficByEdge]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050B0E] text-[#B7E4C7]">
        <div className="text-center">
          <div className="mb-4 text-lg font-mono">INICIALIZANDO...</div>
          <div className="animate-pulse text-sm font-mono text-[#74C69D]/60">
            Conectando ao backend...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050B0E] text-red-400">
        <div className="text-center">
          <div className="mb-4 text-lg font-mono">ERRO DE CONEXÃO</div>
          <div className="text-sm font-mono">{error}</div>
          <div className="mt-4 text-xs text-red-300/60">
            Verifique se o backend está rodando em http://localhost:8000
          </div>
        </div>
      </div>
    );
  }

  if (!graph || nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050B0E] text-[#B7E4C7]">
        <div className="text-center">
          <div className="mb-4 text-lg font-mono">SEM DADOS</div>
          <div className="text-sm font-mono text-[#74C69D]/60">
            Nenhum grafo carregado
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = selectedNodes?.length ?? 0;

  return (
    <div className="relative h-full overflow-hidden bg-[#050B0E]">
      {mode === "route" && (
        <div className="absolute left-4 top-4 z-30 max-w-xs rounded-xl border border-[#2D6A4F]/50 bg-[#07120F]/90 p-3 font-mono text-[10px] text-[#B7E4C7]/80 shadow-[0_0_18px_rgba(82,183,136,0.12)]">
          <div className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#74C69D]">
            HUD de Tráfego
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#74C69D]/70">Vias interditadas</span>
              <span className="text-[#EF4444] font-semibold">{blockedRoads.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#74C69D]/70">Vias críticas</span>
              <span className="text-[#FBBF24] font-semibold">{mostLoadedRoads.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#74C69D]/70">Dinos ativos</span>
              <span className="text-[#52B788] font-semibold">{dinosaurs.length}</span>
            </div>
          </div>

          {blockedRoads.length > 0 && (
            <div className="mt-3 border-t border-[#2D6A4F]/30 pt-2">
              <div className="mb-1 text-[8px] uppercase tracking-[0.2em] text-[#74C69D]/60">
                Interdições
              </div>
              <div className="space-y-1">
                {blockedRoads.slice(0, 4).map((road) => (
                  <div key={road} className="truncate text-red-300/90">
                    {road}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mostLoadedRoads.length > 0 && (
            <div className="mt-3 border-t border-[#2D6A4F]/30 pt-2">
              <div className="mb-1 text-[8px] uppercase tracking-[0.2em] text-[#74C69D]/60">
                Rotas mais movimentadas
              </div>
              <div className="space-y-1">
                {mostLoadedRoads.map((road) => (
                  <div key={road.label} className="flex items-center justify-between gap-2 text-[#B7E4C7]/70">
                    <span className="truncate">{road.label}</span>
                    <span className="text-[#FBBF24]">{road.load}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Grid de fundo */}
      <div
        className="
          absolute inset-0
          opacity-[0.12]
          bg-[linear-gradient(#52B788_1px,transparent_1px),linear-gradient(90deg,#52B788_1px,transparent_1px)]
          bg-[size:50px_50px]
        "
      />

      {/* Brilho ambiente */}
      <div className="ambient-pulse absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D6A4F]/10 blur-[120px]" />

      {/* SVG do mapa */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Rota simulada dos dinossauros */}
        {simulatedRoutes.map((segment) => {
          const color = getStatusColor(segment.status);

          return (
            <g key={`simulated-${segment.id}`}>
              <line
                x1={segment.start.x}
                y1={segment.start.y}
                x2={segment.end.x}
                y2={segment.end.y}
                stroke={color}
                strokeWidth={segment.width}
                opacity="0.45"
                pointerEvents="none"
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
              />
              <circle
                cx={segment.current.x}
                cy={segment.current.y}
                r={4 + (segment.width / 2)}
                fill={color}
                opacity="0.9"
                pointerEvents="none"
                style={{ filter: `drop-shadow(0 0 7px ${color})` }}
              />
            </g>
          );
        })}

        {/* Arestas (ruas) */}
        <g>
          {edges.map((edge, index) => {
            const edgeKey = getEdgeKey(edge.source, edge.target);
            const isBlocked = blockedSet.has(edgeKey);
            const traffic = trafficByEdge[edgeKey] ?? 0;

            if (mode === "interdict") {
              return (
                <g
                  key={`edge-${index}`}
                  onClick={() => onEdgeToggle?.(edge.source, edge.target)}
                  style={{ cursor: onEdgeToggle ? "pointer" : "default" }}
                >
                  <line
                    x1={edge.sourcePixel.x}
                    y1={edge.sourcePixel.y}
                    x2={edge.targetPixel.x}
                    y2={edge.targetPixel.y}
                    stroke={isBlocked ? "#EF4444" : "#2D6A4F"}
                    strokeWidth={isBlocked ? 7 : 5}
                    strokeLinecap="round"
                    opacity={isBlocked ? 1 : showGraphDebug ? 0.8 : 0.18}
                    pointerEvents="stroke"
                  />

                  {isBlocked && (
                    <line
                      x1={edge.sourcePixel.x}
                      y1={edge.sourcePixel.y}
                      x2={edge.targetPixel.x}
                      y2={edge.targetPixel.y}
                      stroke="#FCA5A5"
                      strokeWidth={2}
                      strokeDasharray="9 8"
                      strokeLinecap="round"
                      opacity={1}
                      pointerEvents="none"
                    />
                  )}
                </g>
              );
            }

            const strokeWidth = isBlocked ? 5 : Math.min(8, 2 + traffic * 1.8);
            const stroke = isBlocked
              ? "#EF4444"
              : traffic > 0
                ? traffic >= 3
                  ? "#FBBF24"
                  : "#60A5FA"
                : "#1B4332";

            return (
              <g
                key={`edge-${index}`}
                onClick={() => onEdgeToggle?.(edge.source, edge.target)}
                style={{ cursor: onEdgeToggle ? "pointer" : "default" }}
              >
                <line
                  x1={edge.sourcePixel.x}
                  y1={edge.sourcePixel.y}
                  x2={edge.targetPixel.x}
                  y2={edge.targetPixel.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={isBlocked ? 1 : traffic > 0 ? 0.9 : 0.65}
                  strokeDasharray={isBlocked ? "8 6" : undefined}
                  pointerEvents="stroke"
                />
              </g>
            );
          })}
        </g>

        {/* Rota calculada */}
        {route && route.path.length > 1 && mapBounds && (
          <g>
            {route.coordinates.map((coord, idx) => {
              if (idx === route.coordinates.length - 1) return null;

              const currentPixel = latLonToPixels(
                coord.lat,
                coord.lon,
                mapBounds,
                svgDimensions.width,
                svgDimensions.height
              );
              const nextPixel = latLonToPixels(
                route.coordinates[idx + 1].lat,
                route.coordinates[idx + 1].lon,
                mapBounds,
                svgDimensions.width,
                svgDimensions.height
              );

              return (
                <line
                  key={`route-segment-${idx}`}
                  x1={currentPixel.x}
                  y1={currentPixel.y}
                  x2={nextPixel.x}
                  y2={nextPixel.y}
                  stroke="#40E0D0"
                  strokeWidth="3"
                  opacity="0.9"
                  pointerEvents="none"
                  style={{ filter: "drop-shadow(0 0 8px #40E0D0)" }}
                />
              );
            })}

            {/* Pontos de controle da rota */}
            {route.coordinates.map((coord, idx) => {
              const pixel = latLonToPixels(
                coord.lat,
                coord.lon,
                mapBounds,
                svgDimensions.width,
                svgDimensions.height
              );

              const isStart = idx === 0;
              const isEnd = idx === route.coordinates.length - 1;

              return (
                <circle
                  key={`route-point-${idx}`}
                  cx={pixel.x}
                  cy={pixel.y}
                  r={isStart || isEnd ? 6 : 3}
                  fill={isStart ? "#52B788" : isEnd ? "#EF4444" : "#40E0D0"}
                  opacity="0.9"
                  pointerEvents="none"
                  style={{
                    filter: `drop-shadow(0 0 6px ${isStart ? "#52B788" : isEnd ? "#EF4444" : "#40E0D0"})`,
                  }}
                />
              );
            })}
          </g>
        )}

        {/* Nós (interseções) */}
        <g>
          {nodes.map((node) => {
            const isSelected =
              selectedNodes &&
              (selectedNodes[0] === node.id || selectedNodes[1] === node.id);
            const isOrigin = selectedNodes && selectedNodes[0] === node.id;
            const isDestination = selectedNodes && selectedNodes[1] === node.id;

            return (
              <g key={node.id} onClick={() => onNodeSelect?.(node.id)}>
                {/* Círculo de seleção (quando selecionado) */}
                {isSelected && (
                  <circle
                    cx={node.pixel.x}
                    cy={node.pixel.y}
                    r="16"
                    fill={isOrigin ? "#52B788" : "#EF4444"}
                    opacity="0.2"
                    style={{ pointerEvents: "none" }}
                  />
                )}

                {/* Nó principal */}
                <circle
                  cx={node.pixel.x}
                  cy={node.pixel.y}
                  r="4"
                  fill={isOrigin ? "#52B788" : isDestination ? "#EF4444" : "#071013"}
                  stroke={isSelected ? (isOrigin ? "#52B788" : "#EF4444") : "#74C69D"}
                  strokeWidth={isSelected ? "2" : "1"}
                  opacity="0.8"
                  style={{
                    cursor: "pointer",
                    filter: isSelected
                      ? `drop-shadow(0 0 8px ${isOrigin ? "#52B788" : "#EF4444"})`
                      : "none",
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Dinossauros */}
        <g>
          {dinosaurPixels.map((dino) => {
            const statusColor = getStatusColor(dino.status);
            const icon = getSpeciesIcon(dino.specie);

            return (
              <g key={`dino-${dino.id}`}>
                {/* Círculo de fundo */}
                <circle
                  cx={dino.pixel.x}
                  cy={dino.pixel.y}
                  r="12"
                  fill={statusColor}
                  opacity="0.2"
                  pointerEvents="none"
                />

                {/* Círculo de borda com glow */}
                <circle
                  cx={dino.pixel.x}
                  cy={dino.pixel.y}
                  r="8"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="2"
                  opacity="0.8"
                  pointerEvents="none"
                  style={{
                    filter: `drop-shadow(0 0 6px ${statusColor})`,
                  }}
                />

                {/* Ícone */}
                <text
                  x={dino.pixel.x}
                  y={dino.pixel.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {icon}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {mode === "route" && (
        <div className="absolute left-4 top-[270px] z-30 font-mono text-[9px] text-[#74C69D]/50">
          <div>GRID: {graph.nodes ? Object.keys(graph.nodes).length : 0} nós</div>
          <div>DINOS: {dinosaurs.length}</div>
          <div className="mt-2">
            STATUS:
            <span className={wsConnected ? "text-[#52B788]" : "text-red-400"}>
              {wsConnected ? " ● CONECTADO" : " ● DESCONECTADO"}
            </span>
          </div>
        </div>
      )}

      {/* Rota Info Overlay */}
      {mode === "route" && onNodeSelect && (
        <div className="absolute left-4 bottom-4 z-30 max-w-xs border border-[#40E0D0]/50 bg-[#07120F]/90 p-3 font-mono text-[11px]">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-[#40E0D0]">
            Modo de Roteamento
          </div>
          {!selectedNodes ? (
            <div className="text-[#B7E4C7]/70">
              <div>▶ Clique no primeiro nó (origem)</div>
              <div className="mt-1 text-[10px] text-[#74C69D]/60">em verde</div>
            </div>
          ) : selectedCount === 1 ? (
            <div className="text-[#B7E4C7]/70">
              <div>▶ Clique no segundo nó (destino)</div>
              <div className="mt-1 text-[10px] text-[#74C69D]/60">em vermelho</div>
              <div className="mt-2 text-[10px]">
                Origem: <span className="text-[#52B788]">{selectedNodes[0]}</span>
              </div>
            </div>
          ) : (
            <div className="text-[#40E0D0]">
              <div>✓ Rota calculada!</div>
              <div className="mt-2 text-[10px]">
                <div>Origem: <span className="text-[#52B788]">{selectedNodes[0]}</span></div>
                <div>Destino: <span className="text-red-400">{selectedNodes[1]}</span></div>
              </div>
              {route && (
                <div className="mt-2 text-[10px] text-[#95D5B2]">
                  <div>Distância: {(route.distance_m / 1000).toFixed(2)} km</div>
                  <div>Tempo: {Math.round(route.duration_s)} s</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "interdict" && onEdgeToggle && (
        <div className="absolute left-4 bottom-4 z-30 max-w-xs border border-red-500/50 bg-[#07120F]/90 p-3 font-mono text-[11px]">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-red-300">
            Modo de Interdição
          </div>
          <div className="text-[#B7E4C7]/70">
            <div>▶ Clique em qualquer rua para bloquear ou liberar.</div>
            <div className="mt-1 text-[10px] text-[#74C69D]/60">Total ativo: {blockedRoads.length}</div>
          </div>
        </div>
      )}

      {/* Status dos dinossauros */}
      <div className="absolute bottom-4 right-4 z-30 space-y-1 border border-[#2D6A4F]/50 bg-[#07120F]/90 p-3 font-mono text-[11px]">
        <div className="mb-2 text-[#74C69D] text-[11px]">STATUS DINOSSAUROS</div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#52B788]" />
          <span>CALMOS: {dinosaurs.filter((d) => d.status === "calm").length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span>ESTRESSADOS: {dinosaurs.filter((d) => d.status === "stressed").length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>AGRESSIVOS: {dinosaurs.filter((d) => d.status === "aggressive").length}</span>
        </div>
      </div>

      {/* Lista de dinossauros (sidebar) */}
      <div className="absolute right-4 top-20 z-30 max-h-[600px] overflow-y-auto border border-[#2D6A4F]/50 bg-[#07120F]/90 p-3 font-mono text-[10px]">
        <div className="mb-3 text-[#74C69D] text-[16px]">DINOSSAUROS RASTREADOS</div>
        <div className="space-y-2">
          {dinosaurs.map((dino) => (
            <div key={dino.id} className="border-l-2 border-[#52B788]/30 pl-2 text-[#B7E4C7]/70 ">
              <div className="truncate font-mono text-[12px]">#{dino.id} - {dino.specie}</div>
              <div className="text-[12px]">
                <span className={
                  dino.status === "calm" ? "text-[#52B788]" :
                  dino.status === "stressed" ? "text-yellow-400" :
                  "text-red-400"
                }>
                  {dino.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-[#74C69D]/60">
                Fome: {Math.round(dino.hunger)}% | Stress: {Math.round(dino.stress)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
