import React, { forwardRef, useState } from "react";
import { ExternalLink, Phone, Check, MessageSquare, Calendar, X, ChevronDown, ChevronUp, Clock, AlertTriangle, Edit } from "lucide-react";
import StarRating from "./StarRating";
import { Lead, CallLog } from "../types";
import { useLeadContext } from "../contexts/LeadContext";

interface LeadItemProps {
  lead: Lead;
  index: number;
}

const LeadItem = forwardRef<HTMLTableRowElement, LeadItemProps>(({ lead, index }, ref) => {
  const { setLastCalledIndex, toggleContactStatus, addCallLog } = useLeadContext();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callOutcome, setCallOutcome] = useState<CallLog['outcome']>('follow_up_1_day');
  const [callNotes, setCallNotes] = useState('');

  const handleCallLogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastCalledIndex(index);
    setShowCallDialog(true);
  };

  const handleRowClick = () => {
    toggleContactStatus(lead.id);
  };

  const handleSubmitCallLog = () => {
    if (callNotes.trim()) {
      addCallLog(lead.id, {
        outcome: callOutcome,
        notes: callNotes.trim()
      });
      
      setCallNotes('');
      setCallOutcome('follow_up_1_day');
      setShowCallDialog(false);
    }
  };

  const handleCloseDialog = () => {
    setShowCallDialog(false);
    setCallNotes('');
    setCallOutcome('follow_up_1_day');
  };

  const getOutcomeLabel = (outcome: CallLog['outcome']) => {
    const labels = {
      follow_up_1_day: 'Follow up in 1 day',
      follow_up_72_hours: 'Follow up in 72 hours',
      follow_up_next_week: 'Follow up next week',
      follow_up_next_month: 'Follow up next month',
      follow_up_3_months: 'Follow up in 3 months'
    };
    return labels[outcome] || outcome;
  };

  const getOutcomeColor = (outcome: CallLog['outcome']) => {
    switch (outcome) {
      case 'follow_up_1_day':
        return 'text-red-600 bg-red-50';
      case 'follow_up_72_hours':
        return 'text-orange-600 bg-orange-50';
      case 'follow_up_next_week':
        return 'text-yellow-600 bg-yellow-50';
      case 'follow_up_next_month':
        return 'text-blue-600 bg-blue-50';
      case 'follow_up_3_months':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getNextFollowUp = () => {
    if (!lead.callLogs || lead.callLogs.length === 0) return null;
    
    const latestLog = lead.callLogs
      .sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())[0];
    
    return latestLog.nextFollowUp ? new Date(latestLog.nextFollowUp) : null;
  };

  const nextFollowUp = getNextFollowUp();
  const isFollowUpDue = nextFollowUp && nextFollowUp <= new Date();

  // Mobile card layout
  const MobileCard = () => (
    <div 
      className={`cursor-pointer transition-colors ${lead.contacted ? "bg-green-50/50" : "bg-white"} ${isFollowUpDue ? "border-l-4 border-orange-400" : ""}`}
      onClick={handleRowClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>
            {lead.contacted && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate flex items-center gap-2">
              {lead.name}
              {isFollowUpDue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="mt-1">
              <StarRating reviews={lead.reviews} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {lead.phone && (
          <div className="flex items-center justify-between">
            <a 
              href={lead.phone} 
              className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="border-b border-blue-300 hover:border-blue-600 truncate">
                {lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
              </span>
            </a>
            <button 
              onClick={handleCallLogClick} 
              className="ml-2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Log Call"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}
        
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

        {lead.callLogs && lead.callLogs.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCallHistory(!showCallHistory);
            }}
            className="flex items-center text-gray-600 font-medium hover:text-gray-800 transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{lead.callLogs.length} call{lead.callLogs.length > 1 ? 's' : ''}</span>
            {showCallHistory ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
        )}

        {isFollowUpDue && (
          <div className="flex items-center text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3 mr-1" />
            Follow-up due
          </div>
        )}
      </div>

      {/* Call History */}
      {showCallHistory && lead.callLogs && lead.callLogs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2">
            {lead.callLogs
              .sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())
              .slice(0, 3)
              .map((log) => (
                <div key={log.id} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(log.outcome)}`}>
                      {getOutcomeLabel(log.outcome)}
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.callDate).toLocaleDateString()}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-gray-700 mt-1">{log.notes}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Desktop table row layout
  const TableRow = () => (
    <>
      <tr 
        ref={ref} 
        className={`border-b transition-colors cursor-pointer hover:bg-blue-50 ${lead.contacted ? "bg-green-50/50" : "bg-white"} ${isFollowUpDue ? "border-l-4 border-orange-400" : ""}`} 
        onClick={handleRowClick}
      >
        <td className="p-3 lg:p-4">
          <div className="flex items-start gap-2">
            <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>
              {lead.contacted && <Check className="w-3 h-3 text-white" />}
            </div>
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                {lead.name}
                {isFollowUpDue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
              </div>
            </div>
          </div>
        </td>
        <td className="p-3 lg:p-4">
          <div className="mt-1">
            <StarRating reviews={lead.reviews} />
          </div>
        </td>
        <td className="p-3 lg:p-4">
          {lead.phone ? (
            <a 
              href={lead.phone} 
              className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors group text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4 mr-1.5 group-hover:animate-pulse" />
              <span className="border-b border-blue-300 group-hover:border-blue-600">
                {lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
              </span>
            </a>
          ) : (
            <span className="text-gray-400 text-sm">No phone</span>
          )}
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
        <td className="p-3 lg:p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCallLogClick}
              className="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm px-2 py-1 rounded"
              title="Log Call"
            >
              <Edit className="w-4 h-4 mr-1" />
              <span>Log Call</span>
            </button>
            {isFollowUpDue && (
              <div className="flex items-center text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
                <Clock className="w-3 h-3 mr-1" />
                Due
              </div>
            )}
          </div>
        </td>
        <td className="p-3 lg:p-4">
          <div className="flex items-center gap-2">
            {lead.callLogs && lead.callLogs.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCallHistory(!showCallHistory);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>{lead.callLogs.length}</span>
                {showCallHistory ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Call History Row */}
      {showCallHistory && lead.callLogs && lead.callLogs.length > 0 && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="p-3 lg:p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Call History</h4>
              {lead.callLogs
                .sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())
                .map((log) => (
                  <div key={log.id} className="flex justify-between items-start bg-white p-3 rounded border text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(log.outcome)}`}>
                          {getOutcomeLabel(log.outcome)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(log.callDate).toLocaleString()}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-gray-700 mt-1">{log.notes}</p>
                      )}
                      {log.nextFollowUp && (
                        <div className="flex items-center text-blue-600 text-xs mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Follow up: {new Date(log.nextFollowUp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );

  // Return mobile card for small screens, table row for larger screens
  const isMobile = window.innerWidth < 640;

  return (
    <>
      {isMobile ? <MobileCard /> : <TableRow />}
      
      {/* Call Logging Dialog - Simplified and separate */}
      {showCallDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseDialog}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Log Call - {lead.name}</h3>
              <button
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Schedule
                </label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value as CallLog['outcome'])}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="follow_up_1_day">Follow up in 1 day</option>
                  <option value="follow_up_72_hours">Follow up in 72 hours</option>
                  <option value="follow_up_next_week">Follow up next week</option>
                  <option value="follow_up_next_month">Follow up next month</option>
                  <option value="follow_up_3_months">Follow up in 3 months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Notes *
                </label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Enter notes about the call..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  style={{ direction: 'ltr' }}
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCloseDialog}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCallLog}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!callNotes.trim()}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

LeadItem.displayName = "LeadItem";

export default LeadItem;