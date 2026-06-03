// ==========================================
// 🔥 CONFIGURAÇÃO FIREBASE — Performar Terminal
// ==========================================
// Local no projeto: src/firebase.js
// (chaves públicas — a segurança vem das Regras do Firestore)
// ==========================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDT-6bREJ11ZriQAJ7cIVUI1mRM8MCJZd4",
  authDomain: "performar-terminal.firebaseapp.com",
  projectId: "performar-terminal",
  storageBucket: "performar-terminal.firebasestorage.app",
  messagingSenderId: "94866156592",
  appId: "1:94866156592:web:b5183ee758b673e1bad1f5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
