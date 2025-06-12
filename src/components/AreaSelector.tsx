import React from "react";
import { useLeadContext } from "../contexts/LeadContext";
import { Map, AlertCircle } from "lucide-react";

const AreaSelector: React.FC = () => {
  const { areas, currentArea, setCurrentArea, loading, error } = useLeadContext();

  if (loading) {
    return (
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Loading Cities...</h2>
        </div>
        <div className="animate-pulse">
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-20"></div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 rounded-full w-28"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          <h2 className="font-semibold text-red-800 text-sm sm:text-base">Error Loading Cities</h2>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          <h2 className="font-semibold text-gray-600 text-sm sm:text-base">No Cities Available</h2>
        </div>
        <p className="text-gray-500 text-sm">No leads found. Please check your API connection.</p>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Select City</h2>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {areas.map((area) => (
          <button 
            key={area.id} 
            onClick={() => setCurrentArea(area.id)} 
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              currentArea === area.id 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {area.name} ({area.leads.length})
          </button>
        ))}
      </div>
    </div>
  );
};

export default AreaSelector;