import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider
} from '@mui/material';
import {
  DevicesOther as DevicesIcon,
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
  Warning as NoDataIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
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
      
      if (response.data && response.data.status === 'success') {
        setDeviceStats(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch device statistics');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'warning';
      case 'no_data':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <OnlineIcon />;
      case 'offline':
        return <OfflineIcon />;
      case 'no_data':
        return <NoDataIcon />;
      default:
        return <DevicesIcon />;
    }
  };

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
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Device Statistics
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

      {/* Last Updated Info */}
      {lastUpdated && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DevicesIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Devices</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {deviceStats?.total_devices || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <OnlineIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Online</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {deviceStats?.online_devices || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <OfflineIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Offline</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {deviceStats?.offline_devices || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NoDataIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">No Data</Typography>
              </Box>
              <Typography variant="h3" color="error.main">
                {deviceStats?.no_data_devices || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Query Time:</Typography>
                <Typography variant="body2">
                  {deviceStats?.query_time ? new Date(deviceStats.query_time).toLocaleString() : 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Offline Threshold:</Typography>
                <Typography variant="body2">
                  {deviceStats?.offline_threshold_minutes || 0} minutes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Health Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Online Rate:</Typography>
                  <Chip
                    label={`${deviceStats?.total_devices > 0 ? ((deviceStats?.online_devices / deviceStats?.total_devices) * 100).toFixed(1) : 0}%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Offline Rate:</Typography>
                  <Chip
                    label={`${deviceStats?.total_devices > 0 ? ((deviceStats?.offline_devices / deviceStats?.total_devices) * 100).toFixed(1) : 0}%`}
                    color="warning"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">No Data Rate:</Typography>
                  <Chip
                    label={`${deviceStats?.total_devices > 0 ? ((deviceStats?.no_data_devices / deviceStats?.total_devices) * 100).toFixed(1) : 0}%`}
                    color="error"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Devices Table (if devices array is available) */}
      {deviceStats?.devices && deviceStats.devices.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Device Status (Top 10)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Device Tag ID</TableCell>
                    <TableCell>Vehicle Reg No</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell>District</TableCell>
                    <TableCell>State</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deviceStats.devices.slice(0, 10).map((device, index) => (
                    <TableRow key={device.device_tag_id || index}>
                      <TableCell>{device.device_tag_id}</TableCell>
                      <TableCell>{device.vehicle_reg_no}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(device.device_status)}
                          label={device.device_status}
                          color={getStatusColor(device.device_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>{device.location_details?.district || 'N/A'}</TableCell>
                      <TableCell>{device.location_details?.state || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DeviceStats;
