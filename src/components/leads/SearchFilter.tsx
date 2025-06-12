import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Paper,
  Grid,
  Typography,
} from '@mui/material';
import {
  Search,
  Filter,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';
import type { LeadFilters } from '../../types/leads';

interface SearchFilterProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Converted', label: 'Converted' },
  { value: 'Lost', label: 'Lost' },
];

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function SearchFilter({ filters, onFiltersChange, onReset }: SearchFilterProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: any) => {
    onFiltersChange({ ...filters, status: e.target.value });
  };

  const handleDateRangeChange = (e: any) => {
    onFiltersChange({ ...filters, dateRange: e.target.value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Filter size={20} />
          <Typography variant="h6" fontWeight="medium">
            Search & Filter
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              size="small"
              label={`${activeFiltersCount} active`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<RefreshCw size={16} />}
            onClick={onReset}
            variant="outlined"
          >
            Reset Filters
          </Button>
        )}
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search leads by name, email, or company..."
            value={filters.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />,
              endAdornment: filters.search ? (
                <Button
                  size="small"
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <X size={16} />
                </Button>
              ) : null,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={handleStatusChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filters.dateRange}
              label="Date Range"
              onChange={handleDateRangeChange}
              startAdornment={<Calendar size={16} style={{ marginRight: 8, color: '#666' }} />}
            >
              {dateRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}