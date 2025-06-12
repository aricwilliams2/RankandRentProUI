import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { CRMLead } from '../../types/leads';
import StatusBadge from './StatusBadge';

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  lead: CRMLead | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LeadModal({ open, onClose, lead, onEdit, onDelete }: LeadModalProps) {
  if (!lead) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                fontSize: '1.25rem',
              }}
            >
              {getInitials(lead.name)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {lead.name}
              </Typography>
              <StatusBadge status={lead.status} size="medium" />
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                CONTACT INFORMATION
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Mail size={20} color="#666" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {lead.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone size={20} color="#666" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {lead.phone}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Building size={20} color="#666" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Company
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {lead.company}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                LEAD DETAILS
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Calendar size={20} color="#666" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(lead.created_at)}
                    </Typography>
                  </Box>
                </Box>
                
                {lead.updated_at && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Calendar size={20} color="#666" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(lead.updated_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {lead.notes && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FileText size={20} color="#666" />
                  <Typography variant="subtitle2" color="text.secondary">
                    NOTES
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {lead.notes}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<Edit2 size={16} />}
          onClick={onEdit}
        >
          Edit Lead
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={16} />}
          onClick={onDelete}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}