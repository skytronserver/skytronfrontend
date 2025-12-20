import { useMemo } from 'react';
import Grid from '@mui/material/Grid';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  StatBarChart,
  DashboardMap,
  useVehicleData
} from './SuperAdminCommon';

const PolicePatrolDashboard = () => {
  const { vehicleData, iconStyles } = useVehicleData();

  const policeStats = useMemo(
    () => ({
      totalVehicles: vehicleData.length,
      onDuty: vehicleData.filter((v) => String(v.ignition_status) === '1').length,
      assignedToIncidents: 0,
      patrolling: vehicleData.length
    }),
    [vehicleData]
  );

  const policeChartData = useMemo(
    () => [
      { name: 'On Duty', value: policeStats.onDuty, color: '#3b82f6' },
      { name: 'Patrolling', value: policeStats.patrolling, color: '#8b5cf6' },
      { name: 'Incidents', value: policeStats.assignedToIncidents, color: '#f59e0b' }
    ],
    [policeStats]
  );

  return (
    <PageWrapper
      title="Police Patrol"
      description="Real-time deployment overview for police patrol units."
    >
      <DashboardCard
        title="Police Patrol"
        subtitle="Deployment & Incidents"
        accentColor="#3b82f6"
        animationDelay="0.2s"
        chartComponent={<StatBarChart data={policeChartData} />}
        mapComponent={<DashboardMap data={vehicleData} getStyle={() => iconStyles.blue} />}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MetricCard label="Total Vehicles" value={policeStats.totalVehicles} color="#3b82f6" />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="On Duty" value={policeStats.onDuty} color="#10b981" />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Incidents" value={policeStats.assignedToIncidents} color="#f59e0b" />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Patrolling" value={policeStats.patrolling} color="#8b5cf6" />
          </Grid>
        </Grid>
      </DashboardCard>
    </PageWrapper>
  );
};

export default PolicePatrolDashboard;
