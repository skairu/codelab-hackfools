import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Modo = "aereo" | "terrestre" | "aquatico";

interface Incident {
  id: string;
  regiao: string;
  modo: Modo;
  especie: string;
  diasAtras: number; // 0 = hoje, 90 = há 90 dias
  horaDoDia: number; // 0-23
  tempoResolucaoSeg: number;
  estresse: number; // 0-100
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

// Densidade populacional humana por região (hab/km²) — usada no cruzamento
// exposição x risco. Valores fixos de mock, representando o "lado humano".
const DENSIDADE_POPULACIONAL: Record<string, number> = {
  "Zona Norte": 8200,
  "Ponte Sul": 4300,
  "Zona 8": 12500,
  "Distrito Leste": 6100,
  "Corredor Oeste": 3000,
};

// Espécies monitoradas por modo de locomoção
const ESPECIES_POR_MODO: Record<Modo, string[]> = {
  aereo: ["Pteranodon", "Quetzalcoatlus"],
  terrestre: ["Tyrannosaurus", "Triceratops", "Velociraptor", "Braquiossauro"],
  aquatico: ["Mosassauro", "Plesiossauro"],
};

const ESPECIE_MODO: Record<string, Modo> = Object.entries(ESPECIES_POR_MODO).reduce(
  (acc, [modo, especies]) => {
    especies.forEach((e) => (acc[e] = modo as Modo));
    return acc;
  },
  {} as Record<string, Modo>
);

// Faixas horárias usadas no "pico de atividade". Pesos maiores em
// crepúsculo/amanhecer, período em que a fauna monitorada tende a se
// deslocar mais (padrão comum em animais de grande porte).
const HOUR_BUCKETS = [
  { label: "Madrugada", start: 0, end: 4, peso: 0.6 },
  { label: "Amanhecer", start: 4, end: 8, peso: 1.8 },
  { label: "Manhã", start: 8, end: 12, peso: 1.0 },
  { label: "Tarde", start: 12, end: 16, peso: 0.9 },
  { label: "Entardecer", start: 16, end: 20, peso: 1.9 },
  { label: "Noite", start: 20, end: 24, peso: 0.8 },
] as const;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickHourBucket(rand: () => number) {
  const pesoTotal = HOUR_BUCKETS.reduce((acc, b) => acc + b.peso, 0);
  let alvo = rand() * pesoTotal;
  for (const b of HOUR_BUCKETS) {
    if (alvo < b.peso) return b;
    alvo -= b.peso;
  }
  return HOUR_BUCKETS[HOUR_BUCKETS.length - 1];
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
        const especies = ESPECIES_POR_MODO[modo];
        const especie = especies[Math.floor(rand() * especies.length)];
        const bucket = pickHourBucket(rand);
        const horaDoDia = bucket.start + Math.floor(rand() * (bucket.end - bucket.start));

        incidentes.push({
          id: `inc-${idCounter}`,
          regiao,
          modo,
          especie,
          diasAtras: Math.floor(rand() * 90),
          horaDoDia,
          tempoResolucaoSeg: Math.round(25 + rand() * 70),
          estresse: Math.min(100, Math.round(20 + rand() * 75)),
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

function formatarDensidade(v: number): string {
  return `${v.toLocaleString("pt-BR")} hab/km²`;
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

type NivelEstresse = "Controlado" | "Médio" | "Descontrolado";

function statusEstresse(v: number): { nivel: NivelEstresse; texto: string; ponto: string } {
  if (v < 40) return { nivel: "Controlado", texto: "text-emerald-700 bg-emerald-50", ponto: "bg-emerald-500" };
  if (v < 70) return { nivel: "Médio", texto: "text-amber-700 bg-amber-50", ponto: "bg-amber-500" };
  return { nivel: "Descontrolado", texto: "text-rose-700 bg-rose-50", ponto: "bg-rose-500" };
}

function statusPrioridade(score: number): { texto: string; classe: string } {
  if (score >= 66) return { texto: "Prioridade alta", classe: "text-rose-700 bg-rose-50" };
  if (score >= 33) return { texto: "Prioridade média", classe: "text-amber-700 bg-amber-50" };
  return { texto: "Prioridade baixa", classe: "text-emerald-700 bg-emerald-50" };
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

  // --- Bem-estar e governança -------------------------------------------

  const estresseMedio = useMemo(() => {
    if (filtrados.length === 0) return 0;
    return filtrados.reduce((acc, i) => acc + i.estresse, 0) / filtrados.length;
  }, [filtrados]);
  const estadoEstresseMedio = statusEstresse(estresseMedio);

  const exposicaoRisco = useMemo(() => {
    const linhas = REGIOES.filter((r) => regiao === "todas" || r === regiao).map((r) => {
      const total = filtrados.filter((i) => i.regiao === r).length;
      const densidade = DENSIDADE_POPULACIONAL[r];
      return { regiao: r, total, densidade };
    });
    const maxTotal = Math.max(1, ...linhas.map((l) => l.total));
    const maxDensidade = Math.max(1, ...linhas.map((l) => l.densidade));
    return linhas
      .map((l) => {
        const totalNorm = l.total / maxTotal;
        const densNorm = l.densidade / maxDensidade;
        const score = Math.round((totalNorm * 0.5 + densNorm * 0.5) * 100);
        return { ...l, totalNorm, densNorm, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [filtrados, regiao]);

  // --- Padrões e prevenção ------------------------------------------------

  const picoHorario = useMemo(
    () =>
      HOUR_BUCKETS.map((b) => ({
        label: b.label,
        total: filtrados.filter((i) => i.horaDoDia >= b.start && i.horaDoDia < b.end).length,
      })),
    [filtrados]
  );
  const maxPico = Math.max(1, ...picoHorario.map((p) => p.total));
  const picoPrincipal = picoHorario.reduce(
    (max, p) => (p.total > max.total ? p : max),
    picoHorario[0]
  );

  const reincidenciaZonas = useMemo(() => {
    return REGIOES.map((r) => {
      const incidentesRegiao = filtrados.filter((i) => i.regiao === r);
      const diasUnicos = new Set(incidentesRegiao.map((i) => i.diasAtras)).size;
      return { regiao: r, total: incidentesRegiao.length, diasUnicos };
    })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.diasUnicos - a.diasUnicos || b.total - a.total)
      .slice(0, 5);
  }, [filtrados]);

  const especiesTop = useMemo(() => topN(filtrados, (i) => i.especie, 5), [filtrados]);
  const maxEspecie = especiesTop[0]?.total ?? 1;
  const especieMaisRecorrente = especiesTop[0]?.chave ?? "—";

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
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs text-gray-500">Estresse médio da fauna</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-medium text-gray-900">{Math.round(estresseMedio)}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${estadoEstresseMedio.texto}`}
                  >
                    {estadoEstresseMedio.nivel}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs text-gray-500">Espécie mais recorrente</p>
                <p className="mt-1 text-2xl font-medium text-gray-900">{especieMaisRecorrente}</p>
              </div>
            </div>

            {/* Bem-estar e governança */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Bem-estar e governança
              </h2>

              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Exposição humana × risco{" "}
                  <span className="text-xs text-gray-400">
                    (densidade populacional cruzada com frequência de incidentes)
                  </span>
                </p>
                <div className="mt-3 space-y-3">
                  {exposicaoRisco.map((r) => {
                    const prioridade = statusPrioridade(r.score);
                    return (
                      <div
                        key={r.regiao}
                        className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">{r.regiao}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${prioridade.classe}`}
                          >
                            {prioridade.texto}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-20 shrink-0 text-[11px] text-gray-400">
                              Densidade
                            </span>
                            <div className="h-2 flex-1 rounded bg-gray-100">
                              <div
                                className="h-2 rounded bg-purple-400"
                                style={{ width: `${r.densNorm * 100}%` }}
                              />
                            </div>
                            <span className="w-24 shrink-0 text-right text-[11px] text-gray-500">
                              {formatarDensidade(r.densidade)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-20 shrink-0 text-[11px] text-gray-400">
                              Incidentes
                            </span>
                            <div className="h-2 flex-1 rounded bg-gray-100">
                              <div
                                className="h-2 rounded bg-blue-500"
                                style={{ width: `${r.totalNorm * 100}%` }}
                              />
                            </div>
                            <span className="w-24 shrink-0 text-right text-[11px] text-gray-500">
                              {r.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Padrões e prevenção */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Padrões e prevenção
              </h2>

              {/* Pico de atividade por horário */}
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Pico de atividade por horário{" "}
                  <span className="text-xs text-gray-400">
                    · maior volume: {picoPrincipal.label}
                  </span>
                </p>
                <div className="mt-3 flex h-32 items-end gap-2 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                  {picoHorario.map((p) => (
                    <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[11px] text-gray-500">{p.total}</span>
                      <div
                        className={`w-full rounded-t ${
                          p.label === picoPrincipal.label ? "bg-blue-500" : "bg-blue-200"
                        }`}
                        style={{ height: `${Math.max(4, (p.total / maxPico) * 80)}px` }}
                      />
                      <span className="text-center text-[10px] leading-tight text-gray-400">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locais com mais problemas */}
              <div className="mt-6">
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

              {/* Reincidência por zona */}
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Reincidência por zona{" "}
                  <span className="text-xs text-gray-400">
                    (candidatas a bio-corredor permanente)
                  </span>
                </p>
                <div className="mt-3 space-y-2">
                  {reincidenciaZonas.map((z) => (
                    <div
                      key={z.regiao}
                      className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-100"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-800">{z.regiao}</span>
                        <p className="text-[11px] text-gray-400">
                          {z.total} incidente{z.total !== 1 ? "s" : ""} em {z.diasUnicos} dia
                          {z.diasUnicos !== 1 ? "s" : ""} distintos
                        </p>
                      </div>
                      {z.diasUnicos >= 4 && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                          Candidato a bio-corredor
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Problemas por modo */}
              <div className="mt-6">
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

              {/* Espécie mais recorrente em conflito */}
              <div className="mt-6">
                <p className="text-sm text-gray-500">Espécie mais recorrente em conflito</p>
                <div className="mt-3 space-y-2">
                  {especiesTop.map((e) => {
                    const especieModo = ESPECIE_MODO[e.chave];
                    return (
                      <div key={e.chave} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-sm text-gray-700">
                          {e.chave}
                          <span className="ml-1 text-[10px] text-gray-400">
                            {MODO_LABEL[especieModo]}
                          </span>
                        </span>
                        <div className="h-4 flex-1 rounded bg-gray-100">
                          <div
                            className={`h-4 rounded ${MODO_COR[especieModo]}`}
                            style={{ width: `${(e.total / maxEspecie) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-sm text-gray-500">
                          {e.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}