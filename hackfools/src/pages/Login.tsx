import { useState, FormEvent } from "react";
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

const PAPEL_LABEL: Record<Papel, string> = {
  user: "Usuário",
  admin: "Administrador",
};

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
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <UserIcon className="h-6 w-6 text-blue-400" strokeWidth={1.75} />
          </div>
          <h1 className="mt-4 text-lg font-medium text-white">Acessar plataforma</h1>
          <p className="mt-1 text-sm text-zinc-500">Controle de tráfego pré-histórico</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-400">
              Nome de usuário
            </span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="user ou admin"
              autoComplete="username"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-400">Senha</span>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
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

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-500/10 px-3 py-2.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.75} />
            Entrar
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-600">
          Demo sem back-end — use{" "}
          <span className="text-zinc-400">user / 123</span> ou{" "}
          <span className="text-zinc-400">admin / 456</span>.
        </p>
      </div>
    </div>
  );
}