import { useMemo, useState,useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import axios from 'axios';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { PageWrapper } from './SuperAdminCommon';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  ink: '#0f172a',
  muted: '#475569',
  surface: '#ffffff',
  border: alpha('#0f172a', 0.08),
  cardBg: alpha('#ffffff', 0.92)
};

const ChartCard = ({ title, subtitle, children, color, tokens }) => (
  <Box
    sx={{
      height: '100%',
      borderRadius: 2,
      border: `1px solid ${alpha(color, 0.18)}`,
      bgcolor: tokens?.cardBg || COLORS.cardBg,
      boxShadow: `0 12px 30px -20px ${alpha(color, 0.45)}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderBottom: `1px solid ${alpha(color, 0.12)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.14)} 0%, ${alpha(color, 0.03)} 100%)`
      }}
    >
      <Typography sx={{ fontWeight: 700, color: tokens?.text || COLORS.ink, fontSize: '0.85rem' }}>{title}</Typography>
      <Typography sx={{ color: tokens?.muted || COLORS.muted, fontSize: '0.7rem', mt: 0.15 }}>{subtitle}</Typography>
    </Box>
    <Box sx={{ flex: 1, minHeight: 0, p: 1.5 }}>{children}</Box>
  </Box>
);

const TooltipBox = ({ active, payload, label, tokens }) => {
  if (!active || !payload?.length) return null;

  const titleColor = tokens?.text || COLORS.ink;
  const rowColor = tokens?.muted || COLORS.muted;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        bgcolor: tokens?.cardBg || COLORS.cardBg,
        border: `1px solid ${tokens?.border || COLORS.border}`,
        boxShadow: '0 15px 30px -18px rgba(15, 23, 42, 0.4)'
      }}
    >
      <Typography sx={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem' }}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey || entry.name} sx={{ color: rowColor, fontSize: '0.7rem' }}>
          {entry.name}: {entry.value}
        </Typography>
      ))}
    </Box>
  );
};

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 1.5 }}>
    {value === index ? children : null}
  </Box>
);

const SOSAnalyticsDashboard = () => {
  const [mode, setMode] = useState('light');
  const [tabValue, setTabValue] = useState(0);
  const [overviewSubTab, setOverviewSubTab] = useState(0);
  const [monthwiseSubTab, setMonthwiseSubTab] = useState(0);
  const [timeBasedSubTab, setTimeBasedSubTab] = useState(0);
  const [districtSubTab, setDistrictSubTab] = useState(0);
  const [policeStationSubTab, setPoliceStationSubTab] = useState(0);
  const [typeDistSubTab, setTypeDistSubTab] = useState(0);
  const [topPerformersSubTab, setTopPerformersSubTab] = useState(0);
   const [monthwiseData, setMonthwiseData] = useState([]);
   const [hourlyData, setHourlyData] = useState([]);
   const [districtSeries, setDistrictSeries] = useState([{  name: 'Baksa', total: 1 }]);
   const [policeStationSeries, setPoliceStationSeries] = useState([]);
   const [timeOfDayHeatmap, setTimeOfDayHeatmap] = useState([]);
const [sosByTypeData, setSosByTypeData] = useState({
  panic_alert: 1,
  medical_emergency: 1,
  accident: 1,
  others: 1
});
const [panicBreakdownData, setPanicBreakdownData] = useState({
  sital_alert: 1,
  medical: 1,
  fire_alarm: 1
});
const [ambulanceBreakdownData, setAmbulanceBreakdownData] = useState({
  threat_perception: 1,
  others: 1
});
const [topDistricts, setTopDistricts] = useState([
  { name: 'unknown', total: 1, sla: 1, policeAccepted: 1 }
 ]);
 const [districtsTrend, setDistrictsTrend] = useState([
  { t: 'unknown', Guwahati: 1 }

]);
const [topPoliceStations, setTopPoliceStations] = useState([
  { month: 'Jan', Dispur: 50, Panbazar: 45, Latasil: 40 }
]);
const [overallSLACompliance, setOverallSLACompliance] = useState({OverallSLA_Value:1}); // default 90%


  

  const tokens = useMemo(() => {
    if (mode === 'dark') {
      return {
        pageBg: '#1a1f2e',
        cardBg: alpha('#0f1419', 0.92),
        border: alpha('#475569', 0.3),
        text: '#e5e7eb',
        muted: alpha('#e5e7eb', 0.7)
      };
    }

    return {
      pageBg: '#f8fafc',
      cardBg: alpha('#ffffff', 0.92),
      border: alpha('#0f172a', 0.08),
      text: '#0f172a',
      muted: '#475569'
    };
  }, [mode]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

// -------------------------------start--------------------------------------

useEffect(() => {
  const fetchAllDashboardData = async () => {
    try {
      const response = await axios.get(
        "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
      );
      const data = response.data;
console.log(data);
      // Monthwise data
      if (data.month_wise_metrics) {
        setMonthwiseData(
          data.month_wise_metrics.map((item) => ({
            month: item.month,
            total: item.total_calls_count,
            genuine: item.genuine ?? 0,
            panic: item.panic ?? 0,
            policeAccepted: item.total_police_accepted_count ?? 0,
            ambAccepted: item.total_ambulance_accepted_count ?? 0,
            other: item.other ?? 0,
            fake: item.total_fake_call_close ?? 0
          }))
        );
      }

      // Hourly data
      if (data.hour_of_day_wise_metrics) {
        setHourlyData(
          data.hour_of_day_wise_metrics.map((item) => ({
            time: item.hour_of_day,
            total: item.total_calls_count
          }))
        );
      }

      // District series
      if (data.district_wise_metrics) {
        setDistrictSeries(
          data.district_wise_metrics.map((item) => ({
            name: item.district_name,
            total: item.total_calls_count ?? 0
          }))
        );
      }
debugger
      // Police Station series
      if (data.policestation_wise_metrics) {
        setPoliceStationSeries(
          data.policestation_wise_metrics.map((item) => ({
            name: item.policestation_name ?? "Unknown",
            total: item.total_calls_count ?? 0
          }))
        );
      }
debugger
      // Time of Day Heatmap
      if (data.timeOfDayHeatmap_wise_metrics) {
        setTimeOfDayHeatmap(
          data.timeOfDayHeatmap_wise_metrics.map((item) => ({
            day: item.day ?? "Unknown",
            values: item.values ?? [1, 10, 15]
          }))
        );
      }

      // SOS by Type
      if (data.fetchsosByType_wise_metrics) {
        const apiData = data.fetchsosByType_wise_metrics;
        setSosByTypeData({
          panic_alert: apiData.panic_alert ?? sosByTypeData.panic_alert,
          medical_emergency: apiData.medical_emergency ?? sosByTypeData.medical_emergency,
          accident: apiData.accident ?? sosByTypeData.accident,
          others: apiData.others ?? sosByTypeData.others
        });
      }

      // Panic Breakdown
      if (data.fetchPanicBreakdown_metrics) {
        const apiData = data.fetchPanicBreakdown_metrics;
        setPanicBreakdownData({
          sital_alert: apiData.sital_alert ?? panicBreakdownData.sital_alert,
          medical: apiData.medical ?? panicBreakdownData.medical,
          fire_alarm: apiData.fire_alarm ?? panicBreakdownData.fire_alarm
        });
      }

      // Ambulance Breakdown
      if (data.fetchAmbulanceBreakdown_metrics) {
        const apiData = data.fetchAmbulanceBreakdown_metrics;
        setAmbulanceBreakdownData({
          threat_perception: apiData.threat_perception ?? ambulanceBreakdownData.threat_perception,
          others: apiData.Others ?? ambulanceBreakdownData.others
        });
      }

 

      // Districts Trend
      if (data.districtsTrend_metrics) {
        setDistrictsTrend(
          data.districtsTrend_metrics.map((item) => ({
            t: item.t ?? "Unknown",
            Central: item.Guwahati ?? 0
            // West: item.West ?? 0,
            // South: item.South ?? 0
          }))
        );
      }

      // Top Police Stations
      if (data.topPoliceStations_metrics) {
        setTopPoliceStations(
          data.topPoliceStations_metrics.map((item) => ({
            month: item.month ?? "Unknown",
            Dispur: item.Dispur ?? 0,
            Panbazar: item.Panbazar ?? 0,
            Latasil: item.Latasil ?? 0
          }))
        );
      }
debugger
      // Overall SLA
      if (data.overallSLA) {
        setOverallSLACompliance(data.overallSLA ?? 1);
      }

           // Top Districts
      if (data.topDistrict_metrics) {
        setTopDistricts(
          data.topDistrict_metrics.map((item) => ({
            name: item.name ?? "Unknown",
            total: item.total ?? 0,
            sla: item.sla ?? 0,
            policeAccepted: item.policeAccepted ?? 0
          }))
        );
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // fallback: all states keep their default values
    }
  };

  fetchAllDashboardData();
}, []);

// ---------------------------------end-------------------------------------------

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//         );
// debugger
//         // Transform API response to your previous dummy structure
//         const transformed = response.data.month_wise_metrics.map((item) => ({
//           month: item.month,
//           total: item.total_calls_count,
//           genuine:
//             'genuine' in item
//               ? item.genuine
//               : 0,
//           panic: 'panic' in item
//               ? item.panic
//               : 0, // map as per your logic
//           policeAccepted: item.total_police_accepted_count,
//           ambAccepted: item.total_ambulance_accepted_count,
//           other:  'other' in item
//               ? item.other
//               : 0,// if API doesn't have, put 0
//           fake: item.total_fake_call_close,
//         }));

//         setMonthwiseData(transformed);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         // setError(err.message);
//       } 
//     };

//     fetchData();
//   }, []);


  // Monthwise data from user's image
  // const monthwiseData = useMemo(
  //   () => [
  //     { month: 'Jan', total: 50, genuine: 40, panic: 4, policeAccepted: 3, ambAccepted: 2, other: 1, fake: 10 },
  //     { month: 'Feb', total: 20, genuine: 15, panic: 2, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 },
  //     { month: 'Mar', total: 39, genuine: 32, panic: 2, policeAccepted: 2, ambAccepted: 1, other: 2, fake: 7 },
  //     { month: 'Apr', total: 40, genuine: 35, panic: 1, policeAccepted: 2, ambAccepted: 1, other: 1, fake: 5 },
  //     { month: 'May', total: 37, genuine: 30, panic: 2, policeAccepted: 2, ambAccepted: 1, other: 2, fake: 7 },
  //     { month: 'Jun', total: 48, genuine: 40, panic: 3, policeAccepted: 2, ambAccepted: 2, other: 1, fake: 8 },
  //     { month: 'Jul', total: 95, genuine: 80, panic: 6, policeAccepted: 4, ambAccepted: 3, other: 2, fake: 15 },
  //     { month: 'Aug', total: 29, genuine: 24, panic: 1, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 },
  //     { month: 'Sept', total: 30, genuine: 25, panic: 1, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 },
  //     { month: 'Oct', total: 47, genuine: 38, panic: 3, policeAccepted: 2, ambAccepted: 1, other: 3, fake: 9 },
  //     { month: 'Nov', total: 49, genuine: 42, panic: 2, policeAccepted: 2, ambAccepted: 1, other: 2, fake: 7 },
  //     { month: 'Dec', total: 29, genuine: 24, panic: 1, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 }
  //   ],
  //   []
  // );

  const monthwiseTotals = useMemo(
    () => monthwiseData.map((d) => ({ month: d.month, total: d.total })),
    [monthwiseData]
  );



//   useEffect(() => {
//     const fetchHourlyData = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//         );
// debugger
//         // Transform API response to your previous dummy structure
//         const transformed = response.data.hour_of_day_wise_metrics.map((item) => ({
//           time: item.hour_of_day,
//           total: item.total_calls_count,
         
//         }));

//         setHourlyData(transformed);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         // setError(err.message);
//       } 
//     };

//     fetchHourlyData();
//   }, []);


  // const hourlyData = useMemo(
  //   () => [
  //     { time: '00:00-01:00', total: 50 },
  //     { time: '01:00-02:00', total: 20 },
  //     { time: '02:00-03:00', total: 39 },
  //     { time: '03:00-04:00', total: 40 },
  //     { time: '04:00-05:00', total: 37 },
  //     { time: '05:00-06:00', total: 48 },
  //     { time: '06:00-07:00', total: 95 },
  //     { time: '07:00-08:00', total: 29 },
  //     { time: '08:00-09:00', total: 30 },
  //     { time: '09:00-10:00', total: 47 },
  //     { time: '10:00-11:00', total: 49 },
  //     { time: '11:00-12:00', total: 29 },
  //     { time: '12:00-13:00', total: 20 },
  //     { time: '13:00-14:00', total: 20 },
  //     { time: '14:00-15:00', total: 40 },
  //     { time: '15:00-16:00', total: 50 },
  //     { time: '16:00-17:00', total: 37 },
  //     { time: '17:00-18:00', total: 48 },
  //     { time: '18:00-19:00', total: 59 },
  //     { time: '19:00-20:00', total: 29 },
  //     { time: '20:00-21:00', total: 50 },
  //     { time: '21:00-22:00', total: 58 },
  //     { time: '22:00-23:00', total: 39 },
  //     { time: '23:00-24:00', total: 20 }
  //   ],
  //   []
  // );

//  useEffect(() => {
//     const fetchDistrictSeries = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//         );
// debugger
// console.log(response.data);
//         // Transform API response to your previous dummy structure
//          if (response ) {
//         const transformed = response.data.district_wise_metrics.map((item) => ({
//           name: item.district_name,
//           total: item.total_calls_count,
         
//         }));

//         setDistrictSeries(transformed);}
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         // setError(err.message);
//       } 
//     };

//     fetchDistrictSeries();
//   }, []);

  // const districtSeries = useMemo(
  //   () => [
  //     { name: 'Baksa', total: 50 },
  //     { name: 'Barpeta', total: 20 },
  //     { name: 'Chirang', total: 39 },
  //     { name: 'Goalpara', total: 40 },
  //     { name: 'Kamrup Metropolitan', total: 37 },
  //     { name: 'Nalbari', total: 48 },
  //     { name: 'Tamulpur', total: 95 },
  //     { name: 'Darrang', total: 29 },
  //     { name: 'Udalguri', total: 30 },
  //     { name: 'Dhemaji', total: 47 },
  //     { name: 'Golaghat', total: 49 },
  //     { name: 'Lakhimpur', total: 29 },
  //     { name: 'Sivasagar', total: 20 },
  //     { name: 'Dima Hasao', total: 20 },
  //     { name: 'Karbi Anglong', total: 40 },
  //     { name: 'West Karbi Anglong', total: 50 },
  //     { name: 'Cachar', total: 37 },
  //     { name: 'Hailakandi', total: 48 },
  //     { name: 'Karimganj', total: 58 }
  //   ],
  //   []
  // );


//  useEffect(() => {
//     const fetchPoliceStationSeries = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//         );
// debugger
//         // // Transform API response to your previous dummy structure
//         // const transformed = response.data.policeStation_wise_metrics.map((item) => ({
//         //   name: item.district_name,
//         //   total: item.total_calls_count,
         
//         // }));
// const apiData = response.data.policeStation_wise_metrics;

//      let transformed = [];
//            if (Array.isArray(apiData) && apiData.length > 0) {
//         // ✅ Use API data if available
//         transformed = apiData.map((item) => ({
//           name: item.district_name ?? "Unknown",
//           total: item.total_calls_count ?? 0,
//         }));
//       } else {
//         // ✅ Fallback dummy data
//         transformed = [
//           { name: "Station A", total: 1 },
//           { name: "Station B", total: 1 },
//           { name: "Station C", total: 1 },
//         ];
//       }

//         setPoliceStationSeries(transformed);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         // setError(err.message);
//       } 
//     };

//     fetchPoliceStationSeries();
//   }, []);



  // const policeStationSeries = useMemo(
  //   () => [
  //     { name: 'Dispur', total: 50 },
  //     { name: 'Panbazar', total: 20 },
  //     { name: 'Latasil', total: 39 },
  //     { name: 'Paltan Bazar', total: 40 },
  //     { name: 'Gorchuk', total: 37 },
  //     { name: 'Noonmati', total: 48 },
  //     { name: 'Chandmari', total: 95 },
  //     { name: 'Basistha', total: 29 },
  //     { name: 'Panjabari', total: 30 },
  //     { name: 'Geetanagar', total: 47 },
  //     { name: 'Nalbari', total: 49 },
  //     { name: 'South Salmara-Mankachar', total: 29 },
  //     { name: 'Tamulpur', total: 20 },
  //     { name: 'Biswanath', total: 20 },
  //     { name: 'Darrang', total: 40 },
  //     { name: 'Sonitpur', total: 50 },
  //     { name: 'Udalguri', total: 37 },
  //     { name: 'Charaideo', total: 48 },
  //     { name: 'Dhemaji', total: 59 },
  //     { name: 'Dibrugarh', total: 29 },
  //     { name: 'Golaghat', total: 50 },
  //     { name: 'Jorhat', total: 58 },
  //     { name: 'Lakhimpur', total: 39 },
  //     { name: 'Majuli', total: 20 },
  //     { name: 'Sivasagar', total: 20 },
  //     { name: 'Tinsukia', total: 20 },
  //     { name: 'Dima Hasao', total: 40 },
  //     { name: 'Hojai', total: 50 },
  //     { name: 'Morigaon', total: 37 },
  //     { name: 'Nagaon', total: 48 },
  //     { name: 'Karbi Anglong', total: 58 },
  //     { name: 'West Karbi Anglong', total: 39 },
  //     { name: 'Cachar', total: 20 },
  //     { name: 'Hailakandi', total: 20 },
  //     { name: 'Karimganj', total: 20 }
  //   ],
  //   []
  // );


//  useEffect(() => {
//     const fetchtimeOfDayHeatmap = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//         );

// const apiData = response.data.timeOfDayHeatmap_wise_metrics;

//      let transformed = [];
//            if (Array.isArray(apiData) && apiData.length > 0) {
//         // ✅ Use API data if available
//         transformed = apiData.map((item) => ({
//           day: item.day ?? "Unknown",
//           values: item.values ?? [1,10,15],
//         }));
//       } else {
//         // ✅ Fallback dummy data
//         transformed = [
//           { day: "Unknown", values:[1,10,15] },
         
//         ];
//       }

//         setTimeOfDayHeatmap(transformed);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         // setError(err.message);
//       } 
//     };

//     fetchtimeOfDayHeatmap();
//   }, []);


  // const timeOfDayHeatmap = useMemo(
  //   () => [
  //     { day: 'Mon', values: [8, 6, 5, 4, 3, 4, 6, 7, 9, 10, 8, 7, 6, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5] },
  //     { day: 'Tue', values: [7, 5, 4, 3, 3, 4, 6, 8, 10, 11, 9, 8, 7, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6] },
  //     { day: 'Wed', values: [6, 5, 4, 3, 2, 3, 5, 7, 9, 10, 9, 8, 7, 6, 6, 7, 8, 9, 10, 10, 9, 8, 7, 6] },
  //     { day: 'Thu', values: [6, 4, 4, 3, 2, 3, 5, 7, 9, 11, 10, 9, 7, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6] },
  //     { day: 'Fri', values: [7, 5, 4, 3, 2, 3, 5, 8, 10, 12, 11, 10, 8, 7, 8, 9, 10, 11, 13, 12, 11, 10, 8, 7] },
  //     { day: 'Sat', values: [8, 7, 6, 5, 4, 5, 7, 9, 11, 13, 12, 11, 9, 8, 9, 10, 11, 12, 14, 13, 12, 11, 9, 8] },
  //     { day: 'Sun', values: [9, 8, 7, 6, 5, 6, 8, 10, 12, 14, 13, 12, 10, 9, 10, 11, 12, 13, 15, 14, 13, 12, 10, 9] }
  //   ],
  //   []
  // );

// useEffect(() => {
//   const fetchsosByType = async () => {
//     try {
//       const response = await axios.get(
//         "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );

//       // ✅ Only set API values if key exists and is an object
//       if (response.data && response.data.fetchsosByType_wise_metrics) {
//         const apiData = response.data.fetchsosByType_wise_metrics;

//         // Set values from API
//         setSosByTypeData({
//           panic_alert: apiData.panic_alert ?? sosByTypeData.panic_alert,
//           medical_emergency: apiData.medical_emergency ?? sosByTypeData.medical_emergency,
//           accident: apiData.accident ?? sosByTypeData.accident,
//           others: apiData.others ?? sosByTypeData.others
//         });
//       }
//       // else: do nothing, keep default values

//     } catch (err) {
//       console.error("Error fetching data:", err);
//       // Optional: keep default values on error
//     }
//   };

//   fetchsosByType();
// }, []);

  const sosByType = useMemo(
    () => [
      { name: 'Panic Alert', value: sosByTypeData.panic_alert, color: COLORS.primary },
      { name: 'Medical Emergency', value:  sosByTypeData.medical_emergency, color: COLORS.secondary },
      { name: 'Accident', value: sosByTypeData.accident, color: COLORS.warning },
      { name: 'Others', value: sosByTypeData.others, color: COLORS.accent }
    ],
    [sosByTypeData]
  );
// useEffect(() => {
//   const fetchPanicBreakdown = async () => {
//     try {
//       debugger
//       const response = await axios.get(
//        "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );
// debugger
//       // ✅ Only update if API key exists
//       if (response.data && response.data.fetchPanicBreakdown_metrics) {
//         const apiData = response.data.fetchPanicBreakdown_metrics;
// debugger
//         setPanicBreakdownData({
//           sital_alert: apiData.sital_alert ,
//           medical: apiData.medical ,
//           fire_alarm: apiData.fire_alarm 
//         });
//       }
//       // else: keep default values
//     } catch (err) {
//       console.error("Error fetching panic breakdown:", err);
//       // keep default values
//     }
//   };

//   fetchPanicBreakdown();
// }, []);



  const panicBreakdown = useMemo(
    () => [
      { name: 'Sital Alert', value:  panicBreakdownData.sital_alert, color: COLORS.success },
      { name: 'Medical', value: panicBreakdownData.medical, color: COLORS.primary },
      { name: 'Fire Alarm', value: panicBreakdownData.fire_alarm, color: COLORS.danger }
    ],
    [panicBreakdownData]
  );
// useEffect(() => {
//   const fetchAmbulanceBreakdown = async () => {
//     try {
//       const response = await axios.get(
//       "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );
//       debugger

//       // ✅ Only update if API key exists
//       if (response.data && response.data.fetchAmbulanceBreakdown_metrics) {
//         const apiData = response.data.fetchAmbulanceBreakdown_metrics;

//         setAmbulanceBreakdownData({
//           threat_perception: apiData.threat_perception ,
//           others: apiData.Others 
//         });
//       }
//       // else: keep default values
//     } catch (err) {
//       console.error("Error fetching ambulance breakdown:", err);
//       // keep default values
//     }
//   };

//   fetchAmbulanceBreakdown();
// }, []);



  const ambulanceBreakdown = useMemo(
    () => [
      { name: 'Threat Perception', value: ambulanceBreakdownData.threat_perception, color: COLORS.warning },
      { name: 'Others', value: ambulanceBreakdownData.others, color: COLORS.secondary }
    ],
    [ambulanceBreakdownData]
  );

// useEffect(() => {
//   const fetchTopDistricts = async () => {
//     try {
//       const response = await axios.get(
//        "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );
// debugger
//       const apiData = response.data.topDistrict_metrics; // change as per your API key

//       if (apiData ) {
//         setTopDistricts(
//           apiData.map((item) => ({
//             name: item.name ?? "Unknown",
//             total: item.total ?? 0,
//             sla: item.sla ?? 0,
//             policeAccepted: item.policeAccepted ?? 0
//           }))
//         );
//       }
//       // else: keep default values
//     } catch (err) {
//       console.error("Error fetching top districts:", err);
//       // fallback: keep default values
//     }
//   };

//   fetchTopDistricts();
// }, []);


  // const topDistricts = useMemo(
  //   () => [
  //     { name: 'Central', total: 528, sla: 96, policeAccepted: 93 },
  //     { name: 'West', total: 93, sla: 92, policeAccepted: 88 },
  //     { name: 'South', total: 30, sla: 97, policeAccepted: 85 }
  //   ],
  //   []
  // );




//   useEffect(() => {
//   const fetchDistrictsTrend = async () => {
//     try {
//       const response = await axios.get(
//          "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );

//       const apiData = response.data.districtsTrend_metrics; // change key to match API

//       if (apiData)  {
//         setDistrictsTrend(
//           apiData.map((item) => ({
//             t: item.t ?? "Unknown",
//             Central: item.Central ?? 0,
//             West: item.West ?? 0,
//             South: item.South ?? 0
//           }))
//         );
//       }
//       // else: keep default values

//     } catch (err) {
//       console.error("Error fetching districts trend:", err);
//       // fallback: keep default values
//     }
//   };

//   fetchDistrictsTrend();
// }, []);

  // const districtsTrend = useMemo(
  //   () => [
  //     { t: 'Jan', Central: 120, West: 58, South: 34 },
  //     { t: 'Feb', Central: 140, West: 62, South: 30 },
  //     { t: 'Mar', Central: 132, West: 60, South: 38 },
  //     { t: 'Apr', Central: 150, West: 65, South: 42 },
  //     { t: 'May', Central: 148, West: 70, South: 40 },
  //     { t: 'Jun', Central: 160, West: 72, South: 45 }
  //   ],
  //   []
  // );


// useEffect(() => {
//   const fetchTopPoliceStations = async () => {
//     try {
//       const response = await axios.get(
//          "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );

//       const apiData = response.data.topPoliceStations_metrics; // replace with actual API key

//       if (apiData) {
//         setTopPoliceStations(
//           apiData.map((item) => ({
//             month: item.month ?? "Unknown",
//             Dispur: item.Dispur ?? 0,
//             Panbazar: item.Panbazar ?? 0,
//             Latasil: item.Latasil ?? 0
//           }))
//         );
//       } 
//       // else: keep default values 

//     } catch (err) {
//       console.error("Error fetching top police stations:", err); 
//       // fallback: keep default values
//     }
//   };

//   fetchTopPoliceStations();
// }, []);




  // const topPoliceStations = useMemo(
  //   () => [
  //     { month: 'Jan', Dispur: 50, Panbazar: 45, Latasil: 40 },
  //     { month: 'Feb', Dispur: 48, Panbazar: 42, Latasil: 38 },
  //     { month: 'Mar', Dispur: 55, Panbazar: 47, Latasil: 41 },
  //     { month: 'Apr', Dispur: 52, Panbazar: 46, Latasil: 39 },
  //     { month: 'May', Dispur: 58, Panbazar: 49, Latasil: 42 },
  //     { month: 'Jun', Dispur: 60, Panbazar: 52, Latasil: 44 },
  //     { month: 'Jul', Dispur: 65, Panbazar: 56, Latasil: 50 }
  //   ],
  //   []
  // );

// useEffect(() => {
//   const fetchOverallSLA = async () => {
//     try {
//       debugger
//       const response = await axios.get(
//          "https://api.gromed.in/api/dashboard/sos-analysis/?state_id=1"
//       );

//       const apiValue = response.data.overallSLA; // replace with actual API key

//       if (apiValue !== undefined && apiValue !== null) {
//         setOverallSLACompliance(apiValue.OverallSLA_Value);
//       }
//       // else: keep default value

//     } catch (err) {
//       console.error("Error fetching Overall SLA Compliance:", err);
//       // fallback: keep default value
//     }
//   };

//   fetchOverallSLA();
// }, []);


  const heatMax = useMemo(
    () => timeOfDayHeatmap.reduce((max, row) => Math.max(max, ...row.values), 0),
    [timeOfDayHeatmap]
  );

  const heatColor = (v) => {
    const t = heatMax ? v / heatMax : 0;
    return `rgba(59, 130, 246, ${0.1 + t * 0.8})`;
  };

  return (
    <PageWrapper
      title="SOS Analytics"
      description="Trends & outcomes across months, time of day, SOS type, districts and stations."
      sx={{
        bgcolor: tokens.pageBg,
        backgroundImage: 'none',
        minHeight: '100vh',
        height: { xs: 'auto', md: '100vh' },
        maxHeight: { xs: 'none', md: '100vh' },
        overflow: { xs: 'auto', md: 'hidden' }
      }}
      titleSx={{ color: tokens.text, fontSize: '1.5rem', mb: 0.5 }}
      descriptionSx={{ color: tokens.muted, fontSize: '0.75rem' }}


      
    >
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: tokens.cardBg,
          border: `1px solid ${tokens.border}`,
          overflow: 'visible',
           flex: 1,           // take available space
      mr: 2,  
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: `1px solid ${tokens.border}`,
            px: 2,
            minHeight: 48,
            '& .MuiTabs-flexContainer': {
              gap: 2
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              minHeight: 48,
              color: tokens.muted,
              '&.Mui-selected': {
                color: tokens.text,
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: COLORS.primary
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Monthwise" />
          <Tab label="Time-based (Hourly)" />
          <Tab label="District-wise" />
          {/* <Tab label="Police Station-wise" /> */}
        </Tabs>


        
      </Paper>

 <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
</Box>


      <TabPanel value={tabValue} index={0}>
        {/* Nested tabs for Overview */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(tokens.cardBg, 0.5),
            border: `1px solid ${alpha(tokens.border, 0.5)}`,
            mb: 1.5,
          }}
        >
          <Tabs
            value={overviewSubTab}
            onChange={(e, newVal) => setOverviewSubTab(newVal)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 42,
              px: 1.5,
              '& .MuiTabs-flexContainer': {
                gap: 1
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 42,
                color: tokens.muted,
                '&.Mui-selected': {
                  color: tokens.text,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2.5px 2.5px 0 0',
                backgroundColor: COLORS.secondary
              }
            }}
          >
            <Tab label="Breakdown" />
            <Tab label="Time Heatmap" />
            {/* <Tab label="Type Distribution" />
            <Tab label="Top Performers" /> */}
          </Tabs>
        </Paper>

        {/* Sub-tab 0: Breakdown */}
        <TabPanel value={overviewSubTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard
                title="SOS Calls Breakdown (Jan-Dec)"
                subtitle="Total SOS calls segmented by categories"
                color={COLORS.primary}
                tokens={tokens}
              >
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthwiseData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.18)} />
                    <XAxis dataKey="month" tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
                    <Bar dataKey="genuine" name="Genuine Calls" stackId="a" fill={COLORS.success} />
                    <Bar dataKey="panic" name="Panic Calls" stackId="a" fill={COLORS.primary} />
                    <Bar dataKey="policeAccepted" name="Police Accepted" stackId="a" fill={COLORS.secondary} />
                    <Bar dataKey="ambAccepted" name="Amb Accepted" stackId="a" fill={COLORS.warning} />
                    <Bar dataKey="other" name="Other" stackId="a" fill={alpha(COLORS.ink, 0.22)} />
                    <Bar dataKey="fake" name="Fake Calls" stackId="a" fill={COLORS.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sub-tab 1: Time Heatmap */}
        <TabPanel value={overviewSubTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard
                title="SOS Calls by Time of Day"
                subtitle="Heatmap view (Day vs Hour)"
                color={COLORS.secondary}
                tokens={tokens}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: '52px repeat(24, 1fr)', gap: 0.75 }}>
                  <Box />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.65rem', color: tokens.muted }}>{i}</Typography>
                    </Box>
                  ))}
                  {timeOfDayHeatmap.map((row) => (
                    <Box key={row.day} sx={{ display: 'contents' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.text }}>{row.day}</Typography>
                      </Box>
                      {row.values.map((v, idx) => (
                        <Box
                          key={`${row.day}-${idx}`}
                          sx={{
                            height: 20,
                            borderRadius: 0.75,
                            bgcolor: heatColor(v),
                            border: `1px solid ${alpha(tokens.text, 0.08)}`
                          }}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sub-tab 2: Type Distribution */}
        <TabPanel value={overviewSubTab} index={2}>
          {/* Nested tabs for Type Distribution */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: alpha(tokens.cardBg, 0.5),
              border: `1px solid ${alpha(tokens.border, 0.5)}`,
              mb: 1.5
            }}
          >
            <Tabs
              value={typeDistSubTab}
              onChange={(e, newVal) => setTypeDistSubTab(newVal)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 42,
                px: 1.5,
                '& .MuiTabs-flexContainer': {
                  gap: 1
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  minHeight: 42,
                  color: tokens.muted,
                  '&.Mui-selected': {
                    color: tokens.text,
                    fontWeight: 700
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 2.5,
                  borderRadius: '2.5px 2.5px 0 0',
                  backgroundColor: COLORS.accent
                }
              }}
            >
              <Tab label="Main Distribution" />
              <Tab label="Panic Alert" />
              <Tab label="Ambulance" />
            </Tabs>
          </Paper>

          {/* Type Dist Sub-tab 0: Main Pie */}
          <TabPanel value={typeDistSubTab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ChartCard
                  title="SOS Calls by Type"
                  subtitle="Distribution by category"
                  color={COLORS.accent}
                  tokens={tokens}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={sosByType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {sosByType.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                      <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Type Dist Sub-tab 1: Panic Alert */}
          <TabPanel value={typeDistSubTab} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ChartCard title="Panic Alert" subtitle="Breakdown" color={COLORS.primary} tokens={tokens}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={panicBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {panicBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                      <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Type Dist Sub-tab 2: Ambulance */}
          <TabPanel value={typeDistSubTab} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ChartCard title="Ambulance" subtitle="Breakdown" color={COLORS.warning} tokens={tokens}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={ambulanceBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {ambulanceBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                      <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>
        </TabPanel>

        {/* Sub-tab 3: Top Performers */}
        <TabPanel value={overviewSubTab} index={3}>
          {/* Nested tabs for Top Performers */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: alpha(tokens.cardBg, 0.5),
              border: `1px solid ${alpha(tokens.border, 0.5)}`,
              mb: 1.5
            }}
          >
            <Tabs
              value={topPerformersSubTab}
              onChange={(e, newVal) => setTopPerformersSubTab(newVal)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 42,
                px: 1.5,
                '& .MuiTabs-flexContainer': {
                  gap: 1
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  minHeight: 42,
                  color: tokens.muted,
                  '&.Mui-selected': {
                    color: tokens.text,
                    fontWeight: 700
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 2.5,
                  borderRadius: '2.5px 2.5px 0 0',
                  backgroundColor: COLORS.success
                }
              }}
            >
              <Tab label="Districts Table" />
              <Tab label="Districts Trend" />
              <Tab label="Police Stations" />
            </Tabs>
          </Paper>

          {/* Top Performers Sub-tab 0: Districts Table */}
          <TabPanel value={topPerformersSubTab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ChartCard title="Top SOS Districts" subtitle="Volume and SLA metrics" color={COLORS.success} tokens={tokens}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 0.8fr 0.6fr 0.8fr',
                        gap: 1,
                        pb: 1,
                        borderBottom: `1px solid ${alpha(tokens.text, 0.12)}`
                      }}
                    >
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted }}>District</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted, textAlign: 'right' }}>Total</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted, textAlign: 'right' }}>SLA</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted, textAlign: 'right' }}>Police</Typography>
                    </Box>
                    {topDistricts.map((d) => (
                      <Box
                        key={d.name}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1.4fr 0.8fr 0.6fr 0.8fr',
                          gap: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: tokens.text }}>{d.name}</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: tokens.text, textAlign: 'right' }}>{d.total}</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: COLORS.success, textAlign: 'right' }}>{d.sla}%</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: COLORS.secondary, textAlign: 'right' }}>{d.policeAccepted}%</Typography>
                      </Box>
                    ))}

                    <Box sx={{ mt: 1, pt: 1.25, borderTop: `1px solid ${alpha(tokens.text, 0.12)}` }}>
                      <Typography sx={{ fontSize: '0.8rem', color: tokens.muted }}>Overall SLA Compliance</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: tokens.text }}>{overallSLACompliance.OverallSLA_Value}</Typography>
                    </Box>
                  </Box>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Top Performers Sub-tab 1: Districts Trend */}
          <TabPanel value={topPerformersSubTab} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ChartCard title="Top SOS Districts" subtitle="Trend over time" color={COLORS.secondary} tokens={tokens}>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={districtsTrend} margin={{ top: 10, right: 15, left: -12, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.secondary, 0.15)} />
                      <XAxis dataKey="t" tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                      <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
                      <Line type="monotone" dataKey="Central" name="Central" stroke={COLORS.primary} strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="West" name="West" stroke={COLORS.warning} strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="South" name="South" stroke={COLORS.success} strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Top Performers Sub-tab 2: Police Stations */}
          <TabPanel value={topPerformersSubTab} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ChartCard title="Top SOS Police Stations" subtitle="Monthly stacked volume" color={COLORS.primary} tokens={tokens}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={topPoliceStations} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.18)} />
                      <XAxis dataKey="month" tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                      <Legend wrapperStyle={{ fontSize: 10, color: tokens.muted }} />
                      <Bar dataKey="Dispur" name="Dispur" stackId="a" fill={COLORS.primary} />
                      <Bar dataKey="Panbazar" name="Panbazar" stackId="a" fill={COLORS.secondary} />
                      <Bar dataKey="Latasil" name="Latasil" stackId="a" fill={COLORS.warning} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>
        </TabPanel>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Nested tabs for Monthwise */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(tokens.cardBg, 0.5),
            border: `1px solid ${alpha(tokens.border, 0.5)}`,
            mb: 1.5
          }}
        >
          <Tabs
            value={monthwiseSubTab}
            onChange={(e, newVal) => setMonthwiseSubTab(newVal)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 42,
              px: 1.5,
              '& .MuiTabs-flexContainer': {
                gap: 1
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 42,
                color: tokens.muted,
                '&.Mui-selected': {
                  color: tokens.text,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2.5px 2.5px 0 0',
                backgroundColor: COLORS.secondary
              }
            }}
          >
            <Tab label="Bar Chart" />
          </Tabs>
        </Paper>

        <TabPanel value={monthwiseSubTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="Monthwise total SOS calls (Jan-Dec)" color={COLORS.primary} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthwiseTotals} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.18)} />
                    <XAxis dataKey="month" tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Bar dataKey="total" name="Total SOS call" radius={[6, 6, 0, 0]} fill={COLORS.primary} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Nested tabs for Time-based */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(tokens.cardBg, 0.5),
            border: `1px solid ${alpha(tokens.border, 0.5)}`,
            mb: 1.5
          }}
        >
          <Tabs
            value={timeBasedSubTab}
            onChange={(e, newVal) => setTimeBasedSubTab(newVal)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 42,
              px: 1.5,
              '& .MuiTabs-flexContainer': {
                gap: 1
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 42,
                color: tokens.muted,
                '&.Mui-selected': {
                  color: tokens.text,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2.5px 2.5px 0 0',
                backgroundColor: COLORS.secondary
              }
            }}
          >
            <Tab label="Area Chart" />
            <Tab label="Line Chart" />
          </Tabs>
        </Paper>

        {/* Sub-tab 0: Area Chart */}
        <TabPanel value={timeBasedSubTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="Hourly analysis (Area chart)" color={COLORS.secondary} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={hourlyData} margin={{ top: 5, right: 15, left: -15, bottom: 60 }}>
                    <defs>
                      <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" vertical={true} stroke={alpha(COLORS.secondary, 0.12)} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: tokens.muted, fontSize: 9, angle: -45, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={80}
                    />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Area type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.secondary} strokeWidth={2} fill="url(#hourlyFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sub-tab 1: Line Chart */}
        <TabPanel value={timeBasedSubTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="Hourly analysis (Line chart)" color={COLORS.accent} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={hourlyData} margin={{ top: 5, right: 15, left: -15, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={true} stroke={alpha(COLORS.accent, 0.12)} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: tokens.muted, fontSize: 9, angle: -45, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={80}
                    />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Line type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.accent} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Nested tabs for District-wise */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(tokens.cardBg, 0.5),
            border: `1px solid ${alpha(tokens.border, 0.5)}`,
            mb: 1.5
          }}
        >
          <Tabs
            value={districtSubTab}
            onChange={(e, newVal) => setDistrictSubTab(newVal)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 42,
              px: 1.5,
              '& .MuiTabs-flexContainer': {
                gap: 1
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 42,
                color: tokens.muted,
                '&.Mui-selected': {
                  color: tokens.text,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2.5px 2.5px 0 0',
                backgroundColor: COLORS.secondary
              }
            }}
          >
            <Tab label="Area Chart" />
            <Tab label="Line Chart" />
          </Tabs>
        </Paper>

        {/* Sub-tab 0: Area Chart */}
        <TabPanel value={districtSubTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="District-wise (Area chart)" color={COLORS.success} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={districtSeries} margin={{ top: 5, right: 15, left: -15, bottom: 80 }}>
                    <defs>
                      <linearGradient id="districtFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.success, 0.15)} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: tokens.muted, fontSize: 9, angle: -45, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={95}
                    />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Area type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.success} strokeWidth={2} fill="url(#districtFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sub-tab 1: Line Chart */}
        <TabPanel value={districtSubTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="District-wise (Line chart)" color={COLORS.warning} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={districtSeries} margin={{ top: 5, right: 15, left: -15, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.warning, 0.15)} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: tokens.muted, fontSize: 9, angle: -45, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={95}
                    />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Line type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.warning} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Nested tabs for Police Station-wise */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(tokens.cardBg, 0.5),
            border: `1px solid ${alpha(tokens.border, 0.5)}`,
            mb: 1.5
          }}
        >
          <Tabs
            value={policeStationSubTab}
            onChange={(e, newVal) => setPoliceStationSubTab(newVal)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 42,
              px: 1.5,
              '& .MuiTabs-flexContainer': {
                gap: 1
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 42,
                color: tokens.muted,
                '&.Mui-selected': {
                  color: tokens.text,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2.5px 2.5px 0 0',
                backgroundColor: COLORS.secondary
              }
            }}
          >
            {/* <Tab label="Area Chart" />
            <Tab label="Line Chart" /> */}
          </Tabs>
        </Paper>

        {/* Sub-tab 0: Area Chart */}
        <TabPanel  value={policeStationSubTab} index={0}>
          <Grid  style={{ display: "none" }}  container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="Police Station-wise (Area chart)" color={COLORS.danger} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={policeStationSeries} margin={{ top: 5, right: 15, left: -15, bottom: 100 }}>
                    <defs>
                      <linearGradient id="psFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.danger, 0.15)} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: tokens.muted, fontSize: 8, angle: -45, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={115}
                    />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Area type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.danger} strokeWidth={2} fill="url(#psFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sub-tab 1: Line Chart */}
        <TabPanel value={policeStationSubTab} index={1}>
          <Grid  style={{ display: "none" }}  container spacing={2}>
            <Grid item xs={12}>
              <ChartCard title="Total SOS Call" subtitle="Police Station-wise (Line chart)" color={COLORS.primary} tokens={tokens}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={policeStationSeries} margin={{ top: 5, right: 15, left: -15, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.15)} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: tokens.muted, fontSize: 8, angle: -45, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={115}
                    />
                    <YAxis tick={{ fill: tokens.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                    <Line type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.primary} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </TabPanel>
      </TabPanel>
    </PageWrapper>
  );

};

export default SOSAnalyticsDashboard;
