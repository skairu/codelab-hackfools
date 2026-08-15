// Rotas da aplicação
// Os caminhos ficam centralizados neste arquivo para evitar
// repetir strings como "/dashboard", "/aereo", etc.

export const routePaths = {
  login: "/login",
  home: "/",
  terrestre: "/",
  aereo: "/aereo",
  dashboard: "/dashboard",
  mapadmin: "/mapadmin",
} as const;