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
const DistrictVehicleMap = ({onBack, vehicles,data ,onDistrictClick,level, onZoomChange,onCityClick,onLocalityClick }) => {
 
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
const [zoom, setZoom] = useState(7);
  return (<>
   {zoom >= 9 ? (
  <RoadsMapComponent onZoomChange={(z) => {
    setZoom(z);
    // onZoomChange?.(z);   // ⭐ PASS TO PARENT
  }} data={data} onBack={onBack}  onDistrictClick={onDistrictClick} level={level}  onCityClick={onCityClick}  onLocalityClick={onLocalityClick} />
) : (
  <BhuvanMapComponent onZoomChange={setZoom} data={data} onDistrictClick={onDistrictClick} level={level}/>
)}


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

const fetchAreaData = async (payload = {}, method = "POST") => {
  try {
    const res = await fetch(
      "https://api.gromed.in/api/dashboard/areawise-device-count/",
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
      "https://api.gromed.in/api/dashboard/vehicle-monitoring/",
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








const PublicTransportVehicleMonitoringDashboard = () => {
  // Using existing live data hook to seed dummy points (fallback to generated)



const [districtData, setDistrictData] = useState([]);
const [cityData, setCityData] = useState([]);
const [localityData, setLocalityData] = useState([]);
const [deviceData, setDeviceData] = useState([]);
const [level, setLevel] = useState("district");
const [mapData, setMapData] = useState([]);
const levelRef = useRef(level);
const [dashboardData,setDashboardData]=useState({
  total: 0,
  online: 0,
  offline: 0,
  emergency: 0,
  other: 0});

// const [selectedDistrictObj, setSelectedDistrictObj] = useState(null);
// const [selectedCityObj, setSelectedCityObj] = useState(null);
// const [selectedLocalityObj, setSelectedLocalityObj] = useState(null);


// const [totalDevices, setTotalDevices] = useState(0);
// const data = [
//   {
//     "district_name": "Baksa",
//     "latitude": 26.699,
//     "longitude": 91.487,
//     "total_vehicle_count": 18234
//   },
//   {
//     "district_name": "Bajali",
//     "latitude": 26.495,
//     "longitude": 91.180,
//     "total_vehicle_count": 12456
//   },
//   {
//     "district_name": "Barpeta",
//     "latitude": 26.320,
//     "longitude": 91.000,
//     "total_vehicle_count": 28765
//   },
//   {
//     "district_name": "Biswanath",
//     "latitude": 26.726,
//     "longitude": 93.147,
//     "total_vehicle_count": 15678
//   },
//   {
//     "district_name": "Bongaigaon",
//     "latitude": 26.478,
//     "longitude": 90.556,
//     "total_vehicle_count": 24321
//   },
//   {
//     "district_name": "Cachar",
//     "latitude": 24.833,
//     "longitude": 92.778,
//     "total_vehicle_count": 41234
//   },
//   {
//     "district_name": "Charaideo",
//     "latitude": 27.024,
//     "longitude": 95.016,
//     "total_vehicle_count": 11890
//   },
//   {
//     "district_name": "Chirang",
//     "latitude": 26.486,
//     "longitude": 90.558,
//     "total_vehicle_count": 10987
//   },
//   {
//     "district_name": "Darrang",
//     "latitude": 26.442,
//     "longitude": 92.030,
//     "total_vehicle_count": 17654
//   },
//   {
//     "district_name": "Dhemaji",
//     "latitude": 27.484,
//     "longitude": 94.588,
//     "total_vehicle_count": 13245
//   },
//   {
//     "district_name": "Dhubri",
//     "latitude": 26.018,
//     "longitude": 89.974,
//     "total_vehicle_count": 22110
//   },
//   {
//     "district_name": "Dibrugarh",
//     "latitude": 27.472,
//     "longitude": 94.912,
//     "total_vehicle_count": 33876
//   },
//   {
//     "district_name": "Dima Hasao",
//     "latitude": 25.164,
//     "longitude": 93.017,
//     "total_vehicle_count": 8456
//   },
//   {
//     "district_name": "Goalpara",
//     "latitude": 26.167,
//     "longitude": 90.626,
//     "total_vehicle_count": 16789
//   },
//   {
//     "district_name": "Golaghat",
//     "latitude": 26.523,
//     "longitude": 93.962,
//     "total_vehicle_count": 19876
//   },
//   {
//     "district_name": "Hailakandi",
//     "latitude": 24.683,
//     "longitude": 92.561,
//     "total_vehicle_count": 14567
//   },
//   {
//     "district_name": "Hojai",
//     "latitude": 26.002,
//     "longitude": 92.857,
//     "total_vehicle_count": 17345
//   },
//   {
//     "district_name": "Jorhat",
//     "latitude": 26.751,
//     "longitude": 94.203,
//     "total_vehicle_count": 29754
//   },
//   {
//     "district_name": "Kamrup Metropolitan",
//     "latitude": 26.144,
//     "longitude": 91.736,
//     "total_vehicle_count": 98543
//   },
//   {
//     "district_name": "Kamrup",
//     "latitude": 26.191,
//     "longitude": 91.692,
//     "total_vehicle_count": 26543
//   },
//   {
//     "district_name": "Karbi Anglong",
//     "latitude": 25.844,
//     "longitude": 93.431,
//     "total_vehicle_count": 15432
//   },
//   {
//     "district_name": "Sribhumi",
//     "latitude": 24.869,
//     "longitude": 92.355,
//     "total_vehicle_count": 21456
//   },
//   {
//     "district_name": "Kokrajhar",
//     "latitude": 26.402,
//     "longitude": 90.273,
//     "total_vehicle_count": 18976
//   },
//   {
//     "district_name": "Lakhimpur",
//     "latitude": 27.238,
//     "longitude": 94.105,
//     "total_vehicle_count": 17456
//   },
//   {
//     "district_name": "Majuli",
//     "latitude": 26.954,
//     "longitude": 94.204,
//     "total_vehicle_count": 5432
//   },
//   {
//     "district_name": "Morigaon",
//     "latitude": 26.252,
//     "longitude": 92.342,
//     "total_vehicle_count": 16234
//   },
//   {
//     "district_name": "Nagaon",
//     "latitude": 26.348,
//     "longitude": 92.684,
//     "total_vehicle_count": 35678
//   },
//   {
//     "district_name": "Nalbari",
//     "latitude": 26.442,
//     "longitude": 91.441,
//     "total_vehicle_count": 18567
//   },
//   {
//     "district_name": "Sivasagar",
//     "latitude": 26.984,
//     "longitude": 94.637,
//     "total_vehicle_count": 16890
//   },
//   {
//     "district_name": "Sonitpur",
//     "latitude": 26.633,
//     "longitude": 92.800,
//     "total_vehicle_count": 24890
//   },
//   {
//     "district_name": "South Salmara-Mankachar",
//     "latitude": 25.828,
//     "longitude": 89.901,
//     "total_vehicle_count": 9765
//   },
//   {
//     "district_name": "Tamulpur",
//     "latitude": 26.694,
//     "longitude": 91.102,
//     "total_vehicle_count": 8876
//   },
//   {
//     "district_name": "Tinsukia",
//     "latitude": 27.489,
//     "longitude": 95.359,
//     "total_vehicle_count": 28456
//   },
//   {
//     "district_name": "Udalguri",
//     "latitude": 26.753,
//     "longitude": 92.102,
//     "total_vehicle_count": 13456
//   },
//   {
//     "district_name": "West Karbi Anglong",
//     "latitude": 25.953,
//     "longitude": 92.873,
//     "total_vehicle_count": 7654
//   }
// ];
// const cityLevelData=[{
//   "district_name": "Kamrup",
//   "total_locations": 5,
//   "locations": [
//     {
//       "location_type": "town",
//       "city_village_name": "Rangia",
//       "lat": 26.4700,
//       "lon": 91.6300,
//       "total_vehicle_count": 12840
//     },
//     {
//       "location_type": "town",
//       "city_village_name": "Palashbari",
//       "lat": 26.0181,
//       "lon": 91.0844,
//       "total_vehicle_count": 6840
//     },
//     {
//       "location_type": "town",
//       "city_village_name": "Hajo",
//       "lat": 26.2452,
//       "lon": 91.5253,
//       "total_vehicle_count": 5925
//     },
//     {
//       "location_type": "town",
//       "city_village_name": "Sualkuchi",
//       "lat": 26.1700,
//       "lon": 91.5709,
//       "total_vehicle_count": 4380
//     },
//     {
//       "location_type": "town",
//       "city_village_name": "Boko",
//       "lat": 25.9778,
//       "lon": 91.2356,
//       "total_vehicle_count": 5175
//     }
//   ]
// }];
// const locality=[{
//   "district_name": "Kamrup",
//   "city_name": "Rangia",
//   "city_center_lat": 26.4700,
//   "city_center_lon": 91.6300,
//   "total_localities": 10,
//   "localities": [
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 1",
//       "lat": 26.4728,
//       "lon": 91.6269,
//       "total_vehicle_count": 1180
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 2",
//       "lat": 26.4715,
//       "lon": 91.6288,
//       "total_vehicle_count": 1325
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 3",
//       "lat": 26.4694,
//       "lon": 91.6299,
//       "total_vehicle_count": 1490
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 4",
//       "lat": 26.4679,
//       "lon": 91.6314,
//       "total_vehicle_count": 980
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 5",
//       "lat": 26.4686,
//       "lon": 91.6330,
//       "total_vehicle_count": 1710
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 6",
//       "lat": 26.4701,
//       "lon": 91.6348,
//       "total_vehicle_count": 1045
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 7",
//       "lat": 26.4720,
//       "lon": 91.6339,
//       "total_vehicle_count": 1165
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 8",
//       "lat": 26.4734,
//       "lon": 91.6318,
//       "total_vehicle_count": 760
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 9",
//       "lat": 26.4711,
//       "lon": 91.6361,
//       "total_vehicle_count": 615
//     },
//     {
//       "locality_type": "ward",
//       "locality_name": "Ward No. 10",
//       "lat": 26.4689,
//       "lon": 91.6369,
//       "total_vehicle_count": 570
//     }
//   ]
// }];
// const vehicleLevel=[{
//   "district_name": "Kamrup",
//   "city_name": "Rangia",
//   "locality_name": "Ward No. 5",
//   "locality_center_lat": 26.4686,
//   "locality_center_lon": 91.6330,
//   "total_devices": 5,
//   "devices": [
//     {
//       "device_id": "DEV-KAM-RAN-W05-0001",
//       "vehicle_reg_no": "AS01AB1234",
//       "vehicle_type": "car",
//       "status": "online",
//       "lat": 26.4689,
//       "lon": 91.6335,
//       "last_seen": "2026-03-14T07:10:00+05:30",
//       "speed_kmph": 34
//     },
//     {
//       "device_id": "DEV-KAM-RAN-W05-0002",
//       "vehicle_reg_no": "AS01CD5678",
//       "vehicle_type": "bike",
//       "status": "idle",
//       "lat": 26.4682,
//       "lon": 91.6326,
//       "last_seen": "2026-03-14T07:09:10+05:30",
//       "speed_kmph": 0
//     },
//     {
//       "device_id": "DEV-KAM-RAN-W05-0003",
//       "vehicle_reg_no": "AS25EF9087",
//       "vehicle_type": "truck",
//       "status": "online",
//       "lat": 26.4693,
//       "lon": 91.6341,
//       "last_seen": "2026-03-14T07:08:40+05:30",
//       "speed_kmph": 21
//     },
//     {
//       "device_id": "DEV-KAM-RAN-W05-0004",
//       "vehicle_reg_no": "AS01GH4455",
//       "vehicle_type": "auto",
//       "status": "offline",
//       "lat": 26.4678,
//       "lon": 91.6329,
//       "last_seen": "2026-03-14T06:48:15+05:30",
//       "speed_kmph": 0
//     },
//     {
//       "device_id": "DEV-KAM-RAN-W05-0005",
//       "vehicle_reg_no": "AS01JK7788",
//       "vehicle_type": "bus",
//       "status": "online",
//       "lat": 26.4685,
//       "lon": 91.6338,
//       "last_seen": "2026-03-14T07:10:20+05:30",
//       "speed_kmph": 18
//     }
//   ]
// }];

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

      if (metricsRes) {
        debugger
         const m = metricsRes.dashboard_metrics; // 👈 FIX

        debugger
        setDashboardData({
    total: m.total_active_device_tags??0,
    online: m.online_device_tags ??0,
    offline: m.offline_device_tags??0,
    emergency: m.total_emergency_alerts_today??0,
    other: m.total_other_alerts_today??0
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
      { key: 'total', label: 'Total Devices', value: dashboardData?.total, helper: null },
      { key: 'offline', label: 'Offline', value:dashboardData?.offline, helper: null },
      { key: 'online', label: 'Online', value: dashboardData?.online, helper: null },
      { key: 'alerts', label: 'EA Alerts', value: dashboardData?.emergency, helper: null },
      { key: 'alertsActive', label: 'Normal Alerts', value:dashboardData?.other, helper: null }
    ];
  }, [filteredVehicles,dashboardData]);

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
          data={mapData}
          level={level}
          //  onZoomChange={handleZoomChange}
          onBack={handleBack}
  onDistrictClick={handleDistrictClick}
  onCityClick={handleCityClick}
  onLocalityClick={handleLocalityClick}
          
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

