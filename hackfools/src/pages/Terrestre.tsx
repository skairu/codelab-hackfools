import { Activity } from "lucide-react";
import { TerrestrialMap } from "../components/TerrestrialMap";
import { useTerrialMap } from "../hooks/useTerrialMap";

export default function Terrestre() {
  const { state, clientId } = useTerrialMap();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050B0E] text-[#B7E4C7]">
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: .35;
          }

          50% {
            opacity: .8;
          }
        }

        .ambient-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>

      <div className="flex h-[calc(100vh-80px)]">

        {/* PAINEL LATERAL */}
        <aside className="relative z-20 hidden w-64 shrink-0 border-r border-[#2D6A4F]/30 bg-[#07120F]/95 lg:block overflow-y-auto">

          {/* Título */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#52B788]" />

              <span className="font-mono text-xs tracking-[0.2em] text-[#74C69D]">
                TERRESTRE
              </span>
            </div>

            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Controle de tráfego
            </div>
          </div>

          {/* Status */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Status do sistema
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_#52B788] ${
                  state.wsConnected
                    ? "bg-[#52B788]"
                    : state.error
                      ? "bg-red-500"
                      : "bg-yellow-400"
                }`}
              />

              <span className="font-mono text-xs text-[#95D5B2]">
                {state.loading
                  ? "INICIALIZANDO"
                  : state.error
                    ? "ERRO"
                    : state.wsConnected
                      ? "OPERACIONAL"
                      : "CONECTANDO"}
              </span>
            </div>
          </div>

          {/* Dinossauros */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Dinossauros detectados
            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#52B788]" />
                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    CALMOS
                  </span>
                </div>

                <span className="font-mono text-sm text-[#74C69D]">
                  {state.dinosaurs.filter((d) => d.status === "calm").length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />

                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    ESTRESSADOS
                  </span>
                </div>

                <span className="font-mono text-sm text-yellow-300">
                  {state.dinosaurs.filter((d) => d.status === "stressed").length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />

                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    AGRESSIVOS
                  </span>
                </div>

                <span className="font-mono text-sm text-red-400">
                  {state.dinosaurs.filter((d) => d.status === "aggressive").length}
                </span>
              </div>

            </div>
          </div>

          {/* Grafo */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Informações do grafo
            </div>

            <div className="space-y-2 font-mono text-[9px] text-[#B7E4C7]/60">
              <div>
                <span className="text-[#74C69D]">Nós:</span> {state.graph ? Object.keys(state.graph.nodes).length : 0}
              </div>
              <div>
                <span className="text-[#74C69D]">Arestas:</span> {state.graph ? state.graph.edges.length : 0}
              </div>
            </div>
          </div>

          {/* Informações do cliente */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Cliente
            </div>

            <div className="font-mono text-[8px] text-[#B7E4C7]/60 break-all">
              {clientId || "Gerando..."}
            </div>
          </div>

          {/* Log */}
          <div className="p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Status da conexão
            </div>

            <div className="space-y-2 font-mono text-[8px] text-[#B7E4C7]/50">
              <div>
                WebSocket: <span className={state.wsConnected ? "text-[#52B788]" : "text-red-400"}>
                  {state.wsConnected ? "✓ Conectado" : "✗ Desconectado"}
                </span>
              </div>
              <div>
                Grafo: <span className={state.graph ? "text-[#52B788]" : "text-yellow-400"}>
                  {state.graph ? "✓ Carregado" : "⏳ Carregando"}
                </span>
              </div>
              <div>
                Dinossauros: <span className={state.dinosaurs.length > 0 ? "text-[#52B788]" : "text-yellow-400"}>
                  {state.dinosaurs.length} rastreados
                </span>
              </div>
              {state.error && (
                <div>
                  Erro: <span className="text-red-400">{state.error}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ÁREA DO MAPA */}
        <main className="relative flex-1 overflow-hidden">
          <TerrestrialMap
            graph={state.graph}
            dinosaurs={state.dinosaurs}
            loading={state.loading}
            error={state.error}
            wsConnected={state.wsConnected}
          />
        </main>
      </div>
    </div>
  );
}
