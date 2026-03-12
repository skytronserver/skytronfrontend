import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import BhuvanMapComponent from '../../../components/Map/BhuvanMapComponent';
import RoadsMapComponent from '../../../components/Map_City_Level/RoadsMapComponent';


import {
  PageWrapper,
  useVehicleData
} from './SuperAdminCommon';

  
const COLORS = {
  surface: '#f8fafc',
  border: alpha('#0f172a', 0.08),
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  chipBg: alpha('#0f172a', 0.04),

  online: '#22c55e',
  offline: '#64748b',
  battery: '#f59e0b',
  gpsIssue: '#8b5cf6',
  alerts: '#ef4444',
  localAlerts: '#06b6d4'
};

const FILTERS = {
  state: ['All', 'Assam'],
  district: ['All', 'Kamrup Metro', 'Kamrup Rural', 'Nagaon'],
  vehicleType: ['All', 'Bus', 'Taxi', 'Truck'],
  operator: ['All', 'ASTC', 'Private'],
  reserved: ['All', 'Yes', 'No'],
  stateVids: ['All', 'Enabled', 'Disabled'],
  fastStatus: ['All', 'Active', 'Inactive']
};

const metricTileColors = {
  total: { from: '#0ea5e9', to: '#2563eb' },
  offline: { from: '#334155', to: '#64748b' },
  online: { from: '#22c55e', to: '#16a34a' },
  alerts: { from: '#ef4444', to: '#dc2626' },
  alertsActive: { from: '#f97316', to: '#ea580c' },
  gps: { from: '#8b5cf6', to: '#7c3aed' },
  powerCut: { from: '#0f766e', to: '#14b8a6' },
  notReporting: { from: '#64748b', to: '#94a3b8' }
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  try {
    return Number(value).toLocaleString('en-IN');
  } catch {
    return String(value);
  }
};

