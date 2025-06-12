import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Lead, LeadContextType, Filters, AreaData, SortField, SortDirection, CallLog } from '../types';
import { areaData } from '../data/areas';

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const initialFilters: Filters = {
  showContactedOnly: false
};

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Transform lead data for API (frontend -> backend format)
const transformLeadForAPI = (lead: Lead, followUpAt?: string) => {
  return {
    id: lead.id,
    name: lead.name,
    reviews: lead.reviews,
    phone: lead.phone,
    website: lead.website,
    contacted: lead.contacted ? 1 : 0,
    follow_up_at: followUpAt || null,
    notes: lead.notes || null,
    created_at: lead.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// API call to update lead
const updateLeadAPI = async (lead: Lead, followUpAt?: string) => {
  try {
    const leadData = transformLeadForAPI(lead, followUpAt);
    const response = await fetch(`${API_BASE_URL}/leads/${lead.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(leadData)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update lead via API:', error);
    throw error;
  }
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
      const parsedLeads = JSON.parse(savedLeads);
      // Convert date strings back to Date objects
      return parsedLeads.map((lead: any) => ({
        ...lead,
        callLogs: lead.callLogs?.map((log: any) => ({
          ...log,
          callDate: new Date(log.callDate),
          nextFollowUp: log.nextFollowUp ? new Date(log.nextFollowUp) : undefined
        })) || []
      }));
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
      const parsedLeads = JSON.parse(savedLeads);
      // Convert date strings back to Date objects
      const leadsWithDates = parsedLeads.map((lead: any) => ({
        ...lead,
        callLogs: lead.callLogs?.map((log: any) => ({
          ...log,
          callDate: new Date(log.callDate),
          nextFollowUp: log.nextFollowUp ? new Date(log.nextFollowUp) : undefined
        })) || []
      }));
      setLeads(leadsWithDates);
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
  const toggleContactStatus = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const updatedLead = { ...lead, contacted: !lead.contacted };
    
    try {
      // Update API first
      await updateLeadAPI(updatedLead);
      
      // Update local state on success
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === id ? updatedLead : lead
        )
      );
    } catch (error) {
      console.error('Failed to update contacted status:', error);
      // You might want to show a toast notification here
    }
  };

  // Update lead notes function (combines notes and follow-up)
  const updateLeadNotes = async (leadId: string, notes: string, followUpAt?: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const updatedLead = { ...lead, notes };
    
    try {
      // Update API first
      await updateLeadAPI(updatedLead, followUpAt);
      
      // Update local state on success
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        )
      );
    } catch (error) {
      console.error('Failed to update lead notes:', error);
      // You might want to show a toast notification here
    }
  };

  // Add call log function
  const addCallLog = async (leadId: string, callLogData: Omit<CallLog, 'id' | 'leadId' | 'callDate'>) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const newCallLog: CallLog = {
      id: `call_${Date.now()}`,
      leadId,
      callDate: new Date(),
      ...callLogData,
      nextFollowUp: callLogData.nextFollowUp || calculateNextFollowUp(callLogData.outcome)
    };

    const updatedLead = {
      ...lead,
      callLogs: [...(lead.callLogs || []), newCallLog],
      contacted: true // Mark as contacted when a call is logged
    };

    try {
      // Update API first
      await updateLeadAPI(updatedLead);
      
      // Update local state on success
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        )
      );
    } catch (error) {
      console.error('Failed to add call log:', error);
      // You might want to show a toast notification here
    }
  };

  // Update call log function
  const updateCallLog = async (leadId: string, callLogId: string, updateData: Partial<Pick<CallLog, 'outcome' | 'notes'>>) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const updatedLead = {
      ...lead,
      callLogs: lead.callLogs?.map(log => 
        log.id === callLogId 
          ? { 
              ...log, 
              ...updateData,
              nextFollowUp: updateData.outcome ? calculateNextFollowUp(updateData.outcome) : log.nextFollowUp
            }
          : log
      ) || []
    };

    try {
      // Update API first
      await updateLeadAPI(updatedLead);
      
      // Update local state on success
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        )
      );
    } catch (error) {
      console.error('Failed to update call log:', error);
      // You might want to show a toast notification here
    }
  };

  // Helper function to calculate next follow-up date based on outcome
  const calculateNextFollowUp = (outcome: CallLog['outcome']): Date | undefined => {
    const now = new Date();
    const nextDate = new Date(now);

    switch (outcome) {
      case 'follow_up_1_day':
        nextDate.setDate(now.getDate() + 1);
        return nextDate;
      case 'follow_up_72_hours':
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
      addCallLog,
      updateCallLog,
      updateLeadNotes
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