import { useMemo, useState } from "react";// ajuste o caminho para o seu Header real

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Modo = "aereo" | "terrestre" | "aquatico";

interface Incident {
  id: string;
  regiao: string;
  modo: Modo;
  diasAtras: number; // 0 = hoje, 90 = há 90 dias
  tempoResolucaoSeg: number;
}

type FiltroPeriodo = 7 | 30 | 90;
type FiltroRegiao = "todas" | string;
type FiltroModo = "todos" | Modo;

// ---------------------------------------------------------------------------
// Dados mock (gerados de forma determinística, sem Math.random,
// pra não dar mismatch de hidratação em SSR)
// ---------------------------------------------------------------------------

const REGIOES = [
  "Zona Norte",
  "Ponte Sul",
  "Zona 8",
  "Distrito Leste",
  "Corredor Oeste",
] as const;

const MODOS: Modo[] = ["aereo", "terrestre", "aquatico"];

const MODO_LABEL: Record<Modo, string> = {
  aereo: "Aéreo",
  terrestre: "Terrestre",
  aquatico: "Aquático",
};

const MODO_COR: Record<Modo, string> = {
  aereo: "bg-blue-500",
  terrestre: "bg-orange-500",
  aquatico: "bg-teal-500",
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateMockIncidents(): Incident[] {
  const rand = seededRandom(42);
  const incidentes: Incident[] = [];

  // pesos pra deixar algumas regiões/modos mais frequentes que outros,
  // parecido com o que a gente já tinha desenhado no protótipo
  const pesoRegiao = [3, 2.4, 1.7, 1.3, 0.9];
  const pesoModo = [2.4, 1.9, 1];

  let idCounter = 0;
  REGIOES.forEach((regiao, ri) => {
    MODOS.forEach((modo, mi) => {
      const quantidade = Math.round(rand() * 4 + pesoRegiao[ri] * pesoModo[mi]);
      for (let i = 0; i < quantidade; i++) {
        idCounter += 1;
        incidentes.push({
          id: `inc-${idCounter}`,
          regiao,
          modo,
          diasAtras: Math.floor(rand() * 90),
          tempoResolucaoSeg: Math.round(25 + rand() * 70),
        });
      }
    });
  });

  return incidentes;
}

const MOCK_INCIDENTS = generateMockIncidents();

// ---------------------------------------------------------------------------
// Helpers de agregação
// ---------------------------------------------------------------------------

function formatarTempo(segundos: number): string {
  if (segundos < 60) return `${Math.round(segundos)}s`;
  const min = Math.floor(segundos / 60);
  const seg = Math.round(segundos % 60);
  return `${min}min ${seg}s`;
}

interface Contagem {
  chave: string;
  total: number;
}

function topN(incidentes: Incident[], chaveFn: (i: Incident) => string, n: number): Contagem[] {
  const mapa = new Map<string, number>();
  incidentes.forEach((i) => {
    const chave = chaveFn(i);
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  });
  return Array.from(mapa.entries())
    .map(([chave, total]) => ({ chave, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function DashboardStats() {
  const [periodo, setPeriodo] = useState<FiltroPeriodo>(30);
  const [regiao, setRegiao] = useState<FiltroRegiao>("todas");
  const [modo, setModo] = useState<FiltroModo>("todos");

  const filtrados = useMemo(() => {
    return MOCK_INCIDENTS.filter((i) => {
      if (i.diasAtras > periodo) return false;
      if (regiao !== "todas" && i.regiao !== regiao) return false;
      if (modo !== "todos" && i.modo !== modo) return false;
      return true;
    });
  }, [periodo, regiao, modo]);

  const tempoMedio = useMemo(() => {
    if (filtrados.length === 0) return 0;
    const soma = filtrados.reduce((acc, i) => acc + i.tempoResolucaoSeg, 0);
    return soma / filtrados.length;
  }, [filtrados]);

  const modoMaisAcionado = useMemo(() => {
    const contagens = topN(filtrados, (i) => i.modo, 1);
    if (contagens.length === 0) return "—";
    return MODO_LABEL[contagens[0].chave as Modo];
  }, [filtrados]);

  const locaisTop = useMemo(() => topN(filtrados, (i) => i.regiao, 5), [filtrados]);
  const maxLocal = locaisTop[0]?.total ?? 1;

  const porModo = useMemo(
    () =>
      MODOS.map((m) => ({
        modo: m,
        total: filtrados.filter((i) => i.modo === m).length,
      })),
    [filtrados]
  );
  const maxModo = Math.max(1, ...porModo.map((m) => m.total));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-medium text-gray-900">Estatísticas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão retrospectiva de incidentes por período, região e modo.
        </p>

        {/* Filtros */}
        <div className="mt-6 flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-500">
            Período
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value) as FiltroPeriodo)}
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-500">
            Região
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
            >
              <option value="todas">Todas as regiões</option>
              {REGIOES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-500">
            Modo
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              value={modo}
              onChange={(e) => setModo(e.target.value as FiltroModo)}
            >
              <option value="todos">Todos os modos</option>
              {MODOS.map((m) => (
                <option key={m} value={m}>
                  {MODO_LABEL[m]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtrados.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
            Nenhum incidente encontrado para esse filtro.
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs text-gray-500">Tempo médio de resolução</p>
                <p className="mt-1 text-2xl font-medium text-gray-900">
                  {formatarTempo(tempoMedio)}
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs text-gray-500">Incidentes no período</p>
                <p className="mt-1 text-2xl font-medium text-gray-900">{filtrados.length}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs text-gray-500">Modo mais acionado</p>
                <p className="mt-1 text-2xl font-medium text-gray-900">{modoMaisAcionado}</p>
              </div>
            </div>

            {/* Locais com mais problemas */}
            <div className="mt-8">
              <p className="text-sm text-gray-500">Locais com mais problemas</p>
              <div className="mt-3 space-y-2">
                {locaisTop.map((l) => (
                  <div key={l.chave} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-gray-700">{l.chave}</span>
                    <div className="h-4 flex-1 rounded bg-gray-100">
                      <div
                        className="h-4 rounded bg-blue-500"
                        style={{ width: `${(l.total / maxLocal) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm text-gray-500">
                      {l.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Problemas por modo */}
            <div className="mt-8">
              <p className="text-sm text-gray-500">Problemas por modo</p>
              <div className="mt-3 space-y-2">
                {porModo.map((m) => (
                  <div key={m.modo} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm text-gray-700">
                      {MODO_LABEL[m.modo]}
                    </span>
                    <div className="h-4 flex-1 rounded bg-gray-100">
                      <div
                        className={`h-4 rounded ${MODO_COR[m.modo]}`}
                        style={{ width: `${(m.total / maxModo) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm text-gray-500">
                      {m.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}