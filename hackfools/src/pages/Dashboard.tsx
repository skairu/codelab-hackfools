import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Modo = "aereo" | "terrestre";

interface Incident {
  id: string;
  regiao: string;
  modo: Modo;
  especie: string;
  diasAtras: number;
  horaDoDia: number;
  tempoResolucaoSeg: number;
  estresse: number;
}

type FiltroPeriodo = 7 | 30 | 90;
type FiltroRegiao = "todas" | string;
type FiltroModo = "todos" | Modo;

// ---------------------------------------------------------------------------
// Dados mock
// ---------------------------------------------------------------------------

const REGIOES = [
  "Zona Sul",
  "Zona Sudeste",
  "Zona Oeste",
  "Zona Leste",
  "Zona Noroeste",
  "Zona Nordeste",
  "Zona Norte",
] as const;

const MODOS: Modo[] = ["aereo", "terrestre"];

const MODO_LABEL: Record<Modo, string> = {
  aereo: "Aéreo",
  terrestre: "Terrestre",
};

// Cores seguindo a paleta verde:
const MODO_COR: Record<Modo, string> = {
  aereo: "bg-[#74C69D]",
  terrestre: "bg-[#40916C]",
};

const MODO_TEXTO: Record<Modo, string> = {
  aereo: "text-[#95D5B2]",
  terrestre: "text-[#52B788]",
};

const DENSIDADE_POPULACIONAL: Record<string, number> = {
  "Zona Sul": 5400,
  "Zona Sudeste": 13800,
  "Zona Oeste": 3200,
  "Zona Leste": 7600,
  "Zona Noroeste": 2100,
  "Zona Nordeste": 6900,
  "Zona Norte": 1800,
};

const ESPECIES_POR_MODO: Record<Modo, string[]> = {
  aereo: [
    "Pteranodonte",
    "Quetzalcoatlus",
    "Pterodáctilo",
    "Dimorfodonte",
  ],
  terrestre: [
    "Tiranossauro Rex",
    "Tricerátopo",
    "Velociraptor",
    "Braquiossauro",
    "Anquilossauro",
    "Estegossauro",
    "Espinossauro",
    "Alossauro",
    "Diplodoco",
  ],
};

const ESPECIE_MODO: Record<string, Modo> = Object.entries(ESPECIES_POR_MODO).reduce(
  (acc, [modo, especies]) => {
    especies.forEach((e) => (acc[e] = modo as Modo));
    return acc;
  },
  {} as Record<string, Modo>
);

