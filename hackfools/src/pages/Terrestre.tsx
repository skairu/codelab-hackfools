import { Activity, Crosshair, Layers, Minus, Plus } from "lucide-react";

const buildings = [
  { x: 2, y: 2, w: 15, h: 17 },
  { x: 20, y: 2, w: 12, h: 17 },
  { x: 37, y: 2, w: 18, h: 17 },
  { x: 60, y: 2, w: 14, h: 17 },
  { x: 79, y: 2, w: 18, h: 17 },

  { x: 2, y: 29, w: 17, h: 17 },
  { x: 23, y: 29, w: 12, h: 17 },
  { x: 39, y: 29, w: 17, h: 17 },
  { x: 60, y: 29, w: 13, h: 17 },
  { x: 77, y: 29, w: 20, h: 17 },

  { x: 2, y: 56, w: 14, h: 18 },
  { x: 19, y: 56, w: 17, h: 18 },
  { x: 39, y: 56, w: 13, h: 18 },
  { x: 55, y: 56, w: 18, h: 18 },
  { x: 76, y: 56, w: 21, h: 18 },

  { x: 2, y: 84, w: 17, h: 14 },
  { x: 23, y: 84, w: 14, h: 14 },
  { x: 41, y: 84, w: 17, h: 14 },
  { x: 62, y: 84, w: 13, h: 14 },
  { x: 79, y: 84, w: 18, h: 14 },
];

const vehicles = [
  {
    id: 1,
    type: "normal",
    direction: "right",
    top: "24%",
    left: "8%",
    duration: "9s",
    delay: "0s",
  },
  {
    id: 2,
    type: "normal",
    direction: "right",
    top: "24%",
    left: "48%",
    duration: "11s",
    delay: "-4s",
  },
  {
    id: 3,
    type: "danger",
    direction: "right",
    top: "24%",
    left: "72%",
    duration: "7s",
    delay: "-2s",
  },

  {
    id: 4,
    type: "normal",
    direction: "left",
    top: "51%",
    left: "80%",
    duration: "10s",
    delay: "-6s",
  },
  {
    id: 5,
    type: "normal",
    direction: "left",
    top: "51%",
    left: "35%",
    duration: "8s",
    delay: "-1s",
  },
  {
    id: 6,
    type: "danger",
    direction: "left",
    top: "51%",
    left: "58%",
    duration: "12s",
    delay: "-7s",
  },

  {
    id: 7,
    type: "normal",
    direction: "right",
    top: "79%",
    left: "12%",
    duration: "10s",
    delay: "-5s",
  },
  {
    id: 8,
    type: "normal",
    direction: "right",
    top: "79%",
    left: "62%",
    duration: "8s",
    delay: "-3s",
  },

  {
    id: 9,
    type: "normal",
    direction: "down",
    top: "5%",
    left: "34%",
    duration: "9s",
    delay: "-2s",
  },
  {
    id: 10,
    type: "danger",
    direction: "down",
    top: "37%",
    left: "74%",
    duration: "11s",
    delay: "-5s",
  },
  {
    id: 11,
    type: "normal",
    direction: "up",
    top: "67%",
    left: "57%",
    duration: "10s",
    delay: "-7s",
  },
];

