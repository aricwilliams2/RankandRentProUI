// Lead Management Types
export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  notes: string;
  created_at: string;
  updated_at?: string;
}

export interface LeadFilters {
  search: string;
  status: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  conversionRate: number;
  avgTimeToContact: number;
}