import {
  Activity,
  Crosshair,
  Layers,
  Minus,
  Plane,
  Plus,
  Radio,
} from "lucide-react";

const aircraft = [
  {
    id: 1,
    type: "normal",
    animation: "flightOne",
    duration: "18s",
    delay: "-3s",
    size: 9,
  },
  {
    id: 2,
    type: "normal",
    animation: "flightTwo",
    duration: "22s",
    delay: "-10s",
    size: 8,
  },
  {
    id: 3,
    type: "danger",
    animation: "flightThree",
    duration: "15s",
    delay: "-5s",
    size: 10,
  },
  {
    id: 4,
    type: "normal",
    animation: "flightFour",
    duration: "20s",
    delay: "-14s",
    size: 8,
  },
  {
    id: 5,
    type: "normal",
    animation: "flightFive",
    duration: "17s",
    delay: "-7s",
    size: 7,
  },
  {
    id: 6,
    type: "danger",
    animation: "flightSix",
    duration: "19s",
    delay: "-11s",
    size: 9,
  },
  {
    id: 7,
    type: "normal",
    animation: "flightSeven",
    duration: "24s",
    delay: "-18s",
    size: 8,
  },
  {
    id: 8,
    type: "normal",
    animation: "flightEight",
    duration: "16s",
    delay: "-4s",
    size: 7,
  },
];

