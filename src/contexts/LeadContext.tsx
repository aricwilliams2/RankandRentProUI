import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Lead, LeadContextType, Filters, AreaData, SortField, SortDirection, CallLog } from '../types';
import { areaData } from '../data/areas';

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const initialFilters: Filters = {
  showContactedOnly: false
};

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get current area from localStorage or default to first area
  const [currentArea, setCurrentAreaState] = useState<string>(() => {
    const savedArea = localStorage.getItem('currentArea');
    return savedArea || areaData[0].id;
  });

  // Get leads for the current area from localStorage or default to area data
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem(`leads_${currentArea}`);
    if (savedLeads) {
      return JSON.parse(savedLeads);
    }
    return areaData.find(area => area.id === currentArea)?.leads || [];
  });
  
  const [lastCalledIndex, setLastCalledIndex] = useState<number | null>(() => {
    const savedIndex = localStorage.getItem(`lastCalledIndex_${currentArea}`);
    return savedIndex ? parseInt(savedIndex, 10) : null;
  });

  const [filters, setFilters] = useState<Filters>(initialFilters);
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField | null>("reviews");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Set current area and load leads for that area
  const setCurrentArea = (areaId: string) => {
    setCurrentAreaState(areaId);
    const savedLeads = localStorage.getItem(`leads_${areaId}`);
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      const areaLeads = areaData.find(area => area.id === areaId)?.leads || [];
      setLeads(areaLeads);
    }
    // Reset filters when changing area
    setFilters(initialFilters);
    // Reset last called index
    setLastCalledIndex(null);
    // Reset sorting
    setSortField("reviews");
    setSortDirection("desc");
  };

  // Save current area to localStorage
  useEffect(() => {
    localStorage.setItem('currentArea', currentArea);
  }, [currentArea]);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`leads_${currentArea}`, JSON.stringify(leads));
  }, [leads, currentArea]);

  // Save last called index to localStorage
  useEffect(() => {
    if (lastCalledIndex !== null) {
      localStorage.setItem(`lastCalledIndex_${currentArea}`, lastCalledIndex.toString());
    }
  }, [lastCalledIndex, currentArea]);

  // Toggle contact status for a lead
  const toggleContactStatus = (id: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === id ? { ...lead, contacted: !lead.contacted } : lead
      )
    );
  };

  // Add call log function
  const addCallLog = (leadId: string, callLogData: Omit<CallLog, 'id' | 'leadId' | 'callDate'>) => {
    const newCallLog: CallLog = {
      id: `call_${Date.now()}`,
      leadId,
      callDate: new Date(),
      ...callLogData,
      nextFollowUp: callLogData.nextFollowUp || calculateNextFollowUp(callLogData.outcome)
    };

    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              callLogs: [...(lead.callLogs || []), newCallLog],
              contacted: true // Mark as contacted when a call is logged
            }
          : lead
      )
    );
  };

  // Helper function to calculate next follow-up date based on outcome
  const calculateNextFollowUp = (outcome: CallLog['outcome']): Date | undefined => {
    const now = new Date();
    const nextDate = new Date(now);

    switch (outcome) {
      case 'follow_up_24h':
        nextDate.setDate(now.getDate() + 1);
        return nextDate;
      case 'follow_up_72h':
        nextDate.setDate(now.getDate() + 3);
        return nextDate;
      case 'follow_up_next_week':
        nextDate.setDate(now.getDate() + 7);
        return nextDate;
      case 'follow_up_next_month':
        nextDate.setMonth(now.getMonth() + 1);
        return nextDate;
      case 'follow_up_3_months':
        nextDate.setMonth(now.getMonth() + 3);
        return nextDate;
      default:
        return undefined;
    }
  };

  // Clear cache for current area
  const clearCache = () => {
    localStorage.removeItem(`leads_${currentArea}`);
    localStorage.removeItem(`lastCalledIndex_${currentArea}`);
    
    const areaLeads = areaData.find(area => area.id === currentArea)?.leads || [];
    setLeads(areaLeads);
    setLastCalledIndex(null);
    setFilters(initialFilters);
    setSortField("reviews");
    setSortDirection("desc");
  };

  // Handle sorting by toggling field and direction
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    // First filter by showContactedOnly
    let result = leads.filter(lead => {
      if (filters.showContactedOnly && !lead.contacted) {
        return false;
      }
      return true;
    });

    // Then sort if a sort field is selected
    if (sortField) {
      result = [...result].sort((a, b) => {
        let valueA: string | number = '';
        let valueB: string | number = '';

        // Get values based on sort field
        if (sortField === 'name') {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        } else if (sortField === 'reviews') {
          // Use absolute values for reviews to handle negative values
          valueA = Math.abs(a.reviews);
          valueB = Math.abs(b.reviews);
        } else if (sortField === 'phone') {
          valueA = a.phone;
          valueB = b.phone;
        } else if (sortField === 'website') {
          valueA = a.website.toLowerCase();
          valueB = b.website.toLowerCase();
        }

        // For strings, use localeCompare
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        
        // For numbers
        if (sortDirection === 'asc') {
          return (valueA as number) - (valueB as number);
        } else {
          return (valueB as number) - (valueA as number);
        }
      });
    }

    return result;
  }, [leads, filters, sortField, sortDirection]);

  return (
    <LeadContext.Provider value={{ 
      leads,
      setLeads,
      lastCalledIndex, 
      setLastCalledIndex,
      toggleContactStatus,
      clearCache,
      filters,
      setFilters,
      filteredLeads,
      areas: areaData,
      currentArea,
      setCurrentArea,
      sortField,
      setSortField,
      sortDirection,
      setSortDirection,
      handleSort,
      addCallLog
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadContext = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeadContext must be used within a LeadProvider');
  }
  return context;
};