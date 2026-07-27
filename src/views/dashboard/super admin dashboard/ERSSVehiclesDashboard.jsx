import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import BhuvanMapComponent from '../../../components/Map/BhuvanMapComponent';

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

const fetchAreaData = async (payload = {}, method = "POST") => {
  try {
    debugger
    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}api/dashboard_ERSS/areawise-device-count/`,
      {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: method === "POST" ? JSON.stringify(payload) : null
      }
    );

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
};

const fetchDashboardMetrics  = async (payload = {}, method = "POST") => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}api/dashboard/erss-summary/?state_id=1`,
      {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: method === "POST" ? JSON.stringify(payload) : null
      }
    );

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
};



const ErssVehicleMap = ({erss, onBack, vehicles,data ,onDistrictClick,level, onZoomChange,onCityClick,onLocalityClick }) => {
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
  const [zoom, setZoom] = useState(7);

  return (

<>
  <BhuvanMapComponent 
    erss={erss} 
    onZoomChange={setZoom} 
    data={data} 
    onDistrictClick={onDistrictClick} 
    onCityClick={onCityClick} 
    onLocalityClick={onLocalityClick} 
    onBack={onBack}
    level={level} 
  />
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

// const [districtData, setDistrictData] = useState([]);
// const [totalDevices, setTotalDevices] = useState(0);
const [districtData, setDistrictData] = useState([]);
const [cityData, setCityData] = useState([]);
const [localityData, setLocalityData] = useState([]);
const [deviceData, setDeviceData] = useState([]);
const [level, setLevel] = useState("district");
const [mapData, setMapData] = useState([]);
const levelRef = useRef(level);
const [dashboardData,setDashboardData]=useState({
   // 📱 Devices
  totalDevices: 0,
  onlineDevices: 0,
  offlineDevices: 0,

  // 🚨 Emergency
  activeEmergencyCalls: 0,

  // 🚑 Ambulance
  totalAmbulanceExecutives: 0,
  ambulanceActiveRecently: 0,

  // 🚓 Police
  totalPoliceExecutives: 0,
  policeActiveRecently: 0,

  // 👮 Combined
  totalExecutives: 0,
  totalActiveExecutives: 0});

const handleDistrictClick = async (district) => {
 debugger
  //  setSelectedDistrictObj(district); // ⭐ ADD THIS
 const res = await fetchAreaData({
    district_name: district.district_name
  });

  if (res?.locations) {
    const cities = res.locations.map(c => ({
      ...c,
      district_name: res.district_name
    }));

    setCityData(cities);
    setMapData(cities);
    setLevel("city");
  }
};
const handleCityClick = async(city) => {
   debugger
  //  setSelectedCityObj(city); // ⭐ ADD THIS
  const res = await fetchAreaData({
    district_name: city.district_name,
    city_name: city.city_village_name
  });

  if (res?.localities) {
    const localitiesWithParent = res.localities.map(l => ({
      ...l,
      district_name: res.district_name,
      city_name: res.city_name
    }));

    setLocalityData(localitiesWithParent);
    setMapData(localitiesWithParent);
    setLevel("locality");
  }
};
const handleLocalityClick =async (locality) => {
   debugger
    //  setSelectedLocalityObj(locality); // ⭐ ADD THIS
  const res = await fetchAreaData({
    district_name: locality.district_name,
    city_name: locality.city_name,
    locality_name: locality.locality_name
  });

  if (res?.devices) {
    setDeviceData(res.devices);
    setMapData(res.devices);
    setLevel("device");
  }
};
const handleBack = async ({ level, data }) => {
 debugger
  if (level === "device" && data) {
  const res = await fetchAreaData({
    district_name: data.district_name,
    city_name: data.city_name
  });

 if (res?.localities) {
  const localities = res.localities.map(l => ({
    ...l,
    district_name: res.district_name,
    city_name: res.city_name
  }));

  setMapData(localities);
  setLevel("locality");
}
}
  else if (level === "locality" && data) {
    debugger
  const res = await fetchAreaData({
    district_name: data.district_name
  });

    if (res?.locations) {

    const cities = res.locations.map(c => ({
      ...c,
      district_name: res.district_name
    }));

    setMapData(cities); // ✅ FIXED
    setLevel("city");
  }
}
 else if (level === "city") {
  setMapData(districtData);
  setLevel("district");
}
};

useEffect(() => {
 const loadData  = async () => {
try {
      const [areaRes, metricsRes] = await Promise.all([
        fetchAreaData({}, "GET"),
        fetchDashboardMetrics({}, "GET")
      ]);

      if (Array.isArray(areaRes)) {
        setDistrictData(areaRes);
         setMapData(areaRes);
      }

    if (metricsRes?.erss_dashboard_metrics) {
      debugger
  const metrics = metricsRes.erss_dashboard_metrics;

  setDashboardData({
    // 📱 Devices
    totalDevices: metrics.total_tagged_device_count,
    onlineDevices: metrics.online_device_count,
    offlineDevices: metrics.offline_device_count,

    // 🚨 Emergency Calls
    activeEmergencyCalls: metrics.active_emergency_calls_count,

    // 🚑 Ambulance
    totalAmbulanceExecutives: metrics.total_ambulance_sos_executive_count,
    ambulanceActiveRecently:
      metrics.ambulance_executive_with_latest_location_within_5_min_count,

    // 🚓 Police
    totalPoliceExecutives: metrics.total_police_sos_executive_count,
    policeActiveRecently:
      metrics.police_executive_with_latest_location_within_5_min_count,

    // 👮 Combined
    totalExecutives:
      metrics.total_police_and_ambulance_sos_executive_count,
    totalActiveExecutives:
      metrics.total_executive_with_latest_location_within_5_min_count
  });
}

    } catch (err) {
      console.error(err);
    }
  };
  //   const res = await fetchAreaData({}, "GET");

  //   if (Array.isArray(res)) {
  //     setDistrictData(res);
  //     setMapData(res);

  //     const total = res.total_vehicle_count;

  //     setTotalDevices(total);
  //   }
  // };

  loadData ();

}, []);


// useEffect(() => {

//   // store dummy data
//   setDistrictData(data);

//   // calculate total
//   const total = data.reduce(
//     (sum, item) => sum + (item.total_vehicle_count || 0),
//     0
//   );

//   setTotalDevices(total);

// }, []);



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
      { key: 'total', label: `Total ${selectedLabel}`, value: dashboardData.totalDevices, helper: null },
      { key: 'online', label: 'Online', value: dashboardData.onlineDevices, helper: null },
      { key: 'onEmergency', label: 'On Emergency', value: dashboardData.activeEmergencyCalls, helper: null },
      { key: 'offline', label: 'Offline', value: dashboardData.offlineDevices, helper: null }
    ];
  }, [filteredVehicles, filters.vehicleType,dashboardData]);

  return (
    <PageWrapper
       title={
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Typography
        sx={{
          color: tokens.text,
          fontSize: { xs: "1.5rem", md: "1.75rem" },
          fontWeight: 600,
        }}
      >
        ERSS Vehicles Monitoring
      </Typography>

      <IconButton
        size="small"
        onClick={() =>
          setMode((prev) => (prev === "dark" ? "light" : "dark"))
        }
        sx={{
          color: tokens.text,
          bgcolor: alpha(tokens.text, mode === "dark" ? 0.08 : 0.06),
          border: `1px solid ${alpha(tokens.text, 0.12)}`,
          borderRadius: 1.5,
          "&:hover": {
            bgcolor: alpha(tokens.text, mode === "dark" ? 0.12 : 0.08),
          },
        }}
      >
        {mode === "dark" ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  }
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
        {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 0, md: -0.5 } }}>
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
        </Box> */}



        <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 0.75 }, flexWrap: 'wrap', flexShrink: 0 }}>
          {kpis.map((tile) => (
            <MetricTile key={tile.key} label={tile.label} value={tile.value} helper={tile.helper} colorKey={tile.key} />
          ))}
        </Box>



        <Box sx={{ flex: 1, minHeight: { xs: 420, md: 0 }, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
          <ErssVehicleMap
          erss={true}
            data={mapData}
          level={level}
          //  onZoomChange={handleZoomChange}
          onBack={handleBack}
  onDistrictClick={handleDistrictClick}
  onCityClick={handleCityClick}
  onLocalityClick={handleLocalityClick}
            vehicles={filteredVehicles}
            selectedDistrict={selectedDistrict}
            selectedType={selectedType}
            onSelectCluster={handleSelectCluster}
            // onBack={handleBackToDistricts}
            mode={mode}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default ERSSVehiclesDashboard;
