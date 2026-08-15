// Rotas da aplicação
// Os caminhos ficam centralizados neste arquivo para evitar
// repetir strings como "/dashboard", "/aereo", etc.

export const routePaths = {
  home: "/",
  terrestre: "/",
  aereo: "/aereo",
  submarino: "/submarino",
  dashboard: "/dashboard",
} as const;