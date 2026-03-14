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

import { PageWrapper } from './SuperAdminCommon';

const COLORS = {
  border: alpha('#0f172a', 0.08),
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  chipBg: alpha('#0f172a', 0.04),

  ambulance: '#3b82f6',
  police: '#f97316',
  offline: '#64748b',
  notReporting: '#94a3b8',
  emergency: '#ef4444',
  enRoute: '#a855f7',
  available: '#22c55e'
};

const FILTERS = {
  state: ['All', 'Assam'],
  district: ['All', 'Kamrup Metro', 'Kamrup Rural', 'Nagaon', 'Dibrugarh'],
  hospital: ['All', 'GMC', 'Apollo', 'Red Cross'],
  vehicleType: ['All', 'Ambulance', 'Police'],
  ambulanceType: ['All', 'BLS', 'ALS'],
  status: ['All', 'Available', 'On Emergency', 'En-Route Hospital', 'Offline', 'Not Reporting']
};

const metricTileColors = {
  total: { from: '#0ea5e9', to: '#2563eb' },
  loggedIn: { from: '#0ea5e9', to: '#2563eb' },
  online: { from: '#22c55e', to: '#16a34a' },
  available: { from: '#22c55e', to: '#16a34a' },
  onEmergency: { from: '#ef4444', to: '#dc2626' },
  enRoute: { from: '#a855f7', to: '#7c3aed' },
  offline: { from: '#334155', to: '#64748b' },
  notReporting: { from: '#64748b', to: '#94a3b8' }
};

