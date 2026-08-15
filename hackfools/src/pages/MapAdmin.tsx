import { useMemo, useState } from "react";
import { Map as MapIcon, TriangleAlert, Users } from "lucide-react";
 
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
 
const SEVERIDADE_BADGE: Record<Severidade, string> = {
  baixo: "bg-emerald-500/10 text-emerald-400 border border-emerald-900/60",
  medio: "bg-yellow-500/10 text-yellow-400 border border-yellow-900/60",
  alto: "bg-amber-500/15 text-amber-400 border border-amber-800/60",
  critico: "bg-red-500/10 text-red-400 border border-red-900/60",
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
    titulo: "Rex avistado, Zona Norte",
    regiao: "Zona Norte",
    severidade: "critico",
    estado: "sem_equipe",
    equipe: "Equipe de contenção Alpha",
    etaMin: 4,
  },
  {
    id: "p2",
    titulo: "Velociraptores na via expressa, Zona Norte",
    regiao: "Zona Norte",
    severidade: "critico",
    estado: "a_caminho",
    equipe: "Equipe Alpha 2",
    etaMin: 3,
  },
  {
    id: "p3",
    titulo: "Manada parada, Ponte Sul",
    regiao: "Ponte Sul",
    severidade: "alto",
    estado: "a_caminho",
    equipe: "Equipe Beta",
    etaMin: 2,
  },
  {
    id: "p4",
    titulo: "Mosassauro na baía, Corredor Oeste",
    regiao: "Corredor Oeste",
    severidade: "alto",
    estado: "sem_equipe",
    equipe: "Equipe Aquática Delta",
    etaMin: 9,
  },
  {
    id: "p5",
    titulo: "Pterossauro errante, Distrito Leste",
    regiao: "Distrito Leste",
    severidade: "medio",
    estado: "a_caminho",
    equipe: "Equipe Gama",
    etaMin: 6,
  },
  {
    id: "p6",
    titulo: "Triceratops bloqueando cruzamento, Zona 8",
    regiao: "Zona 8",
    severidade: "medio",
    estado: "sem_equipe",
    equipe: "Equipe Épsilon",
    etaMin: 5,
  },
  {
    id: "p7",
    titulo: "Herbívoro no parque, Zona 8",
    regiao: "Zona 8",
    severidade: "baixo",
    estado: "resolvido",
  },
  {
    id: "p8",
    titulo: "Quetzalcoatlus sobrevoando aeroporto, Distrito Leste",
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
  const [filtro, setFiltro] = useState<FiltroSeveridade>("todos");
  const [problemas, setProblemas] = useState<Problema[]>(PROBLEMAS_INICIAIS);
  const [equipesDisponiveis, setEquipesDisponiveis] = useState(
    TOTAL_EQUIPES - EQUIPES_ALOCADAS_INICIALMENTE
  );
 
  // O filtro afeta só a lista de problemas ativos — o mapa (quando existir)
  // não deve reagir a ele.
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
    <div className="min-h-screen bg-black">
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Filtros por severidade */}
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => {
            const ativo = f === filtro;
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  ativo
                    ? "border border-blue-500 text-blue-400"
                    : "border border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {FILTRO_LABEL[f]}
              </button>
            );
          })}
        </div>
 
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
          {/* Coluna do mapa */}
          <div className="flex flex-col gap-4">
            {/* Mapa geral — placeholder por enquanto */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
                <h2 className="text-base font-medium text-zinc-200">Mapa geral</h2>
              </div>
 
              {/* A grade de ruas (interdição por linha, não por quadra) entra
                  aqui quando o mapa for configurado. */}
              <div className="mt-4 flex min-h-[420px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-700">
                <p className="text-sm text-zinc-500">
                  {problemas.length} focos ativos
                </p>
                <p className="text-xs text-zinc-600">mapa em configuração</p>
              </div>
            </div>
 
            {/* Equipes disponíveis */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
                <h2 className="text-base font-medium text-zinc-200">Equipes de contenção</h2>
              </div>
 
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-medium text-white">{equipesDisponiveis}</span>
                <span className="text-sm text-zinc-500">/ {TOTAL_EQUIPES} disponíveis</span>
              </div>
 
              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: TOTAL_EQUIPES }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 flex-1 rounded-full ${
                      i < equipesDisponiveis ? "bg-blue-500" : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
 
          {/* Problemas ativos */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
              <h2 className="text-base font-medium text-zinc-200">Problemas ativos</h2>
            </div>
 
            <div className="mt-4 space-y-3">
              {problemasFiltrados.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-600">
                  Nenhum foco ativo nessa severidade.
                </p>
              ) : (
                problemasFiltrados.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[15px] font-medium text-white">{p.titulo}</span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${SEVERIDADE_BADGE[p.severidade]}`}
                      >
                        {SEVERIDADE_LABEL[p.severidade]}
                      </span>
                    </div>
 
                    {p.estado === "resolvido" && (
                      <p className="mt-3 text-sm text-zinc-600">Resolvido — sem risco</p>
                    )}
 
                    {p.estado === "a_caminho" && (
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm text-zinc-400">
                          {p.equipe} a caminho — ETA {p.etaMin}min
                        </p>
                        <button
                          onClick={() => handleDesalocar(p.id)}
                          className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                        >
                          Desalocar
                        </button>
                      </div>
                    )}
 
                    {p.estado === "sem_equipe" && (
                      <>
                        <p className="mt-3 text-sm text-zinc-500">Sem equipe alocada</p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-zinc-200">
                            {p.equipe} — ETA {p.etaMin}min
                          </span>
                          <button
                            onClick={() => handleAlocar(p.id)}
                            disabled={equipesDisponiveis <= 0}
                            className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                              equipesDisponiveis <= 0
                                ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600"
                                : "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                            }`}
                          >
                            {equipesDisponiveis <= 0 ? "Sem equipes" : "Alocar"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}