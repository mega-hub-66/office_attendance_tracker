import { useLocation, Link } from "wouter";
import { LayoutGrid, Plus, BarChart3, Settings } from "lucide-react";

const tabs = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    path: "/log",
    label: "Log Day",
    icon: Plus,
  },
  {
    path: "/history",
    label: "History",
    icon: BarChart3,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function TabBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 tab-bar pb-safe-bottom z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button 
                className={`flex flex-col items-center p-2 space-y-1 smooth-transition ${
                  isActive 
                    ? "text-ios-blue" 
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                data-testid={`tab-${path.slice(1) || 'dashboard'}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
