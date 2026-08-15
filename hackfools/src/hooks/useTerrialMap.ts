import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { CityGraph, Dinosaur, RouteData, WebSocketMessage } from "../types/dinosaur";

export interface MapState {
  graph: CityGraph | null;
  dinosaurs: Dinosaur[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  route: RouteData | null;
  selectedNodes: [string, string] | null;
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
    route: null,
    selectedNodes: null,
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
            } else if (message.type === "route_update") {
              setState((prev) => ({
                ...prev,
                route: message.data,
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
      // Deleta a rota ao desmontar
      if (state.route) {
        api.deleteRoute(clientIdRef.current).catch((error) => {
          console.error("Error deleting route on cleanup:", error);
        });
      }
    };
  }, []);

  /**
   * Seleciona um nó para origem/destino
   */
  const selectNode = async (nodeId: string) => {
    setState((prev) => {
      const currentSelected = prev.selectedNodes;

      // Se já tem dois nós selecionados, limpa e começa com o novo
      if (currentSelected && currentSelected.length === 2) {
        return {
          ...prev,
          selectedNodes: [nodeId] as [string],
          route: null,
        };
      }

      // Se é o mesmo nó clicado duas vezes, ignora
      if (currentSelected?.[0] === nodeId) {
        return prev;
      }

      // Adiciona o novo nó
      if (!currentSelected) {
        return {
          ...prev,
          selectedNodes: [nodeId] as [string],
        };
      }

      // Tem um nó selecionado, agora tem dois
      return {
        ...prev,
        selectedNodes: [currentSelected[0], nodeId] as [string, string],
      };
    });

    // Calcula a rota se temos dois nós selecionados
    setState((prev) => {
      if (prev.selectedNodes && prev.selectedNodes.length === 2) {
        // Calcula a rota
        (async () => {
          try {
            const route = await api.calculateRoute(
              clientIdRef.current,
              prev.selectedNodes![0],
              prev.selectedNodes![1]
            );
            setState((prevState) => ({
              ...prevState,
              route,
            }));
          } catch (error) {
            console.error("Error calculating route:", error);
            setState((prevState) => ({
              ...prevState,
              error: `Erro ao calcular rota: ${error instanceof Error ? error.message : "Unknown error"}`,
            }));
          }
        })();
      }
      return prev;
    });
  };

  /**
   * Limpa a rota e os nós selecionados
   */
  const clearRoute = async () => {
    if (state.route) {
      try {
        await api.deleteRoute(clientIdRef.current);
      } catch (error) {
        console.error("Error deleting route:", error);
      }
    }

    setState((prev) => ({
      ...prev,
      route: null,
      selectedNodes: null,
    }));
  };

  return { state, clientId: clientIdRef.current, ws: wsRef.current, selectNode, clearRoute };
}
