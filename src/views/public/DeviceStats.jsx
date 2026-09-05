import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Grid
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Router as RouterIcon,
  Business as BusinessIcon,
  DevicesOther as DevicesIcon,
  Inventory as InventoryIcon,
  Label as LabelIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import publicApi from '../../services/publicApi';

const DeviceStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDeviceStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await publicApi.getDeviceOnboardingDashboard();
      const data = response?.data;

      if (data && typeof data === 'object') {
        setTotals(data.totals || {});
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

  const statsData = [
    {
      title: "M2M Service Provider",
      value: totals?.total_esim_m2m_provider ?? 0,
      icon: <RouterIcon fontSize="large" sx={{ color: '#1976d2' }} />,
      color: "#e3f2fd",
      xs: 12, sm: 6, md: 3
    },
    {
      title: "Technically Onboarded Manufacturers",
      value: totals?.total_manufacturers_with_onboarding_done ?? 0,
      icon: <BusinessIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
      color: "#f3e5f5",
      xs: 12, sm: 6, md: 3
    },
    {
      title: "Device Models",
      value: totals?.total_device_models_with_onboarding_done ?? 0,
      icon: <DevicesIcon fontSize="large" sx={{ color: '#ff9800' }} />,
      color: "#fff3e0",
      xs: 12, sm: 6, md: 3
    },
    {
      title: "Total Stock",
      value: totals?.total_device_stock ?? 0,
      icon: <InventoryIcon fontSize="large" sx={{ color: '#00bcd4' }} />,
      color: "#e0f7fa",
      xs: 12, sm: 6, md: 3
    },
    {
      title: "Total Tagged Device",
      value: totals?.total_tagged_device ?? 0,
      icon: <LabelIcon fontSize="large" sx={{ color: '#3f51b5' }} />,
      color: "#e8eaf6",
      xs: 12, sm: 6, md: 4
    },
    {
      title: "Total Online",
      value: totals?.total_online_device ?? 0,
      icon: <WifiIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      color: "#e8f5e9",
      xs: 12, sm: 6, md: 4
    },
    {
      title: "Total Offline",
      value: totals?.total_offline_device ?? 0,
      icon: <WifiOffIcon fontSize="large" sx={{ color: '#f44336' }} />,
      color: "#ffebee",
      xs: 12, sm: 6, md: 4
    }
  ];

  return (
    <Box p={4} sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="800" color="text.primary" gutterBottom>
            Device Statistics Dashboard
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdated.toLocaleString()}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchDeviceStats}
          disabled={loading}
          sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 'bold' }}
        >
          Refresh Data
        </Button>
      </Box>

      <Box mb={4}>
        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid item xs={stat.xs} sm={stat.sm} md={stat.md} key={index}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${stat.color} 0%, #ffffff 100%)`,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
                    borderColor: 'transparent'
                  }
                }}
              >
                <Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    fontWeight="700" 
                    textTransform="uppercase" 
                    sx={{ mb: 1, display: 'block', letterSpacing: 0.5 }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="900" color="text.primary">
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: '#ffffff', 
                  p: 1.5, 
                  borderRadius: '50%',
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  {stat.icon}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DeviceStats;
