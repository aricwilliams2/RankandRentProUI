import React from "react";
import { useLeadContext } from "../contexts/LeadContext";
import { Map } from "lucide-react";

const AreaSelector: React.FC = () => {
  const { areas, currentArea, setCurrentArea } = useLeadContext();

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-800">Select Area</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {areas.map((area) => (
          <button key={area.id} onClick={() => setCurrentArea(area.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentArea === area.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            {area.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AreaSelector;
