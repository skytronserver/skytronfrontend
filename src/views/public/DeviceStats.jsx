import React, { useState, useEffect, useMemo } from 'react';
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
  const [deviceStats, setDeviceStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDeviceStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the public device health status API
      const response = await publicApi.getDeviceHealthStatusPublic();
      const data = response?.data;

      if (data && typeof data === 'object') {
        setDeviceStats(data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch manufacturer statistics');
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
  const manufacturers = deviceStats?.manufacturers || [];

  const aggregatedStats = useMemo(() => {
    const initial = {
      m2mServiceProviders: deviceStats?.total_m2m_providers || 0,
      deviceManufacturers: deviceStats?.total_manufacturers || manufacturers.length || 0,
      totalModels: 0,
      totalStock: 0,
      totalDeviceTags: 0,
      totalOnlineDevices: 0,
      totalOfflineDevices: 0,
    };

    return manufacturers.reduce((acc, manufacturer) => {
      const models = manufacturer?.models || [];
      const manufacturerTotals = models.reduce(
        (modelAcc, model) => ({
          totalStock: modelAcc.totalStock + (model?.total_stock || 0),
          totalDeviceTags: modelAcc.totalDeviceTags + (model?.total_device_tags || 0),
          totalOnlineDevices: modelAcc.totalOnlineDevices + (model?.online_devices || 0),
          totalOfflineDevices: modelAcc.totalOfflineDevices + (model?.offline_devices || 0),
        }),
        { totalStock: 0, totalDeviceTags: 0, totalOnlineDevices: 0, totalOfflineDevices: 0 }
      );

      acc.totalModels += manufacturer?.total_models ?? models.length;
      acc.totalStock += manufacturerTotals.totalStock;
      acc.totalDeviceTags += manufacturerTotals.totalDeviceTags;
      acc.totalOnlineDevices += manufacturerTotals.totalOnlineDevices;
      acc.totalOfflineDevices += manufacturerTotals.totalOfflineDevices;
      return acc;
    }, initial);
  }, [deviceStats, manufacturers]);

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
                {aggregatedStats.m2mServiceProviders}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Device Manufacturer
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {aggregatedStats.deviceManufacturers}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Device Models
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {aggregatedStats.totalModels}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Stock
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {aggregatedStats.totalStock}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Tagged Device
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {aggregatedStats.totalDeviceTags}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Online
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {aggregatedStats.totalOnlineDevices}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                Total Offline
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {aggregatedStats.totalOfflineDevices}
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
                    <TableCell>{manufacturer.address || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.gstnnumber || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.contact_number || manufacturer.phone || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.email || 'N/A'}</TableCell>
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
