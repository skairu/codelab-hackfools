import { useMemo, useState } from "react";
import { Map as MapIcon, TriangleAlert, Users } from "lucide-react";
import AdminSubheader, { type AdminTab } from "../components/AdminSubheader";
import Dashboard from "./Dashboard";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Severidade = "baixo" | "medio" | "alto" | "critico";
type FiltroSeveridade = "todos" | Severidade;
type EstadoAlocacao = "sem_equipe" | "a_caminho" | "resolvido";

interface Problema {
  id: string;
  titulo: string;
  regiao: string;
  severidade: Severidade;
  estado: EstadoAlocacao;
  equipe?: string; // equipe já a caminho, ou sugerida quando sem_equipe
  etaMin?: number;
}

// ---------------------------------------------------------------------------
// Config visual por severidade
// ---------------------------------------------------------------------------

const SEVERIDADE_LABEL: Record<Severidade, string> = {
  baixo: "baixo",
  medio: "médio",
  alto: "alto",
  critico: "crítico",
};

// Cores temáticas, mantendo vermelho/laranja/amarelo para alertas reais
const SEVERIDADE_BADGE: Record<Severidade, string> = {
  baixo: "bg-[#40916C]/20 text-[#95D5B2] border border-[#40916C]/50",
  medio: "bg-yellow-500/10 text-yellow-400 border border-yellow-900/50",
  alto: "bg-orange-500/10 text-orange-400 border border-orange-800/50",
  critico: "bg-red-500/10 text-red-400 border border-red-900/50",
};

const FILTROS: FiltroSeveridade[] = ["todos", "baixo", "medio", "alto", "critico"];
const FILTRO_LABEL: Record<FiltroSeveridade, string> = {
  todos: "Todos",
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
};

const TOTAL_EQUIPES = 10;

// ---------------------------------------------------------------------------
// Mock de focos ativos
// ---------------------------------------------------------------------------

const PROBLEMAS_INICIAIS: Problema[] = [
  {
    id: "p1",
    titulo: "Rex avistado",
    regiao: "Zona Norte",
    severidade: "critico",
    estado: "sem_equipe",
    equipe: "Equipe de contenção Alpha",
    etaMin: 4,
  },
  {
    id: "p2",
    titulo: "Velociraptores na via expressa",
    regiao: "Zona Norte",
    severidade: "critico",
    estado: "a_caminho",
    equipe: "Equipe Alpha 2",
    etaMin: 3,
  },
  {
    id: "p3",
    titulo: "Manada de Estegossauros parada",
    regiao: "Ponte Sul",
    severidade: "alto",
    estado: "a_caminho",
    equipe: "Equipe Beta",
    etaMin: 2,
  },
  {
    id: "p4",
    titulo: "Alossauro próximo à baía",
    regiao: "Corredor Oeste",
    severidade: "alto",
    estado: "sem_equipe",
    equipe: "Equipe Delta",
    etaMin: 9,
  },
  {
    id: "p5",
    titulo: "Pteranodonte errante",
    regiao: "Distrito Leste",
    severidade: "medio",
    estado: "a_caminho",
    equipe: "Equipe Gama",
    etaMin: 6,
  },
  {
    id: "p6",
    titulo: "Tricerátopos bloqueando cruzamento",
    regiao: "Zona 8",
    severidade: "medio",
    estado: "sem_equipe",
    equipe: "Equipe Épsilon",
    etaMin: 5,
  },
  {
    id: "p7",
    titulo: "Braquiossauro no parque",
    regiao: "Zona 8",
    severidade: "baixo",
    estado: "resolvido",
  },
  {
    id: "p8",
    titulo: "Quetzalcoatlus sobrevoando aeroporto",
    regiao: "Distrito Leste",
    severidade: "baixo",
    estado: "resolvido",
  },
];

