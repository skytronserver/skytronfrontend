import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  useVehicleData
} from './SuperAdminCommon';
import { BhuvanMapComponent } from 'components/Map';

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
  textSecondary: '#475569'
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

  /* --------------------------- Speed Distribution -------------------------- */
  const speedDistributionData = useMemo(() => {
    const bins = [
      { label: '0–20 km/h', min: 0, max: 20 },
      { label: '20–40 km/h', min: 20, max: 40 },
      { label: '40–60 km/h', min: 40, max: 60 },
      { label: '60+ km/h', min: 60, max: Infinity }
    ];

    return bins.map((bin) => {
      const count = vehicleData.filter((v) => {
        const speed = Number(v.speed) || 0;
        if (bin.max === Infinity) return speed >= bin.min;
        return speed >= bin.min && speed < bin.max;
      }).length;

      return { name: bin.label, value: count };
    });
  }, [vehicleData]);

  const hasSpeedData = speedDistributionData.some((s) => s.value > 0);
  const totalVehicles = vehicleStats.total || vehicleData.length || 0;

  /* ------------------------------- Chart ---------------------------------- */
  const speedChartContent = (
    <Box
      sx={{
        ...fadeUpAnimation,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.surface,
        boxShadow: `0 20px 40px -24px ${alpha(COLORS.primary, 0.55)}`,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Fleet Speed Distribution
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          {totalVehicles
            ? `Live breakdown of ${totalVehicles} vehicles by speed range.`
            : 'Speed distribution will appear once vehicles are active.'}
        </Typography>
      </Box>

      {/* Chart Area */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {hasSpeedData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={speedDistributionData} margin={{ top: 12, right: 16, left: -8, bottom: 12 }}>
              <defs>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.9} />
                  <stop offset="55%" stopColor={COLORS.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 6" stroke={COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: COLORS.textPrimary, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: COLORS.textPrimary, fontSize: 12 }} />

              <RechartsTooltip content={<CustomTransportTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS.primaryDark}
                strokeWidth={3}
                fill="url(#speedGradient)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Waiting for live telemetry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vehicles will appear automatically as data streams in.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  /* ------------------------------- Layout ---------------------------------- */
  return (
    <PageWrapper
      // title="Public Transport"
      // description="Live fleet monitoring across the state transport network."
      // sx={{
      //   minHeight: '100vh',
      //   display: 'flex',
      //   flexDirection: 'column'
      // }}
    >
      <DashboardCard
        title="Public Transport"
        subtitle="Live Fleet Monitoring"
        accentColor={COLORS.primary}
        chartComponent={speedChartContent}
        mapComponent={(
          <BhuvanMapComponent
            gpsData={vehicleData}
            policeData={[]}
            width="100%"
            height="100%"
            markerLabelMode="vehicle"
            showMapTypeToggle={false}
            showDrawControls={false}
            showLogos={false}
            showSoiLayerPanel={false}
            autoFit
            onMarkerClick={undefined}
          />
        )}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Total" value={loading ? '—' : vehicleStats.total} color={COLORS.primary} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Online" value={loading ? '—' : vehicleStats.online} color="#10b981" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Emergency" value={loading ? '—' : vehicleStats.emergency} color="#ef4444" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Offline" value={loading ? '—' : vehicleStats.offline} color="#64748b" />
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
