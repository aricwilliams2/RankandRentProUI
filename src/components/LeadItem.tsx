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

  return (
    <tr ref={ref} className={`border-b transition-colors cursor-pointer hover:bg-blue-50 ${lead.contacted ? "bg-green-50/50" : "bg-white"}`} onClick={handleRowClick}>
      <td className="p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>{lead.contacted && <Check className="w-3 h-3 text-white" />}</div>
          <div>
            <div className="font-medium">{lead.name}</div>
          </div>
        </div>
      </td>
      <td className="p-3 sm:p-4">
        <div className="mt-1">
          <StarRating reviews={lead.reviews} />
        </div>
      </td>
      <td className="p-3 sm:p-4">
        <button onClick={handleCallClick} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors group">
          <Phone className="w-4 h-4 mr-1.5 group-hover:animate-pulse" />
          <span className="border-b border-blue-300 group-hover:border-blue-600">{lead.phone ? lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "No phone"}</span>
        </button>
      </td>
      <td className="p-3 sm:p-4">
        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors" onClick={(e) => e.stopPropagation()}>
          <ExternalLink className="w-4 h-4 mr-1.5" />
          <span className="border-b border-blue-300 hover:border-blue-600">Visit Website</span>
        </a>
      </td>
    </tr>
  );
});

LeadItem.displayName = "LeadItem";

export default LeadItem;