const EQUIPES_ALOCADAS_INICIALMENTE = PROBLEMAS_INICIAIS.filter(
  (p) => p.estado === "a_caminho"
).length;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("radar");
  const [filtro, setFiltro] = useState<FiltroSeveridade>("todos");
  const [problemas, setProblemas] = useState<Problema[]>(PROBLEMAS_INICIAIS);
  const [equipesDisponiveis, setEquipesDisponiveis] = useState(
    TOTAL_EQUIPES - EQUIPES_ALOCADAS_INICIALMENTE
  );

  const problemasFiltrados = useMemo(() => {
    if (filtro === "todos") return problemas;
    return problemas.filter((p) => p.severidade === filtro);
  }, [problemas, filtro]);

  const handleAlocar = (id: string) => {
    if (equipesDisponiveis <= 0) return;
    setProblemas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "a_caminho" as const } : p))
    );
    setEquipesDisponiveis((prev) => Math.max(0, prev - 1));
  };

  const handleDesalocar = (id: string) => {
    setProblemas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "sem_equipe" as const } : p))
    );
    setEquipesDisponiveis((prev) => Math.min(TOTAL_EQUIPES, prev + 1));
  };

  return (
    <div className="relative min-h-screen font-mono text-white">
      {/* 
        Fundo global mantido atrás de tudo (-z-10) 
        para o seu Header global e o AdminSubheader aparecerem.
      */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, #020705 0%, #05140D 50%, #010302 100%)",
        }}
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[#2D6A4F]/10 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AdminSubheader activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="mx-auto w-full max-w-7xl px-4 py-8">
          {/* Aba: Map Radar */}
          {activeTab === "radar" && (
            <>
              {/* Filtros por severidade */}
              <div className="flex flex-wrap gap-2">
                {FILTROS.map((f) => {
                  const ativo = f === filtro;
                  return (
                    <button
                      key={f}
                      onClick={() => setFiltro(f)}
                      className={`rounded-full px-5 py-1.5 text-xs uppercase tracking-wide transition-all duration-200 ${
                        ativo
                          ? "border border-[#52B788] bg-[#1B4332]/60 text-[#D8F3DC] shadow-[0_0_10px_rgba(82,183,136,0.2)]"
                          : "border border-transparent bg-transparent text-[#74C69D] hover:bg-[#1B4332]/30 hover:text-[#B7E4C7]"
                      }`}
                    >
                      {FILTRO_LABEL[f]}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
                {/* Coluna do mapa */}
                <div className="flex flex-col gap-4">
                  {/* Mapa geral */}
                  <div className="rounded-2xl border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <MapIcon className="h-5 w-5 text-[#52B788]" strokeWidth={1.75} />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#D8F3DC]">Mapa Tático Geral</h2>
                    </div>

                    <div className="mt-4 flex min-h-[420px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#2D6A4F]/40 bg-[#081C15]/40">
                      <p className="text-sm text-[#74C69D]">
                        {problemas.length} focos ativos no quadrante
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-[#40916C]">calibrando telemetria geoespacial...</p>
                    </div>
                  </div>

                  {/* Equipes disponíveis */}
                  <div className="rounded-2xl border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-[#52B788]" strokeWidth={1.75} />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#D8F3DC]">Equipes de Contenção</h2>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-medium text-[#D8F3DC]">{equipesDisponiveis}</span>
                      <span className="text-xs uppercase tracking-wide text-[#74C69D]">/ {TOTAL_EQUIPES} prontas para envio</span>
                    </div>

                    <div className="mt-4 flex gap-1.5">
                      {Array.from({ length: TOTAL_EQUIPES }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${
                            i < equipesDisponiveis ? "bg-[#52B788] shadow-[0_0_8px_rgba(82,183,136,0.4)]" : "bg-[#0B241B]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Problemas ativos */}
                <div className="rounded-2xl border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-5 backdrop-blur-sm flex flex-col h-full">
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="h-5 w-5 text-[#52B788]" strokeWidth={1.75} />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#D8F3DC]">Painel de Ocorrências</h2>
                  </div>

                  <div className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {problemasFiltrados.length === 0 ? (
                      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#2D6A4F]/30 text-center">
                        <p className="text-sm text-[#74C69D]">Setor limpo.</p>
                        <p className="text-[10px] uppercase text-[#40916C]">Nenhum foco ativo neste nível.</p>
                      </div>
                    ) : (
                      problemasFiltrados.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-[#2D6A4F]/30 bg-[#081C15]/80 p-4 transition-colors hover:border-[#2D6A4F]/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-[#D8F3DC]">{p.titulo}</span>
                              <span className="mt-1 text-[10px] uppercase tracking-wide text-[#74C69D] flex items-center gap-2">
                                {p.regiao}
                              </span>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${SEVERIDADE_BADGE[p.severidade]}`}
                            >
                              {SEVERIDADE_LABEL[p.severidade]}
                            </span>
                          </div>

                          {p.estado === "resolvido" && (
                            <div className="mt-4 border-t border-[#2D6A4F]/20 pt-3 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#52B788]" />
                              <p className="text-xs uppercase tracking-wide text-[#52B788]">Resolvido — Área segura</p>
                            </div>
                          )}

                          {p.estado === "a_caminho" && (
                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#2D6A4F]/20 pt-3">
                              <div className="flex flex-col">
                                <p className="text-[11px] uppercase tracking-wide text-[#95D5B2]">
                                  {p.equipe} a caminho
                                </p>
                                <p className="text-[10px] uppercase text-[#74C69D]">ETA {p.etaMin} min</p>
                              </div>
                              <button
                                onClick={() => handleDesalocar(p.id)}
                                className="shrink-0 rounded-md border border-[#2D6A4F]/60 bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#95D5B2] transition-colors hover:bg-[#1B4332]/60 hover:text-[#D8F3DC]"
                              >
                                Abortar
                              </button>
                            </div>
                          )}

                          {p.estado === "sem_equipe" && (
                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#2D6A4F]/20 pt-3">
                              <div className="flex flex-col">
                                <p className="text-[11px] uppercase tracking-wide text-[#40916C]">
                                  Aguardando despacho
                                </p>
                                <p className="text-[10px] text-[#74C69D]">Sugestão: {p.equipe}</p>
                              </div>
                              <button
                                onClick={() => handleAlocar(p.id)}
                                disabled={equipesDisponiveis <= 0}
                                className={`shrink-0 rounded-md border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                                  equipesDisponiveis <= 0
                                    ? "cursor-not-allowed border-[#0B241B] bg-[#040D09]/50 text-[#2D6A4F]"
                                    : "border-[#52B788]/60 bg-[#1B4332]/40 text-[#D8F3DC] hover:bg-[#2D6A4F]/60"
                                }`}
                              >
                                {equipesDisponiveis <= 0 ? "Sem Recursos" : "Despachar"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Aba: Estatísticas */}
          {activeTab === "stats" && (
            <Dashboard />
          )}
        </main>
      </div>
    </div>
  );
}