import { useRoutes } from "react-router-dom";
import Header from "./components/Header";
import Terrestre from "./pages/Terrestre";
import Dashboard from "./pages/Dashboard";

const routes = [
  {
    path: "/",
    element: <Terrestre />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
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