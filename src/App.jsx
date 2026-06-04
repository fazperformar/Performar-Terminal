import MacroBar from "./components/MacroBar";
import Header from "./components/Header";
import { useCloudState } from "./hooks/useCloudState";
import ProjectionScenarios from "./components/ProjectionScenarios";
import TabNavigation from "./components/TabNavigation";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  ReferenceLine,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Globe,
  DollarSign,
  Sliders,
  Plus,
  Trash2,
  Wallet,
  CalendarDays,
  Save,
  Info,
  Compass,
  BarChart3,
  ArrowRight,
  PieChart as PieChartIcon,
  ListPlus,
  History,
  AlertTriangle,
  Scale,
  ShoppingCart,
  Zap,
  AlertCircle,
  Wand2,
  Edit2,
  Download,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// ==========================================
// 🧠 HOOKS BLINDADOS E OTIMIZADOS
// ==========================================
import useCloudState from "./hooks/useCloudState";

function useCloudState(defaultValue, key) {
  return useCloudState(defaultValue, key);
}
// ==========================================
// 🔧 UTILITÁRIOS GLOBAIS (FORA DO COMPONENTE)
// ==========================================

// Gerador de ID único seguro (evita colisões em iterações rápidas)
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Formatadores criados uma única vez (Intl.NumberFormat é pesado)
const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const formatUSD = (v) => USD_FORMATTER.format(v || 0);
const formatBRL = (v) => BRL_FORMATTER.format(v || 0);

// Escudo universal contra NaN/Infinity/null em qualquer cálculo numérico
const safe = (v, fallback = 0) =>
  v === null || v === undefined || isNaN(v) || !isFinite(v) ? fallback : v;

// Correlação média estimada entre ativos (simplificação de Markowitz)
const ASSET_CORRELATION_ESTIMATE = 0.3;

// ==========================================
// 📈 DADOS BASE E CONFIGURAÇÕES DO ALGORITMO
// ==========================================
const masterAssets = {
  sgov: {
    ticker: "SGOV",
    name: "Caixa Dólar (Renda Fixa)",
    return: 3.5,
    vol: 0.5,
    yield: 3.5,
    beta: 0.0,
    drawdown: -0.5,
    color: "#64748b",
  },
  jaaa: {
    ticker: "JAAA",
    name: "Crédito AAA (Renda Fixa)",
    return: 5.5,
    vol: 4.0,
    yield: 5.0,
    beta: 0.1,
    drawdown: -5,
    color: "#f59e0b",
  },
  schd: {
    ticker: "SCHD",
    name: "Dividendos EUA",
    return: 11.5,
    vol: 15.0,
    yield: 3.5,
    beta: 0.8,
    drawdown: -22,
    color: "#3b82f6",
  },
  cowz: {
    ticker: "COWZ",
    name: "Ações de Muito Caixa",
    return: 13.0,
    vol: 18.0,
    yield: 2.0,
    beta: 0.85,
    drawdown: -20,
    color: "#14b8a6",
  },
  iqlt: {
    ticker: "IQLT",
    name: "Qualidade Internacional",
    return: 10.5,
    vol: 16.0,
    yield: 2.0,
    beta: 0.95,
    drawdown: -24,
    color: "#6366f1",
  },
  vxus: {
    ticker: "VXUS",
    name: "Mundo Ex-EUA",
    return: 8.5,
    vol: 17.0,
    yield: 3.2,
    beta: 1.05,
    drawdown: -28,
    color: "#8b5cf6",
  },
  vt: {
    ticker: "VT",
    name: "Mercado Global",
    return: 9.5,
    vol: 16.0,
    yield: 2.1,
    beta: 1.0,
    drawdown: -25,
    color: "#0ea5e9",
  },
  qqqm: {
    ticker: "QQQM",
    name: "Tecnologia (Nasdaq)",
    return: 18.0,
    vol: 22.0,
    yield: 0.6,
    beta: 1.2,
    drawdown: -33,
    color: "#f43f5e",
  },
  avuv: {
    ticker: "AVUV",
    name: "Pequenas Empresas EUA",
    return: 13.5,
    vol: 21.0,
    yield: 1.5,
    beta: 1.25,
    drawdown: -35,
    color: "#10b981",
  },
  thematic: {
    ticker: "URA",
    name: "Apostas Temáticas (Urânio)",
    return: 15.0,
    vol: 28.0,
    yield: 0.5,
    beta: 1.4,
    drawdown: -40,
    color: "#d946ef",
  },
  rendaFixaBr: {
    ticker: "B5P211/IPCA+",
    name: "Renda Fixa BR (Curta)",
    return: 11.5,
    vol: 3.0,
    yield: 10.5,
    beta: 0.1,
    drawdown: -3,
    color: "#0284c7",
  },
  ibov: {
    ticker: "BOVA11",
    name: "Ações Brasil (Ibovespa)",
    return: 11.0,
    vol: 24.0,
    yield: 7.5,
    beta: 1.0,
    drawdown: -45,
    color: "#059669",
  },
  fiis: {
    ticker: "IFIX",
    name: "Fundos Imobiliários",
    return: 12.0,
    vol: 12.0,
    yield: 11.0,
    beta: 0.3,
    drawdown: -25,
    color: "#ea580c",
  },
};

const modelPortfolios = {
  brasilFeijaoComArroz: {
    label: "Brasil Básico (50/25/25)",
    allocs: { rendaFixaBr: 50, ibov: 25, fiis: 25 },
  },
  boglehead: {
    label: "Básico Global (EUA/Seguro)",
    allocs: { sgov: 40, vxus: 30, cowz: 30 },
  },
  fazPerformar: {
    label: "Faz Performar (Global)",
    allocs: {
      cowz: 20,
      vxus: 10,
      iqlt: 15,
      qqqm: 10,
      avuv: 20,
      jaaa: 10,
      thematic: 15,
    },
  },
  agressivo: {
    label: "Agressivo (Tech/Valor)",
    allocs: { qqqm: 35, avuv: 25, cowz: 15, thematic: 15, vxus: 10 },
  },
  renda: {
    label: "Usufruto (Foco Dividendos)",
    allocs: { jaaa: 30, schd: 25, sgov: 20, cowz: 15, fiis: 10 },
  },
};

const expenseCats = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Impostos",
  "Dívidas",
  "Outros",
];
const incomeCats = [
  "Salário",
  "Renda Extra",
  "Dividendos/Juros",
  "Vendas",
  "Outros",
];
const EXPENSE_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#d946ef",
];

const mesesNomes = [
  { val: "01", nome: "Janeiro" },
  { val: "02", nome: "Fevereiro" },
  { val: "03", nome: "Março" },
  { val: "04", nome: "Abril" },
  { val: "05", nome: "Maio" },
  { val: "06", nome: "Junho" },
  { val: "07", nome: "Julho" },
  { val: "08", nome: "Agosto" },
  { val: "09", nome: "Setembro" },
  { val: "10", nome: "Outubro" },
  { val: "11", nome: "Novembro" },
  { val: "12", nome: "Dezembro" },
];

// Funções Matemáticas Puras (Isoladas para performance)
const calculatePortfolioMetrics = (allocations, totalAllocation, inflation) => {
  if (totalAllocation === 0)
    return { nom: 0, real: 0, vol: 0, dy: 0, beta: 0, drawdown: 0, sharpe: 0 };
  let nom = 0,
    dy = 0,
    weightedVariance = 0,
    crossTermVariance = 0,
    beta = 0,
    drawdown = 0;
  Object.entries(allocations).forEach(([key, weight]) => {
    if (masterAssets[key]) {
      const asset = masterAssets[key];
      const normWeight = safe(weight) / safe(totalAllocation, 1);
      nom += normWeight * safe(asset.return);
      dy += normWeight * safe(asset.yield);
      beta += normWeight * safe(asset.beta);
      drawdown += normWeight * safe(asset.drawdown);
      weightedVariance += Math.pow(normWeight * safe(asset.vol), 2);
      Object.entries(allocations).forEach(([key2, weight2]) => {
        if (key !== key2 && masterAssets[key2]) {
          crossTermVariance +=
            normWeight *
            (safe(weight2) / safe(totalAllocation, 1)) *
            safe(asset.vol) *
            safe(masterAssets[key2].vol) *
            ASSET_CORRELATION_ESTIMATE;
        }
      });
    }
  });
  const vol = safe(Math.sqrt(weightedVariance + crossTermVariance));
  const safeInflation = safe(inflation, 0);
  const real = ((1 + nom / 100) / (1 + safeInflation / 100) - 1) * 100;
  return {
    nom: safe(nom),
    real: safe(real),
    vol: safe(vol),
    dy: safe(dy),
    beta: safe(beta),
    drawdown: safe(drawdown),
    sharpe: vol > 0 ? safe((nom - 4.5) / vol) : 0,
  };
};