const DISTRICTS = [
  { name: 'Kamrup Metro', center: [91.7362, 26.1445] },
  { name: 'Nagaon', center: [92.6850, 26.3569] },
  { name: 'Dibrugarh', center: [94.9110, 27.4728] },
  { name: 'Kamrup Rural', center: [91.3700, 26.0500] },
  { name: 'Jorhat', center: [94.2037, 26.7465] },
  { name: 'Silchar', center: [92.7789, 24.8333] }
];

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
      {helper ? <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', md: '0.75rem' } }}>{helper}</Typography> : null}
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

const buildDummyErssVehicles = () => {
  const vehicles = [];
  const total = 8;

  const pickDistrict = (idx) => DISTRICTS[idx % DISTRICTS.length];
  const pickType = (idx) => (idx % 3 === 0 ? 'police' : 'ambulance');
  const pickStatus = (idx) => {
    const mod = idx % 16;
    if (mod === 0) return 'on_emergency';
    if (mod === 1) return 'en_route_hospital';
    if (mod === 2) return 'offline';
    if (mod === 3) return 'not_reporting';
    if (mod === 4) return 'available';
    return 'online';
  };

  for (let i = 0; i < total; i += 1) {
    const district = pickDistrict(i);
    const type = pickType(i);

    const spreadLat = (Math.sin(i * 0.83) + Math.cos(i * 0.17)) * 0.03;
    const spreadLon = (Math.cos(i * 0.58) + Math.sin(i * 0.29)) * 0.05;

    vehicles.push({
      id: `${type === 'ambulance' ? 'AMB' : 'POL'}-${String(10000 + i).slice(-5)}`,
      regNo: `AS-${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).slice(-4)}`,
      type,
      district: district.name,
      latitude: district.center[1] + spreadLat,
      longitude: district.center[0] + spreadLon,
      status: pickStatus(i)
    });
  }

  return vehicles;
};

const ErssVehicleMap = ({ vehicles,data }) => {
  const gpsData = useMemo(() => {
    const nowIso = new Date().toISOString();
    return (Array.isArray(vehicles) ? vehicles : []).map((v) => {
      const isOnline = v.status === 'online' || v.status === 'available' || v.status === 'on_emergency' || v.status === 'en_route_hospital';
      const packetType = v.status === 'on_emergency' ? 'EA' : 'NR';

      return {
        latitude: v.latitude,
        longitude: v.longitude,
        packet_type: packetType,
        ignition_status: isOnline ? '1' : '0',
        speed: isOnline ? 10 : 0,
        entry_time: nowIso,
        markerCategory: v.type === 'ambulance' ? 'ambulance' : 'police'
      };
    });
  }, [vehicles]);
  const [zoom, setZoom] = useState(8);

  return (

<>

 {zoom >= 9 ? (
  <RoadsMapComponent onZoomChange={setZoom} data={data} />
) : (
  <BhuvanMapComponent onZoomChange={setZoom} data={data} />
)}

</>


    // <BhuvanMapComponent
    //   gpsData={gpsData}
    //   width="100%"
    //   height="100%"
    //   autoFit
    //   markerLabelMode="none"
    //   showMapTypeToggle
    //   showDrawControls={false}
    //   showSoiLayerPanel={false}
    //   showLogos
    // />
  );
};

const ERSSVehiclesDashboard = () => {

const [districtData, setDistrictData] = useState([]);
const [totalDevices, setTotalDevices] = useState(0);
const data = [
  {
    "district_name": "Baksa",
    "latitude": 26.699,
    "longitude": 91.487,
    "total_vehicle_count": 18234
  },
  {
    "district_name": "Bajali",
    "latitude": 26.495,
    "longitude": 91.180,
    "total_vehicle_count": 12456
  },
  {
    "district_name": "Barpeta",
    "latitude": 26.320,
    "longitude": 91.000,
    "total_vehicle_count": 28765
  },
  {
    "district_name": "Biswanath",
    "latitude": 26.726,
    "longitude": 93.147,
    "total_vehicle_count": 15678
  },
  {
    "district_name": "Bongaigaon",
    "latitude": 26.478,
    "longitude": 90.556,
    "total_vehicle_count": 24321
  },
  {
    "district_name": "Cachar",
    "latitude": 24.833,
    "longitude": 92.778,
    "total_vehicle_count": 41234
  },
  {
    "district_name": "Charaideo",
    "latitude": 27.024,
    "longitude": 95.016,
    "total_vehicle_count": 11890
  },
  {
    "district_name": "Chirang",
    "latitude": 26.486,
    "longitude": 90.558,
    "total_vehicle_count": 10987
  },
  {
    "district_name": "Darrang",
    "latitude": 26.442,
    "longitude": 92.030,
    "total_vehicle_count": 17654
  },
  {
    "district_name": "Dhemaji",
    "latitude": 27.484,
    "longitude": 94.588,
    "total_vehicle_count": 13245
  },
  {
    "district_name": "Dhubri",
    "latitude": 26.018,
    "longitude": 89.974,
    "total_vehicle_count": 22110
  },
  {
    "district_name": "Dibrugarh",
    "latitude": 27.472,
    "longitude": 94.912,
    "total_vehicle_count": 33876
  },
  {
    "district_name": "Dima Hasao",
    "latitude": 25.164,
    "longitude": 93.017,
    "total_vehicle_count": 8456
  },
  {
    "district_name": "Goalpara",
    "latitude": 26.167,
    "longitude": 90.626,
    "total_vehicle_count": 16789
  },
  {
    "district_name": "Golaghat",
    "latitude": 26.523,
    "longitude": 93.962,
    "total_vehicle_count": 19876
  },
  {
    "district_name": "Hailakandi",
    "latitude": 24.683,
    "longitude": 92.561,
    "total_vehicle_count": 14567
  },
  {
    "district_name": "Hojai",
    "latitude": 26.002,
    "longitude": 92.857,
    "total_vehicle_count": 17345
  },
  {
    "district_name": "Jorhat",
    "latitude": 26.751,
    "longitude": 94.203,
    "total_vehicle_count": 29754
  },
  {
    "district_name": "Kamrup Metropolitan",
    "latitude": 26.144,
    "longitude": 91.736,
    "total_vehicle_count": 98543
  },
  {
    "district_name": "Kamrup",
    "latitude": 26.191,
    "longitude": 91.692,
    "total_vehicle_count": 26543
  },
  {
    "district_name": "Karbi Anglong",
    "latitude": 25.844,
    "longitude": 93.431,
    "total_vehicle_count": 15432
  },
  {
    "district_name": "Sribhumi",
    "latitude": 24.869,
    "longitude": 92.355,
    "total_vehicle_count": 21456
  },
  {
    "district_name": "Kokrajhar",
    "latitude": 26.402,
    "longitude": 90.273,
    "total_vehicle_count": 18976
  },
  {
    "district_name": "Lakhimpur",
    "latitude": 27.238,
    "longitude": 94.105,
    "total_vehicle_count": 17456
  },
  {
    "district_name": "Majuli",
    "latitude": 26.954,
    "longitude": 94.204,
    "total_vehicle_count": 5432
  },
  {
    "district_name": "Morigaon",
    "latitude": 26.252,
    "longitude": 92.342,
    "total_vehicle_count": 16234
  },
  {
    "district_name": "Nagaon",
    "latitude": 26.348,
    "longitude": 92.684,
    "total_vehicle_count": 35678
  },
  {
    "district_name": "Nalbari",
    "latitude": 26.442,
    "longitude": 91.441,
    "total_vehicle_count": 18567
  },
  {
    "district_name": "Sivasagar",
    "latitude": 26.984,
    "longitude": 94.637,
    "total_vehicle_count": 16890
  },
  {
    "district_name": "Sonitpur",
    "latitude": 26.633,
    "longitude": 92.800,
    "total_vehicle_count": 24890
  },
  {
    "district_name": "South Salmara-Mankachar",
    "latitude": 25.828,
    "longitude": 89.901,
    "total_vehicle_count": 9765
  },
  {
    "district_name": "Tamulpur",
    "latitude": 26.694,
    "longitude": 91.102,
    "total_vehicle_count": 8876
  },
  {
    "district_name": "Tinsukia",
    "latitude": 27.489,
    "longitude": 95.359,
    "total_vehicle_count": 28456
  },
  {
    "district_name": "Udalguri",
    "latitude": 26.753,
    "longitude": 92.102,
    "total_vehicle_count": 13456
  },
  {
    "district_name": "West Karbi Anglong",
    "latitude": 25.953,
    "longitude": 92.873,
    "total_vehicle_count": 7654
  }
];

useEffect(() => {

  // store dummy data
  setDistrictData(data);

  // calculate total
  const total = data.reduce(
    (sum, item) => sum + (item.total_vehicle_count || 0),
    0
  );

  setTotalDevices(total);

}, []);



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

  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    hospital: 'All',
    vehicleType: 'All',
    ambulanceType: 'All',
    status: 'All'
  });

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const vehicles = useMemo(() => buildDummyErssVehicles(), []);

  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    if (filters.district && filters.district !== 'All') {
      result = result.filter((v) => v.district === filters.district);
    }

    if (filters.vehicleType && filters.vehicleType !== 'All') {
      const desiredType = filters.vehicleType === 'Police' ? 'police' : 'ambulance';
      result = result.filter((v) => v.type === desiredType);
    }

    if (filters.status && filters.status !== 'All') {
      const mapStatus = {
        Available: 'available',
        'On Emergency': 'on_emergency',
        'En-Route Hospital': 'en_route_hospital',
        Offline: 'offline',
        'Not Reporting': 'not_reporting'
      };
      const desired = mapStatus[filters.status];
      if (desired) result = result.filter((v) => v.status === desired);
    }

    return result;
  }, [vehicles, filters.district, filters.vehicleType, filters.status]);

  useEffect(() => {
    if (filters.district && filters.district !== 'All') {
      setSelectedDistrict(filters.district);
      return;
    }
    setSelectedDistrict(null);
    setSelectedType(null);
  }, [filters.district]);

  useEffect(() => {
    if (selectedType) {
      setFilters((prev) => ({ ...prev, vehicleType: selectedType === 'police' ? 'Police' : 'Ambulance' }));
    }
  }, [selectedType]);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleReset = () => {
    setFilters({
      state: 'All',
      district: 'All',
      hospital: 'All',
      vehicleType: 'All',
      ambulanceType: 'All',
      status: 'All'
    });
  };

  const handleSelectCluster = useCallback(({ district, type }) => {
    setFilters((prev) => ({ ...prev, district }));
    setSelectedDistrict(district);
    setSelectedType(type);
  }, []);

  const handleBackToDistricts = useCallback(() => {
    setFilters((prev) => ({ ...prev, district: 'All' }));
    setSelectedDistrict(null);
    setSelectedType(null);
  }, []);

  const kpis = useMemo(() => {
    const selectedLabel =
      filters.vehicleType === 'Police' ? 'Police Vehicles' : filters.vehicleType === 'Ambulance' ? 'Ambulances' : 'Vehicles';
    const selectedVehicles = filteredVehicles;

    const totals = {
      total: selectedVehicles.length,
      loggedIn: selectedVehicles.length,
      online: 0,
      available: 0,
      onEmergency: 0,
      enRoute: 0,
      offline: 0,
      notReporting: 0
    };

    selectedVehicles.forEach((v) => {
      if (v.status === 'online') totals.online += 1;
      if (v.status === 'available') totals.available += 1;
      if (v.status === 'on_emergency') totals.onEmergency += 1;
      if (v.status === 'en_route_hospital') totals.enRoute += 1;
      if (v.status === 'offline') totals.offline += 1;
      if (v.status === 'not_reporting') {
        totals.notReporting += 1;
        totals.offline += 1;
      }
    });

    return [
      { key: 'total', label: `Total ${selectedLabel}`, value: totalDevices, helper: null },
      { key: 'online', label: 'Online', value: totals.online, helper: null },
      { key: 'onEmergency', label: 'On Emergency', value: totals.onEmergency, helper: null },
      { key: 'offline', label: 'Offline', value: totals.offline, helper: null }
    ];
  }, [filteredVehicles, filters.vehicleType,totalDevices]);

  return (
    <PageWrapper
      title="ERSS Vehicles Monitoring"
      // description="Ambulance & Police live monitoring across districts (dummy data)."
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



        <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 0.75 }, flexWrap: 'wrap', flexShrink: 0 }}>
          {kpis.map((tile) => (
            <MetricTile key={tile.key} label={tile.label} value={tile.value} helper={tile.helper} colorKey={tile.key} />
          ))}
        </Box>



        <Box sx={{ flex: 1, minHeight: { xs: 420, md: 0 }, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
          <ErssVehicleMap
          data={districtData}
            vehicles={filteredVehicles}
            selectedDistrict={selectedDistrict}
            selectedType={selectedType}
            onSelectCluster={handleSelectCluster}
            onBack={handleBackToDistricts}
            mode={mode}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default ERSSVehiclesDashboard;
