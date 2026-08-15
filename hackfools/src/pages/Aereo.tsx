import {
  Crosshair,
  Layers,
  Minus,
  Plane,
  Plus,
  Radio,
} from "lucide-react";

const aeronaves = [
  {
    id: 1,
    animation: "voo1",
    duration: "18s",
    delay: "-2s",
    left: "8%",
    top: "20%",
    perigo: false,
  },
  {
    id: 2,
    animation: "voo2",
    duration: "22s",
    delay: "-8s",
    left: "75%",
    top: "15%",
    perigo: false,
  },
  {
    id: 3,
    animation: "voo3",
    duration: "15s",
    delay: "-4s",
    left: "15%",
    top: "70%",
    perigo: true,
  },
  {
    id: 4,
    animation: "voo4",
    duration: "20s",
    delay: "-12s",
    left: "80%",
    top: "70%",
    perigo: false,
  },
  {
    id: 5,
    animation: "voo5",
    duration: "17s",
    delay: "-6s",
    left: "30%",
    top: "15%",
    perigo: false,
  },
  {
    id: 6,
    animation: "voo6",
    duration: "19s",
    delay: "-10s",
    left: "85%",
    top: "30%",
    perigo: true,
  },
];

export default function Aereo() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#04090C] text-[#B7E4C7]">
      <style>{`

        /* ============================================================
           TRAJETÓRIAS DAS AERONAVES
           ============================================================ */

        @keyframes voo1 {
          0% {
            left: 8%;
            top: 20%;
            --rotacao: 20deg;
          }

          20% {
            left: 25%;
            top: 12%;
            --rotacao: 60deg;
          }

          40% {
            left: 45%;
            top: 25%;
            --rotacao: 110deg;
          }

          60% {
            left: 65%;
            top: 15%;
            --rotacao: 170deg;
          }

          80% {
            left: 80%;
            top: 40%;
            --rotacao: 230deg;
          }

          100% {
            left: 8%;
            top: 20%;
            --rotacao: 380deg;
          }
        }

        @keyframes voo2 {
          0% {
            left: 75%;
            top: 15%;
            --rotacao: 180deg;
          }

          20% {
            left: 65%;
            top: 35%;
            --rotacao: 225deg;
          }

          40% {
            left: 45%;
            top: 45%;
            --rotacao: 270deg;
          }

          60% {
            left: 25%;
            top: 35%;
            --rotacao: 315deg;
          }

          80% {
            left: 15%;
            top: 55%;
            --rotacao: 380deg;
          }

          100% {
            left: 75%;
            top: 15%;
            --rotacao: 540deg;
          }
        }

        @keyframes voo3 {
          0% {
            left: 15%;
            top: 70%;
            --rotacao: 0deg;
          }

          20% {
            left: 30%;
            top: 55%;
            --rotacao: 45deg;
          }

          40% {
            left: 50%;
            top: 65%;
            --rotacao: 90deg;
          }

          60% {
            left: 70%;
            top: 50%;
            --rotacao: 150deg;
          }

          80% {
            left: 85%;
            top: 70%;
            --rotacao: 210deg;
          }

          100% {
            left: 15%;
            top: 70%;
            --rotacao: 360deg;
          }
        }

        @keyframes voo4 {
          0% {
            left: 80%;
            top: 70%;
            --rotacao: 270deg;
          }

          20% {
            left: 65%;
            top: 55%;
            --rotacao: 220deg;
          }

          40% {
            left: 45%;
            top: 70%;
            --rotacao: 170deg;
          }

          60% {
            left: 30%;
            top: 50%;
            --rotacao: 120deg;
          }

          80% {
            left: 10%;
            top: 65%;
            --rotacao: 60deg;
          }

          100% {
            left: 80%;
            top: 70%;
            --rotacao: -90deg;
          }
        }

        @keyframes voo5 {
          0% {
            left: 30%;
            top: 15%;
            --rotacao: 90deg;
          }

          20% {
            left: 50%;
            top: 10%;
            --rotacao: 130deg;
          }

          40% {
            left: 70%;
            top: 25%;
            --rotacao: 190deg;
          }

          60% {
            left: 55%;
            top: 45%;
            --rotacao: 240deg;
          }

          80% {
            left: 35%;
            top: 35%;
            --rotacao: 300deg;
          }

          100% {
            left: 30%;
            top: 15%;
            --rotacao: 450deg;
          }
        }

        @keyframes voo6 {
          0% {
            left: 85%;
            top: 30%;
            --rotacao: 180deg;
          }

          20% {
            left: 70%;
            top: 15%;
            --rotacao: 240deg;
          }

          40% {
            left: 50%;
            top: 30%;
            --rotacao: 300deg;
          }

          60% {
            left: 30%;
            top: 20%;
            --rotacao: 350deg;
          }

          80% {
            left: 15%;
            top: 40%;
            --rotacao: 420deg;
          }

          100% {
            left: 85%;
            top: 30%;
            --rotacao: 540deg;
          }
        }

        /* ============================================================
           RADAR
           ============================================================ */

        @keyframes radarScan {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .radar-scan {
          animation: radarScan 8s linear infinite;
        }

        /* ============================================================
           PULSO DAS AERONAVES
           ============================================================ */

        @keyframes pulseAircraft {
          0%,
          100% {
            opacity: 0.75;
          }

          50% {
            opacity: 1;
          }
        }

        .aircraft-marker {
          animation: pulseAircraft 2s ease-in-out infinite;
        }

        /*
         * A variável --rotacao é atualizada pelos keyframes
         * de cada aeronave.
         */
        .aircraft-arrow {
          transform: rotate(var(--rotacao));
        }
      `}</style>

      <div className="flex h-[calc(100vh-80px)]">

        {/* ============================================================
            PAINEL LATERAL
            ============================================================ */}

        <aside
          className="
            relative z-30 hidden w-64 shrink-0
            border-r border-[#2D6A4F]/30
            bg-[#07120F]/95
            lg:block
          "
        >
          {/* Cabeçalho */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#52B788]" />

              <span className="font-mono text-xs tracking-[0.2em] text-[#74C69D]">
                AÉREO
              </span>
            </div>

            <div
              className="
                mt-2
                font-mono text-[9px]
                uppercase
                tracking-[0.2em]
                text-[#74C69D]/40
              "
            >
              Controle de espaço aéreo
            </div>
          </div>

          {/* Radar */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div
              className="
                mb-3
                font-mono text-[9px]
                uppercase
                tracking-[0.2em]
                text-[#74C69D]/40
              "
            >
              Radar planetário
            </div>

            <div className="flex items-center gap-2">
              <span
                className="
                  h-2 w-2
                  animate-pulse
                  rounded-full
                  bg-[#52B788]
                  shadow-[0_0_10px_#52B788]
                "
              />

              <span className="font-mono text-xs text-[#95D5B2]">
                SINAL ESTÁVEL
              </span>
            </div>
          </div>

          {/* Tráfego */}
          <div className="border-b border-[#2D6A4F]/30 p-5">
            <div
              className="
                mb-4
                font-mono text-[9px]
                uppercase
                tracking-[0.2em]
                text-[#74C69D]/40
              "
            >
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
                  <span className="h-2 w-2 rounded-full bg-red-500" />

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
            <div
              className="
                mb-4
                font-mono text-[9px]
                uppercase
                tracking-[0.2em]
                text-[#74C69D]/40
              "
            >
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
            <div
              className="
                mb-4
                font-mono text-[9px]
                uppercase
                tracking-[0.2em]
                text-[#74C69D]/40
              "
            >
              Camadas
            </div>

            <div className="space-y-3">
              {[
                "AERONAVES",
                "VETORES",
                "ALTITUDE",
                "ZONAS DE RISCO",
                "RADAR",
              ].map((camada) => (
                <div
                  key={camada}
                  className="flex items-center justify-between"
                >
                  <span className="font-mono text-[10px] text-[#B7E4C7]/60">
                    {camada}
                  </span>

                  <span
                    className="
                      flex h-4 w-4
                      items-center justify-center
                      border border-[#52B788]/50
                      bg-[#1B4332]/40
                      text-[9px]
                      text-[#74C69D]
                    "
                  >
                    ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ============================================================
            ÁREA DO RADAR
            ============================================================ */}

        <main className="relative flex-1 overflow-hidden">

          {/* Grid */}
          <div
            className="
              pointer-events-none
              absolute inset-0
              opacity-[0.10]
              bg-[linear-gradient(#52B788_1px,transparent_1px),linear-gradient(90deg,#52B788_1px,transparent_1px)]
              bg-[size:50px_50px]
            "
          />

          {/* Brilho */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-[600px] w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[#2D6A4F]/10
              blur-[120px]
            "
          />

          {/* ========================================================
              CÍRCULOS DO RADAR
              ======================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-[600px] w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border border-[#52B788]/15
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-[450px] w-[450px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border border-[#52B788]/15
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-[300px] w-[300px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border border-[#52B788]/20
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-[150px] w-[150px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border border-[#52B788]/20
            "
          />

          {/* Linha vertical */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-[600px] w-px
              -translate-x-1/2
              -translate-y-1/2
              bg-[#52B788]/10
            "
          />

          {/* Linha horizontal */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              h-px w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              bg-[#52B788]/10
            "
          />

          {/* ========================================================
              LINHA GIRATÓRIA DO RADAR
              ======================================================== */}

          <div
            className="
              radar-scan
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              z-10
              h-[300px]
              w-[2px]
              origin-bottom
              -translate-x-1/2
              -translate-y-full
              bg-gradient-to-t
              from-[#52B788]/60
              via-[#52B788]/20
              to-transparent
            "
          />

          {/* Centro do radar */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2 top-1/2
              z-10
              h-3 w-3
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border border-[#74C69D]
              bg-[#52B788]/20
              shadow-[0_0_15px_#52B788]
            "
          />

          {/* ========================================================
              AERONAVES
              ======================================================== */}

          {aeronaves.map((aeronave) => (
            <div
              key={aeronave.id}
              className={`
                absolute
                z-20
                ${aeronave.perigo ? "text-red-400" : "text-[#74C69D]"}
              `}
              style={{
                left: aeronave.left,
                top: aeronave.top,

                animation: `
                  ${aeronave.animation}
                  ${aeronave.duration}
                  linear
                  ${aeronave.delay}
                  infinite
                `,
              }}
            >

              {/* Rastro */}
              <div
                className={`
                  pointer-events-none
                  absolute
                  right-full
                  top-1/2
                  h-px
                  w-12
                  -translate-y-1/2
                  bg-gradient-to-r
                  from-transparent
                  ${
                    aeronave.perigo
                      ? "to-red-400/40"
                      : "to-[#52B788]/40"
                  }
                `}
              />

              {/* Círculo */}
              <div
                className={`
                  aircraft-marker
                  flex h-7 w-7
                  items-center justify-center
                  rounded-full
                  border
                  ${
                    aeronave.perigo
                      ? `
                        border-red-400
                        bg-red-500/10
                        shadow-[0_0_12px_rgba(239,68,68,0.5)]
                      `
                      : `
                        border-[#52B788]
                        bg-[#52B788]/10
                        shadow-[0_0_12px_rgba(82,183,136,0.35)]
                      `
                  }
                `}
              >

                {/* ==================================================
                    SETA

                    SOMENTE A SETA ROTACIONA.
                    O círculo permanece parado.
                    ================================================== */}

                <span
                  className="
                    aircraft-arrow
                    inline-block
                    font-mono
                    text-sm
                    font-bold
                  "
                >
                  &gt;
                </span>

              </div>

              {/* ID da aeronave */}
              <span
                className="
                  pointer-events-none
                  absolute
                  left-full
                  top-1/2
                  ml-2
                  -translate-y-1/2
                  whitespace-nowrap
                  font-mono
                  text-[8px]
                  tracking-wider
                  opacity-50
                "
              >
                A-{String(aeronave.id).padStart(3, "0")}
              </span>
            </div>
          ))}

          {/* ========================================================
              INFORMAÇÕES DO SETOR
              ======================================================== */}

          <div className="absolute left-6 top-6 z-30">
            <div
              className="
                font-mono
                text-[9px]
                tracking-[0.2em]
                text-[#74C69D]/50
              "
            >
              ESPAÇO AÉREO // SETOR A-07
            </div>

            <div
              className="
                mt-2
                font-mono
                text-xs
                text-[#95D5B2]
              "
            >
              MONITORAMENTO EM TEMPO REAL
            </div>
          </div>

          {/* Coordenadas */}
          <div
            className="
              absolute
              bottom-6 left-6
              z-30
              font-mono
              text-[9px]
              text-[#74C69D]/40
            "
          >
            LAT: 17.3857° N

            <span className="mx-2">|</span>

            LON: 78.4867° W

            <span className="mx-2">|</span>

            RAIO: 50 KM
          </div>

          {/* ========================================================
              CONTROLES
              ======================================================== */}

          <div
            className="
              absolute
              right-6 top-6
              z-40
              flex flex-col
              border border-[#2D6A4F]/50
              bg-[#07120F]/90
              backdrop-blur-xl
            "
          >
            <button
              className="
                flex h-11 w-11
                items-center justify-center
                border-b border-[#2D6A4F]/30
                text-[#74C69D]
                transition
                hover:bg-[#2D6A4F]/20
              "
            >
              <Crosshair className="h-4 w-4" />
            </button>

            <button
              className="
                flex h-11 w-11
                items-center justify-center
                border-b border-[#2D6A4F]/30
                text-[#74C69D]
                transition
                hover:bg-[#2D6A4F]/20
              "
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              className="
                flex h-11 w-11
                items-center justify-center
                border-b border-[#2D6A4F]/30
                text-[#74C69D]
                transition
                hover:bg-[#2D6A4F]/20
              "
            >
              <Minus className="h-4 w-4" />
            </button>

            <button
              className="
                flex h-11 w-11
                items-center justify-center
                text-[#74C69D]
                transition
                hover:bg-[#2D6A4F]/20
              "
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>

          {/* ========================================================
              STATUS DO RADAR
              ======================================================== */}

          <div
            className="
              absolute
              bottom-6 right-6
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
                <div
                  className="
                    font-mono
                    text-[10px]
                    tracking-[0.2em]
                    text-[#74C69D]
                  "
                >
                  RADAR ONLINE
                </div>

                <div
                  className="
                    mt-1
                    font-mono
                    text-[8px]
                    uppercase
                    tracking-wider
                    text-[#74C69D]/40
                  "
                >
                  255 entidades detectadas
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}