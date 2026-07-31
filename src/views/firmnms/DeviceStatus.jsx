/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Grid, Box, Tooltip, IconButton, Chip, Typography, Card, CardContent } from '@mui/material';
import { useDispatch } from 'react-redux';
import { gridSpacing } from '../../store/constant';
import MainCard from '../../ui-component/cards/MainCard';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import FirmNMSService from '../../services/FirmNMSService';
import { IconRefresh, IconDevices, IconSignal, IconSignalOff, IconDeviceMobile } from '@tabler/icons';
import DialogComponent from '../../ui-component/DialogComponent';

const DeviceStatus = () => {
  const [loading, setLoading] = useState(true);
  const [deviceStatusData, setDeviceStatusData] = useState([]);
  const [deviceStats, setDeviceStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    warning: 0
  });
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDeviceStatusData();
  }, []);

  const fetchDeviceStatusData = async () => {
    setLoading(true);
    try {
      const response = await FirmNMSService.getDeviceStatusData();
      setDeviceStatusData(response.data);
      
      // Calculate stats
      const stats = {
        total: response.data.length,
        online: response.data.filter(device => device.status === 'online').length,
        offline: response.data.filter(device => device.status === 'offline').length,
        warning: response.data.filter(device => device.status === 'warning').length
      };
      setDeviceStats(stats);
    } catch (error) {
      console.error('Error fetching device status data:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'Failed to fetch device status data. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const deviceStatusColumns = [
    {
      name: 'id',
      label: 'ID',
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    },
    {
      name: 'device_id',
      label: 'Device ID',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'device_model',
      label: 'Model',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'status',
      label: 'Status',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          const statusColors = {
            'online': 'success',
            'offline': 'error',
            'warning': 'warning',
            'unknown': 'default'
          };
          
          const statusLabels = {
            'online': 'Online',
            'offline': 'Offline',
            'warning': 'Warning',
            'unknown': 'Unknown'
          };
          
          return (
            <Chip
              label={statusLabels[value] || statusLabels['unknown']}
              color={statusColors[value] || statusColors['unknown']}
              size="small"
            />
          );
        },
      },
    },
    {
      name: 'last_seen',
      label: 'Last Seen',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return value ? new Date(value).toLocaleString() : 'Never';
        },
      },
    },
    {
      name: 'uptime',
      label: 'Uptime',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          if (!value) return 'N/A';
          
          // Convert seconds to days, hours, minutes
          const days = Math.floor(value / (60 * 60 * 24));
          const hours = Math.floor((value % (60 * 60 * 24)) / (60 * 60));
          const minutes = Math.floor((value % (60 * 60)) / 60);
          
          if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
          } else {
            return `${minutes}m`;
          }
        },
      },
    },
    {
      name: 'firmware_version',
      label: 'Firmware',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'signal_strength',
      label: 'Signal',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          if (value === null || value === undefined) return 'N/A';
          
          const getSignalColor = (strength) => {
            if (strength >= 80) return 'success';
            if (strength >= 50) return 'primary';
            if (strength >= 30) return 'warning';
            return 'error';
          };
          
          return (
            <Chip
              label={`${value}%`}
              color={getSignalColor(value)}
              size="small"
              variant="outlined"
            />
          );
        },
      },
    },
  ];

  const tableOptions = {
    customToolbar: () => {
      return (
        <Tooltip title="Refresh">
          <IconButton onClick={fetchDeviceStatusData}>
            <IconRefresh size={24} />
          </IconButton>
        </Tooltip>
      );
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
      <CardContent>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Box sx={{ bgcolor: `${color}.dark`, width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white' }}>
              {icon}
            </Box>
          </Grid>
          <Grid item>
            <Typography variant="h3" color="inherit">{value}</Typography>
            <Typography variant="subtitle1" color="inherit">{title}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Devices" 
            value={deviceStats.total} 
            icon={<IconDevices size={24} />} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Online" 
            value={deviceStats.online} 
            icon={<IconSignal size={24} />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Offline" 
            value={deviceStats.offline} 
            icon={<IconSignalOff size={24} />} 
            color="error" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Warning" 
            value={deviceStats.warning} 
            icon={<IconDeviceMobile size={24} />} 
            color="warning" 
          />
        </Grid>
        
        <Grid item xs={12}>
          <MainCard title="Device Status" content={false}>
            <DynamicDatatables
              tableTitle=""
              rows={deviceStatusData}
              columns={deviceStatusColumns}
              options={tableOptions}
              loading={loading}
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* Alert Dialog */}
      <DialogComponent
        open={alertDialog.open}
        title={alertDialog.title}
        content={alertDialog.message}
        primaryButtonText="OK"
        primaryButtonOnClick={() => setAlertDialog(prev => ({ ...prev, open: false }))}
        handleClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default DeviceStatus; 