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
  const [activeStatesCollapse, setActiveStatesCollapse] = useState(false);
  const [totalStatesCollapse, setTotalStatesCollapse] = useState(true); 
  const [totalInactiveCollapse, setTotalInactiveCollapse] = useState(true);
  const [totalActiveCollapse, setTotalActiveCollapse] = useState(true); 

  
  const handleWidgetClick = (widgetType) => {
    if (widgetType === 'Active States') {
      setActiveStatesCollapse(!activeStatesCollapse);
      setTotalStatesCollapse(true);
      setTotalInactiveCollapse(true);
      setTotalActiveCollapse(true);
    } else if (widgetType === 'Total States') {
      setActiveStatesCollapse(true);
      setTotalStatesCollapse(!totalStatesCollapse);
      setTotalInactiveCollapse(true);
      setTotalActiveCollapse(true);
    } else if (widgetType === 'Total Inactive') {
      setActiveStatesCollapse(true);
      setTotalStatesCollapse(true);
      setTotalInactiveCollapse(!totalInactiveCollapse);
      setTotalActiveCollapse(true);
    } else if (widgetType === 'Total Active') {
      setActiveStatesCollapse(true);
      setTotalStatesCollapse(true);
      setTotalInactiveCollapse(true);
      setTotalActiveCollapse(!totalActiveCollapse);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={10} style={{ marginTop: '20px' }}>
       
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Device Maker"
          onClick={() => handleWidgetClick('Total Device Maker')}
          isCollapsed={activeStatesCollapse}
        />

       
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Total Device Models"
          onClick={() => handleWidgetClick('Total Device Models')}
          isCollapsed={totalStatesCollapse}
        />

        
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Total Device Count"
          onClick={() => handleWidgetClick('Total Device Count')}
          isCollapsed={totalInactiveCollapse}
        />

       
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Device Tagged"
          onClick={() => handleWidgetClick('Total Device Tagged')}
          isCollapsed={totalActiveCollapse}
        />

        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Online Devices"
          onClick={() => handleWidgetClick('Online Devices')}
          isCollapsed={totalActiveCollapse}
        />


        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Offline Devices"
          onClick={() => handleWidgetClick('Offline Devices')}
          isCollapsed={totalActiveCollapse}
        />
      </Grid>
    </Grid>
  );
};

export default DeviceStatistics;