export default function AirTraffic() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#04090C] text-[#B7E4C7]">
        <style>{`
            @keyframes voo1 {
                0% {
                left: 8%;
                top: 20%;
                transform: rotate(25deg);
                }

                20% {
                left: 25%;
                top: 12%;
                transform: rotate(55deg);
                }

                40% {
                left: 45%;
                top: 25%;
                transform: rotate(110deg);
                }

                60% {
                left: 65%;
                top: 15%;
                transform: rotate(170deg);
                }

                80% {
                left: 78%;
                top: 40%;
                transform: rotate(230deg);
                }

                100% {
                left: 8%;
                top: 20%;
                transform: rotate(385deg);
                }
            }

            @keyframes voo2 {
                0% {
                left: 75%;
                top: 15%;
                transform: rotate(180deg);
                }

                20% {
                left: 65%;
                top: 35%;
                transform: rotate(220deg);
                }

                40% {
                left: 45%;
                top: 45%;
                transform: rotate(270deg);
                }

                60% {
                left: 25%;
                top: 35%;
                transform: rotate(320deg);
                }

                80% {
                left: 15%;
                top: 55%;
                transform: rotate(380deg);
                }

                100% {
                left: 75%;
                top: 15%;
                transform: rotate(540deg);
                }
            }

            @keyframes voo3 {
                0% {
                left: 15%;
                top: 70%;
                transform: rotate(0deg);
                }

                20% {
                left: 30%;
                top: 55%;
                transform: rotate(45deg);
                }

                40% {
                left: 50%;
                top: 65%;
                transform: rotate(90deg);
                }

                60% {
                left: 70%;
                top: 50%;
                transform: rotate(150deg);
                }

                80% {
                left: 85%;
                top: 70%;
                transform: rotate(210deg);
                }

                100% {
                left: 15%;
                top: 70%;
                transform: rotate(360deg);
                }
            }

            @keyframes voo4 {
                0% {
                left: 80%;
                top: 70%;
                transform: rotate(270deg);
                }

                20% {
                left: 65%;
                top: 55%;
                transform: rotate(220deg);
                }

                40% {
                left: 45%;
                top: 70%;
                transform: rotate(170deg);
                }

                60% {
                left: 30%;
                top: 50%;
                transform: rotate(120deg);
                }

                80% {
                left: 10%;
                top: 65%;
                transform: rotate(60deg);
                }

                100% {
                left: 80%;
                top: 70%;
                transform: rotate(-90deg);
                }
            }

            @keyframes voo5 {
                0% {
                left: 30%;
                top: 15%;
                transform: rotate(90deg);
                }

                20% {
                left: 50%;
                top: 10%;
                transform: rotate(130deg);
                }

                40% {
                left: 70%;
                top: 25%;
                transform: rotate(190deg);
                }

                60% {
                left: 55%;
                top: 45%;
                transform: rotate(240deg);
                }

                80% {
                left: 35%;
                top: 35%;
                transform: rotate(300deg);
                }

                100% {
                left: 30%;
                top: 15%;
                transform: rotate(450deg);
                }
            }

            @keyframes voo6 {
                0% {
                left: 85%;
                top: 30%;
                transform: rotate(180deg);
                }

                20% {
                left: 70%;
                top: 15%;
                transform: rotate(240deg);
                }

                40% {
                left: 50%;
                top: 30%;
                transform: rotate(300deg);
                }

                60% {
                left: 30%;
                top: 20%;
                transform: rotate(350deg);
                }

                80% {
                left: 15%;
                top: 40%;
                transform: rotate(420deg);
                }

                100% {
                left: 85%;
                top: 30%;
                transform: rotate(540deg);
                }
            }

            @keyframes radarScan {
                from {
                transform: rotate(0deg);
                }

                to {
                transform: rotate(360deg);
                }
            }

            @keyframes pulseAircraft {
                0%,
                100% {
                box-shadow:
                    0 0 5px currentColor,
                    0 0 12px currentColor;
                }

                50% {
                box-shadow:
                    0 0 8px currentColor,
                    0 0 22px currentColor;
                }
            }

            .radar-scan {
                animation: radarScan 8s linear infinite;
            }

            .aircraft {
                animation-timing-function: linear;
                animation-iteration-count: infinite;
            }
        `}</style>

      <div className="flex h-[calc(100vh-80px)]">

        {/* PAINEL LATERAL */}
        <aside className="relative z-30 hidden w-64 shrink-0 border-r border-[#2D6A4F]/30 bg-[#07120F]/95 lg:block">

          {/* Título */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#52B788]" />

              <span className="font-mono text-xs tracking-[0.2em] text-[#74C69D]">
                AÉREO
              </span>
            </div>

            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Controle de espaço aéreo
            </div>
          </div>

          {/* Radar */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Radar planetário
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#52B788] shadow-[0_0_10px_#52B788]" />

              <span className="font-mono text-xs text-[#95D5B2]">
                SINAL ESTÁVEL
              </span>
            </div>
          </div>

          {/* Tráfego */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Tráfego aéreo
            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#52B788]" />

                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    NORMAL
                  </span>
                </div>

                <span className="font-mono text-sm text-[#74C69D]">
                  247
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />

                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    ELEVADO
                  </span>
                </div>

                <span className="font-mono text-sm text-yellow-300">
                  31
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />

                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    ALERTAS
                  </span>
                </div>

                <span className="font-mono text-sm text-red-400">
                  08
                </span>
              </div>

            </div>
          </div>

          {/* Altitudes */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Faixas de altitude
            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#B7E4C7]/60">
                  BAIXA
                </span>

                <span className="font-mono text-[9px] text-[#74C69D]">
                  0–2 KM
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#B7E4C7]/60">
                  MÉDIA
                </span>

                <span className="font-mono text-[9px] text-[#74C69D]">
                  2–8 KM
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#B7E4C7]/60">
                  ALTA
                </span>

                <span className="font-mono text-[9px] text-[#74C69D]">
                  8+ KM
                </span>
              </div>

            </div>
          </div>

          {/* Camadas */}
          <div className="p-5">
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Camadas
            </div>

            <div className="space-y-3">
              {[
                "AERONAVES",
                "VETORES",
                "ALTITUDE",
                "ZONAS DE RISCO",
                "RADAR",
              ].map((layer) => (
                <div
                  key={layer}
                  className="flex items-center justify-between"
                >
                  <span className="font-mono text-[10px] text-[#B7E4C7]/60">
                    {layer}
                  </span>

                  <span className="flex h-4 w-4 items-center justify-center border border-[#52B788]/50 bg-[#1B4332]/40 text-[9px] text-[#74C69D]">
                    ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ESPAÇO AÉREO */}
        <main className="relative flex-1 overflow-hidden">

          {/* Grid */}
          <div
            className="
              absolute inset-0
              opacity-[0.10]
              bg-[linear-gradient(#52B788_1px,transparent_1px),linear-gradient(90deg,#52B788_1px,transparent_1px)]
              bg-[size:50px_50px]
            "
          />

          {/* Brilho central */}
          <div
            className="
              absolute left-1/2 top-1/2
              h-[600px] w-[600px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-[#2D6A4F]/10
              blur-[120px]
            "
          />

          {/* Radar principal */}
          <div
            className="
              absolute left-1/2 top-1/2
              h-[600px] w-[600px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[#52B788]/15
            "
          />

          <div
            className="
              absolute left-1/2 top-1/2
              h-[450px] w-[450px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[#52B788]/15
            "
          />

          <div
            className="
              absolute left-1/2 top-1/2
              h-[300px] w-[300px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[#52B788]/20
            "
          />

          <div
            className="
              absolute left-1/2 top-1/2
              h-[150px] w-[150px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[#52B788]/20
            "
          />

          {/* Linhas do radar */}
          <div className="absolute left-1/2 top-1/2 h-[600px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#52B788]/10" />

          <div className="absolute left-1/2 top-1/2 h-px w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#52B788]/10" />

          {/* Scanner */}
          <div
            className="
              radar-scan
              absolute left-1/2 top-1/2
              h-[300px] w-[2px]
              origin-bottom
              bg-gradient-to-t
              from-[#52B788]/50
              to-transparent
            "
            style={{
              transformOrigin: "bottom center",
            }}
          />

          {/* Centro do radar */}
          <div
            className="
              absolute left-1/2 top-1/2
              z-10
              h-3 w-3
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[#74C69D]
              bg-[#52B788]/20
              shadow-[0_0_15px_#52B788]
            "
          />

          {/* AERONAVES */}
          {aircraft.map((craft) => {
            const danger = craft.type === "danger";

            return (
              <div
                key={craft.id}
                className={`
                  absolute left-1/2 top-1/2
                  z-20
                  ${danger ? "text-red-400" : "text-[#74C69D]"}
                  ${danger ? "aircraft-danger" : "aircraft-normal"}
                `}
                style={{
                  animationName: craft.animation,
                  animationDuration: craft.duration,
                  animationDelay: craft.delay,
                  animationIterationCount: "infinite",
                  animationTimingFunction: "linear",
                }}
              >
                {/* Vetor */}
                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${
                      danger
                        ? "border-red-400 bg-red-500/10"
                        : "border-[#52B788] bg-[#52B788]/10"
                    }
                  `}
                  style={{
                    width: `${craft.size * 3}px`,
                    height: `${craft.size * 3}px`,
                  }}
                >
                  <span className="font-mono text-sm font-bold">
                    &gt;
                  </span>
                </div>

                {/* Trilha */}
                <div
                  className={`
                    absolute right-full top-1/2
                    h-px w-10
                    -translate-y-1/2
                    bg-gradient-to-r
                    from-transparent
                    ${
                      danger
                        ? "to-red-400/40"
                        : "to-[#52B788]/40"
                    }
                  `}
                />

                {/* Identificador */}
                <span
                  className="
                    absolute left-full top-1/2
                    ml-2 -translate-y-1/2
                    whitespace-nowrap
                    font-mono text-[8px]
                    tracking-wider
                    opacity-50
                  "
                >
                  A-{String(craft.id).padStart(3, "0")}
                </span>
              </div>
            );
          })}

          {/* Informações */}
          <div className="absolute left-6 top-6 z-30">
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#74C69D]/50">
              ESPAÇO AÉREO // SETOR A-07
            </div>

            <div className="mt-2 font-mono text-xs text-[#95D5B2]">
              MONITORAMENTO EM TEMPO REAL
            </div>
          </div>

          <div className="absolute bottom-6 left-6 z-30 font-mono text-[9px] text-[#74C69D]/40">
            LAT: 17.3857° N
            <span className="mx-2">|</span>
            LON: 78.4867° W
            <span className="mx-2">|</span>
            RAIO: 50 KM
          </div>

          {/* Controles */}
          <div
            className="
              absolute right-6 top-6
              z-40
              flex flex-col
              border border-[#2D6A4F]/50
              bg-[#07120F]/90
              backdrop-blur-xl
            "
          >
            <button className="flex h-11 w-11 items-center justify-center border-b border-[#2D6A4F]/30 text-[#74C69D] transition hover:bg-[#2D6A4F]/20">
              <Crosshair className="h-4 w-4" />
            </button>

            <button className="flex h-11 w-11 items-center justify-center border-b border-[#2D6A4F]/30 text-[#74C69D] transition hover:bg-[#2D6A4F]/20">
              <Plus className="h-4 w-4" />
            </button>

            <button className="flex h-11 w-11 items-center justify-center border-b border-[#2D6A4F]/30 text-[#74C69D] transition hover:bg-[#2D6A4F]/20">
              <Minus className="h-4 w-4" />
            </button>

            <button className="flex h-11 w-11 items-center justify-center text-[#74C69D] transition hover:bg-[#2D6A4F]/20">
              <Layers className="h-4 w-4" />
            </button>
          </div>

          {/* Status */}
          <div
            className="
              absolute bottom-6 right-6
              z-40
              border border-[#2D6A4F]/50
              bg-[#07120F]/90
              px-5 py-4
              backdrop-blur-xl
            "
          >
            <div className="flex items-center gap-3">

              <Radio className="h-4 w-4 text-[#52B788]" />

              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#74C69D]">
                  RADAR ONLINE
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[#74C69D]/40">
                  255 entidades detectadas
                </div>
              </div>

            </div>
          </div>

          {/* Linha de varredura */}
          <div
            className="
              scan-line
              pointer-events-none
              absolute left-0 right-0 top-0
              z-50
              h-24
              bg-gradient-to-b
              from-transparent
              via-[#52B788]/5
              to-transparent
            "
          />

        </main>
      </div>
    </div>
  );
}