const HOUR_BUCKETS = [
  { label: "Madrugada", start: 0, end: 4, peso: 0.6 },
  { label: "Amanhecer", start: 4, end: 8, peso: 1.9 },
  { label: "Manhã", start: 8, end: 12, peso: 1.0 },
  { label: "Tarde", start: 12, end: 16, peso: 0.9 },
  { label: "Entardecer", start: 16, end: 20, peso: 2.1 },
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

  const pesoRegiao = [3.2, 2.8, 1.6, 2.3, 1.0, 1.9, 0.8];
  const pesoModo = [2.6, 2.1];

  let idCounter = 0;
  REGIOES.forEach((regiao, ri) => {
    MODOS.forEach((modo, mi) => {
      const quantidade = Math.round(rand() * 100 + pesoRegiao[ri] * pesoModo[mi] * 80) + 50;
      for (let i = 0; i < quantidade; i++) {
        idCounter += 1;
        const especies = ESPECIES_POR_MODO[modo];
        const especie = especies[Math.floor(rand() * especies.length)];
        const bucket = pickHourBucket(rand);
        const horaDoDia = bucket.start + Math.floor(rand() * (bucket.end - bucket.start));

        const diasAtras = Math.floor(rand() * 90);

        // Define um tempo base dependendo de quão antigo é o incidente.
        // Garante que todos sejam > 1h (3600s) e que as médias entre 7, 30 e 90 dias 
        // sejam diferentes, porém com valores próximos.
        let baseTempo = 3600;
        if (diasAtras <= 7) {
          baseTempo = 3900; // ~ 1h 05m
        } else if (diasAtras <= 30) {
          baseTempo = 4200; // ~ 1h 10m
        } else {
          baseTempo = 4600; // ~ 1h 16m
        }

        incidentes.push({
          id: `inc-${idCounter}`,
          regiao,
          modo,
          especie,
          diasAtras,
          horaDoDia,
          // Soma o baseTempo com até 15 min extras de variação randômica
          tempoResolucaoSeg: Math.round(baseTempo + rand() * 900),
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
  if (segundos < 3600) {
    const min = Math.floor(segundos / 60);
    const seg = Math.round(segundos % 60);
    return `${min}min ${seg}s`;
  }
  const horas = Math.floor(segundos / 3600);
  const min = Math.round((segundos % 3600) / 60);
  return `${horas}h ${min}min`;
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

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

type Tier = "alta" | "media" | "baixa";

const TIER_CLASSE: Record<Tier, string> = {
  alta: "border-[#52B788]/50 bg-[#52B788]/10 text-[#D8F3DC]",
  media: "border-[#74C69D]/30 bg-[#74C69D]/10 text-[#B7E4C7]",
  baixa: "border-[#40916C]/30 bg-[#40916C]/10 text-[#95D5B2]",
};

const TIER_PONTO: Record<Tier, string> = {
  alta: "bg-[#52B788]",
  media: "bg-[#74C69D]",
  baixa: "bg-[#40916C]",
};

function statusEstresse(v: number): { tier: Tier; nivel: string } {
  if (v < 40) return { tier: "baixa", nivel: "Controlado" };
  if (v < 70) return { tier: "media", nivel: "Controle médio" };
  return { tier: "alta", nivel: "Descontrolado" };
}

function statusPrioridade(score: number): { tier: Tier; texto: string } {
  if (score >= 66) return { tier: "alta", texto: "Alta prioridade" };
  if (score >= 33) return { tier: "media", texto: "Média prioridade" };
  return { tier: "baixa", texto: "Baixa prioridade" };
}

function statusReincidencia(freqDiaria: number): { tier: Tier; texto: string } {
  if (freqDiaria >= 4) return { tier: "alta", texto: "Candidato a bio-corredor" };
  if (freqDiaria >= 2) return { tier: "media", texto: "Monitoramento estendido" };
  return { tier: "baixa", texto: "Trânsito de baixo impacto" };
}

function Badge({ tier, texto }: { tier: Tier; texto: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${TIER_CLASSE[tier]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TIER_PONTO[tier]}`} />
      {texto}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Componente Principal
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
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filtrados]);

  const especiesTop = useMemo(() => topN(filtrados, (i) => i.especie, 5), [filtrados]);
  const maxEspecie = especiesTop[0]?.total ?? 1;
  const especieMaisRecorrente = especiesTop[0]?.chave ?? "—";

  return (
    <div className="w-full font-mono text-white">
      <main className="mx-auto max-w-5xl px-4 py-8 w-full">
        <h1 className="text-xl font-bold uppercase tracking-wide text-[#D8F3DC]">Estatísticas</h1>
        <p className="mt-1 text-sm text-[#95D5B2]">
          Visão retrospectiva de incidentes por período, região e modo.
        </p>

        {/* Filtros */}
        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-[#74C69D]">
            Período
            <select
              className="h-10 w-40 rounded-md border border-[#2D6A4F]/60 bg-[#0B241B]/80 px-3 text-sm text-[#D8F3DC] focus:border-[#52B788] focus:outline-none"
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value) as FiltroPeriodo)}
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-[#74C69D]">
            Região
            <select
              className="h-10 w-44 rounded-md border border-[#2D6A4F]/60 bg-[#0B241B]/80 px-3 text-sm text-[#D8F3DC] focus:border-[#52B788] focus:outline-none"
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

          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-[#74C69D]">
            Modo
            <select
              className="h-10 w-40 rounded-md border border-[#2D6A4F]/60 bg-[#0B241B]/80 px-3 text-sm text-[#D8F3DC] focus:border-[#52B788] focus:outline-none"
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
          <div className="mt-10 rounded-lg border border-dashed border-[#2D6A4F]/60 py-16 text-center text-sm text-[#95D5B2]">
            Nenhum incidente encontrado para esse filtro.
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-[#74C69D]">Tempo médio</p>
                <p className="mt-1 text-2xl font-semibold text-[#D8F3DC]">{formatarTempo(tempoMedio)}</p>
              </div>
              <div className="rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-[#74C69D]">Incidentes</p>
                <p className="mt-1 text-2xl font-semibold text-[#D8F3DC]">{filtrados.length}</p>
              </div>
              <div className="rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-[#74C69D]">Modo principal</p>
                <p className="mt-1 text-2xl font-semibold text-[#D8F3DC] whitespace-nowrap">{modoMaisAcionado}</p>
              </div>
              <div className="rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-[#74C69D]">Estresse fauna</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-[#D8F3DC]">{Math.round(estresseMedio)}</p>
                  <Badge tier={estadoEstresseMedio.tier} texto={estadoEstresseMedio.nivel} />
                </div>
              </div>
              <div className="rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-4 backdrop-blur-sm overflow-hidden">
                <p className="text-[10px] uppercase tracking-wide text-[#74C69D]">Top Espécie</p>
                <p className="mt-1 text-lg font-semibold text-[#D8F3DC] whitespace-nowrap overflow-hidden text-ellipsis" title={especieMaisRecorrente}>
                  {especieMaisRecorrente}
                </p>
              </div>
            </div>

            {/* Bem-estar e governança */}
            <div className="mt-10 border-t border-[#2D6A4F]/30 pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#95D5B2]">
                Bem-estar e governança
              </h2>

              <div className="mt-4">
                <p className="text-sm text-[#B7E4C7]">
                  Exposição humana × risco{" "}
                  <span className="text-xs text-[#74C69D]">(densidade populacional cruzada com frequência de incidentes)</span>
                </p>
                <div className="mt-3 space-y-3">
                  {exposicaoRisco.map((r) => {
                    const prioridade = statusPrioridade(r.score);
                    return (
                      <div key={r.regiao} className="rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#D8F3DC] whitespace-nowrap">{r.regiao}</span>
                          <Badge tier={prioridade.tier} texto={prioridade.texto} />
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide text-[#74C69D]">Densidade</span>
                            <div className="h-2 flex-1 rounded bg-[#081C15]">
                              <div className="h-2 rounded bg-[#74C69D]" style={{ width: `${r.densNorm * 100}%` }} />
                            </div>
                            <span className="w-28 shrink-0 text-right text-[11px] text-[#95D5B2] whitespace-nowrap">
                              {formatarDensidade(r.densidade)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide text-[#74C69D]">Incidentes</span>
                            <div className="h-2 flex-1 rounded bg-[#081C15]">
                              <div className="h-2 rounded bg-[#52B788]" style={{ width: `${r.totalNorm * 100}%` }} />
                            </div>
                            <span className="w-28 shrink-0 text-right text-[11px] text-[#95D5B2] whitespace-nowrap">
                              {r.total.toLocaleString("pt-BR")}
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
            <div className="mt-10 border-t border-[#2D6A4F]/30 pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#95D5B2]">
                Padrões e prevenção
              </h2>

              {/* Pico de atividade por horário */}
              <div className="mt-4">
                <p className="text-sm text-[#B7E4C7]">
                  Pico de atividade por horário{" "}
                  <span className="text-xs text-[#74C69D]">· maior volume: {picoPrincipal.label}</span>
                </p>
                <div className="mt-3 flex h-40 items-end gap-2 rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-4">
                  {picoHorario.map((p) => (
                    <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[11px] text-[#95D5B2] whitespace-nowrap">{p.total}</span>
                      <div
                        className={`w-full rounded-t ${p.label === picoPrincipal.label ? "bg-[#52B788]" : "bg-[#2D6A4F]"}`}
                        style={{ height: `${Math.max(4, (p.total / maxPico) * 80)}px` }}
                      />
                      <span className="text-center text-[9px] uppercase leading-tight tracking-wide text-[#74C69D] whitespace-nowrap">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locais com mais problemas */}
              <div className="mt-6">
                <p className="text-sm text-[#B7E4C7]">Locais com mais problemas</p>
                <div className="mt-3 space-y-2">
                  {locaisTop.map((l) => (
                    <div key={l.chave} className="flex items-center gap-4">
                      <span className="w-36 shrink-0 text-sm text-[#D8F3DC] whitespace-nowrap">{l.chave}</span>
                      <div className="h-4 flex-1 rounded bg-[#081C15]">
                        <div className="h-4 rounded bg-[#52B788]" style={{ width: `${(l.total / maxLocal) * 100}%` }} />
                      </div>
                      <span className="w-12 shrink-0 text-right text-sm text-[#95D5B2] whitespace-nowrap">
                        {l.total.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reincidência por zona */}
              <div className="mt-6">
                <p className="text-sm text-[#B7E4C7]">
                  Reincidência por zona{" "}
                  <span className="text-xs text-[#74C69D]">(análise de volume e constância do tráfego)</span>
                </p>
                <div className="mt-3 space-y-2">
                  {reincidenciaZonas.map((z) => {
                    const frequencia = z.total / Math.max(1, z.diasUnicos);
                    const tag = statusReincidencia(frequencia);
                    return (
                      <div key={z.regiao} className="flex items-center justify-between rounded-lg border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-3">
                        <div className="flex items-center gap-4">
                          <span className="w-36 text-sm font-medium text-[#D8F3DC] whitespace-nowrap">{z.regiao}</span>
                          <p className="text-[11px] text-[#95D5B2] whitespace-nowrap">
                            {z.total.toLocaleString("pt-BR")} registros ({frequencia.toFixed(1)}/dia)
                          </p>
                        </div>
                        <Badge tier={tag.tier} texto={tag.texto} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Problemas por modo */}
              <div className="mt-6">
                <p className="text-sm text-[#B7E4C7]">Problemas por modo</p>
                <div className="mt-3 space-y-2">
                  {porModo.map((m) => (
                    <div key={m.modo} className="flex items-center gap-4">
                      <span className={`w-36 shrink-0 text-sm whitespace-nowrap ${MODO_TEXTO[m.modo]}`}>
                        {MODO_LABEL[m.modo]}
                      </span>
                      <div className="h-4 flex-1 rounded bg-[#081C15]">
                        <div className={`h-4 rounded ${MODO_COR[m.modo]}`} style={{ width: `${(m.total / maxModo) * 100}%` }} />
                      </div>
                      <span className="w-12 shrink-0 text-right text-sm text-[#95D5B2] whitespace-nowrap">
                        {m.total.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Espécie mais recorrente em conflito */}
              <div className="mt-6">
                <p className="text-sm text-[#B7E4C7]">Espécie mais recorrente em conflito</p>
                <div className="mt-3 space-y-2 pb-10">
                  {especiesTop.map((e) => {
                    const especieModo = ESPECIE_MODO[e.chave];
                    return (
                      <div key={e.chave} className="flex items-center gap-4">
                        <span className="w-48 shrink-0 text-sm text-[#D8F3DC] flex justify-between whitespace-nowrap pr-2">
                          {e.chave}
                          <span className={`text-[9px] uppercase tracking-wide ${MODO_TEXTO[especieModo]}`}>
                            {MODO_LABEL[especieModo]}
                          </span>
                        </span>
                        <div className="h-4 flex-1 rounded bg-[#081C15]">
                          <div className={`h-4 rounded ${MODO_COR[especieModo]}`} style={{ width: `${(e.total / maxEspecie) * 100}%` }} />
                        </div>
                        <span className="w-12 shrink-0 text-right text-sm text-[#95D5B2] whitespace-nowrap">
                          {e.total.toLocaleString("pt-BR")}
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