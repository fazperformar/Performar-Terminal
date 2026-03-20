import React, { memo } from "react";
import { Globe, Target, Wallet, Zap } from "lucide-react";

const TabNavigation = memo(function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "portfolio", icon: Globe, label: "1. CARTEIRA & PATRIMÔNIO" },
    { id: "fire", icon: Target, label: "2. PROJEÇÃO FIRE" },
    { id: "cashflow", icon: Wallet, label: "3. FLUXO DE CAIXA" },
    { id: "rebalance", icon: Zap, label: "4. APORTES INTELIGENTES" },
  ];

  return (
    <div className="flex w-full overflow-x-auto custom-scrollbar bg-[#161b22] border border-slate-800 rounded-2xl p-1.5 shadow-inner gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[160px] px-4 py-3.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center whitespace-nowrap border ${
              isActive
                ? "bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg border-blue-500/50"
                : "bg-transparent text-slate-500 border-transparent hover:bg-slate-800/50 hover:text-slate-300"
            }`}
          >
            <Icon
              className={`w-4 h-4 mr-2 ${
                isActive ? "text-blue-200" : "opacity-50"
              }`}
            />{" "}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
});

export default TabNavigation;
