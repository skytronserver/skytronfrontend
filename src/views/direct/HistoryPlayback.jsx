import React, { useEffect, useState, useCallback, useMemo } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage";
import GPSHistoryMap from "./GPSHistoryMap";
import GoogleMapComponent from "./HistoryGoogleMapComponent";
import OSMHistoryMap from "./OSMHistoryMap";
import { dateTimeUpdate } from "../../helper";
import {
  FormControl, Autocomplete, TextField, Button, Grid, Typography,
  Box, CircularProgress, Collapse, IconButton, Tooltip
} from '@mui/material';
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import AzureHistoryMap from "./AzureHistoryMap";

const MAX_HISTORY_RANGE_MS = 1000 * 60 * 60 * 24 * 365 * 2;

const TOKEN = {
  bg: '#f0f2f5',          // page background
  card: '#ffffff',
  cardBorder: '#e2e5eb',
  accent: '#1e3a5f',      // deep navy  (matches header)
  accentLight: '#2563eb', // bright blue for CTA / icons
  accentGlow: 'rgba(37,99,235,0.12)',
  text: '#1a2236',
  textMuted: '#64748b',
  danger: '#ef4444',
  success: '#16a34a',
  radius: 14,
  radiusSm: 8,
  shadow: '0 4px 24px rgba(30,58,95,0.10)',
  shadowHover: '0 8px 32px rgba(30,58,95,0.18)',
};

const compactInputSx = {
  '& .MuiOutlinedInput-root': {
    height: 36,
    fontSize: 13
  }
};

/* ── reusable label/value badge ── */
const InfoBadge = ({ label, value, color }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column',
    px: 2, py: 1,
    bgcolor: 'rgba(30,58,95,0.06)',
    borderRadius: TOKEN.radiusSm,
    minWidth: 110
  }}>
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: TOKEN.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 14, fontWeight: 700, color: color || TOKEN.text, mt: 0.25 }}>
      {value || '—'}
    </Typography>
  </Box>
);

