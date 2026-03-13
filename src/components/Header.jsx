import React from "react";
import { Globe, Download, UploadCloud, Compass, Sliders } from "lucide-react";

export default function Header({
  handleExportBackup,
  fileInputRef,
  handleImportBackup,
  isGuidedMode,
  setIsGuidedMode,
}) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#161b22] p-4 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-3 rounded-xl shadow-lg shadow-blue-500/20">
          <Globe className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
            FAZ PERFORMAR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              TERMINAL PRO
            </span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">
            Gestão Patrimonial Nível Institucional
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <div className="flex bg-[#0d1117] border border-slate-700/50 rounded-xl p-1 shadow-inner">
          <button
            onClick={handleExportBackup}
            className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5 text-blue-400" /> Exportar
          </button>
          <div className="w-px bg-slate-800 mx-1"></div>
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center"
          >
            <UploadCloud className="w-4 h-4 mr-1.5 text-amber-400" /> Restaurar
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImportBackup}
          />
        </div>

        <button
          onClick={() => setIsGuidedMode(!isGuidedMode)}
          className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
            isGuidedMode
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
              : "bg-[#0d1117] text-slate-500 border-slate-700/50"
          }`}
        >
          {isGuidedMode ? (
            <Compass className="w-4 h-4 mr-2" />
          ) : (
            <Sliders className="w-4 h-4 mr-2" />
          )}
          {isGuidedMode ? "Guias Ligados" : "Modo PRO"}
        </button>
      </div>
    </div>
  );
}
