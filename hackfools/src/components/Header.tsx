import { Plane, CarFront, Waves, Activity } from "lucide-react";

const services = [
  {
    label: "AIR",
    description: "Air Traffic Control",
    icon: Plane,
  },
  {
    label: "LAND",
    description: "Land Traffic Control",
    icon: CarFront,
  },
  {
    label: "MARINE",
    description: "Marine Traffic Control",
    icon: Waves,
  },
];

export default function Header() {
  return (
    <header className="relative border-b border-[#2D6A4F]/40 bg-[#081C15]/95 backdrop-blur-xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 rounded-full bg-[#52B788]/10 blur-3xl" />
        <div className="absolute left-0 top-0 h-20 w-40 bg-[#2D6A4F]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="
              relative flex h-10 w-10 items-center justify-center
              rounded-lg border border-[#52B788]/40
              bg-[#1B4332]/60
              shadow-[0_0_20px_rgba(82,183,136,0.08)]
            "
          >
            <div className="absolute inset-1 rounded-md border border-[#74C69D]/10" />

            <Activity className="h-5 w-5 text-[#74C69D]" />
          </div>

          <div>
            <h1 className="font-mono text-lg font-bold tracking-[0.2em] text-[#D8F3DC]">
              NEXUS
              <span className="text-[#52B788]"> //</span>
              TRAFFIC
            </h1>

            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#74C69D]/50">
              Planetary Traffic Network
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <button
                key={service.label}
                className="
                  group relative flex items-center gap-3
                  border border-transparent
                  px-5 py-2.5
                  transition-all duration-200
                  hover:border-[#52B788]/30
                  hover:bg-[#2D6A4F]/20
                "
              >
                {/* Active indicator */}
                {index === 0 && (
                  <span
                    className="
                      absolute bottom-0 left-1/2 h-px w-8
                      -translate-x-1/2
                      bg-[#74C69D]
                      shadow-[0_0_10px_#74C69D]
                    "
                  />
                )}

                <Icon
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
                    {service.label}
                  </div>

                  <div
                    className="
                      mt-0.5 text-[8px] uppercase
                      tracking-wider
                      text-[#74C69D]/40
                      group-hover:text-[#74C69D]/70
                    "
                  >
                    {service.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* System status */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="relative flex h-2 w-2">
            <span
              className="
                absolute inline-flex h-full w-full
                animate-ping rounded-full
                bg-[#74C69D] opacity-40
              "
            />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#52B788]" />
          </span>

          <span
            className="
              font-mono text-[10px] uppercase
              tracking-[0.2em]
              text-[#74C69D]
            "
          >
            System Online
          </span>
        </div>
      </div>
    </header>
  );
}