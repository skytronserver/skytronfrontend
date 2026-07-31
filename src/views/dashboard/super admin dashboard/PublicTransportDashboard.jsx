/* eslint-disable no-unused-vars */
import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  useVehicleData
} from './SuperAdminCommon';
import MapComponent from 'views/direct/LiveMap';

/* -------------------------------------------------------------------------- */
/* 🎨 Design Tokens                                                            */
/* -------------------------------------------------------------------------- */
const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  surface: alpha('#6366f1', 0.06),
  border: alpha('#6366f1', 0.18),
  grid: alpha('#312e81', 0.18),
  textPrimary: '#1e1b4b',
  textSecondary: '#475569',
  online: '#06b6d4',      // Cyan - for active/online vehicles
  offline: '#64748b',     // Slate gray - for offline vehicles
  emergency: '#f59e0b'    // Amber/Orange - for emergency vehicles
};

/* -------------------------------------------------------------------------- */
/* ✨ Animations                                                               */
/* -------------------------------------------------------------------------- */
const fadeUpAnimation = {
  animation: 'fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1)',
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(14px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
};

/* -------------------------------------------------------------------------- */
/* 🚍 Dashboard                                                                */
/* -------------------------------------------------------------------------- */
const PublicTransportDashboard = () => {
  const { vehicleData, vehicleStats, loading, getVehicleStyle } = useVehicleData();

  /* --------------------------- Fleet Distribution -------------------------- */
  const fleetDistributionData = useMemo(() => {
    return [
      { name: 'Online', value: vehicleStats.online || 0, color: COLORS.online },
      { name: 'Offline', value: vehicleStats.offline || 0, color: COLORS.offline },
      { name: 'Emergency', value: vehicleStats.emergency || 0, color: COLORS.emergency }
    ];
  }, [vehicleStats]);

  const hasFleetData = fleetDistributionData.some((s) => s.value > 0);
  const totalVehicles = vehicleStats.total || vehicleData.length || 0;

  /* ------------------------------- Chart ---------------------------------- */
  const fleetChartContent = (
    <Box
      sx={{
        ...fadeUpAnimation,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        bgcolor: 'white',
        boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.08)}`,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '1rem' }}>
          Fleet Distribution
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: '0.875rem' }}>
          {totalVehicles
            ? `Live status of ${totalVehicles} vehicles`
            : 'Waiting for data...'}
        </Typography>
      </Box>

      {/* Chart Area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, pt: 0 }}>
        {hasFleetData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fleetDistributionData}
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="75%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {fleetDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTransportTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: '12px',
                  color: COLORS.textPrimary,
                  paddingTop: '4px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
              Waiting for live telemetry
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Vehicles will appear automatically
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  /* ------------------------------- Layout ---------------------------------- */
  return (
    <PageWrapper
      title="Public Transport"
      description="Live fleet monitoring across the state transport network."
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <DashboardCard
        title="Public Transport"
        subtitle="Live Fleet Monitoring"
        accentColor={COLORS.primary}
        chartComponent={fleetChartContent}
        mapComponent={(
          <MapComponent
            gpsData={vehicleData}
            policeData={[]}
            incidentData={[]}
            width="100%"
            height="100%"
            markerLabelMode="vehicle"
            autoFit={false}
          />
        )}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        {/* Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Total" value={loading ? '—' : vehicleStats.total} color={COLORS.primary} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Online" value={loading ? '—' : vehicleStats.online} color={COLORS.online} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Emergency" value={loading ? '—' : vehicleStats.emergency} color={COLORS.emergency} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Offline" value={loading ? '—' : vehicleStats.offline} color={COLORS.offline} />
          </Grid>
        </Grid>
      </DashboardCard>
    </PageWrapper>
  );
};

/* -------------------------------------------------------------------------- */
/* 🧊 Tooltip                                                                  */
/* -------------------------------------------------------------------------- */
const CustomTransportTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2,
        bgcolor: '#fff',
        boxShadow: '0 16px 30px -14px rgba(79,70,229,0.45)'
      }}
    >
      <Typography variant="subtitle2" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="body2">{payload[0].value} vehicles</Typography>
    </Box>
  );
};

export default PublicTransportDashboard;
