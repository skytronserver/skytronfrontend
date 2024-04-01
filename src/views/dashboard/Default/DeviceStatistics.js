import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import Widget from './Widget';
import { gridSpacing } from '../../../store/constant';

const DeviceStatistics = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // State for collapse
  const [totalDeviceMakerCollapse, setTotalDeviceMakerCollapse] = useState(true);
  const [totalDeviceModelsCollapse, setTotalDeviceModelsCollapse] = useState(true); 
  const [totalDeviceCountCollapse, setTotalDeviceCountCollapse] = useState(true);
  const [totalDeviceTaggedCollapse, setTotalDeviceTaggedCollapse] = useState(true); 
  const [onlineDevicesCollapse, setOnlineDevicesCollapse] = useState(true);
  const [offlineDevicesCollapse, setOfflineDevicesCollapse] = useState(true);

  
  const handleWidgetClick = (widgetType) => {
    switch (widgetType) {
      case 'Total Device Maker':
        setTotalDeviceMakerCollapse(!totalDeviceMakerCollapse);
        break;
      case 'Total Device Models':
        setTotalDeviceModelsCollapse(!totalDeviceModelsCollapse);
        break;
      case 'Total Device Count':
        setTotalDeviceCountCollapse(!totalDeviceCountCollapse);
        break;
      case 'Total Device Tagged':
        setTotalDeviceTaggedCollapse(!totalDeviceTaggedCollapse);
        break;
      case 'Online Devices':
        setOnlineDevicesCollapse(!onlineDevicesCollapse);
        break;
      case 'Offline Devices':
        setOfflineDevicesCollapse(!offlineDevicesCollapse);
        break;
      default:
        break;
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Device Maker"
          onClick={() => handleWidgetClick('Total Device Maker')}
          isCollapsed={totalDeviceMakerCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Total Device Models"
          onClick={() => handleWidgetClick('Total Device Models')}
          isCollapsed={totalDeviceModelsCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Total Device Count"
          onClick={() => handleWidgetClick('Total Device Count')}
          isCollapsed={totalDeviceCountCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Device Tagged"
          onClick={() => handleWidgetClick('Total Device Tagged')}
          isCollapsed={totalDeviceTaggedCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Online Devices"
          onClick={() => handleWidgetClick('Online Devices')}
          isCollapsed={onlineDevicesCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Offline Devices"
          onClick={() => handleWidgetClick('Offline Devices')}
          isCollapsed={offlineDevicesCollapse}
        />
      </Grid>
    </Grid>
  );
};

export default DeviceStatistics;
