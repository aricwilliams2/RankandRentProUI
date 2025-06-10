import React, { forwardRef } from "react";
import { ExternalLink, Phone, Check } from "lucide-react";
import StarRating from "./StarRating";
import { Lead } from "../types";
import { useLeadContext } from "../contexts/LeadContext";

interface LeadItemProps {
  lead: Lead;
  index: number;
}

const LeadItem = forwardRef<HTMLTableRowElement, LeadItemProps>(({ lead, index }, ref) => {
  const { setLastCalledIndex, toggleContactStatus } = useLeadContext();

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastCalledIndex(index);
    window.location.href = `tel:${lead.phone}`;
  };

  const handleRowClick = () => {
    toggleContactStatus(lead.id);
  };

  // Mobile card layout
  const MobileCard = () => (
    <div 
      className={`cursor-pointer transition-colors ${lead.contacted ? "bg-green-50/50" : "bg-white"}`}
      onClick={handleRowClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>
            {lead.contacted && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{lead.name}</div>
            <div className="mt-1">
              <StarRating reviews={lead.reviews} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <button 
          onClick={handleCallClick} 
          className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm w-full justify-start"
        >
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="border-b border-blue-300 hover:border-blue-600 truncate">
            {lead.phone ? lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "No phone"}
          </span>
        </button>
        
        <a 
          href={lead.website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="border-b border-blue-300 hover:border-blue-600 truncate">Visit Website</span>
        </a>
      </div>
    </div>
  );

  // Desktop table row layout
  const TableRow = () => (
    <tr 
      ref={ref} 
      className={`border-b transition-colors cursor-pointer hover:bg-blue-50 ${lead.contacted ? "bg-green-50/50" : "bg-white"}`} 
      onClick={handleRowClick}
    >
      <td className="p-3 lg:p-4">
        <div className="flex items-start gap-2">
          <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>
            {lead.contacted && <Check className="w-3 h-3 text-white" />}
          </div>
          <div>
            <div className="font-medium text-sm">{lead.name}</div>
          </div>
        </div>
      </td>
      <td className="p-3 lg:p-4">
        <div className="mt-1">
          <StarRating reviews={lead.reviews} />
        </div>
      </td>
      <td className="p-3 lg:p-4">
        <button 
          onClick={handleCallClick} 
          className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors group text-sm"
        >
          <Phone className="w-4 h-4 mr-1.5 group-hover:animate-pulse" />
          <span className="border-b border-blue-300 group-hover:border-blue-600">
            {lead.phone ? lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "No phone"}
          </span>
        </button>
      </td>
      <td className="p-3 lg:p-4">
        <a 
          href={lead.website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm" 
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4 mr-1.5" />
          <span className="border-b border-blue-300 hover:border-blue-600">Visit Website</span>
        </a>
      </td>
    </tr>
  );

  // Return mobile card for small screens, table row for larger screens
  return window.innerWidth < 640 ? <MobileCard /> : <TableRow />;
});

LeadItem.displayName = "LeadItem";

export default LeadItem;