const calcExactTimeToTarget = (
  initialCapital,
  target,
  realRate,
  monthlyContribution,
  targetYears
) => {
  const safeInitial = safe(initialCapital);
  const safeTarget = safe(target, 1);
  const safeRealRate = safe(realRate);
  const safePmt = safe(monthlyContribution);
  const safeYears = safe(targetYears, 1);

  const targetMonths = safeYears * 12;
  const monthlyRealRate = Math.pow(1 + safeRealRate / 100, 1 / 12) - 1;
  let requiredPmt = 0;

  if (targetMonths > 0) {
    if (monthlyRealRate > 0) {
      requiredPmt = safe(
        (safeTarget - safeInitial * Math.pow(1 + monthlyRealRate, targetMonths)) /
        ((Math.pow(1 + monthlyRealRate, targetMonths) - 1) / monthlyRealRate)
      );
    } else {
      requiredPmt = safe((safeTarget - safeInitial) / targetMonths);
    }
  }

  requiredPmt = Math.max(0, requiredPmt);
  const pmtDiff = requiredPmt - safePmt;

  if (safeInitial >= safeTarget)
    return {
      reached: true,
      years: 0,
      months: 0,
      totalMonths: 0,
      isLate: false,
      requiredPmt: 0,
      pmtDiff: 0,
    };
  if (safeInitial <= 0 && safePmt <= 0)
    return {
      impossible: true,
      isLate: true,
      reason: "Sem patrimônio e sem aportes é matematicamente impossível.",
      requiredPmt,
      pmtDiff,
    };
  if (monthlyRealRate <= 0 && safePmt <= 0)
    return {
      impossible: true,
      isLate: true,
      reason: "Sem aportes e sem juros reais, o dinheiro não cresce.",
      requiredPmt,
      pmtDiff,
    };

  let months = 0,
    tempBal = safeInitial;
  while (tempBal < safeTarget && months < 1200) {
    months++;
    tempBal = tempBal * (1 + monthlyRealRate) + safePmt;
  }

  const isLate = months > targetMonths;
  let reason = isLate
    ? `Sua meta de ${safeYears} anos vai atrasar. Serão necessários +${Math.floor(
        (months - targetMonths) / 12
      )} anos e ${(months - targetMonths) % 12} meses extras neste ritmo.`
    : "";
  if (months >= 1200)
    reason =
      "Neste ritmo, levaria mais de 100 anos. Aumente seus aportes imediatamente.";

  return {
    reached: false,
    impossible: months >= 1200,
    isLate,
    years: Math.floor(months / 12),
    months: months % 12,
    totalMonths: months,
    reason,
    requiredPmt,
    pmtDiff,
  };
};

const generateMasterProjection = (
  initialCapital,
  monthlyContribution,
  metrics,
  safeWithdrawalRate
) => {
  const safeNom = safe(metrics.nom);
  const safeReal = safe(metrics.real);
  const safeVol = safe(metrics.vol);
  const safeInitCap = safe(initialCapital);
  const safeMonthly = safe(monthlyContribution);
  const mNom = safe(Math.pow(1 + safeNom / 100, 1 / 12) - 1);
  const mReal = safe(Math.pow(1 + safeReal / 100, 1 / 12) - 1);
  const data = [];
  let nBal = safeInitCap,
    rBal = safeInitCap;

  for (let m = 0; m <= 600; m++) {
    if (m > 0) {
      nBal = safe(nBal * (1 + mNom) + safeMonthly);
      rBal = safe(rBal * (1 + mReal) + safeMonthly);
    }
    if (m % 12 === 0 || m === 600) {
      const year = m / 12;
      const disp = safe((safeVol / 100) * Math.sqrt(year || 0.001));
      data.push({
        month: m,
        year,
        nMedian: Math.round(safe(nBal)),
        rMedian: Math.round(safe(rBal)),
        nBull: Math.round(safe(nBal * Math.exp(1.28 * disp))),
        nBear: Math.round(safe(nBal * Math.exp(-1.28 * disp))),
        rBull: Math.round(safe(rBal * Math.exp(1.28 * disp))),
        rBear: Math.round(safe(rBal * Math.exp(-1.28 * disp))),
      });
    }
  }
  return data;
};

