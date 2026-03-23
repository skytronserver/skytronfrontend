import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  Card,
  Grid
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import publicApi from '../../services/publicApi';

const DeviceStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDeviceStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await publicApi.getDeviceOnboardingDashboard();
      const data = response?.data;

      if (data && typeof data === 'object') {
        setTotals(data.totals || {});
        setManufacturers(data.manufacturers || []);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch device onboarding statistics');
      }
    } catch (err) {
      console.error('Error fetching device stats:', err);
      setError(err.message || 'Failed to load device statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Device Statistics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchDeviceStats}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDeviceStats}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {lastUpdated && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>
      )}

      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                M2M Service Provider
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_esim_m2m_provider ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Device Manufacturer
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_manufacturers_with_onboarding_done ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Device Models
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_device_models_with_onboarding_done ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Stock
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_device_stock ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Tagged Device
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_tagged_device ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Online
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_online_device ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Offline
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totals?.total_offline_device ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box mb={1} mt={2}>
        <Typography variant="h6" fontWeight="bold">
          Technically Onboarded Device Manufacturer
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      <Card variant="outlined">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Address</strong></TableCell>
                <TableCell><strong>GSTN</strong></TableCell>
                <TableCell><strong>Contact Number</strong></TableCell>
                <TableCell><strong>Email ID</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {manufacturers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No manufacturers found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                manufacturers.map((manufacturer) => (
                  <TableRow hover key={manufacturer.manufacturer_id}>
                    <TableCell>{manufacturer.company_name || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.company_address || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.company_gstn || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.company_contact_no || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.company_email_id || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DeviceStats;
