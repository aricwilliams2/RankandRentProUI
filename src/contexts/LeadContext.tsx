import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { Lead, LeadContextType, Filters, AreaData, SortField, SortDirection, CallLog } from "../types";

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const initialFilters: Filters = {
  showContactedOnly: false,
};

// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000/api";

// Transform API lead data to frontend format
const transformAPILeadToFrontend = (apiLead: any): Lead => {
  return {
    id: apiLead.id,
    name: apiLead.name,
    reviews: apiLead.reviews,
    phone: apiLead.phone,
    website: apiLead.website,
    contacted: apiLead.contacted === 1,
    callLogs: [],
    createdAt: new Date(apiLead.created_at),
    updatedAt: new Date(apiLead.updated_at),
    city: apiLead.city,
    follow_up_at: apiLead.follow_up_at ?? null,
    notes: apiLead.notes ?? null,
  };
};

// Transform lead data for API (frontend -> backend format)
const transformLeadForAPI = (lead: Lead) => {
  return {
    id: lead.id,
    name: lead.name,
    reviews: lead.reviews,
    phone: lead.phone,
    website: lead.website,
    contacted: lead.contacted ? 1 : 0,
    follow_up_at: lead.follow_up_at, // Handled through call logs now
    notes: lead.notes, // Handled through call logs now
    created_at: lead.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// API call to fetch leads
const fetchLeadsAPI = async (): Promise<Lead[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const apiLeads = await response.json();
    return apiLeads.map(transformAPILeadToFrontend);
  } catch (error) {
    console.error("Failed to fetch leads from API:", error);
    throw error;
  }
};

// API call to update lead
const updateLeadAPI = async (lead: Lead) => {
  try {
    const leadData = transformLeadForAPI(lead);
    const response = await fetch(`${API_BASE_URL}/leads/${lead.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update lead via API:", error);
    throw error;
  }
};

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current area from localStorage or default to first available city
  const [currentArea, setCurrentAreaState] = useState<string>(() => {
    return localStorage.getItem("currentArea") || "";
  });

  const [lastCalledIndex, setLastCalledIndex] = useState<number | null>(() => {
    const savedIndex = localStorage.getItem(`lastCalledIndex_${currentArea}`);
    return savedIndex ? parseInt(savedIndex, 10) : null;
  });

  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Sorting states
  const [sortField, setSortField] = useState<SortField | null>("reviews");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Create areas from API data (group by city)
  const areas = useMemo<AreaData[]>(() => {
    const cityGroups = allLeads.reduce((acc, lead) => {
      const city = (lead as any).city || "Unknown";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);

    return Object.entries(cityGroups).map(([city, leads]) => ({
      id: city.toLowerCase().replace(/\s+/g, "-"),
      name: city,
      leads,
    }));
  }, [allLeads]);

  // Get leads for current area
  const leads = useMemo(() => {
    if (!currentArea) return [];
    const area = areas.find((a) => a.id === currentArea);
    return area?.leads || [];
  }, [areas, currentArea]);

  // Load leads from API on component mount
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load call logs from localStorage (since they're managed locally)
        const savedCallLogs = localStorage.getItem("callLogs");
        const callLogsMap = savedCallLogs ? JSON.parse(savedCallLogs) : {};

        const apiLeads = await fetchLeadsAPI();

        // Merge with saved call logs
        const leadsWithCallLogs = apiLeads.map((lead) => ({
          ...lead,
          callLogs:
            callLogsMap[lead.id]?.map((log: any) => ({
              ...log,
              callDate: new Date(log.callDate),
              nextFollowUp: log.nextFollowUp ? new Date(log.nextFollowUp) : undefined,
            })) || [],
        }));

        setAllLeads(leadsWithCallLogs);

        // Set default area if not set
        if (!currentArea && leadsWithCallLogs.length > 0) {
          const firstCity = (leadsWithCallLogs[0] as any).city;
          if (firstCity) {
            const firstAreaId = firstCity.toLowerCase().replace(/\s+/g, "-");
            setCurrentAreaState(firstAreaId);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  // Set current area and update localStorage
  const setCurrentArea = (areaId: string) => {
    setCurrentAreaState(areaId);
    localStorage.setItem("currentArea", areaId);

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
    if (currentArea) {
      localStorage.setItem("currentArea", currentArea);
    }
  }, [currentArea]);

  // Save call logs to localStorage whenever they change
  useEffect(() => {
    const callLogsMap = allLeads.reduce((acc, lead) => {
      if (lead.callLogs && lead.callLogs.length > 0) {
        acc[lead.id] = lead.callLogs;
      }
      return acc;
    }, {} as Record<string, CallLog[]>);

    localStorage.setItem("callLogs", JSON.stringify(callLogsMap));
  }, [allLeads]);

  // Save last called index to localStorage
  useEffect(() => {
    if (lastCalledIndex !== null) {
      localStorage.setItem(`lastCalledIndex_${currentArea}`, lastCalledIndex.toString());
    }
  }, [lastCalledIndex, currentArea]);

  // Toggle contact status for a lead
  const toggleContactStatus = async (id: string) => {
    const lead = allLeads.find((l) => l.id === id);
    if (!lead) return;

    const updatedLead = { ...lead, contacted: !lead.contacted };

    try {
      // Update API first
      await updateLeadAPI(updatedLead);

      // Update local state on success
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === id ? updatedLead : lead)));
    } catch (error) {
      console.error("Failed to update contacted status:", error);
      setError("Failed to update lead status");
    }
  };

  // Add call log function
  const addCallLog = async (leadId: string, callLogData: Omit<CallLog, "id" | "leadId" | "callDate">) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;

    const newCallLog: CallLog = {
      id: `call_${Date.now()}`,
      leadId,
      callDate: new Date(),
      ...callLogData,
      nextFollowUp: callLogData.nextFollowUp || calculateNextFollowUp(callLogData.outcome),
    };

    const updatedLead = {
      ...lead,
      callLogs: [...(lead.callLogs || []), newCallLog],
      contacted: true, // Mark as contacted when a call is logged
    };

    try {
      // Update API first (just the contacted status)
      await updateLeadAPI(updatedLead);

      // Update local state on success
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead)));
    } catch (error) {
      console.error("Failed to add call log:", error);
      setError("Failed to add call log");
    }
  };

  // Update call log function
  const updateCallLog = async (leadId: string, callLogId: string, updateData: Partial<Pick<CallLog, "outcome" | "notes">>) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;

    const updatedLead = {
      ...lead,
      callLogs:
        lead.callLogs?.map((log) =>
          log.id === callLogId
            ? {
                ...log,
                ...updateData,
                nextFollowUp: updateData.outcome ? calculateNextFollowUp(updateData.outcome) : log.nextFollowUp,
              }
            : log
        ) || [],
    };

    try {
      // Update API first (contacted status might change)
      await updateLeadAPI(updatedLead);

      // Update local state on success
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead)));
    } catch (error) {
      console.error("Failed to update call log:", error);
      setError("Failed to update call log");
    }
  };

  // Helper function to calculate next follow-up date based on outcome
  const calculateNextFollowUp = (outcome: CallLog["outcome"]): Date | undefined => {
    const now = new Date();
    const nextDate = new Date(now);

    switch (outcome) {
      case "follow_up_1_day":
        nextDate.setDate(now.getDate() + 1);
        return nextDate;
      case "follow_up_72_hours":
        nextDate.setDate(now.getDate() + 3);
        return nextDate;
      case "follow_up_next_week":
        nextDate.setDate(now.getDate() + 7);
        return nextDate;
      case "follow_up_next_month":
        nextDate.setMonth(now.getMonth() + 1);
        return nextDate;
      case "follow_up_3_months":
        nextDate.setMonth(now.getMonth() + 3);
        return nextDate;
      default:
        return undefined;
    }
  };

  // Clear cache and reload from API
  const clearCache = async () => {
    localStorage.removeItem(`lastCalledIndex_${currentArea}`);
    localStorage.removeItem("callLogs");

    try {
      setLoading(true);
      const apiLeads = await fetchLeadsAPI();
      setAllLeads(apiLeads);
      setLastCalledIndex(null);
      setFilters(initialFilters);
      setSortField("reviews");
      setSortDirection("desc");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload leads");
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting by toggling field and direction
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    // First filter by showContactedOnly
    let result = leads.filter((lead) => {
      if (filters.showContactedOnly && !lead.contacted) {
        return false;
      }
      return true;
    });

    // Then sort if a sort field is selected
    if (sortField) {
      result = [...result].sort((a, b) => {
        let valueA: string | number = "";
        let valueB: string | number = "";

        // Get values based on sort field
        if (sortField === "name") {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        } else if (sortField === "reviews") {
          // Use absolute values for reviews to handle negative values
          valueA = Math.abs(a.reviews);
          valueB = Math.abs(b.reviews);
        } else if (sortField === "phone") {
          valueA = a.phone;
          valueB = b.phone;
        } else if (sortField === "website") {
          valueA = a.website.toLowerCase();
          valueB = b.website.toLowerCase();
        }

        // For strings, use localeCompare
        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        // For numbers
        if (sortDirection === "asc") {
          return (valueA as number) - (valueB as number);
        } else {
          return (valueB as number) - (valueA as number);
        }
      });
    }

    return result;
  }, [leads, filters, sortField, sortDirection]);

  return (
    <LeadContext.Provider
      value={{
        leads,
        setLeads: () => {}, // Not used anymore, data comes from API
        lastCalledIndex,
        setLastCalledIndex,
        toggleContactStatus,
        clearCache,
        filters,
        setFilters,
        filteredLeads,
        areas,
        currentArea,
        setCurrentArea,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        handleSort,
        addCallLog,
        updateCallLog,
        loading,
        error,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadContext = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLeadContext must be used within a LeadProvider");
  }
  return context;
};
