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
  Card
} from '@mui/material';
import { Refresh as RefreshIcon, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import publicApi from '../../services/publicApi';

const DeviceStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceStats, setDeviceStats] = useState(null);
  const [expandedManufacturerIndex, setExpandedManufacturerIndex] = useState(null);
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
      totalManufacturers: deviceStats?.total_manufacturers || manufacturers.length || 0,
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
  const manufacturerSummary = useMemo(() => {
    return manufacturers.map((manufacturer) => {
      const models = manufacturer?.models || [];
      const totals = models.reduce(
        (acc, model) => ({
          totalStock: acc.totalStock + (model?.total_stock || 0),
          totalDeviceTags: acc.totalDeviceTags + (model?.total_device_tags || 0),
          totalOnlineDevices: acc.totalOnlineDevices + (model?.online_devices || 0),
          totalOfflineDevices: acc.totalOfflineDevices + (model?.offline_devices || 0),
        }),
        { totalStock: 0, totalDeviceTags: 0, totalOnlineDevices: 0, totalOfflineDevices: 0 }
      );

      return {
        ...manufacturer,
        models,
        aggregated: totals,
      };
    });
  }, [manufacturers]);

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
          Manufacturer & Model Statistics
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

      <Box mb={2}>
        <Typography variant="subtitle1">
          Total Manufacturers: {aggregatedStats.totalManufacturers} | Total Models: {aggregatedStats.totalModels}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Total Stock: {aggregatedStats.totalStock} | Total Tagged Devices: {aggregatedStats.totalDeviceTags}
        </Typography>
      </Box>

      <Card variant="outlined">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%"></TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>GSTIN</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell align="right">Models</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Tagged</TableCell>
                <TableCell align="right">Online</TableCell>
                <TableCell align="right">Offline</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {manufacturerSummary.map((manufacturer, index) => (
                <React.Fragment key={manufacturer.manufacturer_id}>
                  <TableRow hover>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() =>
                          setExpandedManufacturerIndex((prev) => (prev === index ? null : index))
                        }
                        endIcon={
                          expandedManufacturerIndex === index ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                        }
                      >
                        {expandedManufacturerIndex === index ? 'Hide' : 'View'}
                      </Button>
                    </TableCell>
                    <TableCell>{manufacturer.company_name}</TableCell>
                    <TableCell>{manufacturer.gstnnumber || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.created || 'N/A'}</TableCell>
                    <TableCell>{manufacturer.expirydate || 'N/A'}</TableCell>
                    <TableCell align="right">{manufacturer.total_models}</TableCell>
                    <TableCell align="right">{manufacturer.aggregated.totalStock}</TableCell>
                    <TableCell align="right">{manufacturer.aggregated.totalDeviceTags}</TableCell>
                    <TableCell align="right">{manufacturer.aggregated.totalOnlineDevices}</TableCell>
                    <TableCell align="right">{manufacturer.aggregated.totalOfflineDevices}</TableCell>
                  </TableRow>
                  {expandedManufacturerIndex === index && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ backgroundColor: '#fafafa' }}>
                        {manufacturer.models.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No models available for this manufacturer.
                          </Typography>
                        ) : (
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>
                              Models
                            </Typography>
                            <Divider sx={{ mb: 1 }} />
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Model Name</TableCell>
                                  <TableCell>Vendor ID</TableCell>
                                  <TableCell>TAC No</TableCell>
                                  <TableCell>Hardware Version</TableCell>
                                  <TableCell>Test Agency</TableCell>
                                  <TableCell align="right">Stock</TableCell>
                                  <TableCell align="right">Tagged</TableCell>
                                  <TableCell align="right">Online</TableCell>
                                  <TableCell align="right">Offline</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {manufacturer.models.map((model) => (
                                  <TableRow key={model.model_id}>
                                    <TableCell>{model.model_name}</TableCell>
                                    <TableCell>{model.vendor_id || 'N/A'}</TableCell>
                                    <TableCell>{model.tac_no || 'N/A'}</TableCell>
                                    <TableCell>{model.hardware_version || 'N/A'}</TableCell>
                                    <TableCell>{model.test_agency || 'N/A'}</TableCell>
                                    <TableCell align="right">{model.total_stock}</TableCell>
                                    <TableCell align="right">{model.total_device_tags}</TableCell>
                                    <TableCell align="right">{model.online_devices}</TableCell>
                                    <TableCell align="right">{model.offline_devices}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DeviceStats;
