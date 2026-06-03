// ==========================================
// 🎯 ProjectionScenarios.jsx — Cenários + Modos de Saída
// ==========================================
// Local: src/components/ProjectionScenarios.jsx
//
// Componente AUTOSSUFICIENTE. Recebe por props valores que o App já calcula
// (não duplica lógica de estado). Renderiza:
//   1) Matriz de cenários NOMINAIS (aporte x retorno), pinta meta atingida.
//   2) Dois modos de saída: PERPETUAR (vive da renda, principal intacto) e
//      DEPLETAR (gasta tudo em N anos).
//
// Props esperadas:
//   patrimonioInicial : number (USD)  -> use unifiedCapitalUSD
//   aporteMensal      : number        -> monthlyContribution
//   anos              : number        -> years
//   retornoNominalPct : number        -> metrics.nom
//   taxaSaquePct      : number        -> safeWithdrawalRate
//   rendaMensalDesejada custom (opcional) -> annualExpenses/12
//   formatUSD         : (n)=>string   -> reaproveita o formatador do App
// ==========================================

import React, { memo, useMemo, useState } from "react";
import { TrendingUp, Infinity as InfinityIcon, Flame, Target } from "lucide-react";
import {
  matrizCenarios,
  valorFuturo,
  comparaModos,
} from "../utils/projectionEngine";

