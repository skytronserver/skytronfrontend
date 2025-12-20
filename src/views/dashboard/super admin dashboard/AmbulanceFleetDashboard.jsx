import { useMemo } from 'react';
import Grid from '@mui/material/Grid';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  StatPieChart,
  DashboardMap,
  useVehicleData
} from './SuperAdminCommon';

const AmbulanceFleetDashboard = () => {
  const { vehicleData, iconStyles } = useVehicleData();

  const ambulanceStats = useMemo(
    () => ({
      totalAmbulances: vehicleData.length,
      available: vehicleData.length,
      occupied: 0,
      emergencyMode: vehicleData.filter((v) => v.packet_type === 'EA').length
    }),
    [vehicleData]
  );

  const ambulanceChartData = useMemo(
    () => [
      { name: 'Available', value: ambulanceStats.available, color: '#ec4899' },
      { name: 'Occupied', value: ambulanceStats.occupied, color: '#d946ef' },
      { name: 'Emergency', value: ambulanceStats.emergencyMode, color: '#f43f5e' }
    ],
    [ambulanceStats]
  );

  return (
    <PageWrapper
      title="Ambulance Fleet"
      description="Availability and response readiness of ambulance resources."
    >
      <DashboardCard
        title="Ambulance Fleet"
        subtitle="Availability & Response"
        accentColor="#ec4899"
        animationDelay="0.3s"
        chartComponent={<StatPieChart data={ambulanceChartData} />}
        mapComponent={<DashboardMap data={vehicleData} getStyle={() => iconStyles.red} />}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MetricCard label="Total Fleet" value={ambulanceStats.totalAmbulances} color="#ec4899" />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Available" value={ambulanceStats.available} color="#10b981" />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Occupied" value={ambulanceStats.occupied} color="#d946ef" />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Emergency" value={ambulanceStats.emergencyMode} color="#f43f5e" />
          </Grid>
        </Grid>
      </DashboardCard>
    </PageWrapper>
  );
};

export default AmbulanceFleetDashboard;