export default function Terrestre() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050B0E] text-[#B7E4C7]">
      <style>{`
        @keyframes moveRight {
          0% {
            transform: translateX(-120px);
          }
          100% {
            transform: translateX(calc(100vw + 120px));
          }
        }

        @keyframes moveLeft {
          0% {
            transform: translateX(calc(100vw + 120px));
          }
          100% {
            transform: translateX(-120px);
          }
        }

        @keyframes moveDown {
          0% {
            transform: translateY(-120px);
          }
          100% {
            transform: translateY(calc(100vh + 120px));
          }
        }

        @keyframes moveUp {
          0% {
            transform: translateY(calc(100vh + 120px));
          }
          100% {
            transform: translateY(-120px);
          }
        }

        @keyframes pulseVehicle {
          0%, 100% {
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

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }

          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: .35;
          }

          50% {
            opacity: .8;
          }
        }

        .vehicle-right {
          animation-name: moveRight, pulseVehicle;
        }

        .vehicle-left {
          animation-name: moveLeft, pulseVehicle;
        }

        .vehicle-down {
          animation-name: moveDown, pulseVehicle;
        }

        .vehicle-up {
          animation-name: moveUp, pulseVehicle;
        }

        .scan-line {
          animation: scan 7s linear infinite;
        }

        .ambient-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>

      <div className="flex h-[calc(100vh-80px)]">

        {/* PAINEL LATERAL */}
        <aside className="relative z-20 hidden w-64 shrink-0 border-r border-[#2D6A4F]/30 bg-[#07120F]/95 lg:block">

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
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#52B788] shadow-[0_0_10px_#52B788]" />

              <span className="font-mono text-xs text-[#95D5B2]">
                OPERACIONAL
              </span>
            </div>
          </div>

          {/* Tráfego */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#74C69D]/40">
              Fluxo atual
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
                  128
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
                  24
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />

                  <span className="font-mono text-[10px] text-[#B7E4C7]/70">
                    CRÍTICO
                  </span>
                </div>

                <span className="font-mono text-sm text-red-400">
                  13
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
                "PRÉDIOS",
                "RUAS",
                "VEÍCULOS",
                "INTERSEÇÕES",
                "ALERTAS",
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

        {/* ÁREA DO MAPA */}
        <main className="relative flex-1 overflow-hidden">

          {/* Grid de fundo */}
          <div
            className="
              absolute inset-0
              opacity-[0.12]
              bg-[linear-gradient(#52B788_1px,transparent_1px),linear-gradient(90deg,#52B788_1px,transparent_1px)]
              bg-[size:50px_50px]
            "
          />

          {/* Brilho ambiente */}
          <div className="ambient-pulse absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D6A4F]/10 blur-[120px]" />

          {/* CIDADE */}
          <div className="absolute inset-8 overflow-hidden border border-[#2D6A4F]/30 bg-[#071013]">

            {/* Ruas horizontais */}
            <div className="absolute left-0 right-0 top-[22%] h-[7%] border-y border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[#74C69D]/20" />
            </div>

            <div className="absolute left-0 right-0 top-[49%] h-[7%] border-y border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[#74C69D]/20" />
            </div>

            <div className="absolute left-0 right-0 top-[76%] h-[7%] border-y border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[#74C69D]/20" />
            </div>

            {/* Ruas verticais */}
            <div className="absolute bottom-0 left-[17%] top-0 w-[7%] border-x border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-[#74C69D]/20" />
            </div>

            <div className="absolute bottom-0 left-[35%] top-0 w-[7%] border-x border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-[#74C69D]/20" />
            </div>

            <div className="absolute bottom-0 left-[57%] top-0 w-[7%] border-x border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-[#74C69D]/20" />
            </div>

            <div className="absolute bottom-0 left-[75%] top-0 w-[7%] border-x border-[#1B4332]/60 bg-[#05090B]">
              <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-[#74C69D]/20" />
            </div>

            {/* Prédios */}
            {buildings.map((building, index) => (
              <div
                key={index}
                className="
                  absolute
                  border border-[#59636A]/50
                  bg-[#252D31]
                  shadow-[inset_0_0_30px_rgba(0,0,0,0.6),0_0_20px_rgba(0,0,0,0.4)]
                "
                style={{
                  left: `${building.x}%`,
                  top: `${building.y}%`,
                  width: `${building.w}%`,
                  height: `${building.h}%`,
                }}
              >
                {/* Detalhes do prédio */}
                <div className="absolute inset-2 border border-[#69757B]/10" />

                <div className="absolute left-2 top-2 h-1 w-8 bg-[#59636A]/30" />

                <div className="absolute bottom-2 right-2 h-1 w-4 bg-[#52B788]/20" />

                <div className="absolute bottom-2 left-2 flex gap-1">
                  <span className="h-1 w-1 bg-[#74C69D]/20" />
                  <span className="h-1 w-1 bg-[#74C69D]/20" />
                  <span className="h-1 w-1 bg-[#74C69D]/20" />
                </div>
              </div>
            ))}

            {/* Veículos */}
            {vehicles.map((vehicle) => {
              const animationClass =
                vehicle.direction === "right"
                  ? "vehicle-right"
                  : vehicle.direction === "left"
                    ? "vehicle-left"
                    : vehicle.direction === "down"
                      ? "vehicle-down"
                      : "vehicle-up";

              const isDanger = vehicle.type === "danger";

              return (
                <div
                  key={vehicle.id}
                  className={`
                    absolute z-10
                    flex h-7 w-7
                    items-center justify-center
                    rounded-full
                    border
                    font-mono text-xs font-bold
                    ${
                      isDanger
                        ? "border-red-400 bg-red-500/10 text-red-400"
                        : "border-[#52B788] bg-[#52B788]/10 text-[#74C69D]"
                    }
                    ${animationClass}
                  `}
                  style={{
                    top: vehicle.top,
                    left: vehicle.left,
                    animationDuration: `${vehicle.duration}, 2s`,
                    animationDelay: `${vehicle.delay}, 0s`,
                    animationIterationCount: "infinite",
                    animationTimingFunction: "linear, ease-in-out",
                  }}
                >
                  <span
                    className={
                      vehicle.direction === "left"
                        ? "rotate-180"
                        : vehicle.direction === "down"
                          ? "rotate-90"
                          : vehicle.direction === "up"
                            ? "-rotate-90"
                            : ""
                    }
                  >
                    &gt;
                  </span>
                </div>
              );
            })}

            {/* Interseções */}
            {[
              { left: "20.5%", top: "25.5%" },
              { left: "38.5%", top: "25.5%" },
              { left: "60.5%", top: "25.5%" },
              { left: "78.5%", top: "25.5%" },

              { left: "20.5%", top: "52.5%" },
              { left: "38.5%", top: "52.5%" },
              { left: "60.5%", top: "52.5%" },
              { left: "78.5%", top: "52.5%" },
            ].map((point, index) => (
              <div
                key={index}
                className="
                  absolute z-10
                  h-2 w-2
                  rounded-full
                  border border-[#74C69D]/50
                  bg-[#071013]
                  shadow-[0_0_8px_#52B788]
                "
                style={{
                  left: point.left,
                  top: point.top,
                }}
              />
            ))}

            {/* Linha de varredura */}
            <div
              className="
                scan-line
                pointer-events-none
                absolute left-0 right-0 top-0
                z-20 h-20
                bg-gradient-to-b
                from-transparent
                via-[#52B788]/5
                to-transparent
              "
            />

            {/* Coordenadas */}
            <div className="absolute left-4 top-4 z-30 font-mono text-[9px] text-[#74C69D]/50">
              SETOR: T-07
              <br />
              LAT: 17.3857° N
              <br />
              LON: 78.4867° W
            </div>

            <div className="absolute bottom-4 left-4 z-30 font-mono text-[9px] tracking-wider text-[#74C69D]/40">
              MAPA TERRESTRE // ESCALA 1:5000
            </div>

          </div>

          {/* Controles do mapa */}
          <div
            className="
              absolute right-8 top-8 z-40
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

          {/* Status inferior */}
          <div
            className="
              absolute bottom-8 right-8 z-40
              border border-[#2D6A4F]/50
              bg-[#07120F]/90
              px-5 py-4
              backdrop-blur-xl
            "
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#52B788] shadow-[0_0_10px_#52B788]" />

              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#74C69D]">
                  SISTEMA OPERACIONAL
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[#74C69D]/40">
                  Todos os sensores nominais
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}