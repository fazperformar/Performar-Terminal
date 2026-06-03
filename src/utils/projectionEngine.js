// ==========================================
// 📊 projectionEngine.js — Motor de Cenários e Modos de Saída
// ==========================================
// Local: src/utils/projectionEngine.js
//
// Funções PURAS (sem React, sem efeitos colaterais). Fáceis de testar.
// Tudo em valores NOMINAIS por padrão; quem chama decide se passa taxa
// nominal ou real. Nada aqui acessa estado global.
// ==========================================

const _safe = (v, fb = 0) =>
  v === null || v === undefined || isNaN(v) || !isFinite(v) ? fb : v;

// Valor futuro de um aporte mensal + capital inicial (juros compostos mensais)
// taxaAnual em % (ex.: 8 = 8%). Retorna o patrimônio no fim do período.
export function valorFuturo(inicial, aporteMensal, taxaAnualPct, anos) {
  const P0 = _safe(inicial);
  const pmt = _safe(aporteMensal);
  const r = Math.pow(1 + _safe(taxaAnualPct) / 100, 1 / 12) - 1;
  const n = _safe(anos) * 12;
  if (n <= 0) return P0;
  if (r === 0) return P0 + pmt * n;
  return P0 * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
}

// MATRIZ DE CENÁRIOS: linhas = aportes, colunas = taxas de retorno.
// Retorna [{ aporte, valores: [{ taxa, valor, atingiuMeta }] }]
export function matrizCenarios({
  inicial,
  anos,
  aportes = [1300, 1600, 2000, 2500],
  taxas = [7, 8, 9, 10],
  metaPatrimonio = 0,
}) {
  return aportes.map((aporte) => ({
    aporte,
    valores: taxas.map((taxa) => {
      const valor = valorFuturo(inicial, aporte, taxa, anos);
      return {
        taxa,
        valor,
        atingiuMeta: metaPatrimonio > 0 && valor >= metaPatrimonio,
      };
    }),
  }));
}

// ==========================================
// MODOS DE SAÍDA (fase de desacumulação)
// ==========================================

// MODO PERPETUAR: saca só uma % ao ano; o principal NUNCA é tocado.
// Retorna a renda sustentável e quanto o patrimônio ainda cresce (se sobra).
// patrimonio: valor no início da aposentadoria
// taxaSaquePct: % do patrimônio sacada por ano (ex.: 4)
// retornoAnualPct: retorno esperado da carteira na fase de saque
export function modoPerpetuar({ patrimonio, taxaSaquePct, retornoAnualPct }) {
  const P = _safe(patrimonio);
  const saqueAnual = P * (_safe(taxaSaquePct) / 100);
  const rendimentoAnual = P * (_safe(retornoAnualPct) / 100);
  // Se o saque <= rendimento, o principal se mantém ou cresce (perpétuo de fato).
  const sobraReinveste = rendimentoAnual - saqueAnual; // + = principal cresce
  return {
    rendaAnual: saqueAnual,
    rendaMensal: saqueAnual / 12,
    rendimentoAnual,
    sobraReinveste,
    perpetuoSustentavel: rendimentoAnual >= saqueAnual,
  };
}

// MODO DEPLETAR: gastar TUDO ao longo de N anos (principal vai a zero).
// Calcula a renda mensal máxima que zera o patrimônio exatamente no prazo.
// (fórmula de anuidade — payout de um valor presente)
// patrimonio: valor no início
// anosDeVida: por quantos anos quer que o dinheiro dure
// retornoAnualPct: retorno durante a fase de saque
export function modoDepletar({ patrimonio, anosDeVida, retornoAnualPct }) {
  const P = _safe(patrimonio);
  const r = Math.pow(1 + _safe(retornoAnualPct) / 100, 1 / 12) - 1;
  const n = _safe(anosDeVida) * 12;
  if (n <= 0) return { rendaMensal: 0, rendaAnual: 0, totalSacado: 0 };
  let rendaMensal;
  if (r === 0) {
    rendaMensal = P / n;
  } else {
    // PMT de uma anuidade que zera P em n meses
    rendaMensal = (P * r) / (1 - Math.pow(1 + r, -n));
  }
  rendaMensal = _safe(rendaMensal);
  return {
    rendaMensal,
    rendaAnual: rendaMensal * 12,
    totalSacado: rendaMensal * n,
    anos: _safe(anosDeVida),
  };
}

// Sanity helper p/ a UI: renda-alvo do usuário vs o que cada modo entrega
export function comparaModos({
  patrimonio,
  taxaSaquePct,
  retornoSaquePct,
  anosDepletar,
  rendaMensalDesejada = 0,
}) {
  const perp = modoPerpetuar({
    patrimonio,
    taxaSaquePct,
    retornoAnualPct: retornoSaquePct,
  });
  const dep = modoDepletar({
    patrimonio,
    anosDeVida: anosDepletar,
    retornoAnualPct: retornoSaquePct,
  });
  return {
    perpetuar: perp,
    depletar: dep,
    metaPerpetuarOk:
      rendaMensalDesejada > 0 ? perp.rendaMensal >= rendaMensalDesejada : null,
    metaDepletarOk:
      rendaMensalDesejada > 0 ? dep.rendaMensal >= rendaMensalDesejada : null,
  };
}

export default {
  valorFuturo,
  matrizCenarios,
  modoPerpetuar,
  modoDepletar,
  comparaModos,
};
