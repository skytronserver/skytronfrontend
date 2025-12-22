import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  StatPieChart,
  DashboardMap,
  useVehicleData
} from './SuperAdminCommon';

const COLORS = {
  primary: '#ec4899',
  secondary: '#f43f5e',
  available: '#10b981',
  enRoute: '#fb923c',
  emergency: '#ef4444',
  surface: alpha('#ec4899', 0.06),
  border: alpha('#ec4899', 0.18),
  textPrimary: '#1e1b4b',
  textSecondary: '#475569'
};

const fadeUpAnimation = {
  animation: 'fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1)',
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(14px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
};

const AmbulanceFleetDashboard = () => {
  const { vehicleData, loading, getVehicleStyle } = useVehicleData();

  const ambulanceStats = useMemo(() => {
    const total = vehicleData.length;
    const emergency = vehicleData.filter((v) => v.packet_type === 'EA').length;
    const enRoute = vehicleData.filter((v) => Number(v.speed) > 25 && String(v.ignition_status) === '1' && v.packet_type !== 'EA').length;
    const available = Math.max(total - emergency - enRoute, 0);

    return {
      total,
      available,
      enRoute,
      emergency
    };
  }, [vehicleData]);

  const ambulanceChartData = useMemo(
    () => [
      { name: 'Available', value: ambulanceStats.available, color: COLORS.available },
      { name: 'En Route', value: ambulanceStats.enRoute, color: COLORS.enRoute },
      { name: 'Emergency', value: ambulanceStats.emergency, color: COLORS.emergency }
    ],
    [ambulanceStats]
  );

  const hasChartData = ambulanceChartData.some((segment) => segment.value > 0);

  const readinessChartContent = (
    <Box
      sx={{
        ...fadeUpAnimation,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.surface,
        boxShadow: `0 22px 44px -26px ${alpha(COLORS.primary, 0.55)}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Fleet Readiness Overview
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          {loading
            ? 'Fetching latest ambulance deployment metrics...'
            : `Tracking ${ambulanceStats.total} ambulances across the network.`}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 3 } }}>
        {hasChartData ? (
          <StatPieChart data={ambulanceChartData} />
        ) : (
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Live readiness metrics will appear once ambulances are active.
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <PageWrapper
      title="Ambulance Fleet"
      description="Availability and response readiness of ambulance resources."
    >
      <DashboardCard
        title="Ambulance Fleet"
        subtitle="Availability & Response"
        accentColor={COLORS.primary}
        animationDelay="0.3s"
        chartComponent={readinessChartContent}
        mapComponent={<DashboardMap data={vehicleData} getStyle={getVehicleStyle} />}
      >
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
            Operational Snapshot
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Summary of ambulance availability and active dispatch status.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MetricCard label="Total Fleet" value={loading ? '—' : ambulanceStats.total} color={COLORS.primary} />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Available" value={loading ? '—' : ambulanceStats.available} color={COLORS.available} />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="En Route" value={loading ? '—' : ambulanceStats.enRoute} color={COLORS.enRoute} />
          </Grid>
          <Grid item xs={6}>
            <MetricCard label="Emergency" value={loading ? '—' : ambulanceStats.emergency} color={COLORS.secondary} />
          </Grid>
        </Grid>
      </DashboardCard>
    </PageWrapper>
  );
};

export default AmbulanceFleetDashboard;
