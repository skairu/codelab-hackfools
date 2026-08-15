import { BarChart3, Radar } from "lucide-react";

type AdminTab = "stats" | "radar";

interface AdminSubheaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const TABS = [
  {
    id: "stats" as const,
    label: "Estatísticas",
    icon: BarChart3,
    description: "Análise de dados e métricas",
  },
  {
    id: "radar" as const,
    label: "Map Radar",
    icon: Radar,
    description: "Mapa com radar de tráfego",
  },
];

export default function AdminSubheader({ activeTab, onTabChange }: AdminSubheaderProps) {
  return (
    <div className="border-b border-[#2D6A4F]/40 bg-[#0B1F18]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group flex items-center gap-2.5 
                  border border-transparent px-4 py-2.5
                  rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "border-[#52B788]/40 bg-[#1B4332]/40 text-[#D8F3DC]"
                      : "text-[#74C69D]/60 hover:text-[#74C69D] hover:bg-[#1B4332]/20"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">{tab.label}</div>
                  <div className={`text-xs ${isActive ? "text-[#74C69D]/70" : "text-[#74C69D]/40"}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export type { AdminTab };
