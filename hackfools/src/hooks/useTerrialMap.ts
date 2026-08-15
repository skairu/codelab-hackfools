import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { CityGraph, Dinosaur, WebSocketMessage } from "../types/dinosaur";

export interface MapState {
  graph: CityGraph | null;
  dinosaurs: Dinosaur[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
}

export function useTerrialMap() {
  const clientIdRef = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<MapState>({
    graph: null,
    dinosaurs: [],
    loading: true,
    error: null,
    wsConnected: false,
  });

  // Inicializa o mapa
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Gera um client ID único para esta sessão
        if (!clientIdRef.current) {
          clientIdRef.current = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Busca o grafo de ruas
        const graphData = await api.getGraph();
        setState((prev) => ({
          ...prev,
          graph: graphData,
        }));

        // Busca os dinossauros iniciais
        const dinosaurs = await api.getDinosaurs();
        setState((prev) => ({
          ...prev,
          dinosaurs,
          loading: false,
        }));

        // Conecta ao WebSocket
        const ws = api.connectWebSocket(
          clientIdRef.current,
          (message: WebSocketMessage) => {
            if (message.type === "dinos_update") {
              setState((prev) => ({
                ...prev,
                dinosaurs: message.data,
              }));
            }
          },
          (error) => {
            setState((prev) => ({
              ...prev,
              error: `WebSocket Error: ${error.type}`,
              wsConnected: false,
            }));
          },
          () => {
            setState((prev) => ({
              ...prev,
              wsConnected: false,
            }));
          }
        );

        wsRef.current = ws;

        // Marca como conectado quando o WebSocket abre
        ws.addEventListener("open", () => {
          setState((prev) => ({
            ...prev,
            wsConnected: true,
          }));
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { state, clientId: clientIdRef.current, ws: wsRef.current };
}
