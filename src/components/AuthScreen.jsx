// ==========================================
// 🔐 AuthScreen + AuthGate — Performar Terminal
// ==========================================
// Local sugerido: src/components/AuthScreen.jsx
//
// Exporta:
//   - <AuthGate>{children}</AuthGate>  -> envolve o App; mostra login OU o app
//   - useAuthUser()                    -> hook p/ pegar o usuário logado
//   - signOutUser()                    -> faz logout (limpa cache da nuvem)
// ==========================================

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { resetCloudCache } from "../hooks/useCloudState";
import { Globe, Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle } from "lucide-react";

// ---------- Contexto de usuário ----------
const AuthContext = createContext({ user: null, loading: true });
export const useAuthUser = () => useContext(AuthContext);

export async function signOutUser() {
  resetCloudCache();
  await signOut(auth);
}

// Traduz erros do Firebase para português amigável
function traduzErro(code) {
  const map = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Conta não encontrada. Crie uma conta primeiro.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Este e-mail já tem conta. Faça login.",
    "auth/weak-password": "A senha precisa ter ao menos 6 caracteres.",
    "auth/popup-closed-by-user": "Janela do Google fechada antes de concluir.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um momento.",
  };
  return map[code] || "Algo deu errado. Tente novamente.";
}

// ---------- Tela de Login / Cadastro ----------
function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e) {
      setError(traduzErro(e.code));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(traduzErro(e.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 font-sans text-slate-200 selection:bg-blue-500/30">
      {/* Brilhos de fundo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Marca */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-4 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
            <Globe className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic text-center">
            FAZ PERFORMAR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              TERMINAL PRO
            </span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">
            Gestão Patrimonial Nível Institucional
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-[#161b22] border border-slate-800 p-6 sm:p-8 rounded-[1.5rem] shadow-2xl">
          {/* Alternador Login / Cadastro */}
          <div className="flex bg-[#0d1117] border border-slate-700/50 rounded-xl p-1 mb-6 shadow-inner">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "login"
                  ? "bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "signup"
                  ? "bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="space-y-4">
            {/* E-mail */}
            <div className="bg-[#0d1117] border border-slate-700 px-4 py-3 rounded-xl shadow-inner focus-within:border-blue-500/50 transition-colors flex items-center">
              <Mail className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                placeholder="seu@email.com"
                className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder-slate-600"
              />
            </div>

            {/* Senha */}
            <div className="bg-[#0d1117] border border-slate-700 px-4 py-3 rounded-xl shadow-inner focus-within:border-blue-500/50 transition-colors flex items-center">
              <Lock className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                placeholder="Senha (mín. 6 caracteres)"
                className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder-slate-600"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-900/40 border border-red-500/40 text-red-200 text-xs font-bold p-3 rounded-xl flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
              </div>
            )}

            {/* Botão principal */}
            <button
              onClick={handleEmailAuth}
              disabled={busy || !email || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center border border-white/10"
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === "login" ? (
                <><LogIn className="w-4 h-4 mr-2" /> Entrar no Terminal</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" /> Criar Minha Conta</>
              )}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={busy}
              className="w-full bg-[#0d1117] hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-slate-200 font-black uppercase tracking-widest text-[11px] py-3.5 rounded-xl shadow-inner transition-all flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6">
          Seus dados ficam salvos com segurança na sua conta
        </p>
      </div>
    </div>
  );
}

// ---------- Tela de carregamento ----------
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-4 rounded-2xl shadow-lg shadow-blue-500/20 animate-pulse">
        <Globe className="text-white w-8 h-8" />
      </div>
      <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
    </div>
  );
}

// ---------- Gate: decide entre login e app ----------
export function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthGate;
