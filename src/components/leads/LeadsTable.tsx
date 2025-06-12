import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  TablePagination,
} from '@mui/material';
import {
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  Phone,
  Mail,
  Calendar,
  Building,
} from 'lucide-react';
import type { CRMLead } from '../../types/leads';
import StatusBadge from './StatusBadge';

interface LeadsTableProps {
  leads: CRMLead[];
  onEdit: (lead: CRMLead) => void;
  onDelete: (id: string) => void;
  onView: (lead: CRMLead) => void;
  loading?: boolean;
}

export default function LeadsTable({ leads, onEdit, onDelete, onView, loading }: LeadsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lead: CRMLead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const paginatedLeads = leads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading leads...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Lead</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                hover
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => onView(lead)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                      }}
                    >
                      {getInitials(lead.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {lead.name}
                      </Typography>
                      {lead.notes && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {lead.notes}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Building size={16} color="#666" />
                    <Typography variant="body2">{lead.company}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={14} color="#666" />
                      <Typography variant="body2" fontSize="0.75rem">
                        {lead.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone size={14} color="#666" />
                      <Typography variant="body2" fontSize="0.75rem">
                        {lead.phone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={14} color="#666" />
                    <Typography variant="body2" fontSize="0.75rem">
                      {formatDate(lead.created_at)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, lead);
                    }}
                  >
                    <MoreVertical size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={leads.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 160 }
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedLead) onView(selectedLead);
            handleMenuClose();
          }}
        >
          <Eye size={16} style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLead) onEdit(selectedLead);
            handleMenuClose();
          }}
        >
          <Edit2 size={16} style={{ marginRight: 8 }} />
          Edit Lead
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLead) onDelete(selectedLead.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete Lead
        </MenuItem>
      </Menu>
    </Paper>
  );
}