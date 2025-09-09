import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";
import { Link, useLocation } from "wouter";

const TabBar = () => {
  const [location] = useLocation();
  const validConfig = useConfigStoreWithSelectors((state) => state.validConfig);

  const tabs = [
    { path: "/", label: "Watch", icon: "👁️" },
    { path: "/list", label: "List", icon: "📋" },
    { path: "/voice-groups", label: "Voice Groups", icon: "🎵" },
  ];

  return (
    <div className={`flex border-b border-gray-200 mb-4`}>
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          href={tab.path}
          className={` ${validConfig ? "pointer-events-auto" : "opacity-50 pointer-events-none"}`}
          aria-disabled={!validConfig}
        >
          <div
            className={`px-4 py-2 cursor-pointer transition-colors ${
              location === tab.path
                ? "bg-blue-100 text-blue-800 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TabBar;
