// Rotas da aplicação
// Os caminhos ficam centralizados neste arquivo para evitar
// repetir strings como "/dashboard", "/aereo", etc.

export const routePaths = {
  home: "/",
  terrestre: "/",
  aereo: "/aereo",
  dashboard: "/dashboard",
} as const;