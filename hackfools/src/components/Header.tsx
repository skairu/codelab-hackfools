import {
  Plane,
  CarFront,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

// ---------------------------------------------------------------------------
// Ícone Customizado: Dinossauro com Radar (Baseado na referência)
// ---------------------------------------------------------------------------
function DinoRadarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      className={className}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* --- Fundo: Radar --- */}
      <circle cx="50" cy="45" r="42" />
      <circle cx="50" cy="45" r="26" />
      <circle cx="50" cy="45" r="10" />
      
      {/* Linha de varredura do radar */}
      <path d="M50 45 L20 15" />
      
      {/* Pontos (blips) do radar */}
      <circle cx="72" cy="32" r="4" />
      <circle cx="80" cy="75" r="4" />

      {/* --- Plano de fundo do Dinossauro: Pernas Traseiras --- */}
      {/* Perna Dianteira (fundo) */}
      <path d="M 34 72 L 44 88 L 34 88 Z" fill="#081C15" />
      {/* Perna Traseira (fundo) */}
      <path d="M 64 65 L 76 88 L 66 88 Z" fill="#081C15" />

      {/* --- Primeiro Plano: Corpo Principal do Dinossauro --- */}
      {/* O fill="#081C15" (cor do fundo do header) garante que as linhas do radar sejam escondidas atrás do dinossauro */}
      <path
        d="
          M 40 45
          Q 70 55 95 72
          Q 75 68 64 62
          L 64 88
          L 48 88
          L 50 72
          Q 42 75 34 72
          L 34 88
          L 18 88
          L 22 60
          Q 12 30 10 12
          A 4 4 0 0 1 16 8
          L 20 12
          A 2 2 0 0 1 16 16
          Q 20 35 40 45
          Z
        "
        fill="#081C15"
      />
    </svg>
  );
}

const servicos = [
  {
    label: "AÉREO",
    description: "Controle de Tráfego Aéreo",
    icon: Plane,
    path: "/aereo",
  },
  {
    label: "TERRESTRE",
    description: "Controle de Tráfego Terrestre",
    icon: CarFront,
    path: "/",
  },
];

export default function Cabecalho() {
  const location = useLocation();

  return (
    <header className="relative border-b border-[#2D6A4F]/40 bg-[#081C15]/95 backdrop-blur-xl">

      {/* Brilho ambiente */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 rounded-full bg-[#52B788]/10 blur-3xl" />

        <div className="absolute left-0 top-0 h-20 w-40 bg-[#2D6A4F]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div
            className="
              relative flex h-10 w-10 items-center justify-center
              rounded-lg border border-[#52B788]/40
              bg-[#1B4332]/60
              shadow-[0_0_20px_rgba(82,183,136,0.08)]
            "
          >
            <div
              className="
                absolute inset-1 rounded-md
                border border-[#74C69D]/10
              "
            />

            {/* Novo Ícone do Dinossauro aplicado aqui */}
            <DinoRadarIcon className="h-7 w-7 text-[#74C69D]" />
          </div>

          <div className="flex flex-col justify-center">
            <h1
              className="
                font-mono text-2xl font-extrabold
                tracking-[0.15em]
                bg-gradient-to-r from-[#D8F3DC] via-[#95D5B2] to-[#52B788]
                bg-clip-text text-transparent
                drop-shadow-[0_0_12px_rgba(82,183,136,0.5)]
              "
            >
              P-Mob
            </h1>

            <p
              className="
                mt-0.5
                font-mono text-[9px] uppercase
                tracking-[0.25em]
                text-[#74C69D]/60
              "
            >
              Rede Planetária de Tráfego
            </p>
          </div>
        </Link>

        {/* Navegação */}
        <nav className="hidden items-center gap-2 md:flex">
          {servicos.map((servico) => {
            const Icone = servico.icon;

            const ativo =
              location.pathname === servico.path;

            return (
              <Link
                key={servico.label}
                to={servico.path}
                className="
                  group relative flex items-center gap-3
                  border border-transparent
                  px-5 py-2.5
                  transition-all duration-200
                  hover:border-[#52B788]/30
                  hover:bg-[#2D6A4F]/20
                "
              >

                {/* Indicador ativo */}
                {ativo && (
                  <span
                    className="
                      absolute bottom-0 left-1/2
                      h-px w-8
                      -translate-x-1/2
                      bg-[#74C69D]
                      shadow-[0_0_10px_#74C69D]
                    "
                  />
                )}

                <Icone
                  className="
                    h-4 w-4
                    text-[#40916C]
                    transition-colors
                    group-hover:text-[#95D5B2]
                  "
                />

                <div className="text-left">
                  <div
                    className="
                      font-mono text-xs font-semibold
                      tracking-[0.18em]
                      text-[#B7E4C7]
                      group-hover:text-[#D8F3DC]
                    "
                  >
                    {servico.label}
                  </div>

                  <div
                    className="
                      mt-0.5 text-[8px] uppercase
                      tracking-wider
                      text-[#74C69D]/40
                      group-hover:text-[#74C69D]/70
                    "
                  >
                    {servico.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Acesso */}
        <Link
          to="/login"
          className="
            group relative hidden sm:flex
            items-center gap-2
            border border-[#52B788]/40
            bg-[#0B241B]/80
            px-5 py-2

            font-mono text-[10px]
            font-semibold
            tracking-[0.2em]
            text-[#74C69D]

            transition-all duration-200

            hover:border-[#95D5B2]/70
            hover:bg-[#1B4332]/60
            hover:text-[#D8F3DC]

            before:absolute
            before:left-0
            before:top-0
            before:h-px
            before:w-4
            before:bg-[#95D5B2]

            after:absolute
            after:bottom-0
            after:right-0
            after:h-px
            after:w-4
            after:bg-[#95D5B2]
          "
        >
          <span
            className="
              h-1.5 w-1.5
              rounded-full
              bg-[#52B788]
              shadow-[0_0_8px_#52B788]
            "
          />

          ACESSAR

          <span className="text-[#40916C] group-hover:text-[#95D5B2]">
            //
          </span>

          LOGIN
        </Link>
      </div>
    </header>
  );
}