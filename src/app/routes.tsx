import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { HealthLog } from "./components/HealthLog";
import { Nutrition } from "./components/Nutrition";
import { ControlCenter } from "./components/ControlCenter";
import { Identity } from "./components/Identity";
import { useAppContext } from "./context/AppContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { onboardingComplete } = useAppContext();
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/onboarding" replace /> },
  { path: "/onboarding", element: <Onboarding /> },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "health", element: <HealthLog /> },
      { path: "nutrition", element: <Nutrition /> },
      { path: "profile", element: <Identity /> },
      { path: "settings", element: <ControlCenter /> },
    ]
  }
]);
