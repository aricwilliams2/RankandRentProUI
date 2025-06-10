import React from "react";
import { Phone, RefreshCw } from "lucide-react";
import { useLeadContext } from "../contexts/LeadContext";

const Header: React.FC = () => {
  const { clearCache, currentArea, areas } = useLeadContext();
  const currentAreaName = areas.find((area) => area.id === currentArea)?.name || "";

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Phone className="h-6 w-6" />
          <h1 className="text-xl sm:text-2xl font-bold">LeadTracker</h1>
          {currentAreaName && <span className="text-white/80 text-sm sm:text-base ml-2 px-2.5 py-0.5 bg-white/10 rounded-full">{currentAreaName}</span>}
        </div>
        <div className="flex items-center">
          <span className="hidden sm:inline mr-4">Your Sales Leads Dashboard</span>
          <button onClick={clearCache} className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors" title="Reset data for current area">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