// ==========================================
// 💻 COMPONENTE PRINCIPAL MESTRE
// ==========================================
export default function App() {
  const [isStorageBlocked, setIsStorageBlocked] = useState(false);
  const [isDark, setIsDark] = useCloudState(true, "fp_dark_mode");
  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);
  const fileInputRef = useRef(null);

  // Sistema de Toast UI (Sem alerts)
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      4000
    );
  }, []);

  // Aplica o tema (dark/light) no documento inteiro
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem("__test", "1");
      localStorage.removeItem("__test");
    } catch (e) {
      setIsStorageBlocked(true);
    }
  }, []);

  // ESTADO GLOBAL DO TERMINAL
  const [activeTab, setActiveTab] = useCloudState("portfolio", "fp_tab");
  const [isRealView, setIsRealView] = useCloudState(false, "fp_realView");
  const [isGuidedMode, setIsGuidedMode] = useCloudState(true, "fp_guidedMode");

  // Carteira
  const [wealthEUA, setWealthEUA] = useCloudState(62000, "fp_wealthEUA");
  const [wealthBR, setWealthBR] = useCloudState(30000, "fp_wealthBR");
  const [wealthCrypto, setWealthCrypto] = useCloudState(
    4000,
    "fp_wealthCrypto"
  );
  const [emergencyFund, setEmergencyFund] = useCloudState(
    29000,
    "fp_emergencyFund"
  );

  const [exchangeRates, setExchangeRates] = useState({
    BRL: 0.18,
    USDBRL: 5.0,
  });
  const [isFetchingRates, setIsFetchingRates] = useState(false);

  // Macro & Regras
  const [macroData, setMacroData] = useCloudState(
    { selic: 11.25, fed: 4.5, fearGreed: 72 },
    "fp_macro"
  );
  const [monthlyContribution, setMonthlyContribution] = useCloudState(
    1300,
    "fp_monthlyContribution"
  );
  const [years, setYears] = useCloudState(15, "fp_years");
  const [inflation, setInflation] = useCloudState(4.0, "fp_inflation");

  // Alocações com Tratamento Fino
  const [allocationsRaw, setAllocationsRaw] = useCloudState(
    modelPortfolios.brasilFeijaoComArroz.allocs,
    "fp_allocations"
  );
  const allocations = useMemo(() => {
    const cleanAllocs = { ...allocationsRaw };
    Object.keys(masterAssets).forEach((k) => {
      if (isNaN(cleanAllocs[k])) cleanAllocs[k] = 0;
    });
    return cleanAllocs;
  }, [allocationsRaw]);
  const [activePreset, setActivePreset] = useCloudState(
    "brasilFeijaoComArroz",
    "fp_activePreset"
  );

  // FIRE
  const [annualExpenses, setAnnualExpenses] = useCloudState(
    42000,
    "fp_annualExpenses"
  );
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useCloudState(
    4.0,
    "fp_swr"
  );
  const [estimatedTaxRate, setEstimatedTaxRate] = useCloudState(
    15.0,
    "fp_taxRate"
  );

  // Fluxo de Caixa (Lançamentos e Histórico)
  const [cfTab, setCfTab] = useCloudState("lancamentos", "fp_cftab");
  const [incomes, setIncomes] = useCloudState(
    [{ id: 1, desc: "Salário Principal", amount: 4500, category: "Salário" }],
    "fp_incomes"
  );
  const [expenses, setExpenses] = useCloudState(
    [{ id: 1, desc: "Aluguel/Condomínio", amount: 2100, category: "Moradia" }],
    "fp_expenses"
  );
  const [debts, setDebts] = useCloudState(
    [{ id: 1, desc: "Financiamento Carro", amount: 400, category: "Dívidas" }],
    "fp_debts"
  );

  const getCurrentYearMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const [currentMonth, setCurrentMonth] = useCloudState(
    getCurrentYearMonth(),
    "fp_cf_month"
  );
  const [savedMonths, setSavedMonths] = useCloudState([], "fp_saved_months");

  // Controle Visual de Exclusão (Para evitar confirm nativo)
  const [deletingId, setDeletingId] = useState(null);

  // Rebalanceamento Automático
  const [currentBalances, setCurrentBalances] = useCloudState(
    {},
    "fp_current_bals"
  );
  const [newRebalanceAporte, setNewRebalanceAporte] = useCloudState(
    1300,
    "fp_new_aporte"
  );

  // Funções Auxiliares UI
  const [curYearStr, curMonthStr] = currentMonth.split("-");
  const handleMonthChange = (e) =>
    setCurrentMonth(`${curYearStr}-${e.target.value}`);
  const handleYearChange = (e) =>
    setCurrentMonth(`${e.target.value}-${curMonthStr}`);
  const stepMonth = (dir) => {
    let y = parseInt(curYearStr),
      m = parseInt(curMonthStr);
    if (dir === "next") {
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    } else {
      m--;
      if (m < 1) {
        m = 12;
        y--;
      }
    }
    setCurrentMonth(`${y}-${String(m).padStart(2, "0")}`);
  };

  // Busca API Câmbio Blindada (useCallback evita recriação desnecessária)
  const fetchGlobalRates = useCallback(async () => {
    setIsFetchingRates(true);
    try {
      const res = await fetch(
        "https://economia.awesomeapi.com.br/last/BRL-USD,USD-BRL"
      );
      if (!res.ok) throw new Error("API Indisponível");
      const data = await res.json();
      if (data?.USDBRL)
        setExchangeRates({
          USDBRL: Number(data.USDBRL.bid),
          BRL: Number(data.BRLUSD.bid),
        });
    } catch (error) {
      showToast(
        "Não foi possível atualizar o câmbio. Usando última cotação.",
        "warning"
      );
    } finally {
      setIsFetchingRates(false);
    }
  }, [showToast]);
  useEffect(() => {
    fetchGlobalRates();
  }, [fetchGlobalRates]);

  // Cálculos Base Memorizados (Performance Extrema)
  const totalAllocation = useMemo(
    () => Object.values(allocations).reduce((a, v) => a + Number(v), 0),
    [allocations]
  );
  const unifiedCapitalUSD = useMemo(
    () =>
      wealthEUA +
      wealthBR * (exchangeRates.BRL || 0.2) +
      wealthCrypto +
      emergencyFund,
    [wealthEUA, wealthBR, wealthCrypto, emergencyFund, exchangeRates]
  );
  const metrics = useMemo(
    () => calculatePortfolioMetrics(allocations, totalAllocation, inflation),
    [allocations, totalAllocation, inflation]
  );
  const fireTargetValue = useMemo(
    () =>
      annualExpenses /
      (1 - estimatedTaxRate / 100) /
      Math.max(0.001, safeWithdrawalRate / 100),
    [annualExpenses, estimatedTaxRate, safeWithdrawalRate]
  );
  const timeToFire = useMemo(
    () =>
      calcExactTimeToTarget(
        unifiedCapitalUSD,
        fireTargetValue,
        metrics.real,
        monthlyContribution,
        years
      ),
    [
      unifiedCapitalUSD,
      fireTargetValue,
      metrics.real,
      monthlyContribution,
      years,
    ]
  );
  const displayData = useMemo(
    () =>
      generateMasterProjection(
        unifiedCapitalUSD,
        monthlyContribution,
        metrics,
        safeWithdrawalRate
      ).filter((d) => d.year <= years),
    [unifiedCapitalUSD, monthlyContribution, metrics, safeWithdrawalRate, years]
  );

  const projectedFinalValueNominal = displayData.length
    ? displayData[displayData.length - 1].nMedian
    : 0;
  const projectedFinalValueReal = displayData.length
    ? displayData[displayData.length - 1].rMedian
    : 0;

  // Lógica Cashflow Otimizada (useMemo evita recálculo em cada re-render)
  const totalIncome = useMemo(
    () => incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [incomes]
  );
  const totalExpense = useMemo(
    () => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [expenses]
  );
  const totalDebt = useMemo(
    () => debts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [debts]
  );
  const netCashflow = useMemo(
    () => totalIncome - (totalExpense + totalDebt),
    [totalIncome, totalExpense, totalDebt]
  );
  const savingsRate = useMemo(
    () => (totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0),
    [totalIncome, netCashflow]
  );

  const handleNormalize = () => {
    if (totalAllocation === 0 || totalAllocation === 100) return;
    const factor = 100 / totalAllocation;
    const newAllocs = {};
    Object.keys(allocations).forEach(
      (k) => (newAllocs[k] = Number((allocations[k] * factor).toFixed(2)))
    );
    setAllocationsRaw(newAllocs);
  };

  const handleSetPreset = (key, port) => {
    const newAllocs = { ...allocations };
    Object.keys(newAllocs).forEach((k) => (newAllocs[k] = 0));
    Object.entries(port.allocs).forEach(([k, v]) => {
      if (newAllocs[k] !== undefined) newAllocs[k] = v;
    });
    setAllocationsRaw(newAllocs);
    setActivePreset(key);
  };

  // ⚡ FUNÇÃO MILIONÁRIA: CLONAR MÊS ANTERIOR
  const handleCloneLastMonth = () => {
    if (savedMonths.length === 0) {
      showToast("Você ainda não tem meses salvos para clonar.", "warning");
      return;
    }
    // Pega o último mês salvo chronologicamente
    const sorted = [...savedMonths].sort((a, b) =>
      a.monthId.localeCompare(b.monthId)
    );
    const lastMonth = sorted[sorted.length - 1];

    setIncomes(
      lastMonth.incomes.map((i) => ({ ...i, id: genId() }))
    );
    setExpenses(
      lastMonth.expenses.map((i) => ({ ...i, id: genId() }))
    );
    setDebts(
      lastMonth.debts.map((i) => ({ ...i, id: genId() }))
    );

    showToast(`Copiado com sucesso de ${lastMonth.monthName}!`);
  };

  const handleSaveMonth = () => {
    const [y, m] = currentMonth.split("-");
    const mName = mesesNomes.find((mn) => mn.val === m)?.nome || m;
    const monthFormatted = `${mName} de ${y}`;

    const newRecord = {
      id: new Date().getTime(),
      monthId: currentMonth,
      monthName: monthFormatted,
      incomes: JSON.parse(JSON.stringify(incomes)),
      expenses: JSON.parse(JSON.stringify(expenses)),
      debts: JSON.parse(JSON.stringify(debts)),
      totalIncome,
      totalExpense,
      totalDebt,
      netCashflow,
      savingsRate,
      timestamp: new Date().toISOString(),
    };

    setSavedMonths((prev) => {
      const idx = prev.findIndex((item) => item.monthId === currentMonth);
      const copy = [...prev];
      if (idx >= 0) copy[idx] = newRecord;
      else copy.push(newRecord);
      copy.sort((a, b) => a.monthId.localeCompare(b.monthId));
      return copy.slice(-36); // Guarda até 3 anos
    });

    showToast("Mês salvo com sucesso no Extrato!", "success");
    stepMonth("next");
  };

  // Backups Otimizados
  const handleExportBackup = () => {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("fp_")) data[key] = localStorage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Terminal_Performar_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Backup exportado com sucesso!", "success");
    } catch (e) {
      showToast("Erro ao exportar backup.", "error");
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        Object.keys(imported).forEach((k) => {
          if (k.startsWith("fp_")) localStorage.setItem(k, imported[k]);
        });
        showToast("Backup restaurado! Recarregando Terminal...", "success");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast("Arquivo de backup inválido.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Engine de Rebalanceamento
  const rebalancePlan = useMemo(() => {
    const activeAssets = Object.keys(masterAssets).filter(
      (k) =>
        allocations[k] > 0 || (currentBalances[k] && currentBalances[k] > 0)
    );
    const totalCurrent = activeAssets.reduce(
      (acc, k) => acc + (Number(currentBalances[k]) || 0),
      0
    );
    const targetTotal = totalCurrent + newRebalanceAporte;

    let plan = [];
    let positiveDiffsSum = 0;

    activeAssets.forEach((key) => {
      const asset = masterAssets[key];
      const targetPct = (allocations[key] || 0) / 100;
      const targetVal = targetTotal * targetPct;
      const currentVal = Number(currentBalances[key]) || 0;
      const diff = targetVal - currentVal;

      if (diff > 0) positiveDiffsSum += diff;

      let trend = {
        label: "Neutro",
        icon: Activity,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      };
      if (asset.beta < 0.5)
        trend = {
          label: "Defensivo",
          icon: ShieldCheck,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        };
      else if (macroData.fearGreed > 55 && asset.beta >= 1.0)
        trend = {
          label: "Bullish",
          icon: TrendingUp,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      else if (macroData.fearGreed < 45 && asset.beta >= 1.0)
        trend = {
          label: "Bearish",
          icon: TrendingDown,
          color: "text-red-500",
          bg: "bg-red-500/10",
        };

      plan.push({ key, asset, targetPct, targetVal, currentVal, diff, trend });
    });

    return plan
      .map((item) => ({
        ...item,
        suggestedBuy:
          item.diff > 0 && positiveDiffsSum > 0
            ? newRebalanceAporte * (item.diff / positiveDiffsSum)
            : 0,
      }))
      .sort((a, b) => b.suggestedBuy - a.suggestedBuy);
  }, [allocations, currentBalances, newRebalanceAporte, macroData.fearGreed]);

  const expensesByCategory = useMemo(() => {
    const map = {};
    [...expenses, ...debts].forEach((item) => {
      const cat = item.category || "Outros";
      map[cat] = (map[cat] || 0) + (Number(item.amount) || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses, debts]);

  return (
    <div className="min-h-screen bg-[#0d1117] p-2 sm:p-4 md:p-6 font-sans text-slate-200 text-left overflow-x-hidden flex flex-col selection:bg-blue-500/30">

      {/* TOAST NOTIFICATION SYSTEM */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-5 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-50"
              : toast.type === "error"
              ? "bg-red-900/90 border-red-500/50 text-red-50"
              : "bg-amber-900/90 border-amber-500/50 text-amber-50"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400" />
          )}
          {toast.type === "error" && (
            <XCircle className="w-5 h-5 mr-3 text-red-400" />
          )}
          {toast.type === "warning" && (
            <AlertTriangle className="w-5 h-5 mr-3 text-amber-400" />
          )}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {isStorageBlocked && (
        <div className="bg-red-900/80 text-red-100 text-[10px] font-bold p-2 text-center rounded-xl mb-4 flex justify-center items-center">
          <AlertCircle className="w-4 h-4 mr-2" /> O navegador bloqueia o
          salvamento local. Dados temporários nesta sessão.
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-5 flex-1 w-full">
        {/* HEADER INSTITUCIONAL */}
        <Header
          handleExportBackup={handleExportBackup}
          fileInputRef={fileInputRef}
          handleImportBackup={handleImportBackup}
          isGuidedMode={isGuidedMode}
          setIsGuidedMode={setIsGuidedMode}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        {/* NAVEGAÇÃO ABAS MASTER */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <MacroBar
          exchangeRates={exchangeRates}
          isFetchingRates={isFetchingRates}
          fetchGlobalRates={fetchGlobalRates}
          macroData={macroData}
          setMacroData={setMacroData}
        />

        {/* CONTEÚDO DINÂMICO DAS ABAS */}
        <div className="bg-[#0d1117] rounded-[2rem] min-h-[500px]">
          {/* =======================================================
              ABA 1: CARTEIRA
          ======================================================= */}
          {activeTab === "portfolio" && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isGuidedMode && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
                    <strong>Passo 1:</strong> Preencha seu Patrimônio Global
                    (ele será unificado em Dólar para métricas fortes). Depois,
                    preencha as "Regras do Plano" e distribua sua alocação
                    estratégica. Normalize para bater 100%.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUNA ESQUERDA: PATRIMÔNIO & REGRAS */}
                <div className="lg:col-span-4 space-y-6 flex flex-col">
                  {/* CARD PATRIMÔNIO */}
                  <div className="bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center border-b border-slate-800/80 pb-3 mb-5 relative z-10">
                      <Globe className="w-4 h-4 mr-2 text-blue-400" />
                      <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Patrimônio Investido
                      </h3>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="bg-[#0d1117] p-3 rounded-xl border border-slate-800 shadow-inner group focus-within:border-emerald-500/50 transition-all">
                        <label className="text-[9px] font-black text-slate-500 uppercase flex items-center tracking-widest mb-1.5">
                          <DollarSign className="w-3 h-3 mr-1 text-emerald-500" />{" "}
                          EUA / Global (USD)
                        </label>
                        <div className="flex items-center">
                          <span className="text-slate-600 font-mono mr-2 text-lg">
                            $
                          </span>
                          <input
                            type="number"
                            value={wealthEUA || ""}
                            onChange={(e) =>
                              setWealthEUA(Number(e.target.value))
                            }
                            className="w-full bg-transparent text-xl font-black text-white font-mono outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="bg-[#0d1117] p-3 rounded-xl border border-slate-800 shadow-inner group focus-within:border-amber-500/50 transition-all">
                        <label className="text-[9px] font-black text-slate-500 uppercase flex items-center tracking-widest mb-1.5">
                          <Activity className="w-3 h-3 mr-1 text-amber-500" />{" "}
                          Brasil Local (BRL)
                        </label>
                        <div className="flex items-center">
                          <span className="text-slate-600 font-mono mr-2 text-lg">
                            R$
                          </span>
                          <input
                            type="number"
                            value={wealthBR || ""}
                            onChange={(e) =>
                              setWealthBR(Number(e.target.value))
                            }
                            className="w-full bg-transparent text-xl font-black text-white font-mono outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#0d1117] p-3 rounded-xl border border-slate-800 shadow-inner focus-within:border-purple-500/50 transition-all">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                            Cripto (USD)
                          </label>
                          <input
                            type="number"
                            value={wealthCrypto || ""}
                            onChange={(e) =>
                              setWealthCrypto(Number(e.target.value))
                            }
                            className="w-full bg-transparent text-sm font-black text-white font-mono outline-none"
                          />
                        </div>
                        <div className="bg-[#0d1117] p-3 rounded-xl border border-slate-800 shadow-inner focus-within:border-slate-400/50 transition-all">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                            Caixa (USD)
                          </label>
                          <input
                            type="number"
                            value={emergencyFund || ""}
                            onChange={(e) =>
                              setEmergencyFund(Number(e.target.value))
                            }
                            className="w-full bg-transparent text-sm font-black text-white font-mono outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-800 text-center bg-gradient-to-b from-transparent to-black/20 -mx-6 -mb-6 pb-6">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                        TOTAL CONSOLIDADO (USD)
                      </p>
                      <div className="text-4xl font-black text-emerald-400 drop-shadow-lg tracking-tighter">
                        {formatUSD(unifiedCapitalUSD)}
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 mt-1 bg-slate-900/50 inline-block px-3 py-1 rounded-full border border-slate-800/50">
                        ≅{" "}
                        {formatBRL(
                          unifiedCapitalUSD * (exchangeRates.USDBRL || 5)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* CARD REGRAS */}
                  <div className="bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl flex-1 flex flex-col">
                    <div className="flex items-center border-b border-slate-800/80 pb-3 mb-5">
                      <Target className="w-4 h-4 mr-2 text-amber-500" />
                      <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Regras de Acumulação
                      </h3>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">
                          Aporte Mensal Constante
                        </label>
                        <div className="flex items-center bg-[#0d1117] border border-slate-700 px-4 py-3 rounded-xl shadow-inner focus-within:border-amber-500/50 transition-colors">
                          <span className="text-slate-500 font-mono mr-2 text-lg">
                            $
                          </span>
                          <input
                            type="number"
                            value={monthlyContribution || ""}
                            onChange={(e) =>
                              setMonthlyContribution(Number(e.target.value))
                            }
                            className="w-full bg-transparent text-white font-mono text-xl font-black outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase block tracking-widest text-center">
                            Tempo (Anos)
                          </label>
                          <input
                            type="number"
                            value={years || ""}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full bg-[#0d1117] border border-slate-700 p-3 rounded-xl text-white font-mono text-xl font-black outline-none text-center shadow-inner focus-within:border-blue-500/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase block tracking-widest text-center">
                            Inflação Média %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={inflation || ""}
                            key={inflation}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (!isNaN(v) && v !== inflation) setInflation(v);
                            }}
                            className="w-full bg-[#0d1117] border border-slate-700 p-3 rounded-xl text-white font-mono text-xl font-black outline-none text-center shadow-inner focus-within:border-red-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUNA DIREITA: ALOCAÇÃO TÁTICA */}
                <div className="lg:col-span-8 bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl flex flex-col">
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-800/80 pb-4 mb-5 gap-4">
                    <div className="flex items-center">
                      <Sliders className="w-4 h-4 mr-2 text-emerald-500" />
                      <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Alocação Estratégica (%)
                      </h3>
                    </div>

                    {totalAllocation !== 100 ? (
                      <button
                        onClick={handleNormalize}
                        className="flex items-center text-xs font-black px-4 py-2 rounded-xl shadow-lg text-amber-900 bg-amber-500 hover:bg-amber-400 transition-all animate-pulse shadow-amber-500/20"
                      >
                        <Wand2 className="w-4 h-4 mr-1.5" /> Normalizar (
                        {totalAllocation}%) para 100%
                      </button>
                    ) : (
                      <span className="flex items-center text-xs font-black px-4 py-2 rounded-xl shadow-inner text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> 100%
                        Ajustado
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(modelPortfolios).map(([key, port]) => (
                      <button
                        key={key}
                        onClick={() => handleSetPreset(key, port)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                          activePreset === key
                            ? "bg-blue-600 text-white shadow-blue-500/30"
                            : "bg-[#0d1117] text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200"
                        }`}
                      >
                        {port.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(masterAssets).map(([key, asset]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border transition-all ${
                          allocations[key] > 0
                            ? "bg-[#0d1117] border-slate-700 shadow-sm"
                            : "bg-[#0d1117]/50 border-slate-800/50 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                          <div className="flex items-center">
                            <span
                              className="w-2.5 h-2.5 rounded-full mr-2 shadow-inner"
                              style={{ backgroundColor: asset.color }}
                            ></span>
                            <span className="text-slate-200">
                              {asset.ticker}
                            </span>
                          </div>
                          <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700 min-w-[45px] text-center">
                            {allocations[key] || 0}%
                          </span>
                        </div>
                        <input
                          type="range"
                          value={allocations[key] || 0}
                          onChange={(e) => {
                            setAllocationsRaw((prev) => ({
                              ...prev,
                              [key]: Number(e.target.value),
                            }));
                            setActivePreset("custom");
                          }}
                          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                          style={{ accentColor: asset.color }}
                        />
                        <p className="text-[8px] text-slate-500 truncate mt-1.5 font-bold">
                          {asset.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto bg-[#0d1117] p-5 rounded-2xl border border-slate-800 shadow-inner">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center border-b border-slate-800/50 pb-2">
                      Métricas Avançadas da Alocação Atual
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center divide-x divide-slate-800/50">
                      <div className="px-2 flex flex-col justify-center">
                        <p
                          className="text-[9px] text-emerald-500 font-black uppercase tracking-widest"
                          title="Retorno Anualizado Esperado"
                        >
                          CAGR Nom.
                        </p>
                        <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
                          {metrics.nom.toFixed(1)}%
                        </p>
                      </div>
                      <div className="px-2 flex flex-col justify-center">
                        <p
                          className="text-[9px] text-emerald-600 font-black uppercase tracking-widest"
                          title="Descontada a inflação"
                        >
                          CAGR Real
                        </p>
                        <p className="text-xl font-black text-emerald-500 mt-1 font-mono">
                          {metrics.real.toFixed(1)}%
                        </p>
                      </div>
                      <div className="px-2 flex flex-col justify-center bg-blue-500/5 rounded-xl border border-blue-500/10 py-2 -my-2">
                        <p
                          className="text-[9px] text-blue-400 font-black uppercase tracking-widest"
                          title="Yield de Dividendos Projetado"
                        >
                          Yield (DY)
                        </p>
                        <p className="text-xl font-black text-blue-400 mt-1 font-mono">
                          {metrics.dy.toFixed(2)}%
                        </p>
                      </div>
                      <div className="px-2 flex flex-col justify-center">
                        <p
                          className="text-[9px] text-amber-500 font-black uppercase tracking-widest"
                          title="Volatilidade vs Mercado Global"
                        >
                          Risco (Beta)
                        </p>
                        <p className="text-xl font-black text-amber-500 mt-1 font-mono">
                          {metrics.beta.toFixed(2)}
                        </p>
                      </div>
                      <div className="px-2 flex flex-col justify-center">
                        <p
                          className="text-[9px] text-red-400 font-black uppercase tracking-widest"
                          title="Pior queda histórica esperada"
                        >
                          Queda Máx
                        </p>
                        <p className="text-xl font-black text-red-400 mt-1 font-mono">
                          {metrics.drawdown.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("fire");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all flex items-center justify-center border border-white/10 group"
                  >
                    Projetar Aposentadoria (FIRE){" "}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              ABA 2: FIRE
          ======================================================= */}
          {activeTab === "fire" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-[#161b22] border border-slate-800 p-6 sm:p-8 rounded-[1.5rem] shadow-2xl flex flex-col text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase italic flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-emerald-500" />{" "}
                      Projeção de Patrimônio
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Crescimento Composto Baseado na Alocação
                    </p>
                  </div>

                  <div className="flex bg-[#0d1117] p-1.5 rounded-xl border border-slate-700 shadow-inner">
                    <button
                      onClick={() => setIsRealView(false)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all ${
                        !isRealView
                          ? "bg-amber-500 text-amber-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      VALOR NOMINAL
                    </button>
                    <button
                      onClick={() => setIsRealView(true)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all ${
                        isRealView
                          ? "bg-emerald-500 text-emerald-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      PODER DE COMPRA (REAL)
                    </button>
                  </div>
                </div>

                {/* GRÁFICO */}
                <div className="w-full h-[380px] bg-[#0d1117]/60 rounded-2xl px-2 pt-4 pb-2 border border-slate-800/50">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={displayData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isRealView ? "#10b981" : "#f59e0b"} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={isRealView ? "#10b981" : "#f59e0b"} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#21262d" opacity={0.8} />
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: "bold" }}
                        dy={10}
                        tickFormatter={(v) => `${v}a`}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: "bold" }}
                        tickFormatter={(v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}k`}
                        dx={-4}
                        width={64}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#161b22",
                          border: "1px solid #30363d",
                          borderRadius: "12px",
                          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.7)",
                          color: "#fff",
                          padding: "12px 16px",
                        }}
                        itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: "12px" }}
                        formatter={(value, name) => [formatUSD(value), name]}
                        labelFormatter={(label) => `Ano ${label}`}
                        labelStyle={{ color: "#64748b", fontWeight: "black", fontSize: "11px", paddingBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                      />
                      <Area
                        type="monotone"
                        dataKey={isRealView ? "rMedian" : "nMedian"}
                        stroke={isRealView ? "#10b981" : "#f59e0b"}
                        strokeWidth={3}
                        fill="url(#mainGrad)"
                        name="Média Esperada"
                      />
                      <Line
                        type="monotone"
                        dataKey={isRealView ? "rBear" : "nBear"}
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Pessimista"
                        opacity={0.7}
                      />
                      <Line
                        type="monotone"
                        dataKey={isRealView ? "rBull" : "nBull"}
                        stroke="#34d399"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Otimista"
                        opacity={0.7}
                      />
                      {/* 🎯 LINHA DE REFERÊNCIA — NÚMERO MÁGICO FIRE */}
                      <ReferenceLine
                        y={fireTargetValue}
                        stroke="#818cf8"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={(props) => {
                          const { viewBox } = props;
                          const x = viewBox.x + viewBox.width - 8;
                          const y = viewBox.y;
                          return (
                            <g>
                              <rect
                                x={x - 110}
                                y={y - 22}
                                width={118}
                                height={20}
                                rx={6}
                                fill="#1e1b4b"
                                stroke="#818cf8"
                                strokeWidth={1}
                                opacity={0.95}
                              />
                              <text
                                x={x - 52}
                                y={y - 8}
                                fill="#a5b4fc"
                                fontSize={10}
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                🎯 FIRE {formatUSD(fireTargetValue)}
                              </text>
                            </g>
                          );
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* RESULTADO PROJETADO — CARD CLEAN E DESTACADO */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {/* Pessimista */}
                  <div className="bg-[#0d1117] rounded-2xl border border-red-500/20 p-4 text-center flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 opacity-70"></span>
                      <p className="text-[9px] font-black text-red-400/80 uppercase tracking-[0.2em]">Pessimista</p>
                    </div>
                    <p className="text-lg sm:text-xl font-black text-red-300 font-mono tracking-tighter leading-none">
                      {formatUSD(isRealView ? displayData[displayData.length - 1]?.rBear : displayData[displayData.length - 1]?.nBear)}
                    </p>
                  </div>

                  {/* Média — destaque central */}
                  <div className={`rounded-2xl border p-4 text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden ${isRealView ? "bg-emerald-900/20 border-emerald-500/40 shadow-emerald-500/10" : "bg-amber-900/20 border-amber-500/40 shadow-amber-500/10"}`}>
                    <div className={`absolute inset-0 opacity-5 ${isRealView ? "bg-emerald-400" : "bg-amber-400"}`}></div>
                    <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                      <span className={`w-2.5 h-2.5 rounded-full ${isRealView ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isRealView ? "text-emerald-400" : "text-amber-400"}`}>
                        {isRealView ? "Real (Poder de Compra)" : "Nominal"}
                      </p>
                    </div>
                    <p className={`text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10`}>
                      Projetado em {years} anos
                    </p>
                    <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter leading-none relative z-10 ${isRealView ? "text-emerald-300" : "text-amber-300"}`}>
                      {formatUSD(isRealView ? projectedFinalValueReal : projectedFinalValueNominal)}
                    </p>
                  </div>

                  {/* Otimista */}
                  <div className="bg-[#0d1117] rounded-2xl border border-emerald-500/20 p-4 text-center flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-70"></span>
                      <p className="text-[9px] font-black text-emerald-400/80 uppercase tracking-[0.2em]">Otimista</p>
                    </div>
                    <p className="text-lg sm:text-xl font-black text-emerald-300 font-mono tracking-tighter leading-none">
                      {formatUSD(isRealView ? displayData[displayData.length - 1]?.rBull : displayData[displayData.length - 1]?.nBull)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl flex flex-col">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center mb-5 border-b border-slate-800/80 pb-3">
                    <Wallet className="w-4 h-4 mr-2 text-amber-500" /> Custo de
                    Vida na Aposentadoria
                  </h3>

                  <div className="flex-1 space-y-5">
                    <div className="bg-[#0d1117] p-5 rounded-xl border border-slate-700 shadow-inner group">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest text-center">
                        Salário Limpo Desejado (Mês USD)
                      </label>
                      <div className="flex flex-col space-y-4">
                        <div className="text-center text-4xl font-black text-white font-mono drop-shadow-md tracking-tighter">
                          {formatUSD(annualExpenses / 12)}
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="25000"
                          step="100"
                          value={annualExpenses / 12}
                          onChange={(e) =>
                            setAnnualExpenses(Number(e.target.value) * 12)
                          }
                          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:bg-slate-700 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0d1117] p-4 rounded-xl border border-slate-700 text-center focus-within:border-blue-500/50 transition-colors shadow-inner">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                          Taxa de Saque (%)
                        </p>
                        <input
                          type="number"
                          step="0.1"
                          value={safeWithdrawalRate || ""}
                          onChange={(e) =>
                            setSafeWithdrawalRate(Number(e.target.value))
                          }
                          className="w-full bg-transparent text-xl font-black text-white font-mono outline-none text-center"
                        />
                      </div>
                      <div className="bg-[#0d1117] p-4 rounded-xl border border-slate-700 text-center focus-within:border-red-500/50 transition-colors shadow-inner">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                          Impostos (%)
                        </p>
                        <input
                          type="number"
                          step="0.1"
                          value={estimatedTaxRate || ""}
                          onChange={(e) =>
                            setEstimatedTaxRate(Number(e.target.value))
                          }
                          className="w-full bg-transparent text-xl font-black text-white font-mono outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`lg:col-span-8 rounded-[1.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center gap-6 text-slate-900 border ${
                    timeToFire.impossible || timeToFire.isLate
                      ? "bg-red-900 border-red-800"
                      : "bg-emerald-900 border-emerald-800"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-90 z-0 ${
                      timeToFire.impossible || timeToFire.isLate
                        ? "from-red-600 to-red-900"
                        : "from-emerald-500 to-emerald-800"
                    }`}
                  ></div>
                  <Target className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5 z-0 pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2 text-white">
                        NÚMERO MÁGICO (O MONTANTE)
                      </h4>
                      <div className="text-5xl sm:text-7xl font-black tracking-tighter drop-shadow-xl text-white">
                        {formatUSD(fireTargetValue)}
                      </div>
                      <div className="mt-3 bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl inline-block text-white/90 font-bold text-xs uppercase tracking-widest shadow-inner">
                        Garante {formatUSD(annualExpenses / 12)} Limpos / Mês
                      </div>
                    </div>

                    <div className="bg-[#0d1117]/60 backdrop-blur-md p-6 rounded-2xl w-full md:w-auto text-left md:text-right shadow-2xl border border-white/10">
                      {timeToFire.reached ? (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">
                            STATUS
                          </p>
                          <div className="text-3xl font-black text-white drop-shadow-sm">
                            VOCÊ É LIVRE 🎉
                          </div>
                        </>
                      ) : timeToFire.impossible ? (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-widest text-red-300 mb-1">
                            TEMPO ESTIMADO
                          </p>
                          <div className="text-2xl font-black text-white drop-shadow-sm">
                            {">"} 1 Século
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">
                            TEMPO RESTANTE
                          </p>
                          <div className="text-4xl font-black text-white drop-shadow-md tracking-tighter">
                            {timeToFire.years > 0
                              ? `${timeToFire.years}A `
                              : ""}
                            {timeToFire.months > 0
                              ? `${timeToFire.months}M`
                              : ""}
                          </div>
                          <p className="text-[10px] font-bold text-white/80 mt-2 uppercase bg-black/40 px-3 py-1.5 rounded-lg inline-block">
                            📅{" "}
                            {(() => {
                              const d = new Date();
                              d.setMonth(d.getMonth() + timeToFire.totalMonths);
                              return d.toLocaleString("pt-BR", {
                                month: "short",
                                year: "numeric",
                              });
                            })()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {(timeToFire.impossible || timeToFire.isLate) &&
                    !timeToFire.reached && (
                      <div className="relative z-10 bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-red-500/50 text-white shadow-inner">
                        <h5 className="font-black flex items-center mb-2 text-red-300 text-sm uppercase tracking-widest">
                          <AlertTriangle className="w-5 h-5 mr-2" />{" "}
                          {timeToFire.impossible
                            ? "INVIÁVEL MATEMATICAMENTE"
                            : "ALERTA DE ATRASO"}
                        </h5>
                        <p className="text-sm font-bold text-red-100/90 leading-relaxed mb-4">
                          {timeToFire.reason}
                        </p>

                        <div className="bg-[#0d1117]/80 p-4 rounded-xl border border-red-500/30">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1.5">
                            Correção de Curso
                          </p>
                          <p className="text-sm font-bold text-slate-300">
                            Para bater a meta exatamente em{" "}
                            <span className="text-white">{years} anos</span>,
                            seu aporte mensal base precisa subir para{" "}
                            <span className="text-emerald-400 font-black font-mono bg-black/50 px-2 py-1 rounded">
                              {formatUSD(timeToFire.requiredPmt)}
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="relative z-10 border-t border-white/20 pt-4 flex flex-col sm:flex-row items-center justify-between text-white/80 gap-2">
                    <div className="w-full sm:w-auto bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                        Falta Acumular
                      </p>
                      <p className="text-lg font-black font-mono">
                        {formatUSD(
                          Math.max(0, fireTargetValue - unifiedCapitalUSD)
                        )}
                      </p>
                    </div>
                    {/* Progress Bar do FIRE */}
                    <div className="flex-1 w-full mx-4 h-3 bg-black/30 rounded-full overflow-hidden border border-white/10 hidden sm:block">
                      <div
                        className="h-full bg-emerald-400"
                        style={{
                          width: `${Math.min(
                            100,
                            (unifiedCapitalUSD / fireTargetValue) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-full sm:w-auto bg-black/20 px-4 py-2 rounded-lg border border-white/5 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                        Juros Reais
                      </p>
                      <p className="text-lg font-black font-mono">
                        {metrics.real.toFixed(2)}% a.a
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              ABA 3: FLUXO DE CAIXA
          ======================================================= */}
          {activeTab === "cashflow" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#161b22] border border-slate-800 p-2 rounded-2xl shadow-inner w-full">
                <div className="flex w-full sm:w-auto p-1 bg-[#0d1117] rounded-xl border border-slate-700/50">
                  <button
                    onClick={() => setCfTab("lancamentos")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${
                      cfTab === "lancamentos"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <ListPlus className="w-4 h-4 mr-2" /> Lançamentos
                  </button>
                  <button
                    onClick={() => setCfTab("extratos")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${
                      cfTab === "extratos"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <PieChartIcon className="w-4 h-4 mr-2" /> Dash/Extratos
                  </button>
                </div>
              </div>

              {cfTab === "lancamentos" && (
                <div className="bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl animate-in fade-in">
                  {/* BARRA SUPERIOR DE CONTROLE DO MÊS */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-[#0d1117] border border-slate-800 p-3 rounded-2xl gap-4 shadow-inner">
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 mr-1">
                        <CalendarDays className="w-5 h-5 text-emerald-500" />
                      </div>

                      <button
                        onClick={() => stepMonth("prev")}
                        className="bg-[#161b22] border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <select
                        value={curMonthStr}
                        onChange={handleMonthChange}
                        className="bg-[#161b22] border border-slate-700 text-white font-black text-sm uppercase px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-blue-500 transition-colors appearance-none text-center min-w-[130px] shadow-sm"
                      >
                        {mesesNomes.map((m) => (
                          <option key={m.val} value={m.val}>
                            {m.nome}
                          </option>
                        ))}
                      </select>

                      <select
                        value={curYearStr}
                        onChange={handleYearChange}
                        className="bg-[#161b22] border border-slate-700 text-white font-black text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-blue-500 transition-colors appearance-none text-center min-w-[90px] shadow-sm"
                      >
                        {Array.from(
                          { length: 15 },
                          (_, i) => new Date().getFullYear() - 5 + i
                        ).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => stepMonth("next")}
                        className="bg-[#161b22] border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={handleCloneLastMonth}
                        className="flex-1 md:flex-none px-4 py-3 rounded-xl font-black uppercase tracking-wider text-[9px] flex items-center justify-center transition-all bg-[#0d1117] border border-slate-700 text-amber-400 hover:bg-slate-800 hover:border-amber-500/50 shadow-sm"
                      >
                        <Copy className="w-4 h-4 mr-2" /> Clonar Anterior
                      </button>

                      <button
                        onClick={handleSaveMonth}
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center shadow-lg transition-all border bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white group"
                      >
                        <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Gravar no Extrato
                      </button>
                    </div>
                  </div>

                  {/* CARDS DE RESUMO EM TEMPO REAL */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#0d1117] p-4 rounded-2xl border border-slate-800 shadow-inner text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Receitas
                      </p>
                      <p className="text-2xl font-black text-blue-400 font-mono tracking-tighter">
                        {formatUSD(totalIncome)}
                      </p>
                    </div>
                    <div className="bg-[#0d1117] p-4 rounded-2xl border border-slate-800 shadow-inner text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Despesas
                      </p>
                      <p className="text-2xl font-black text-red-400 font-mono tracking-tighter">
                        {formatUSD(totalExpense)}
                      </p>
                    </div>
                    <div className="bg-[#0d1117] p-4 rounded-2xl border border-slate-800 shadow-inner text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Dívidas
                      </p>
                      <p className="text-2xl font-black text-amber-400 font-mono tracking-tighter">
                        {formatUSD(totalDebt)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-4 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10 text-center flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 relative z-10">
                        Margem (Savings)
                      </p>
                      <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter relative z-10">
                        {savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* RECEITAS */}
                    <div className="bg-[#0d1117] p-5 rounded-2xl border border-slate-800 shadow-inner flex flex-col h-full">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-800/80 pb-3">
                        <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center">
                          <Plus className="w-4 h-4 mr-2" /> Entradas / Receitas
                        </h3>
                        <button
                          onClick={() =>
                            setIncomes([
                              {
                                id: genId(),
                                desc: "",
                                amount: 0,
                                category: "Salário",
                              },
                              ...incomes,
                            ])
                          }
                          className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Adicionar
                        </button>
                      </div>
                      <div
                        className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2"
                        style={{ maxHeight: "400px" }}
                      >
                        {incomes.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row gap-3 bg-[#161b22] p-3 rounded-xl border border-slate-800 focus-within:border-blue-500/50 focus-within:shadow-lg transition-all"
                          >
                            <input
                              type="text"
                              value={item.desc}
                              onChange={(e) =>
                                setIncomes(
                                  incomes.map((i) =>
                                    i.id === item.id
                                      ? { ...i, desc: e.target.value }
                                      : i
                                  )
                                )
                              }
                              placeholder="Descrição..."
                              className="flex-1 bg-transparent text-sm font-bold text-white outline-none px-2 placeholder-slate-600"
                            />
                            <div className="flex gap-2">
                              <select
                                value={item.category}
                                onChange={(e) =>
                                  setIncomes(
                                    incomes.map((i) =>
                                      i.id === item.id
                                        ? { ...i, category: e.target.value }
                                        : i
                                    )
                                  )
                                }
                                className="bg-[#0d1117] text-[10px] font-bold text-slate-300 outline-none rounded-lg border border-slate-700 px-2 w-28 focus:border-blue-500"
                              >
                                {incomeCats.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <div className="relative w-28">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-mono text-xs">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={item.amount || ""}
                                  onChange={(e) =>
                                    setIncomes(
                                      incomes.map((i) =>
                                        i.id === item.id
                                          ? { ...i, amount: e.target.value }
                                          : i
                                      )
                                    )
                                  }
                                  className="w-full bg-[#0d1117] text-right text-blue-400 font-mono font-black text-sm outline-none rounded-lg pl-6 pr-3 py-2 border border-slate-700 focus:border-blue-500"
                                  placeholder="0"
                                />
                              </div>
                              <button
                                onClick={() =>
                                  setIncomes(
                                    incomes.filter((i) => i.id !== item.id)
                                  )
                                }
                                className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SAÍDAS (DESPESAS E DÍVIDAS) */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-[#0d1117] p-5 rounded-2xl border border-slate-800 shadow-inner flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800/80 pb-3">
                          <h3 className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center">
                            <TrendingDown className="w-4 h-4 mr-2" /> Despesas
                            de Vida
                          </h3>
                          <button
                            onClick={() =>
                              setExpenses([
                                {
                                  id: genId(),
                                  desc: "",
                                  amount: 0,
                                  category: "Moradia",
                                },
                                ...expenses,
                              ])
                            }
                            className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                          </button>
                        </div>
                        <div
                          className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2"
                          style={{ maxHeight: "200px" }}
                        >
                          {expenses.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row gap-3 bg-[#161b22] p-3 rounded-xl border border-slate-800 focus-within:border-red-500/50 focus-within:shadow-lg transition-all"
                            >
                              <input
                                type="text"
                                value={item.desc}
                                onChange={(e) =>
                                  setExpenses(
                                    expenses.map((i) =>
                                      i.id === item.id
                                        ? { ...i, desc: e.target.value }
                                        : i
                                    )
                                  )
                                }
                                placeholder="Descrição..."
                                className="flex-1 bg-transparent text-sm font-bold text-white outline-none px-2 placeholder-slate-600"
                              />
                              <div className="flex gap-2">
                                <select
                                  value={item.category}
                                  onChange={(e) =>
                                    setExpenses(
                                      expenses.map((i) =>
                                        i.id === item.id
                                          ? { ...i, category: e.target.value }
                                          : i
                                      )
                                    )
                                  }
                                  className="bg-[#0d1117] text-[10px] font-bold text-slate-300 outline-none rounded-lg border border-slate-700 px-2 w-28 focus:border-red-500"
                                >
                                  {expenseCats.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                                <div className="relative w-28">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-mono text-xs">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    value={item.amount || ""}
                                    onChange={(e) =>
                                      setExpenses(
                                        expenses.map((i) =>
                                          i.id === item.id
                                            ? { ...i, amount: e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                    className="w-full bg-[#0d1117] text-right text-red-400 font-mono font-black text-sm outline-none rounded-lg pl-6 pr-3 py-2 border border-slate-700 focus:border-red-500"
                                    placeholder="0"
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    setExpenses(
                                      expenses.filter((i) => i.id !== item.id)
                                    )
                                  }
                                  className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#0d1117] p-5 rounded-2xl border border-slate-800 shadow-inner flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800/80 pb-3">
                          <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" /> Dívidas
                            (Passivos)
                          </h3>
                          <button
                            onClick={() =>
                              setDebts([
                                {
                                  id: genId(),
                                  desc: "",
                                  amount: 0,
                                  category: "Dívidas",
                                },
                                ...debts,
                              ])
                            }
                            className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                          </button>
                        </div>
                        <div
                          className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2"
                          style={{ maxHeight: "130px" }}
                        >
                          {debts.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row gap-3 bg-[#161b22] p-3 rounded-xl border border-slate-800 focus-within:border-amber-500/50 focus-within:shadow-lg transition-all"
                            >
                              <input
                                type="text"
                                value={item.desc}
                                onChange={(e) =>
                                  setDebts(
                                    debts.map((i) =>
                                      i.id === item.id
                                        ? { ...i, desc: e.target.value }
                                        : i
                                    )
                                  )
                                }
                                placeholder="Descrição da Dívida..."
                                className="flex-1 bg-transparent text-sm font-bold text-white outline-none px-2 placeholder-slate-600"
                              />
                              <div className="flex gap-2">
                                <div className="relative w-28 ml-auto">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-mono text-xs">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    value={item.amount || ""}
                                    onChange={(e) =>
                                      setDebts(
                                        debts.map((i) =>
                                          i.id === item.id
                                            ? { ...i, amount: e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                    className="w-full bg-[#0d1117] text-right text-amber-400 font-mono font-black text-sm outline-none rounded-lg pl-6 pr-3 py-2 border border-slate-700 focus:border-amber-500"
                                    placeholder="0"
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    setDebts(
                                      debts.filter((i) => i.id !== item.id)
                                    )
                                  }
                                  className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cfTab === "extratos" && (
                <div className="bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] shadow-2xl animate-in fade-in space-y-8">
                  {savedMonths.length === 0 ? (
                    <div className="text-center py-20 bg-[#0d1117] rounded-2xl border border-slate-800 border-dashed">
                      <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-10 h-10 text-slate-500" />
                      </div>
                      <p className="text-xl font-black uppercase tracking-widest text-slate-300">
                        Extrato Vazio
                      </p>
                      <p className="text-sm font-bold text-slate-500 mt-2 max-w-md mx-auto">
                        Vá na aba "Lançamentos", preencha seus dados do mês e
                        clique em "Gravar no Extrato" para gerar inteligência e
                        histórico.
                      </p>
                      <button
                        onClick={() => setCfTab("lancamentos")}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg"
                      >
                        Ir para Lançamentos
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* DASHBOARD GRÁFICO DO EXTRATO */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 bg-[#0d1117] p-6 rounded-2xl border border-slate-800 shadow-inner">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center border-b border-slate-800/80 pb-3">
                            <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />{" "}
                            Histórico de Margem e Fluxo
                          </h3>
                          <div className="w-full h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={savedMonths.map((m) => ({
                                  name: m.monthName.substring(0, 3),
                                  Receitas: m.totalIncome,
                                  Saídas: m.totalExpense + m.totalDebt,
                                  Sobrou: m.netCashflow,
                                }))}
                                margin={{
                                  top: 5,
                                  right: 5,
                                  left: -20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#30363d"
                                  opacity={0.5}
                                />
                                <XAxis
                                  dataKey="name"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fill: "#64748b",
                                    fontSize: 11,
                                    fontWeight: "bold",
                                  }}
                                  dy={10}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fill: "#64748b",
                                    fontSize: 11,
                                    fontWeight: "bold",
                                  }}
                                  tickFormatter={(v) =>
                                    `$${(v / 1000).toFixed(0)}k`
                                  }
                                  dx={-10}
                                />
                                <RechartsTooltip
                                  cursor={{ fill: "#161b22" }}
                                  contentStyle={{
                                    backgroundColor: "#161b22",
                                    border: "1px solid #30363d",
                                    borderRadius: "12px",
                                    boxShadow:
                                      "0 10px 15px -3px rgba(0,0,0,0.5)",
                                  }}
                                  itemStyle={{
                                    color: "#fff",
                                    fontWeight: "bold",
                                  }}
                                  formatter={(value) => formatUSD(value)}
                                  labelStyle={{
                                    color: "#94a3b8",
                                    fontWeight: "bold",
                                    paddingBottom: "4px",
                                  }}
                                />
                                <Legend
                                  wrapperStyle={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    paddingTop: "20px",
                                  }}
                                />
                                <Bar
                                  dataKey="Receitas"
                                  fill="#3b82f6"
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={50}
                                />
                                <Bar
                                  dataKey="Saídas"
                                  fill="#ef4444"
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={50}
                                />
                                <Bar
                                  dataKey="Sobrou"
                                  fill="#10b981"
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={50}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="lg:col-span-4 bg-[#0d1117] p-6 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center self-start border-b border-slate-800/80 pb-3 w-full">
                            <PieChartIcon className="w-4 h-4 mr-2 text-amber-500" />{" "}
                            Categorias (Mês Atual)
                          </h3>
                          {expensesByCategory.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-xl w-full">
                              Sem saídas preenchidas
                            </div>
                          ) : (
                            <div className="w-full flex-1 relative min-h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={expensesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    {expensesByCategory.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={
                                          EXPENSE_COLORS[
                                            index % EXPENSE_COLORS.length
                                          ]
                                        }
                                      />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip
                                    formatter={(value) => formatUSD(value)}
                                    contentStyle={{
                                      backgroundColor: "#161b22",
                                      border: "1px solid #30363d",
                                      borderRadius: "12px",
                                      fontWeight: "bold",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                  />
                                  <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{
                                      fontSize: "9px",
                                      fontWeight: "bold",
                                      marginTop: "10px",
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                  Saída Total
                                </p>
                                <p className="text-lg font-black text-white font-mono tracking-tighter">
                                  {formatUSD(totalExpense + totalDebt)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TABELA DE HISTÓRICO PRO */}
                      <div>
                        <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-4 flex items-center bg-[#0d1117] p-4 rounded-xl border border-slate-800">
                          <History className="w-4 h-4 mr-2 text-blue-400" />{" "}
                          Relatório Completo de Lançamentos
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#0d1117] text-[10px] text-slate-400 uppercase tracking-[0.2em] border-b border-slate-800">
                                <th className="px-6 py-4 font-black">
                                  Mês/Ano
                                </th>
                                <th className="px-6 py-4 font-black">
                                  Receitas
                                </th>
                                <th className="px-6 py-4 font-black">Saídas</th>
                                <th className="px-6 py-4 font-black">
                                  Margem (%)
                                </th>
                                <th className="px-6 py-4 font-black">
                                  Saldo Líq.
                                </th>
                                <th className="px-6 py-4 font-black text-center">
                                  Gerenciar
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-sm font-mono font-bold bg-[#161b22]">
                              {[...savedMonths].reverse().map((m) => (
                                <tr
                                  key={m.id}
                                  className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors"
                                >
                                  <td className="px-6 py-4 text-slate-200 uppercase text-xs font-sans tracking-widest font-black">
                                    {m.monthName}
                                  </td>
                                  <td className="px-6 py-4 text-blue-400">
                                    {formatUSD(m.totalIncome)}
                                  </td>
                                  <td className="px-6 py-4 text-red-400">
                                    {formatUSD(m.totalExpense + m.totalDebt)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                        m.savingsRate > 0
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                                      }`}
                                    >
                                      {m.savingsRate.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td
                                    className={`px-6 py-4 font-black tracking-tighter ${
                                      m.netCashflow >= 0
                                        ? "text-emerald-400"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {m.netCashflow >= 0 ? "+" : ""}
                                    {formatUSD(m.netCashflow)}
                                  </td>
                                  <td className="px-6 py-4">
                                    {deletingId === m.id ? (
                                      <div className="flex justify-center items-center gap-2 animate-in fade-in">
                                        <button
                                          onClick={() => {
                                            setSavedMonths(
                                              savedMonths.filter(
                                                (x) => x.id !== m.id
                                              )
                                            );
                                            setDeletingId(null);
                                            showToast("Excluído.", "success");
                                          }}
                                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-black transition-colors shadow-md"
                                        >
                                          Confirmar
                                        </button>
                                        <button
                                          onClick={() => setDeletingId(null)}
                                          className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-black transition-colors"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-center items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setCurrentMonth(m.monthId);
                                            setIncomes(m.incomes);
                                            setExpenses(m.expenses);
                                            setDebts(m.debts);
                                            setCfTab("lancamentos");
                                            window.scrollTo({
                                              top: 0,
                                              behavior: "smooth",
                                            });
                                          }}
                                          className="bg-[#0d1117] border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-all text-[10px] uppercase tracking-wider font-black"
                                        >
                                          <Edit2 className="w-3 h-3 mr-1.5" />{" "}
                                          Editar
                                        </button>
                                        <button
                                          onClick={() => setDeletingId(m.id)}
                                          className="bg-[#0d1117] border border-slate-700 text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 px-3 py-2 rounded-lg flex items-center shadow-sm transition-all"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              ABA 4: APORTES INTELIGENTES (REBALANCE)
          ======================================================= */}
          {activeTab === "rebalance" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-[#161b22] border border-slate-800 p-6 sm:p-8 rounded-[1.5rem] shadow-2xl flex flex-col text-left">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800/80 pb-6 mb-8 gap-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic flex items-center">
                      <Scale className="w-6 h-6 mr-2 text-emerald-500" /> Aporte
                      Inteligente PRO
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                      Rebalanceamento de Carteira via Dinheiro Novo
                    </p>
                  </div>

                  <div className="bg-[#0d1117] border border-emerald-500/30 p-5 rounded-2xl flex items-center shadow-lg shadow-emerald-500/5 group focus-within:border-emerald-500 transition-colors w-full lg:w-auto">
                    <div>
                      <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-2 flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-1.5" /> Valor do
                        Novo Aporte
                      </label>
                      <div className="flex items-center">
                        <span className="text-emerald-600/50 font-mono mr-2 font-black text-2xl">
                          $
                        </span>
                        <input
                          type="number"
                          value={newRebalanceAporte || ""}
                          onChange={(e) =>
                            setNewRebalanceAporte(Number(e.target.value))
                          }
                          className="w-40 bg-transparent text-4xl font-black text-white font-mono outline-none tracking-tighter"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#0d1117] p-5 rounded-2xl border border-slate-800 shadow-inner">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Total Lançado Agora
                    </p>
                    <p className="text-2xl font-black text-slate-300 font-mono tracking-tighter">
                      {formatUSD(
                        rebalancePlan.reduce((a, b) => a + b.currentVal, 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-[#0d1117] p-5 rounded-2xl border border-slate-800 shadow-inner">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Carteira Alvo (Futuro)
                    </p>
                    <p className="text-2xl font-black text-blue-400 font-mono tracking-tighter">
                      {formatUSD(
                        rebalancePlan.reduce((a, b) => a + b.currentVal, 0) +
                          newRebalanceAporte
                      )}
                    </p>
                  </div>
                  <div className="lg:col-span-2 bg-gradient-to-r from-emerald-900/40 to-[#0d1117] p-5 rounded-2xl border border-emerald-500/30 shadow-inner flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                        Medo & Ganância (Influência)
                      </p>
                      <p className="text-xl font-black text-white tracking-tighter">
                        {macroData.fearGreed} pts{" "}
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          ({macroData.fearGreed > 50 ? "Ganância" : "Medo"})
                        </span>
                      </p>
                    </div>
                    <Zap className="w-10 h-10 text-emerald-500/20" />
                  </div>
                </div>

                {rebalancePlan.length === 0 ? (
                  <div className="text-center py-16 bg-[#0d1117] rounded-2xl border border-slate-800 border-dashed">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sliders className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-lg font-black text-slate-300 uppercase tracking-widest">
                      Estratégia Vazia
                    </p>
                    <p className="text-sm font-bold text-slate-500 mt-2 max-w-sm mx-auto">
                      Vá na Aba 1 (Carteira) e defina sua alocação estratégica
                      (porcentagens) para o algoritmo poder calcular os aportes.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0d1117] text-[10px] text-slate-400 uppercase tracking-[0.2em] border-b border-slate-800">
                          <th className="px-6 py-4 font-black">
                            Ativo & Dinâmica
                          </th>
                          <th className="px-6 py-4 font-black">
                            Saldo Atual na Corretora ($)
                          </th>
                          <th className="px-6 py-4 font-black text-center">
                            Alvo %
                          </th>
                          <th className="px-6 py-4 font-black text-right text-emerald-400">
                            Aporte Exato Sugerido
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-bold bg-[#161b22]">
                        {rebalancePlan.map((item) => {
                          const TrendIcon = item.trend.icon;
                          const isBuying = item.suggestedBuy > 0;
                          return (
                            <tr
                              key={item.key}
                              className={`border-b border-slate-800/50 transition-colors ${
                                isBuying
                                  ? "hover:bg-emerald-900/10 bg-emerald-500/5"
                                  : "hover:bg-slate-800/30"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full mr-3 shadow-inner"
                                      style={{
                                        backgroundColor: item.asset.color,
                                      }}
                                    ></span>
                                    <div>
                                      <p className="text-white tracking-wider font-black">
                                        {item.asset.ticker}
                                      </p>
                                      <p className="text-[8px] text-slate-500 uppercase tracking-widest">
                                        {item.asset.name}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={`flex items-center px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${item.trend.bg} ${item.trend.color}`}
                                    title={`Beta: ${item.asset.beta} | FG: ${macroData.fearGreed}`}
                                  >
                                    {item.trend.label}{" "}
                                    <TrendIcon className="w-3 h-3 ml-1.5" />
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center bg-[#0d1117] border border-slate-700 px-4 py-2.5 rounded-xl focus-within:border-blue-500 transition-all shadow-inner w-40">
                                  <span className="text-slate-500 font-mono mr-2 text-sm">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    value={currentBalances[item.key] || ""}
                                    onChange={(e) =>
                                      setCurrentBalances((prev) => ({
                                        ...prev,
                                        [item.key]: Number(e.target.value),
                                      }))
                                    }
                                    className="w-full bg-transparent text-white font-mono text-base font-black outline-none placeholder-slate-700"
                                    placeholder="0"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="bg-[#0d1117] text-slate-300 px-3 py-1.5 rounded-lg font-mono text-xs border border-slate-700 font-black shadow-inner">
                                  {(item.targetPct * 100).toFixed(0)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isBuying ? (
                                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border border-emerald-400 px-4 py-2 rounded-xl font-mono font-black shadow-lg shadow-emerald-500/20 flex items-center justify-end w-max ml-auto tracking-tighter text-base">
                                    <ShoppingCart className="w-4 h-4 mr-2 opacity-80" />{" "}
                                    + {formatUSD(item.suggestedBuy)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-black text-xs uppercase tracking-widest bg-slate-800/30 px-3 py-1.5 rounded-lg">
                                    Aguardar
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                  <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
                  <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                    <strong>Algoritmo de Aporte:</strong> Ele nunca sugere
                    vender (o que gera impostos). Ele pega o seu dinheiro novo e
                    direciona matematicamente para os ativos que ficaram para
                    trás na sua carteira, forçando-a de volta ao equilíbrio
                    original da forma mais barata possível.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