/* ── styled input override helper ── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: TOKEN.radiusSm,
    bgcolor: '#fff',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: TOKEN.accentLight },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: TOKEN.accentLight, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: TOKEN.accentLight },
};

/* ── map-type pill button ── */
const MapPill = ({ active, label, icon, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 2.5, py: 1,
      borderRadius: 50,
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 13,
      transition: 'all .2s',
      bgcolor: active ? TOKEN.accentLight : 'transparent',
      color: active ? '#fff' : TOKEN.textMuted,
      boxShadow: active ? `0 4px 12px ${TOKEN.accentGlow}` : 'none',
      userSelect: 'none',
      '&:hover': {
        bgcolor: active ? TOKEN.accentLight : 'rgba(37,99,235,0.08)',
        color: active ? '#fff' : TOKEN.accentLight,
      }
    }}
  >
    <span>{icon}</span> {label}
  </Box>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const HistoryPlayback = () => {
  const { t } = useTranslation();

  const { currentDateTime, initialFromDate } = useMemo(() => {
    const now = new Date();
    return {
      currentDateTime: dateTimeUpdate(now),
      initialFromDate: dateTimeUpdate(new Date(now.getTime() - 86400000))
    };
  }, []);

  const [vehicleNo, setVehicleNo] = useState('');
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(currentDateTime);
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicleGpsData, setVehicleGpsData] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [showHistoryMap, setShowHistoryMap] = useState(false);
  const [showVehicleMap, setShowVehicleMap] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingGpsData, setIsLoadingGpsData] = useState(false);
  const [mapType, setMapType] = useState("google");
  const [historyData, setHistoryData] = useState([]);

  const [owner, setOwner] = useState("");
  const [poi, setPoi] = useState("");
  const [roads, setRoads] = useState("");
  const [polygon, setPolygon] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    speed: 0,
    progress: 0,
    time: null,
    sat: 0,
  gps: 0,
  network: "",
  ignition: 0,
  battery: "",
  internalBattery: "",
  owner: "",
  deviceId: ""
  });

  /* ─── fetch vehicle list ─── */
  useEffect(() => {
    let isMounted = true;
    const fetchVehicleList = async () => {
      try {
        const response = await HomePageService.getVehicleList();
        if (isMounted && response?.data) setVehicleList(response.data);
      } catch (error) {
        console.error("Error fetching vehicle list:", error);
      } finally {
        if (isMounted) setIsLoadingVehicles(false);
      }
    };
    fetchVehicleList();
    return () => { isMounted = false; };
  }, []);

  /* ─── fetch history data ─── */
  const fetchHistoryData = async () => {
    try {
      const toUTC = (d) => new Date(d).toISOString().slice(0, 19);
      const url = `${process.env.REACT_APP_BASE_URL}api/gps_history_map_data/?` +
        `vehicle_registration_number=${vehicleNo}` +
        `&start_datetime=${toUTC(fromDate)}` +
        `&end_datetime=${toUTC(toDate)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Token ${sessionStorage.getItem("oAuthToken")}` }
      });
      const data = await res.json();

      const validData = (data?.data || []).filter(item => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        return lat !== 0 && lon !== 0 && !isNaN(lat) && !isNaN(lon);
      });
      setHistoryData(validData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showHistoryMap && vehicleNo) fetchHistoryData();
  }, [showHistoryMap, vehicleNo]);

  /* ─── fetch live GPS for vehicle map ─── */
  useEffect(() => {
    if (!showVehicleMap || vehicleGpsData.length > 0) return;
    let isMounted = true;
    setIsLoadingGpsData(true);
    const fetchVehicleGpsData = async () => {
      try {
        const response = await HomePageService.getLiveTracking_data({});
        if (isMounted && Array.isArray(response?.data?.data))
          setVehicleGpsData(response.data.data);
      } catch (error) {
        console.error("Error fetching vehicle GPS data:", error);
        if (isMounted) setVehicleGpsData([]);
      } finally {
        if (isMounted) setIsLoadingGpsData(false);
      }
    };
    fetchVehicleGpsData();
    return () => { isMounted = false; };
  }, [showVehicleMap, vehicleGpsData.length]);

  const validateDateRange = useCallback((from, to) => {
    if (new Date(to).getTime() - new Date(from).getTime() > MAX_HISTORY_RANGE_MS)
      return "Date range cannot exceed 2 years. Please select a shorter range.";
    return null;
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!fromDate || !toDate) { alert("Please select both From Date and To Date"); return; }
    const error = validateDateRange(fromDate, toDate);
    if (error) { alert(error); return; }
    if (vehicleNo) {
      setShowHistoryMap(true);
      setShowVehicleMap(false);
    } else {
      setShowHistoryMap(false);
      setShowVehicleMap(true);
    }
  }, [fromDate, toDate, vehicleNo, validateDateRange]);

  const handleVehicleSelect = useCallback((selectedVehicleNo) => {
    setVehicleNo(selectedVehicleNo);
    setShowVehicleMap(false);
    setShowHistoryMap(true);
  }, []);

  const handleVehicleNoChange = useCallback((event, newValue) => {
    setVehicleNo(newValue || '');
  }, []);

  const handleFromDateChange = useCallback((e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;
    if (selected > new Date()) { alert("From Date cannot be in the future"); return; }
    setFromDate(dateTimeUpdate(selected));
  }, []);

  const handleToDateChange = useCallback((e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;
    if (selected > new Date()) { alert("To Date cannot be in the future"); return; }
    setToDate(dateTimeUpdate(selected));
  }, []);

  const handleBackToVehicleSelection = useCallback(() => {
    setShowHistoryMap(false);
    setShowVehicleMap(true);
    setVehicleNo('');
  }, []);

  /* ════════════════ RENDER ════════════════ */

  return (
    <Box sx={{
      bgcolor: TOKEN.bg,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>

      {/* HEADER */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderBottom: `1px solid ${TOKEN.cardBorder}`
      }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          History Playback
        </Typography>
      </Box>

      {/*  COMPACT SEARCH FORM */}
      <Box sx={{
        px: 2,
        py: 1,
        bgcolor: TOKEN.card,
        borderBottom: `1px solid ${TOKEN.cardBorder}`
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1} alignItems="center">

            <Grid item md={3} xs={12}>
              <Autocomplete
                size="small"
                value={vehicleNo}
                onChange={handleVehicleNoChange}
                options={vehicleList}
                loading={isLoadingVehicles}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Vehicle" size="small" />
                )}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <TextField
                size="small"
                fullWidth
                type="datetime-local"
                value={fromDate}
                onChange={handleFromDateChange}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <TextField
                size="small"
                fullWidth
                type="datetime-local"
                value={toDate}
                onChange={handleToDateChange}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ height: 32, bgcolor: TOKEN.accent }}
              >
                Search
              </Button>
            </Grid>

          </Grid>
        </form>
      </Box>

      {/* MAP AREA (NO SCROLL) */}
      <Box sx={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        p: 1
      }}>

        {/* VEHICLE MAP */}
        {showVehicleMap && (
          <Box sx={{ flex: 1 }}>
            {isLoadingGpsData ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <GoogleMapComponent
                gpsData={vehicleGpsData}
                onMarkerClick={(entryData) => {
                  const vehicleRegNo =
                    entryData.vehicle_registration_number ||
                    entryData.vehicle_reg_no ||
                    entryData.device_tag_info?.device?.vehicle_reg_no;
                  if (vehicleRegNo) handleVehicleSelect(vehicleRegNo);
                }}
              />
            )}
          </Box>
        )}

        {/* HISTORY MAP */}
        {showHistoryMap && vehicleNo && (
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}>

            {/* HEADER WITH LIVE STATS */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
              bgcolor: TOKEN.accent
            }}>

              {/* LEFT SIDE */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "#fff" }}>

                {/* VEHICLE */}
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {vehicleNo}
                </Typography>

                {/*  STATS (ADD HERE) */}
                <span style={{ color: stats.speed > 0 ? "#22c55e" : "#ef4444" }}>
                  ⚡ {stats.speed} km/h
                </span>

                <span>
                  ⏱ {stats.progress}%
                </span>


              </Box>

              {/* RIGHT SIDE */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  size="small"
                  value={mapType}
                  onChange={(e) => setMapType(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ bgcolor: "#fff", width: 120 }}
                >
                  <option value="google">Google </option>
                  <option value="osm">Open Street </option>
                  <option value="azure">Azure Map</option>
                </TextField>

                <Button
                  onClick={handleBackToVehicleSelection}
                  size="small"
                  sx={{ bgcolor: "#fff", fontSize: 12 }}
                >
                  ⇄ Select Different Vehicle
                </Button>
              </Box>

            </Box>

            {/* MAP */}
            <Box sx={{ flex: 1 }}>
              {mapType === "google" ? (
                <GPSHistoryMap
                  startDateTime={fromDate}
                  endDateTime={toDate}
                  vehicleRegistrationNumber={vehicleNo}
                  poi={poi}
                  owner={owner}
                  roads={roads}
                  polygon={polygon}
                  onStatsUpdate={setStats}
                />
              ) : mapType === "osm" ? (
                <OSMHistoryMap mapData={historyData}
                  onStatsUpdate={setStats} />
              ) : (<AzureHistoryMap mapData={historyData} onStatsUpdate={setStats} />)}
            </Box>

          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(HistoryPlayback);
