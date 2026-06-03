// ==========================================
// useCloudState - Persistência na Nuvem (Firestore)
// ==========================================

import { useState, useEffect, useRef } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

let cloudCache = null;
let cloudLoaded = false;
let cloudUid = null;
let unsubscribeSnapshot = null;
const subscribers = new Set();
const notifyAll = () => subscribers.forEach((fn) => fn());
const LAST_UID_KEY = "fp__last_uid";

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

// A FUNÇÃO FOI MANTIDA AQUI, MAS NEUTRALIZADA MAIS ABAIXO PARA PROTEGER SEUS DADOS
function clearLocalFpKeys() {
  if (typeof window === "undefined") return;
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("fp_") && k !== LAST_UID_KEY) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch (e) {
    console.warn("useCloudState: falha ao limpar cache local.", e);
  }
}

// ---------- Escrita debounced + FLUSH ----------
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
    pendingWrites = { ...batch, ...pendingWrites };
  }
}

function scheduleCloudWrite(uid, key, value) {
  pendingWrites[key] = value;
  if (cloudCache) cloudCache[key] = value;
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => flushWrites(uid), 600);
}

// ---------- Listener em tempo real ----------
function startCloudListener(uid) {
  if (cloudUid === uid && unsubscribeSnapshot) return;
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
      notifyAll();
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

// ---------- Reação central ao estado de auth ----------
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const lastUid = readLocal(LAST_UID_KEY, null);
      if (lastUid && lastUid !== user.uid) {
        // clearLocalFpKeys(); // <-- COMENTADO PARA NÃO APAGAR DADOS LOCAIS AO TROCAR CONTA
      }
      writeLocal(LAST_UID_KEY, user.uid);
      startCloudListener(user.uid);
      notifyAll();
    } else {
      stopCloudListener();
      notifyAll();
    }
  });
}

export async function resetCloudCache() {
  const uid = cloudUid || auth.currentUser?.uid || null;
  await flushWrites(uid);
  stopCloudListener();
  // clearLocalFpKeys(); // <-- COMENTADO PARA NÃO APAGAR DADOS LOCAIS AO SAIR
  notifyAll();
}

// ---------- O hook ----------
export function useCloudState(defaultValue, key) {
  const [value, setValue] = useState(() => readLocal(key, defaultValue));
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const onCloudChange = () => {
      if (cloudLoaded && cloudCache && key in cloudCache) {
        const cloudVal = cloudCache[key];
        if (JSON.stringify(cloudVal) !== JSON.stringify(valueRef.current)) {
          setValue(cloudVal);
        }
        writeLocal(key, cloudVal);
      }
    };
    subscribers.add(onCloudChange);
    onCloudChange();
    return () => subscribers.delete(onCloudChange);
  }, [key]);

  useEffect(() => {
    writeLocal(key, value);
    const uid = cloudUid || auth.currentUser?.uid || null;
    if (uid) scheduleCloudWrite(uid, key, value);
  }, [key, value]);

  return [value, setValue];
}

export default useCloudState;
Desça e clique no botão verde Commit changes...
Me avise com um "fiz" quando terminar. Depois disso, vamos para o último e mais importante arquivo: o seu App.jsx!
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
