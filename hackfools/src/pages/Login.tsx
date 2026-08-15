import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User as UserIcon } from "lucide-react";
import { routePaths } from "../rotes/routes";

// ---------------------------------------------------------------------------
// "Base" de usuários mockada — sem backend/DB por enquanto.
// Troque isso por uma chamada real quando o login for integrado.
// ---------------------------------------------------------------------------

type Papel = "user" | "admin";

interface Usuario {
  nome: string;
  senha: string;
  papel: Papel;
}

const USUARIOS_MOCK: Usuario[] = [
  { nome: "user", senha: "123", papel: "user" },
  { nome: "admin", senha: "456", papel: "admin" },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const encontrado = USUARIOS_MOCK.find(
      (u) => u.nome === nome.trim() && u.senha === senha.trim()
    );

    if (!encontrado) {
      setErro("Usuário ou senha incorretos.");
      return;
    }

    setErro(null);
    // Redirecionar baseado no papel
    if (encontrado.papel === "admin") {
      navigate(routePaths.mapadmin);
    } else {
      navigate(routePaths.terrestre);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center font-mono text-white px-4">
      
      {/* 
        Fundo global mantido atrás de tudo (-z-10) 
        Isso garante que seu header global apareça normalmente no topo.
      */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, #020705 0%, #05140D 50%, #010302 100%)",
        }}
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[#2D6A4F]/10 blur-[150px]" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-[#2D6A4F]/40 bg-[#1B4332]/20 p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(82,183,136,0.05)]">
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#52B788]/40 bg-[#1B4332]/60 shadow-[0_0_15px_rgba(82,183,136,0.1)]">
            <UserIcon className="h-6 w-6 text-[#74C69D]" strokeWidth={1.75} />
          </div>
          <h1 className="mt-4 text-lg font-bold uppercase tracking-wide text-[#D8F3DC]">
            Acesso Restrito
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-[#74C69D]">
            Rede planetária de tráfego
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#95D5B2]">
              Credencial
            </span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="user ou admin"
              autoComplete="username"
              className="w-full rounded-lg border border-[#2D6A4F]/60 bg-[#081C15]/80 px-3 py-2.5 text-sm text-[#D8F3DC] placeholder:text-[#2D6A4F] outline-none transition-colors focus:border-[#52B788] focus:bg-[#0B241B]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#95D5B2]">
              Código de Acesso
            </span>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#2D6A4F]/60 bg-[#081C15]/80 px-3 py-2.5 pr-10 text-sm tracking-widest text-[#D8F3DC] placeholder:text-[#2D6A4F] outline-none transition-colors focus:border-[#52B788] focus:bg-[#0B241B]"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#52B788] transition-colors hover:text-[#95D5B2]"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </label>

          {erro && (
            <div className="rounded-md border border-red-900/50 bg-red-500/10 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-red-400">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#52B788]/60 bg-[#1B4332]/40 px-3 py-3 text-xs font-bold uppercase tracking-widest text-[#D8F3DC] transition-all hover:bg-[#2D6A4F]/60 hover:shadow-[0_0_15px_rgba(82,183,136,0.2)]"
          >
            <LogIn className="h-4 w-4 text-[#74C69D]" strokeWidth={2} />
            Autenticar
          </button>
        </form>

        <div className="mt-6 border-t border-[#2D6A4F]/30 pt-4 text-center">
          <p className="text-[10px] uppercase tracking-wide text-[#40916C]">
            Acesso Temporário — Demo
          </p>
          <div className="mt-1 flex justify-center gap-4 text-xs font-medium text-[#74C69D]">
            <span>user / 123</span>
            <span className="text-[#2D6A4F]">|</span>
            <span>admin / 456</span>
          </div>
        </div>
      </div>
    </div>
  );
}