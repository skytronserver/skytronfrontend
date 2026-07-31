/* eslint-disable no-unused-vars */
import { useMemo, useCallback, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  StatBarChart,
  useVehicleData
} from './SuperAdminCommon';
import MapComponent from 'views/direct/LiveMap';
import UserServices from 'services/UserServices';

/* -------------------------------------------------------------------------- */
/* 🎨 Design Tokens                                                            */
/* -------------------------------------------------------------------------- */
const COLORS = {
  policePrimary: '#3b82f6',
  policeSecondary: '#2563eb',
  policeMuted: alpha('#3b82f6', 0.35),
  ambulancePrimary: '#ec4899',
  ambulanceSecondary: '#f43f5e',
  ambulanceMuted: alpha('#ec4899', 0.32),
  offline: '#94a3b8',
  surface: alpha('#1e1b4b', 0.06),
  border: alpha('#3b82f6', 0.18),
  grid: alpha('#312e81', 0.18),
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

/* -------------------------------------------------------------------------- */
/* 🚨 Public Safety Dashboard                                                  */
/* -------------------------------------------------------------------------- */
const PublicSafetyDashboard = () => {
  const { vehicleData, loading, iconStyles } = useVehicleData();
  const [policeMetrics, setPoliceMetrics] = useState(null);
  const [ambulanceMetrics, setAmbulanceMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [policeRes, ambulanceRes] = await Promise.all([
          UserServices.getPoliceFleetMetrics(),
          UserServices.getAmbulanceFleetMetrics()
        ]);

        if (policeRes.data) setPoliceMetrics(policeRes.data);
        if (ambulanceRes.data) setAmbulanceMetrics(ambulanceRes.data);
      } catch (error) {
        console.error("Error fetching fleet metrics", error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const policeStats = useMemo(() => {
    if (policeMetrics) {
      return {
        total: policeMetrics.total_executives || 0,
        onDuty: policeMetrics.online_executives || 0,
        standby: policeMetrics.standby_executives || 0,
        incidents: policeMetrics.total_emergency_calls_live || 0,
        offline: policeMetrics.offline_executives || 0
      };
    }

    return {
      total: 0,
      onDuty: 0,
      standby: 0,
      incidents: 0,
      offline: 0
    };
  }, [policeMetrics]);

  const ambulanceStats = useMemo(() => {
    if (ambulanceMetrics) {
      return {
        total: ambulanceMetrics.total_executives || 0,
        emergency: ambulanceMetrics.total_emergency_calls_live || 0,
        available: ambulanceMetrics.online_executives || 0,
        enRoute: ambulanceMetrics.standby_executives || 0,
        offline: ambulanceMetrics.offline_executives || 0
      };
    }

    return {
      total: 0,
      emergency: 0,
      enRoute: 0,
      available: 0,
      offline: 0
    };
  }, [ambulanceMetrics]);

  const readinessData = useMemo(
    () =>
      [
        { name: 'Police On Duty', value: policeStats.onDuty, color: COLORS.policePrimary },
        { name: 'Police Standby', value: policeStats.standby, color: COLORS.policeMuted },
        { name: 'Police Offline', value: policeStats.offline, color: COLORS.offline },
        { name: 'Ambulance Emergency', value: ambulanceStats.emergency, color: COLORS.ambulanceSecondary },
        { name: 'Ambulance En Route', value: ambulanceStats.enRoute, color: COLORS.ambulancePrimary },
        { name: 'Ambulance Available', value: ambulanceStats.available, color: COLORS.ambulanceMuted },
        { name: 'Ambulance Offline', value: ambulanceStats.offline, color: COLORS.offline }
      ].filter((item) => item.value > 0),
    [policeStats, ambulanceStats]
  );

  const readinessTrendData = useMemo(() => {
    return [];
  }, []);

  const getSafetyStyle = useCallback(
    (vehicle) => {
      if (vehicle.packet_type === 'EA') return iconStyles.red;
      if (String(vehicle.ignition_status) === '1') return iconStyles.blue;
      return iconStyles.grey;
    },
    [iconStyles]
  );

  const ambulanceVehicles = useMemo(() => {
    return vehicleData.filter(v => {
      const nestedCategory = v?.device_tag_info?.category_info?.category;
      const topCategory = v?.category || v?.vehicle_category;
      const candidates = [nestedCategory, topCategory].filter(Boolean);

      return candidates.some(c => String(c).toUpperCase() === 'AMBULANCE');
    });
  }, [vehicleData]);

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
        boxShadow: `0 22px 44px -26px ${alpha(COLORS.policePrimary, 0.6)}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Public Safety Readiness
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          Live status of patrol units and medical responders across the state.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 } }}>
        <Box sx={{ flexShrink: 0 }}>
          {readinessData.length ? (
            <StatBarChart data={readinessData} />
          ) : (
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              Live readiness metrics will appear when units are active.
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={readinessTrendData} margin={{ top: 10, right: 12, left: -4, bottom: 10 }}>
              <defs>
                <linearGradient id="policeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.policePrimary} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={COLORS.policePrimary} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="ambulanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.ambulancePrimary} stopOpacity={0.85} />
                  <stop offset="100%" stopColor={COLORS.ambulancePrimary} stopOpacity={0.12} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 6" stroke={COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: COLORS.textPrimary, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: COLORS.textPrimary, fontSize: 12 }} />
              <RechartsTooltip content={<CombinedTooltip />} />

              <Area
                type="monotone"
                dataKey="police"
                stroke={COLORS.policeSecondary}
                strokeWidth={3}
                fill="url(#policeGradient)"
                animationDuration={900}
              />
              <Area
                type="monotone"
                dataKey="ambulance"
                stroke={COLORS.ambulanceSecondary}
                strokeWidth={3}
                fill="url(#ambulanceGradient)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );

  return (
    <PageWrapper title="Public Safety Command" description="Unified view of patrol deployment and medical response.">
      <DashboardCard
        title="Public Safety"
        subtitle="Police & Ambulance Coordination"
        accentColor={COLORS.policePrimary}
        chartComponent={readinessChartContent}
        mapComponent={(
          <MapComponent
            gpsData={ambulanceVehicles}
            policeData={[]}
            width="100%"
            height="100%"
            markerLabelMode="vehicle"
            autoFit
          />
        )}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Police Patrol Snapshot
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MetricCard label="Total Units" value={loading ? '—' : policeStats.total} color={COLORS.policePrimary} />
              </Grid>
              <Grid item xs={6}>
                <MetricCard label="On Duty" value={loading ? '—' : policeStats.onDuty} color={COLORS.policeSecondary} />
              </Grid>
              <Grid item xs={6}>
                <MetricCard label="Standby" value={loading ? '—' : policeStats.standby} color={COLORS.policeMuted} />
              </Grid>
              <Grid item xs={6}>
                <MetricCard label="Incidents" value={loading ? '—' : policeStats.incidents} color="#f59e0b" />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Ambulance Response Snapshot
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MetricCard label="Total Fleet" value={loading ? '—' : ambulanceStats.total} color={COLORS.ambulancePrimary} />
              </Grid>
              <Grid item xs={6}>
                <MetricCard label="Available" value={loading ? '—' : ambulanceStats.available} color="#10b981" />
              </Grid>
              <Grid item xs={6}>
                <MetricCard label="En Route" value={loading ? '—' : ambulanceStats.enRoute} color={COLORS.ambulancePrimary} />
              </Grid>
              <Grid item xs={6}>
                <MetricCard label="Emergency" value={loading ? '—' : ambulanceStats.emergency} color={COLORS.ambulanceSecondary} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DashboardCard>
    </PageWrapper>
  );
};

const CombinedTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2.5,
        backdropFilter: 'blur(10px)',
        bgcolor: alpha('#ffffff', 0.92),
        border: `1px solid ${alpha(COLORS.primaryDark || COLORS.policePrimary, 0.15)}`,
        boxShadow: '0 20px 40px -18px rgba(79,70,229,0.45)'
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="body2" sx={{ color: COLORS.textSecondary }}>
          {entry.name}: {entry.value}
        </Typography>
      ))}
    </Box>
  );
};

export default PublicSafetyDashboard;
