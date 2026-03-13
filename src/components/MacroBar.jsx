import React from "react";
import { Activity, RefreshCw } from "lucide-react";

export default function MacroBar({
  exchangeRates,
  isFetchingRates,
  fetchGlobalRates,
  macroData,
  setMacroData,
}) {
  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden shadow-inner">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600"></div>
      <div className="flex items-center pl-2">
        <Activity className="w-5 h-5 text-amber-500 mr-2 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Painel Macro Global
        </span>
      </div>

      <div className="flex-1 w-full flex overflow-x-auto gap-3 custom-scrollbar pb-1">
        {/* CÂMBIO */}
        <div className="min-w-[140px] bg-[#161b22] rounded-xl px-4 py-2 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center">
              Câmbio Comercial{" "}
              <RefreshCw
                className={`w-2 h-2 ml-1 cursor-pointer hover:text-white ${
                  isFetchingRates ? "animate-spin text-emerald-500" : ""
                }`}
                onClick={fetchGlobalRates}
              />
            </p>
            <p className="text-sm font-black text-emerald-400 font-mono mt-0.5 tracking-tight">
              R$ {exchangeRates.USDBRL?.toFixed(4) || "5.0000"}
            </p>
          </div>
        </div>

        {/* SELIC */}
        <div className="min-w-[140px] bg-[#161b22] rounded-xl px-4 py-2 border border-slate-800 flex items-center focus-within:border-blue-500/50 transition-colors">
          <div className="w-full">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
              Taxa Selic %
            </p>
            <div className="flex items-center mt-0.5">
              <input
                type="number"
                step="0.1"
                value={macroData.selic}
                onChange={(e) =>
                  setMacroData({ ...macroData, selic: Number(e.target.value) })
                }
                className="w-full bg-transparent text-sm font-black text-blue-400 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* FED FUNDS */}
        <div className="min-w-[140px] bg-[#161b22] rounded-xl px-4 py-2 border border-slate-800 flex items-center focus-within:border-blue-500/50 transition-colors">
          <div className="w-full">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
              Fed Funds %
            </p>
            <div className="flex items-center mt-0.5">
              <input
                type="number"
                step="0.1"
                value={macroData.fed}
                onChange={(e) =>
                  setMacroData({ ...macroData, fed: Number(e.target.value) })
                }
                className="w-full bg-transparent text-sm font-black text-blue-400 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* FEAR & GREED */}
        <div className="min-w-[160px] bg-[#161b22] rounded-xl px-4 py-2 border border-slate-800 flex items-center focus-within:border-amber-500/50 transition-colors">
          <div className="w-full">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
              Fear & Greed Index
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <input
                type="number"
                min="0"
                max="100"
                value={macroData.fearGreed}
                onChange={(e) =>
                  setMacroData({
                    ...macroData,
                    fearGreed: Number(e.target.value),
                  })
                }
                className={`w-10 bg-transparent text-sm font-black font-mono outline-none ${
                  macroData.fearGreed > 50 ? "text-emerald-400" : "text-red-400"
                }`}
              />
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {macroData.fearGreed >= 75
                  ? "Ext. Greed"
                  : macroData.fearGreed >= 55
                  ? "Greed"
                  : macroData.fearGreed <= 25
                  ? "Ext. Fear"
                  : macroData.fearGreed <= 45
                  ? "Fear"
                  : "Neutral"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
