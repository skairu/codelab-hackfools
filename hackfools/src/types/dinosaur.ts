export type DinosaurStatus = "calm" | "stressed" | "aggressive";
export type DinosaurType = "herbivore" | "carnivore";

export interface Dinosaur {
  id: number;
  specie: string;
  latitude: number;
  longitude: number;
  type: DinosaurType;
  status: DinosaurStatus;
  speed: number;
  hunger: number;
  stress: number;
  current_node?: string | null;
  next_node?: string | null;
  edge_progress?: number | null;
}

export type BlockedEdge = [string, string];

export interface GraphNode {
  id: string;
  lat: number;
  lon: number;
  row: number;
  col: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  length: number;
}

export interface CityGraph {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}

export interface DinosUpdatedMessage {
  type: "dinos_update";
  data: Dinosaur[];
}

export interface RouteData {
  path: string[];
  coordinates: Array<{ lat: number; lon: number }>;
  distance_m: number;
  duration_s: number;
  computed_at: number;
}

export interface RouteUpdateMessage {
  type: "route_update";
  data: RouteData;
}

export type WebSocketMessage = DinosUpdatedMessage | RouteUpdateMessage;
