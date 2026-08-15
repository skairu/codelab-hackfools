import type { CityGraph, Dinosaur, WebSocketMessage } from "../types/dinosaur";

const API_BASE = "http://localhost:8000";
const WS_BASE = "ws://localhost:8000";

export class BackendAPI {
  private static instance: BackendAPI;

  private constructor() {}

  static getInstance(): BackendAPI {
    if (!BackendAPI.instance) {
      BackendAPI.instance = new BackendAPI();
    }
    return BackendAPI.instance;
  }

  /**
   * Busca o grafo de ruas da cidade
   */
  async getGraph(): Promise<CityGraph> {
    try {
      const response = await fetch(`${API_BASE}/graph`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching graph:", error);
      throw error;
    }
  }

  /**
   * Busca todos os dinossauros
   */
  async getDinosaurs(): Promise<Dinosaur[]> {
    try {
      const response = await fetch(`${API_BASE}/dinosaurs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dinosaurs:", error);
      throw error;
    }
  }

  /**
   * Conecta ao WebSocket para receber atualizações em tempo real
   */
  connectWebSocket(
    clientId: string,
    onMessage: (message: WebSocketMessage) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void
  ): WebSocket {
    const ws = new WebSocket(`${WS_BASE}/ws/${clientId}`);

    ws.onopen = () => {
      console.log("WebSocket connected:", clientId);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        onMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) {
        onError(error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      if (onClose) {
        onClose(event);
      }
    };

    return ws;
  }

  /**
   * Calcula uma rota entre dois nós
   */
  async calculateRoute(
    clientId: string,
    originNode: string,
    destinationNode: string
  ): Promise<{
    path: string[];
    coordinates: Array<{ lat: number; lon: number }>;
    distance_m: number;
    duration_s: number;
    computed_at: number;
  }> {
    try {
      const response = await fetch(`${API_BASE}/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          origin_node: originNode,
          destination_node: destinationNode,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calculating route:", error);
      throw error;
    }
  }

  /**
   * Para o monitoramento de uma rota
   */
  async deleteRoute(clientId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/route/${clientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      throw error;
    }
  }

  async interdictEdge(nodeA: string, nodeB: string): Promise<{ status: string; edge: [string, string] }> {
    try {
      const response = await fetch(`${API_BASE}/admin/interdict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node_a: nodeA,
          node_b: nodeB,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error interdicting edge:", error);
      throw error;
    }
  }

  async clearInterdictEdge(nodeA: string, nodeB: string): Promise<{ status: string; edge: [string, string] }> {
    try {
      const response = await fetch(`${API_BASE}/admin/interdict`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node_a: nodeA,
          node_b: nodeB,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error clearing road interdiction:", error);
      throw error;
    }
  }
}

export const api = BackendAPI.getInstance();
