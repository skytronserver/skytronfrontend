import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Chip, Button, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DynamicDatatables from '../../datatables/DynamicDatatables';
import DeviceRenewalService from '../../services/DeviceRenewalService';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../store/constant';

const RenewalHistory = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page: 1, page_size: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await DeviceRenewalService.getRenewalHistory(params);
      if (res.data?.status === 'success') {
        setHistory(res.data.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch renewal history', error);
      showToast('Failed to load renewal history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'success';
      case 'rejected': return 'warning';
      case 'failed': return 'error';
      case 'pending': return 'primary';
      default: return 'default';
    }
  };

  const columns = [
    { name: "device_imei", label: "IMEI" },
    { name: "device_iccid", label: "ICCID" },
    { name: "requested_by_name", label: "Requested By" },
    { name: "requester_role", label: "Role" },
    { name: "requested_duration_years", label: "Years" },
    { name: "old_esim_validity", label: "Old Expiry", options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }},
    { name: "new_esim_validity", label: "New Expiry", options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }},
    { name: "status", label: "Status", options: {
        customBodyRender: (value) => (
          <Chip label={value.toUpperCase()} color={getStatusColor(value)} size="small" />
        )
    }},
    { name: "rejection_reason", label: "Reason" },
    { name: "created_at", label: "Date", options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }},
    {
      name: "Action",
      label: "Certificate",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const record = history[tableMeta.rowIndex];
          if (record.status === 'success' && record.certificate_file_path) {
            return (
              <Button 
                variant="outlined" 
                size="small" 
                href={`${BASE_URL}/${record.certificate_file_path}`} 
                target="_blank"
              >
                Download
              </Button>
            );
          }
          return 'N/A';
        },
      },
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} sm={4} md={3}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-filter-label">Filter by Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        {loading ? (
          <CircularProgress />
        ) : (
          <DynamicDatatables 
            tableTitle="Device Renewal History" 
            rows={history} 
            columns={columns} 
          />
        )}
      </Grid>
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default RenewalHistory;