const MetricTile = ({ label, value, colorKey, helper }) => {
  const colors = metricTileColors[colorKey] || metricTileColors.total;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: 180, md: 180 },
        borderRadius: 2,
        p: { xs: 2.5, md: 2.25 },
        color: '#fff',
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
        boxShadow: `0 8px 20px -12px ${alpha(colors.to, 0.75)}`,
        border: `1px solid ${alpha('#ffffff', 0.18)}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', md: '0.875rem' }, letterSpacing: '0.02em' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '1.85rem' }, lineHeight: 1.05 }}>{formatNumber(value)}</Typography>
      {helper ? (
        <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', md: '0.75rem' } }}>{helper}</Typography>
      ) : null}
    </Box>
  );
};

const LegendChip = ({ label, color, tokens }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      px: 1.25,
      py: 0.75,
      borderRadius: 2,
      bgcolor: tokens?.chipBg || COLORS.chipBg,
      border: `1px solid ${tokens?.border || COLORS.border}`
    }}
  >
    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: tokens?.muted || COLORS.textSecondary }}>{label}</Typography>
  </Box>
);

const DISTRICTS = [
  { name: 'Kamrup Metro', center: [91.7362, 26.1445], color: '#22c55e' },
  { name: 'Nagaon', center: [92.6850, 26.3569], color: '#38bdf8' },
  { name: 'Dibrugarh', center: [94.9110, 27.4728], color: '#a855f7' },
  { name: 'Kamrup Rural', center: [91.3700, 26.0500], color: '#f59e0b' },
  { name: 'Jorhat', center: [94.2037, 26.7465], color: '#ef4444' },
  { name: 'Silchar', center: [92.7789, 24.8333], color: '#64748b' }
];

const buildDummyVehicles = (seed = []) => {
  const vehicles = [];
  const total = 8;

  const pickDistrict = (idx) => DISTRICTS[idx % DISTRICTS.length];
  const pickStatus = (idx) => {
    const mod = idx % 14;
    if (mod === 0) return 'ea_alert';
    if (mod === 1) return 'normal_alert';
    if (mod === 2) return 'gps_issue';
    if (mod === 3) return 'battery_low';
    if (mod === 4) return 'power_cut';
    if (mod === 5) return 'not_reporting';
    if (mod === 6) return 'offline';
    return 'online';
  };

  for (let i = 0; i < total; i += 1) {
    const district = pickDistrict(i);

    const spreadLat = (Math.sin(i * 0.85) + Math.cos(i * 0.23)) * 0.035;
    const spreadLon = (Math.cos(i * 0.62) + Math.sin(i * 0.31)) * 0.055;

    vehicles.push({
      regNo: `AS01AB${String(1000 + i).slice(-4)}`,
      district: district.name,
      latitude: district.center[1] + spreadLat,
      longitude: district.center[0] + spreadLon,
      status: pickStatus(i)
    });
  }

  if (Array.isArray(seed) && seed.length) {
    seed.slice(0, 40).forEach((entry, idx) => {
      const district = pickDistrict(idx + 3);
      const lat = Number(entry.latitude);
      const lon = Number(entry.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;

      vehicles.push({
        regNo: entry.vehicle_reg_no || entry.regNo || `SKY${String(9000 + idx).slice(-4)}`,
        district: entry.district || district.name,
        latitude: lat,
        longitude: lon,
        status: 'online'
      });
    });
  }

  return vehicles;
};
const DistrictVehicleMap = ({ vehicles }) => {
  const gpsData = useMemo(() => {
    const nowIso = new Date().toISOString();
    return (Array.isArray(vehicles) ? vehicles : []).map((v) => {
      const packetType =
        v.status === 'ea_alert'
          ? 'EA'
          : v.status === 'normal_alert'
            ? 'OT'
            : 'NR';

      const isOnline = v.status === 'online';

      return {
        latitude: v.latitude,
        longitude: v.longitude,
        packet_type: 'NR',
        ignition_status: '1',
        speed: 0,
        entry_time: nowIso
      };
    });
  }, [vehicles]);
const [zoom, setZoom] = useState(10);

  return (<>
      <div style={{ display: zoom >= 11 ? "block" : "none" }}>
  <RoadsMapComponent onZoomChange={setZoom} />
</div>

<div style={{ display: zoom < 11 ? "block" : "none" }}>
  <BhuvanMapComponent onZoomChange={setZoom} />
</div>


    {/* <RoadsMapComponent/>
    <BhuvanMapComponent
      gpsData={gpsData}
      width="100%"
      height="100%"
      autoFit
      markerLabelMode="none"
      showMapTypeToggle
      showDrawControls={false}
      showSoiLayerPanel={false}
      showLogos
    /> */}
    </>
  );
};

const PublicTransportVehicleMonitoringDashboard = () => {
  // Using existing live data hook to seed dummy points (fallback to generated)
  const { vehicleData } = useVehicleData();

  const [mode, setMode] = useState('light');

  const tokens = useMemo(() => {
    if (mode === 'dark') {
      return {
        pageBg: '#1a1f2e',
        cardBg: '#0f1419',
        border: alpha('#475569', 0.3),
        text: '#e5e7eb',
        muted: alpha('#e5e7eb', 0.7),
        chipBg: alpha('#ffffff', 0.06)
      };
    }

    return {
      pageBg: '#f8fafc',
      cardBg: '#ffffff',
      border: alpha('#0f172a', 0.08),
      text: '#0f172a',
      muted: '#475569',
      chipBg: COLORS.chipBg
    };
  }, [mode]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    vehicleType: 'All',
    operator: 'All',
    reserved: 'All',
    stateVids: 'All',
    fastStatus: 'All'
  });

  const vehicles = useMemo(() => buildDummyVehicles(vehicleData), [vehicleData]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    if (filters.district && filters.district !== 'All') {
      result = result.filter((v) => v.district === filters.district);
    }
    return result;
  }, [vehicles, filters.district]);

  useEffect(() => {
    if (filters.district && filters.district !== 'All') {
      setSelectedDistrict(filters.district);
      return;
    }
    setSelectedDistrict(null);
  }, [filters.district]);

  const handleSelectDistrict = useCallback(
    (districtName) => {
      setFilters((prev) => ({ ...prev, district: districtName }));
      setSelectedDistrict(districtName);
    },
    []
  );

  const handleBackToDistricts = useCallback(() => {
    setFilters((prev) => ({ ...prev, district: 'All' }));
    setSelectedDistrict(null);
  }, []);

  const kpis = useMemo(() => {
    const totals = {
      total: filteredVehicles.length,
      online: 0,
      offline: 0,
      eaAlerts: 0,
      normalAlerts: 0,
      gpsIssue: 0,
      powerCut: 0,
      notReporting: 0,
      batteryLow: 0
    };

    filteredVehicles.forEach((v) => {
      if (v.status === 'online') totals.online += 1;
      if (v.status === 'offline') totals.offline += 1;
      if (v.status === 'not_reporting') {
        totals.notReporting += 1;
        totals.offline += 1;
      }
      if (v.status === 'ea_alert') totals.eaAlerts += 1;
      if (v.status === 'normal_alert') totals.normalAlerts += 1;
      if (v.status === 'gps_issue') totals.gpsIssue += 1;
      if (v.status === 'power_cut') totals.powerCut += 1;
      if (v.status === 'battery_low') totals.batteryLow += 1;
    });

    const alertsTotal = totals.eaAlerts + totals.normalAlerts;

    return [
      { key: 'total', label: 'Total Devices', value: totals.total, helper: null },
      { key: 'offline', label: 'Offline', value: totals.offline, helper: null },
      { key: 'online', label: 'Online', value: totals.online, helper: null },
      { key: 'alerts', label: 'EA Alerts', value: totals.eaAlerts, helper: null },
      { key: 'alertsActive', label: 'Normal Alerts', value: totals.normalAlerts, helper: null }
    ];
  }, [filteredVehicles]);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <PageWrapper
      title="Public Transport Vehicle Monitoring"
      // description="All vehicles/devices on board Skytron platform (dummy data)."
      sx={{
        bgcolor: tokens.pageBg,
        backgroundImage: 'none',
        minHeight: '100vh',
        height: { xs: 'auto', md: '100%' },
        maxHeight: { xs: 'none', md: '100%' },
        overflow: { xs: 'auto', md: 'hidden' }
      }}
      titleSx={{ color: tokens.text, fontSize: { xs: '1.5rem', md: '1.75rem' }, mb: 0.5 }}
      descriptionSx={{ color: tokens.muted, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
      headerSx={{ mb: { xs: 2, md: 1.5 } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 1 }, height: { xs: 'auto', md: '100%' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 0, md: -0.5 } }}>
          <IconButton
            size="small"
            onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            sx={{
              color: tokens.text,
              bgcolor: alpha(tokens.text, mode === 'dark' ? 0.08 : 0.06),
              border: `1px solid ${alpha(tokens.text, 0.12)}`,
              borderRadius: 1.5,
              '&:hover': { bgcolor: alpha(tokens.text, mode === 'dark' ? 0.12 : 0.08) }
            }}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </IconButton>
        </Box>



        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, md: 0.75 },
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          {kpis.map((tile) => (
            <MetricTile key={tile.key} label={tile.label} value={tile.value} helper={tile.helper} colorKey={tile.key} />
          ))}
        </Box>



        <Box sx={{ flex: 1, minHeight: { xs: 420, md: 0 }, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
          <DistrictVehicleMap
            vehicles={filteredVehicles}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleSelectDistrict}
            mode={mode}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default PublicTransportVehicleMonitoringDashboard;
