import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Activity, Utensils, Settings, UserCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { devMode } = useAppContext();

  const tabs = [
    { id: "dashboard", icon: Home, path: "/dashboard", label: "Luna" },
    { id: "health", icon: Activity, path: "/health", label: "Salud" },
    { id: "nutrition", icon: Utensils, path: "/nutrition", label: "Nutrición" },
    { id: "profile", icon: UserCircle2, path: "/profile", label: "Yo" },
    { id: "settings", icon: Settings, path: "/settings", label: "Control" },
  ];

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar relative z-10">
        <Outlet />
      </div>

      {devMode && (
        <div
          className="absolute top-3 right-3 z-50 px-3 py-1 rounded-full text-[10px] tracking-widest"
          style={{ fontFamily: 'monospace', background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.4)', color: '#39ff14' }}
        >
          DEV MODE ON
        </div>
      )}

      <nav
        className="absolute bottom-0 w-full flex justify-around items-center z-50 rounded-t-3xl px-1 py-3"
        style={{
          background: 'rgba(8,2,22,0.88)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderTop: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 relative"
              style={isActive ? { background: 'rgba(139,92,246,0.18)' } : {}}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(196,132,252,0.22) 0%, transparent 70%)' }}
                />
              )}
              <Icon
                size={21}
                className="relative z-10 transition-all duration-300"
                style={{
                  color: isActive ? '#c084fc' : 'rgba(255,255,255,0.32)',
                  filter: isActive ? 'drop-shadow(0 0 7px rgba(192,132,252,0.85))' : 'none',
                  strokeWidth: isActive ? 2 : 1.5,
                }}
              />
              <span
                className="text-[9px] font-medium relative z-10 tracking-wide"
                style={{ color: isActive ? '#c084fc' : 'rgba(255,255,255,0.28)' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
