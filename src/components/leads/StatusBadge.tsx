import React from 'react';
import { Chip } from '@mui/material';
import {
  AlertCircle,
  Phone,
  CheckCircle,
  Trophy,
  XCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'New':
        return {
          color: 'info' as const,
          icon: <AlertCircle size={14} />,
          label: 'New',
        };
      case 'Contacted':
        return {
          color: 'warning' as const,
          icon: <Phone size={14} />,
          label: 'Contacted',
        };
      case 'Qualified':
        return {
          color: 'primary' as const,
          icon: <CheckCircle size={14} />,
          label: 'Qualified',
        };
      case 'Converted':
        return {
          color: 'success' as const,
          icon: <Trophy size={14} />,
          label: 'Converted',
        };
      case 'Lost':
        return {
          color: 'error' as const,
          icon: <XCircle size={14} />,
          label: 'Lost',
        };
      default:
        return {
          color: 'default' as const,
          icon: <AlertCircle size={14} />,
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      size={size}
      label={config.label}
      color={config.color}
      icon={config.icon}
      variant="filled"
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: '14px',
        },
      }}
    />
  );
}