const ProjectionScenarios = memo(function ProjectionScenarios({
  patrimonioInicial = 0,
  aporteMensal = 1300,
  anos = 15,
  retornoNominalPct = 8,
  taxaSaquePct = 4,
  rendaMensalDesejada = 0,
  formatUSD = (n) => `$${Math.round(n || 0).toLocaleString("en-US")}`,
}) {
  // controles locais da seção de saída
  const [modo, setModo] = useState("perpetuar"); // "perpetuar" | "depletar"
  const [anosDepletar, setAnosDepletar] = useState(40);
  const [retornoSaque, setRetornoSaque] = useState(
    Math.max(4, Math.round(retornoNominalPct - 3)) // saque costuma ser mais conservador
  );

  // patrimônio projetado no fim da acumulação (cenário base)
  const patrimonioNaMeta = useMemo(
    () => valorFuturo(patrimonioInicial, aporteMensal, retornoNominalPct, anos),
    [patrimonioInicial, aporteMensal, retornoNominalPct, anos]
  );

  // meta de patrimônio p/ a renda desejada (regra da taxa de saque)
  const metaPatrimonio = useMemo(
    () =>
      rendaMensalDesejada > 0 && taxaSaquePct > 0
        ? (rendaMensalDesejada * 12) / (taxaSaquePct / 100)
        : 0,
    [rendaMensalDesejada, taxaSaquePct]
  );

  const matriz = useMemo(
    () =>
      matrizCenarios({
        inicial: patrimonioInicial,
        anos,
        aportes: [aporteMensal, aporteMensal + 300, aporteMensal + 700, aporteMensal + 1200],
        taxas: [7, 8, 9, 10],
        metaPatrimonio,
      }),
    [patrimonioInicial, anos, aporteMensal, metaPatrimonio]
  );

  const comp = useMemo(
    () =>
      comparaModos({
        patrimonio: patrimonioNaMeta,
        taxaSaquePct,
        retornoSaquePct: retornoSaque,
        anosDepletar,
        rendaMensalDesejada,
      }),
    [patrimonioNaMeta, taxaSaquePct, retornoSaque, anosDepletar, rendaMensalDesejada]
  );

  return (
    <div className="bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl mt-6">
      <div className="flex items-center mb-5">
        <TrendingUp className="w-5 h-5 text-emerald-400 mr-2" />
        <h4 className="text-sm font-black text-white uppercase tracking-widest">
          Cenários & Estratégia de Saída
        </h4>
        <span className="ml-auto text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-[#0d1117] px-2 py-1 rounded-lg border border-slate-800">
          valores nominais
        </span>
      </div>

      {/* MATRIZ DE CENÁRIOS */}
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        Patrimônio em {anos} anos — aporte × retorno anual
      </p>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                Aporte/mês
              </th>
              {[7, 8, 9, 10].map((t) => (
                <th
                  key={t}
                  className="p-2 text-[10px] font-black text-slate-300 text-center"
                >
                  {t}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matriz.map((linha) => (
              <tr key={linha.aporte} className="border-t border-slate-800">
                <td className="p-2 font-mono font-black text-blue-400 text-xs">
                  {formatUSD(linha.aporte)}
                </td>
                {linha.valores.map((cel) => (
                  <td
                    key={cel.taxa}
                    className={`p-2 text-center font-mono font-bold text-xs ${
                      cel.atingiuMeta
                        ? "bg-emerald-500/15 text-emerald-300 rounded"
                        : "text-slate-400"
                    }`}
                  >
                    {formatUSD(cel.valor)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {metaPatrimonio > 0 && (
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
          <span className="text-emerald-400 font-bold">Verde</span> = atinge a
          meta de {formatUSD(metaPatrimonio)} (necessária p/ sua renda desejada à
          taxa de saque de {taxaSaquePct}%). Subir o aporte costuma mover mais que
          subir o retorno.
        </p>
      )}

      {/* MODOS DE SAÍDA */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Como viver desse dinheiro (a partir de {formatUSD(patrimonioNaMeta)})
        </p>

        <div className="flex bg-[#0d1117] border border-slate-700/50 rounded-xl p-1 mb-4 shadow-inner max-w-md">
          <button
            onClick={() => setModo("perpetuar")}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${
              modo === "perpetuar"
                ? "bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-md"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5 mr-1.5" /> Perpetuar
          </button>
          <button
            onClick={() => setModo("depletar")}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${
              modo === "depletar"
                ? "bg-gradient-to-b from-orange-600 to-orange-800 text-white shadow-md"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Flame className="w-3.5 h-3.5 mr-1.5" /> Gastar Tudo
          </button>
        </div>

        {/* retorno na fase de saque (comum aos dois modos) */}
        <div className="flex items-center gap-2 mb-4 max-w-md">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Retorno na aposentadoria %
          </label>
          <input
            type="number"
            step="0.5"
            value={retornoSaque}
            onChange={(e) => setRetornoSaque(Number(e.target.value))}
            className="w-16 bg-[#0d1117] border border-slate-700 rounded-lg px-2 py-1 text-sm font-black text-blue-400 font-mono outline-none focus:border-blue-500/50"
          />
        </div>

        {modo === "perpetuar" ? (
          <div className="bg-[#0d1117] border border-blue-500/30 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <InfinityIcon className="w-5 h-5 text-blue-400 mr-2" />
              <h5 className="text-xs font-black uppercase tracking-widest text-blue-300">
                Modo Perpetuar — renda sem tocar no principal
              </h5>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Renda mensal (saque {taxaSaquePct}%)
                </p>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {formatUSD(comp.perpetuar.rendaMensal)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Rendimento anual da carteira
                </p>
                <p className="text-2xl font-black text-white font-mono">
                  {formatUSD(comp.perpetuar.rendimentoAnual)}
                </p>
              </div>
            </div>
            <p
              className={`text-xs font-bold mt-4 p-3 rounded-xl border ${
                comp.perpetuar.perpetuoSustentavel
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-200"
              }`}
            >
              {comp.perpetuar.perpetuoSustentavel
                ? `Sustentável: o rendimento cobre o saque e ainda sobra ${formatUSD(
                    comp.perpetuar.sobraReinveste
                  )}/ano para reinvestir. O principal pode passar para gerações.`
                : `Atenção: o saque de ${taxaSaquePct}% é maior que o rendimento de ${retornoSaque}%. O principal vai encolher com o tempo — não é perpétuo de fato neste cenário.`}
            </p>
          </div>
        ) : (
          <div className="bg-[#0d1117] border border-orange-500/30 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <Flame className="w-5 h-5 text-orange-400 mr-2" />
              <h5 className="text-xs font-black uppercase tracking-widest text-orange-300">
                Modo Gastar Tudo — principal vai a zero no prazo
              </h5>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Durar por quantos anos
              </label>
              <input
                type="number"
                value={anosDepletar}
                onChange={(e) => setAnosDepletar(Number(e.target.value))}
                className="w-16 bg-[#161b22] border border-slate-700 rounded-lg px-2 py-1 text-sm font-black text-orange-400 font-mono outline-none focus:border-orange-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Renda mensal possível
                </p>
                <p className="text-2xl font-black text-orange-400 font-mono">
                  {formatUSD(comp.depletar.rendaMensal)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Total sacado em {anosDepletar} anos
                </p>
                <p className="text-2xl font-black text-white font-mono">
                  {formatUSD(comp.depletar.totalSacado)}
                </p>
              </div>
            </div>
            <p className="text-xs font-bold mt-4 p-3 rounded-xl border bg-orange-500/10 border-orange-500/30 text-orange-200">
              Você pode sacar {formatUSD(comp.depletar.rendaMensal)}/mês — bem
              mais que o modo perpetuar — mas o dinheiro acaba em {anosDepletar}{" "}
              anos. Bom se não há intenção de herança.
            </p>
          </div>
        )}

        {rendaMensalDesejada > 0 && (
          <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400">
            <Target className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
            <span>
              Sua renda desejada é {formatUSD(rendaMensalDesejada)}/mês.{" "}
              {modo === "perpetuar"
                ? comp.metaPerpetuarOk
                  ? "O modo perpetuar já cobre isso. ✓"
                  : "O modo perpetuar ainda não cobre — aumente aporte, prazo ou aceite o modo gastar tudo."
                : comp.metaDepletarOk
                ? "O modo gastar tudo cobre isso. ✓"
                : "Nem gastando tudo no prazo a renda cobre — reveja aporte ou prazo."}
            </span>
          </div>
        )}
      </div>

      <p className="text-[9px] text-slate-600 mt-5 leading-relaxed">
        Estimativas nominais (valor de face, sem desconto de inflação). Não são
        promessa de retorno. Retornos passados não garantem retornos futuros.
      </p>
    </div>
  );
});

export default ProjectionScenarios;
