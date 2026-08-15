import { useRoutes } from "react-router-dom";

import Header from "./components/Header";

import Terrestre from "./pages/Terrestre";
import Dashboard from "./pages/Dashboard";
import Aereo from "./pages/Aereo";
import Submarino from "./pages/Submarino";

import { routePaths } from "./rotes/routes.ts";

const routes = [
  {
    path: routePaths.terrestre,
    element: <Terrestre />,
  },
  {
    path: routePaths.dashboard,
    element: <Dashboard />,
  },
  {
    path: routePaths.aereo,
    element: <Aereo />,
  },
  {
    path: routePaths.submarino,
    element: <Submarino />,
  },
];

export default function App() {
  const element = useRoutes(routes);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {element}
      </main>
    </div>
  );
}