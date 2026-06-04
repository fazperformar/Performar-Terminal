// ==========================================
// useCloudState — Persistência na Nuvem (Firestore) — v2 LIMPO
// ==========================================
// Substituto direto do useStickyState. Mesma assinatura:
//   const [valor, setValor] = useCloudState(default, "fp_chave");
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
        clearLocalFpKeys();
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
  clearLocalFpKeys();
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
