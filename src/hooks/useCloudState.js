// ==========================================
// ☁️ useCloudState — Persistência na Nuvem (Firestore) — v2 CORRIGIDO
// ==========================================
// Local: src/hooks/useCloudState.js
//
// Substituto direto do useStickyState. MESMA ASSINATURA (nada muda no App.jsx):
//   const [valor, setValor] = useCloudState(default, "fp_chave");
//
// O QUE MUDOU NESTA VERSÃO (correções, sem alterar a API):
//   [BUG 1] Race condition do auth: agora ouvimos onAuthStateChanged de verdade,
//           em vez de confiar no auth.currentUser síncrono no mount. Quando o
//           Firebase resolve o login (que é assíncrono), a nuvem carrega e os
//           hooks reconciliam automaticamente.
//   [BUG 2] Perda de escrita no logout: damos FLUSH síncrono das escritas
//           pendentes ANTES de limpar o timer/cache. Nada que o usuário mexeu
//           se perde ao clicar "Sair".
//   [BUG 3] Conflito entre dispositivos: trocamos getDoc (leitura única) por
//           onSnapshot (tempo real). Celular e PC ficam sincronizados de fato.
//   [BUG 4] Vazamento entre contas no mesmo navegador: ao logar um uid diferente
//           do último, limpamos o cache local fp_ ANTES de mostrar qualquer dado.
//
// Estratégia de dados mantida: TODO o estado vive em UM documento (users/{uid}),
// mapa de chaves fp_*. 1 doc = 1 leitura inicial + listener. Econômico.
// ==========================================

import { useState, useEffect, useRef } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

// --- Cache em memória do documento da nuvem ---
let cloudCache = null;      // objeto { fp_chave: valor, ... }
let cloudLoaded = false;    // já recebemos ao menos um snapshot?
let cloudUid = null;        // uid atualmente carregado
let unsubscribeSnapshot = null; // cancela o listener em tempo real
const subscribers = new Set();  // hooks ouvindo mudanças

const notifyAll = () => subscribers.forEach((fn) => fn());

const LAST_UID_KEY = "fp__last_uid"; // controla troca de conta (BUG 4)

// ---------- localStorage helpers ----------
function readLocal(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const v = window.localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeLocal(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`useCloudState: erro ao salvar ${key} no cache.`, e);
  }
}

function clearLocalFpKeys() {
  if (typeof window === "undefined") return;
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      // Não apaga a chave de controle de uid
      if (k && k.startsWith("fp_") && k !== LAST_UID_KEY) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch (e) {
    console.warn("useCloudState: falha ao limpar cache local.", e);
  }
}

// ---------- Escrita debounced + FLUSH (BUG 2) ----------
let pendingWrites = {};
let writeTimer = null;

async function flushWrites(uid) {
  if (!uid || Object.keys(pendingWrites).length === 0) return;
  const batch = { ...pendingWrites };
  pendingWrites = {};
  clearTimeout(writeTimer);
  writeTimer = null;
  try {
    await setDoc(doc(db, "users", uid), batch, { merge: true });
  } catch (e) {
    console.warn("useCloudState: falha ao salvar na nuvem (flush).", e);
    // Recoloca o que falhou para tentar de novo depois
    pendingWrites = { ...batch, ...pendingWrites };
  }
}

function scheduleCloudWrite(uid, key, value) {
  pendingWrites[key] = value;
  if (cloudCache) cloudCache[key] = value;
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => flushWrites(uid), 600);
}

// ---------- Listener em tempo real (BUG 3) ----------
function startCloudListener(uid) {
  if (cloudUid === uid && unsubscribeSnapshot) return; // já ouvindo este uid
  // Troca de uid: encerra o listener anterior
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  cloudUid = uid;
  cloudLoaded = false;
  cloudCache = {};

  unsubscribeSnapshot = onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      cloudCache = snap.exists() ? snap.data() : {};
      cloudLoaded = true;
      notifyAll(); // todos os hooks reconciliam seu valor
    },
    (e) => {
      console.warn("useCloudState: erro no listener da nuvem.", e);
      cloudLoaded = true;
      notifyAll();
    }
  );
}

function stopCloudListener() {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  cloudCache = null;
  cloudLoaded = false;
  cloudUid = null;
}

// ---------- Reação central ao estado de auth (BUG 1 e BUG 4) ----------
// Um único listener global de auth coordena tudo.
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const lastUid = readLocal(LAST_UID_KEY, null);
      // BUG 4: se logou uma conta diferente da última neste navegador,
      // limpa o cache local antes de qualquer leitura para não vazar dados.
      if (lastUid && lastUid !== user.uid) {
        clearLocalFpKeys();
      }
      writeLocal(LAST_UID_KEY, user.uid);
      startCloudListener(user.uid); // BUG 3: tempo real
      notifyAll();                  // BUG 1: acorda os hooks montados
    } else {
      // Logout vindo de qualquer lugar
      stopCloudListener();
      notifyAll();
    }
  });
}

// Chamado explicitamente no logout (AuthScreen.signOutUser)
export async function resetCloudCache() {
  // BUG 2: garante que a última edição vá pra nuvem ANTES de limpar
  const uid = cloudUid || auth.currentUser?.uid || null;
  await flushWrites(uid);
  stopCloudListener();
  clearLocalFpKeys();
  notifyAll();
}

// ---------- O hook ----------
export function useCloudState(defaultValue, key) {
  const [value, setValue] = useState(() => readLocal(key, defaultValue));
  const valueRef = useRef(value);
  valueRef.current = value;

  // Reconcilia quando a nuvem carrega/atualiza (snapshot) ou auth muda
  useEffect(() => {
    const onCloudChange = () => {
      if (cloudLoaded && cloudCache && key in cloudCache) {
        const cloudVal = cloudCache[key];
        // Só atualiza se de fato mudou, evitando re-render desnecessário
        if (JSON.stringify(cloudVal) !== JSON.stringify(valueRef.current)) {
          setValue(cloudVal);
        }
        writeLocal(key, cloudVal);
      }
    };
    subscribers.add(onCloudChange);
    onCloudChange(); // tenta reconciliar já, caso a nuvem tenha carregado antes
    return () => subscribers.delete(onCloudChange);
  }, [key]);

  // Persiste: sempre local; nuvem se logado (debounced)
  useEffect(() => {
    writeLocal(key, value);
    const uid = cloudUid || auth.currentUser?.uid || null;
    if (uid) scheduleCloudWrite(uid, key, value);
  }, [key, value]);

  return [value, setValue];
}

export default useCloudState;
