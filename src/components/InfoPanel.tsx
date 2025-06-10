import React from "react";
import { Info, CheckCircle } from "lucide-react";
import { useLeadContext } from "../contexts/LeadContext";

const InfoPanel: React.FC = () => {
  const { leads, filteredLeads, currentArea, areas } = useLeadContext();
  const contactedCount = filteredLeads.filter((lead) => lead.contacted).length;
  const totalLeads = filteredLeads.length;
  const progressPercentage = totalLeads > 0 ? (contactedCount / totalLeads) * 100 : 0;

  // Find current area name
  const currentAreaName = areas.find((area) => area.id === currentArea)?.name || "";

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full flex-shrink-0">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">{currentAreaName} Progress Tracking</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Track your contacted leads and overall progress</p>

          <div className="mt-3 sm:mt-4 flex items-center justify-between mb-1">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Contacted Leads</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700 text-right">
              {contactedCount} of {totalLeads}
              {filteredLeads.length !== leads.length && (
                <div className="text-xs text-gray-500">(filtered from {leads.length} total)</div>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
            <div 
              className="bg-green-500 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-gray-600">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 sm:mr-1.5 flex-shrink-0" />
            <span className="leading-tight">
              {contactedCount === 0 
                ? "Start contacting leads by clicking on any row" 
                : contactedCount === totalLeads 
                ? "Great job! You've contacted all leads" 
                : `${totalLeads - contactedCount} leads remaining`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;