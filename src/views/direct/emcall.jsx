/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import { alpha, useTheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import HomePageService from "../../services/HomePage";
import POIService from "../../services/POIService";
import CustomModal from "../../ui-component/CustomModal";
import "./emcall.css";
import BhuvanMapComponent from "../../components/Map/BhuvanMapComponent";
import { fetchSecureIncidentMedia, createMediaUrl } from "../../utils/incidentImageLoader";

const EMCall = () => {
  const theme = useTheme();
  const { state } = useLocation();
  const { call } = state || {};
  const userRole = call?.type || '';
  const navigate = useNavigate();

  // State
  const [assignments, setAssignments] = useState([]);
  const assignmentsRef = useRef([]); // To track previous assignments for notifications
  const [sosLocations, setSosLocations] = useState([]);
  const [, setMessages] = useState([]);
  const [activeRoutes, setActiveRoutes] = useState([]); // Routes for assigned executives
  const latestLocationsRef = useRef({}); // Cache for last known locations

  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Police Data State
  const [policeLocations, setPoliceLocations] = useState([]);
  const [policePois, setPolicePois] = useState([]);
  const [hospitalPois, setHospitalPois] = useState([]);
  const [nearestPolice, setNearestPolice] = useState(null);
  const [nearestPoliceDistance, setNearestPoliceDistance] = useState(null);
  const [nearestPoliceAddress, setNearestPoliceAddress] = useState("");

  // Toggle states for map visibility
  const [showPoliceLayers, setShowPoliceLayers] = useState(false);
  const [showPoiLayers, setShowPoiLayers] = useState(false);
  const [showHospitalPoiLayers, setShowHospitalPoiLayers] = useState(false);
  const [showAmbulanceLayers, setShowAmbulanceLayers] = useState(false);

  // Tab State & Auto-play
  const [tabValue, setTabValue] = useState(0);

  const [driverPhotoUrl, setDriverPhotoUrl] = useState(null);
  const [driverPhotoLoading, setDriverPhotoLoading] = useState(false);
  const driverPhotoUrlRef = useRef(null);

  const driverPhotoPathRaw = call?.call?.device?.drivers?.[0]?.photo || null;
  const driverPhotoPath = (() => {
    if (!driverPhotoPathRaw) return null;
    const raw = String(driverPhotoPathRaw);
    try {
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        const u = new URL(raw);
        return u.pathname.replace(/^\/+/, "");
      }
    } catch (e) {
      // ignore
    }
    return raw.replace(/^\/+/, "");
  })();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    let cancelled = false;

    if (driverPhotoUrlRef.current) {
      URL.revokeObjectURL(driverPhotoUrlRef.current);
      driverPhotoUrlRef.current = null;
    }
    setDriverPhotoUrl(null);

    const token = sessionStorage.getItem('oAuthToken');
    if (!driverPhotoPath || !token) {
      setDriverPhotoLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setDriverPhotoLoading(true);
    (async () => {
      try {
        const blob = await fetchSecureIncidentMedia(driverPhotoPath, token);
        if (cancelled) return;
        const url = createMediaUrl(blob);
        driverPhotoUrlRef.current = url;
        setDriverPhotoUrl(url);
      } catch (e) {
        if (cancelled) return;
        setDriverPhotoUrl(null);
      } finally {
        if (!cancelled) setDriverPhotoLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (driverPhotoUrlRef.current) {
        URL.revokeObjectURL(driverPhotoUrlRef.current);
        driverPhotoUrlRef.current = null;
      }
    };
  }, [driverPhotoPath]);

  // Distance helper (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Logic for nearest police station and reverse geocoding
  useEffect(() => {
    if (sosLocations.length > 0 && policePois.length > 0) {
      const callPoint = sosLocations[0];
      let minDistance = Infinity;
      let nearestUnit = null;

      policePois.forEach((poi) => {
        try {
          const locData = JSON.parse(poi.location);
          if (Array.isArray(locData) && locData.length > 0) {
            const lat = Number(locData[0][0]);
            const lon = Number(locData[0][1]);

            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              const dist = calculateDistance(
                callPoint.latitude,
                callPoint.longitude,
                lat,
                lon
              );

              if (dist < minDistance) {
                minDistance = dist;
                nearestUnit = {
                  ...poi,
                  latitude: lat,
                  longitude: lon
                };
              }
            }
          }
        } catch (e) {
          // ignore invalid loc data
        }
      });

      if (nearestUnit) {
        setNearestPolice(nearestUnit);
        setNearestPoliceDistance(minDistance);

        // Initialize address from POI data immediately (prefer description if longer)
        const initialAddr = (nearestUnit.description?.length > (nearestUnit.address?.length || 0))
          ? nearestUnit.description
          : (nearestUnit.address || nearestUnit.description || "Fetching address...");
        setNearestPoliceAddress(initialAddr);

        // Fetch address via reverse geocoding to see if we can get an even better one
        const fetchAddress = async () => {
          try {
            const resp = await HomePageService.getReverseGeocode(nearestUnit.latitude, nearestUnit.longitude);
            const data = resp?.data;
            const result = data?.results?.[0];

            if (result && Array.isArray(result.address_components)) {
              // Logic to extract city if needed in future
              // const cityComp = result.address_components.find(...)
            }

            const geoAddr = result?.formatted_address ||
              data?.results?.[0]?.address ||
              data?.address ||
              data?.formatted_address;

            // Update address if we got a valid one
            if (geoAddr) {
              setNearestPoliceAddress(geoAddr);
            }
          } catch (error) {
            console.error("Geocoding failed:", error);
          }
        };
        fetchAddress();
      }
    }
  }, [sosLocations, policePois]);

  // Fetch Police Station POIs
  useEffect(() => {
    const fetchPolicePois = async () => {
      try {
        const response = await POIService.getAllPOIs();
        const data = response?.data || response || [];

        const filtered = Array.isArray(data)
          ? data.filter((poi) => {
            const type = poi?.use_type || "";
            const normalized = String(type).toLowerCase();
            return (
              normalized === "policestation" ||
              normalized === "police_station" ||
              normalized === "police"
            );
          })
          : [];

        const filteredHospitals = Array.isArray(data)
          ? data.filter((poi) => {
            const type = poi?.use_type || "";
            const normalized = String(type).trim().toLowerCase();
            return (
              normalized === "hospital" ||
              normalized === "hospitals" ||
              normalized === "hospital_name"
            );
          })
          : [];

        setPolicePois(filtered);
        setHospitalPois(filteredHospitals);
      } catch (error) {
        console.error("Error fetching police POIs for EmCall:", error);
        setHospitalPois([]);
      }
    };

    fetchPolicePois();
  }, []);

  // Fetch Police Locations
  const fetchPoliceLocations = async (callLocs = []) => {
    try {
      const params = {
        user_type: 'police_ex',
      };

      if (callLocs && callLocs.length > 0) {
        const center = callLocs[0]; // Use first call location as center
        if (center && center.latitude && center.longitude) {
          params.lat = center.latitude;
          params.lon = center.longitude;
          params.radius_km = 10000;
        }
      }

      const response = await HomePageService.getEmergencyUserLocations(params);

      // Parse the nested response structure
      const payload = response?.data ?? {};
      let records = [];

      if (payload?.results?.data && Array.isArray(payload.results.data)) {
        records = payload.results.data;
      } else if (Array.isArray(payload?.results)) {
        records = payload.results;
      } else if (Array.isArray(payload?.data)) {
        records = payload.data;
      } else if (Array.isArray(payload)) {
        records = payload;
      }

      const normalized = records
        .map((item, index) => {
          const latitude = Number(item?.em_lat ?? item?.latitude ?? item?.lat);
          const longitude = Number(item?.em_lon ?? item?.longitude ?? item?.lon);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          const fieldEx = item?.field_ex ?? {};
          const users = fieldEx?.users ?? [];
          const primaryUser = users[0] ?? {};

          const lastUpdatedRaw = item?.time ?? fieldEx?.created ?? item?.timestamp;
          const lastUpdated = lastUpdatedRaw ? new Date(lastUpdatedRaw).toISOString() : new Date().toISOString();

          const userName = primaryUser?.name || fieldEx?.idProofno || `Police #${index + 1}`;
          const labelFallback = userName;

          return {
            id: item?.id || fieldEx?.id || `police-${index}`,
            vehicle_registration_number: userName,
            block_name: fieldEx?.district_info?.district || fieldEx?.state_info?.state || '',
            route_name: '',
            markerLabel: labelFallback,
            markerCategory: 'police',
            packet_type: 'POLICE',
            ignition_status: 1,
            speed: Number(item?.speed) || 0,
            entry_time: lastUpdated,
            date: lastUpdated.split('T')[0] ?? '',
            time: lastUpdated.split('T')[1]?.split('Z')[0] ?? '',
            latitude,
            longitude,
          };
        })
        .filter(Boolean);

      setPoliceLocations(normalized);
    } catch (error) {
      console.error('Error fetching police locations:', error);
      setPoliceLocations([]);
    }
  };

  // Poll Police Locations based on SOS Location
  /*
  // Poll Police Locations based on SOS Location
  useEffect(() => {
    fetchPoliceLocations(sosLocations);
    const interval = setInterval(() => fetchPoliceLocations(sosLocations), 10000);
    return () => clearInterval(interval);
  }, [sosLocations]);
  */

  // Fetch locations and assignments
  const fetchAndPlotLocations = async () => {
    if (!call?.id) return;

    try {
      const response = await HomePageService.getEMCallloc({
        assignment_id: call.id,
      });

      // Update assignments
      if (response.data && response.data.assignments) {
        const newAssignments = response.data.assignments;
        const prevAssignments = assignmentsRef.current;

        // Check for status changes
        newAssignments.forEach(newAssignment => {
          const prevAssignment = prevAssignments.find(a => a.id === newAssignment.id);
          if (prevAssignment && prevAssignment.status !== newAssignment.status) {
            setSnackbarMessage(`Assignment ${newAssignment.id} status changed to ${newAssignment.status}`);
            setSnackbarSeverity(newAssignment.status === 'closed_false_allert' ? 'error' : 'info');
            setSnackbarOpen(true);
          }
        });

        setAssignments(newAssignments);
        assignmentsRef.current = newAssignments;
      }

      // Filter and plot location data
      const locations = response.data.target || [];
      const mappedLocations = locations.map(loc => ({
        ...loc,
        packet_type: 'EA', // Force Red color for emergency
        device_tag_info: {
          ...loc.device_tag_info,
          category_info: {
            category: 'bus' // Default icon
          }
        }
      }));
      setSosLocations(mappedLocations);

      // Process Field Executives for Routes
      const fieldExList = response.data.fieldEx || [];
      const newRoutes = [];
      const newPoliceLocations = [];

      if (mappedLocations.length > 0) {
        const victimLoc = mappedLocations[0]; // Target location

        // Process each field executive
        for (const item of fieldExList) {
          const assignment = item?.Assignment;
          const userType = assignment?.ex?.user_type;

          if (userType === 'police_ex' || userType === 'ambulance_ex') {
            const exId = assignment?.ex?.id;
            const locArray = item?.loc;

            let exData = null;

            // Check for new location data
            if (Array.isArray(locArray) && locArray.length > 0 && locArray[0]?.em_lat && locArray[0]?.em_lon) {
              exData = locArray[0];
              // Update cache if ID is available
              if (exId) {
                latestLocationsRef.current[exId] = {
                  ...exData,
                  userId: assignment?.ex?.users?.[0]?.name,
                  userType: userType
                };
              }
            } else if (exId && latestLocationsRef.current[exId]) {
              // Fallback to cached location if available
              exData = latestLocationsRef.current[exId];
            }

            // If we have valid location data
            if (exData) {
              const lat = parseFloat(exData.em_lat);
              const lon = parseFloat(exData.em_lon);

              if (!isNaN(lat) && !isNaN(lon)) {
                // Fetch shortest path from Bhuvan API
                try {
                  const routeResponse = await HomePageService.getRoute({
                    points: [
                      [lon, lat], // Executive location (lon, lat)
                      [victimLoc.longitude, victimLoc.latitude] // Victim location
                    ]
                  });

                  // Extract route coordinates from API response
                  const routeData = routeResponse?.data?.data && routeResponse.data.data.paths
                    ? routeResponse.data.data
                    : routeResponse.data;

                  if (routeData?.paths?.[0]?.points?.coordinates) {
                    const coordinates = routeData.paths[0].points.coordinates;
                    const distanceInMeters = routeData.paths[0].distance || 0;
                    const distanceInKm = distanceInMeters / 1000;

                    // Calculate time based on 15 km/hr speed
                    const speedKmPerHr = 15;
                    const timeInHours = distanceInKm / speedKmPerHr;
                    const timeInMinutes = timeInHours * 60;

                    // Add the actual road route
                    newRoutes.push({
                      from: [lon, lat],
                      to: [victimLoc.longitude, victimLoc.latitude],
                      type: userType,
                      coordinates: coordinates, // Full path coordinates
                      distance: distanceInMeters,
                      distanceKm: distanceInKm,
                      time: routeData.paths[0].time || 0,
                      estimatedTimeMinutes: timeInMinutes
                    });
                  } else {
                    // Fallback to straight line if API fails
                    newRoutes.push({
                      from: [lon, lat],
                      to: [victimLoc.longitude, victimLoc.latitude],
                      type: userType
                    });
                  }
                } catch (error) {
                  console.error('Error fetching route for executive:', error);
                  // Fallback to straight line on error
                  newRoutes.push({
                    from: [lon, lat],
                    to: [victimLoc.longitude, victimLoc.latitude],
                    type: userType
                  });
                }

                // Add to Field Executive Markers
                newPoliceLocations.push({
                  id: `ex-${exData.id || exId || Math.random()}`,
                  latitude: lat,
                  longitude: lon,
                  vehicle_registration_number: assignment?.ex?.users?.[0]?.name || latestLocationsRef.current[exId]?.userId || (userType === 'police_ex' ? "Police Unit" : "Ambulance Unit"),
                  markerCategory: userType === 'police_ex' ? 'police' : 'ambulance',
                  speed: exData.speed || 0,
                  entry_time: exData.time || new Date().toISOString(),
                  packet_type: userType === 'police_ex' ? 'POLICE' : 'AMBULANCE'
                });
              }
            }
          }
        }
      }

      // Always update state with the computed lists (which now include cached positions)
      setActiveRoutes(newRoutes);
      setPoliceLocations(newPoliceLocations);

    } catch (error) {
      console.error("Fetch Locations Error:", error);
      // Suppress error snackbar on periodic fetch to avoid spamming, or log only
    }
  };

  const fetchMessages = async () => {
    if (!call?.id) return;
    try {
      const response = await HomePageService.getEMmessage({
        assignment_id: call.id,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Fetch Messages Error:", error);
    }
  };

  // Initial Fetch and Polling for Call Data
  useEffect(() => {
    fetchMessages();
    fetchAndPlotLocations();

    const interval = setInterval(fetchAndPlotLocations, 5000);
    return () => clearInterval(interval);
  }, [call?.id]);

  const handleBroadcast = async (type) => {
    try {
      let broadcastType = type;
      if (type === "both") {
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type: "police_ex",
        });
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type: "ambulance_ex",
        });
        broadcastType = "Police and Ambulance";
      } else {
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type,
        });
        broadcastType = type === "police_ex" ? "Police" : "Ambulance";
      }

      setBroadcastDisabled(true);
      alert(`${broadcastType} broadcast successful!`);
    } catch (error) {
      console.error("Broadcast Error:", error);
    }
  };

  const canCloseCall = () => {
    if (userRole === 'teamlead') return true;
    if (userRole !== 'desk_ex') return false;
    if (!assignments || assignments.length === 0) return false;

    const policeAssignment = assignments.find(a => a.type === "police_ex");
    const ambulanceAssignment = assignments.find(a => a.type === "ambulance_ex");

    const isClosureStatus = (status) =>
      status === "closed" ||
      status === "closed_false_alert" ||
      status === "closed_false_allert";

    if ((policeAssignment && isClosureStatus(policeAssignment.status)) ||
      (ambulanceAssignment && isClosureStatus(ambulanceAssignment.status))) {
      return true;
    }
    return false;
  };

  const handleCloseCall = async () => {
    try {
      if (userRole !== 'teamlead') {
        if (!assignments || assignments.length === 0) {
          throw new Error("No assignments found");
        }
        if (!canCloseCall()) {
          throw new Error("Cannot close call: Conditions not met");
        }
      }

      await HomePageService.closeCase({ assignment_id: call.id });
      await fetchAndPlotLocations(); // Update status

      setModalOpen(true);
      setSnackbarMessage("Call closed successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Close Call Error:", error);
      setSnackbarMessage(error.message || "Error closing call");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };



  const handleModalClose = () => setModalOpen(false);
  const handleRedirectToDashboard = () => navigate('/dashboard');
  const handleSnackbarClose = (e, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Status Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'closed_false_allert': return 'error.main';
      case 'closed': return 'warning.main';
      case 'active': return 'success.main';
      default: return 'text.primary';
    }
  };

  const getStatusIcon = (status) => {
    const commonSx = { fontSize: '1.5rem' };
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert':
        return <ReportProblemIcon sx={{ ...commonSx, color: '#f44336', animation: 'pulse 2s infinite' }} />;
      case 'closed':
        return <AssignmentTurnedInIcon sx={{ ...commonSx, color: '#4caf50' }} />;
      case 'accepted':
        return <PhoneInTalkIcon sx={{ ...commonSx, color: '#2196f3', animation: 'bounce 1s infinite' }} />;
      case 'pending':
        return <AssignmentIcon sx={{ ...commonSx, color: '#ff9800', animation: 'spin 2s linear infinite' }} />;
      default:
        return <NotificationsActiveIcon sx={{ ...commonSx, color: '#757575' }} />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert': return alpha('#f44336', 0.08);
      case 'closed': return alpha('#4caf50', 0.08);
      case 'accepted': return alpha('#2196f3', 0.08);
      case 'pending': return alpha('#ff9800', 0.08);
      default: return alpha('#9e9e9e', 0.08);
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert': return '#f44336';
      case 'closed': return '#4caf50';
      case 'accepted': return '#2196f3';
      case 'pending': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert': return 'False Alert';
      case 'closed': return 'Closed';
      case 'accepted': return 'Accepted';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const getServiceIcon = (type) => {
    return type === "police_ex"
      ? <LocalPoliceIcon sx={{ color: '#1976d2', fontSize: '1.8rem' }} />
      : <SupportAgentIcon sx={{ color: '#e91e63', fontSize: '1.8rem' }} />;
  };

  // Animations
  const keyframes = `
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  console.log("nearestUnit", call);

  const visibleResponderMarkers = policeLocations.filter((marker) => {
    const category = String(marker?.markerCategory || "").toLowerCase();
    if (category === "police") return showPoliceLayers;
    if (category === "ambulance") return showAmbulanceLayers;
    return showPoliceLayers;
  });

  return (
    <>
      <CustomModal
        open={modalOpen}
        onClose={handleModalClose}
        title="Success"
        content="Call closed successfully!"
        actions={
          <Button onClick={handleRedirectToDashboard} color="secondary" variant="outlined">Done</Button>
        }
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ p: 3, height: '100vh', overflow: 'hidden', background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Call Details Card */}
          <Grid item xs={12} md={3} sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>

              {/* Fixed Map Layers Section */}
              <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>MAP LAYERS</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={<Switch checked={showPoliceLayers} onChange={(e) => setShowPoliceLayers(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Show Police Vehicles</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={showAmbulanceLayers} onChange={(e) => setShowAmbulanceLayers(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Show Ambulance Vehicles</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={showPoiLayers} onChange={(e) => setShowPoiLayers(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Show Police Stations</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={showHospitalPoiLayers} onChange={(e) => setShowHospitalPoiLayers(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Show Hospitals</Typography>}
                    sx={{ ml: 0 }}
                  />
                </Box>
              </Box>

              {/* Tabs Header */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{ minHeight: 48 }}
                >
                  <Tab label="Call Info" sx={{ fontSize: '0.75rem', fontWeight: 600, minHeight: 48, p: 1 }} />
                  <Tab label="Driver" sx={{ fontSize: '0.75rem', fontWeight: 600, minHeight: 48, p: 1 }} />
                  <Tab label="Police" sx={{ fontSize: '0.75rem', fontWeight: 600, minHeight: 48, p: 1 }} />
                  <Tab label="Status" sx={{ fontSize: '0.75rem', fontWeight: 600, minHeight: 48, p: 1 }} />
                </Tabs>
              </Box>

              {/* Scrollable Content Area */}
              <CardContent sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2, position: 'relative', bgcolor: '#fff' }}>
                {tabValue === 0 && (
                  <Box sx={{ animation: 'fadeIn 0.5s', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Emergency Call ID</Typography>
                      <Typography variant="body1" fontWeight={500}>{call?.call?.id ?? call?.id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vehicle RegNo</Typography>
                      <Typography variant="body1" fontWeight={500}>{call?.call?.device?.vehicle_reg_no || "N/A"}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">Owner Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{call?.call?.device?.vehicle_owner?.users?.[0]?.name || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Owner Phone</Typography>
                      <Typography variant="body1" fontWeight={500}>{call?.call?.device?.vehicle_owner?.users?.[0]?.mobile || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vehicle Category</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {typeof call?.call?.device?.category === 'object'
                          ? (call.call.device.category?.category || "N/A")
                          : (call?.call?.device?.category || "N/A")}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Alert Type</Typography>
                      <Typography variant="body1" fontWeight={500} color="error.main">
                        {call?.call?.packet_type || "SOS"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Lat</Typography>
                        <Typography variant="body2" fontWeight={600}>{sosLocations[0]?.latitude?.toFixed(5) || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Lon</Typography>
                        <Typography variant="body2" fontWeight={600}>{sosLocations[0]?.longitude?.toFixed(5) || "N/A"}</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box sx={{ animation: 'fadeIn 0.5s', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {driverPhotoLoading ? (
                        <Box sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid',
                          borderColor: 'grey.300'
                        }}>
                          <Typography variant="caption">Loading...</Typography>
                        </Box>
                      ) : driverPhotoUrl ? (
                        <Box
                          component="img"
                          src={driverPhotoUrl}
                          alt="Driver"
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid',
                            borderColor: 'primary.light',
                            boxShadow: theme.shadows[3]
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <Box sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid',
                          borderColor: 'grey.300'
                        }}>
                          <Typography variant="caption">No Photo</Typography>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {call?.call?.device?.drivers?.[0]?.name || "N/A"}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1 }}>
                        <PhoneInTalkIcon fontSize="small" />
                        <Typography variant="body2">
                          {call?.call?.device?.drivers?.[0]?.phone_no || "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>License Number</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ letterSpacing: 1 }}>
                        {call?.call?.device?.drivers?.[0]?.license_no || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box sx={{ animation: 'fadeIn 0.5s' }}>
                    {nearestPolice ? (
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        border: '1px solid',
                        borderColor: 'info.light'
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'info.dark', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalPoliceIcon fontSize="small" /> NEAREST STATION
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Station Name</Typography>
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                              {nearestPolice.name || nearestPolice.description || "Police Station"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Contact Info</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {nearestPolice.phone ||
                                nearestPolice.mobile ||
                                nearestPolice.phoneno ||
                                nearestPolice.contact ||
                                "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Distance</Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                              {nearestPoliceDistance !== null ? `${nearestPoliceDistance.toFixed(2)} km` : "N/A"}
                            </Typography>
                          </Box>
                          {nearestPolice.description && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Description</Typography>
                              <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                                {nearestPolice.description}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6, opacity: 0.6 }}>
                        <LocalPoliceIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">Searching for nearest police station...</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {tabValue === 3 && (
                  <Box sx={{ animation: 'fadeIn 0.5s' }}>
                    {assignments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {assignments.map((assignment, index) => {
                          // Find matching route for this assignment
                          const matchingRoute = activeRoutes.find(route => route.type === assignment.type);
                          const hasRouteInfo = matchingRoute && matchingRoute.estimatedTimeMinutes;

                          return (
                            <Box key={assignment.id} sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              p: 2,
                              bgcolor: getStatusBgColor(assignment.status),
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: getStatusBorderColor(assignment.status),
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              {/* Decorative strip */}
                              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: getStatusBorderColor(assignment.status) }} />

                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ mr: 2, ml: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', bgcolor: 'background.paper', boxShadow: 1 }}>
                                  {getServiceIcon(assignment.type)}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                                    {assignment.type?.replace('_ex', '')}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                                    {getStatusIcon(assignment.status)}
                                    <Typography variant="body2" sx={{ color: getStatusColor(assignment.status), fontWeight: 700 }}>
                                      {getStatusText(assignment.status)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Route Information */}
                              {hasRouteInfo && (
                                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Distance</Typography>
                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                      {matchingRoute.distanceKm.toFixed(2)} km
                                    </Typography>
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">Est. Time </Typography>
                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                      {Math.round(matchingRoute.estimatedTimeMinutes)} min
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6, opacity: 0.6 }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">No tasks assigned yet.</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>

              {/* Fixed Bottom Broadcast Options */}
              <CardContent sx={{ p: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1 }}>Broadcast Actions</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1 }}>
                  Assignment ID: {call?.id ?? "N/A"}
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button fullWidth variant="contained" color="primary" onClick={() => handleBroadcast("police_ex")} disabled={broadcastDisabled} size="small" sx={{ fontSize: '0.7rem' }}>
                      Police
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button fullWidth variant="contained" color="secondary" onClick={() => handleBroadcast("ambulance_ex")} disabled={broadcastDisabled} size="small" sx={{ fontSize: '0.7rem' }}>
                      Ambulance
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button fullWidth variant="outlined" color="primary" onClick={() => handleBroadcast("both")} disabled={broadcastDisabled} size="small" startIcon={<NotificationsActiveIcon />}>
                      Broadcast Both
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button fullWidth variant="contained" color="error" onClick={handleCloseCall} disabled={!canCloseCall()} size="medium">
                      Close Call
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={9} sx={{ height: '100%' }}>
            <Card elevation={3} sx={{ height: '100%', minHeight: '400px', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <BhuvanMapComponent
                gpsData={sosLocations}
                policeData={(showPoliceLayers || showAmbulanceLayers) ? visibleResponderMarkers : []}
                pois={[
                  ...(showPoiLayers ? policePois : []),
                  ...(showHospitalPoiLayers ? hospitalPois : []),
                ]}
                lookupPois={[...policePois, ...hospitalPois]}
                width="100%"
                height="100%"
                routes={activeRoutes}
                autoFit={true}
                showMapTypeToggle={true}
                showDrawControls={false}
                showLogos={true}
                defaultMapType="normal"
                markerLabelMode="vehicle"
                center={sosLocations.length > 0 ? [sosLocations[0].longitude, sosLocations[0].latitude] : [91.829437, 26.131644]}
                zoom={sosLocations.length > 0 ? 14 : 7}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EMCall;