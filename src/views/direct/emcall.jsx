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
import { BASE_URL } from "../../store/constant";

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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Police Data State
  const [policeLocations, setPoliceLocations] = useState([]);
  const [policePois, setPolicePois] = useState([]);
  const [nearestPolice, setNearestPolice] = useState(null);
  const [nearestPoliceDistance, setNearestPoliceDistance] = useState(null);
  const [nearestPoliceAddress, setNearestPoliceAddress] = useState("");

  // Toggle states for map visibility
  const [showPoliceLayers, setShowPoliceLayers] = useState(false);
  const [showPoiLayers, setShowPoiLayers] = useState(false);

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

            let city = "";
            if (result && Array.isArray(result.address_components)) {
              const cityComp = result.address_components.find((c) =>
                c.types.includes("locality") ||
                c.types.includes("administrative_area_level_2") ||
                c.types.includes("administrative_area_level_3")
              );
              if (cityComp) city = cityComp.long_name;
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

        setPolicePois(filtered);
      } catch (error) {
        console.error("Error fetching police POIs for EmCall:", error);
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
          params.radius_km = 10;
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
  useEffect(() => {
    fetchPoliceLocations(sosLocations);
    const interval = setInterval(() => fetchPoliceLocations(sosLocations), 10000);
    return () => clearInterval(interval);
  }, [sosLocations]);

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

    const interval = setInterval(fetchAndPlotLocations, 10000);
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
    if (!assignments || assignments.length === 0) return false;
    if (userRole !== 'teamlead' && userRole !== 'desk_ex') return false;

    const policeAssignment = assignments.find(a => a.type === "police_ex");
    const ambulanceAssignment = assignments.find(a => a.type === "ambulance_ex");

    const isClosureStatus = (status) =>
      status === "closed" ||
      status === "closed_false_alert" ||
      status === "closed_false_allert";

    if (userRole === 'desk_ex') {
      const hasProperService =
        (policeAssignment && isClosureStatus(policeAssignment.status)) ||
        (ambulanceAssignment && isClosureStatus(ambulanceAssignment.status));
      if (!hasProperService) return false;
    }

    if ((policeAssignment && isClosureStatus(policeAssignment.status)) ||
      (ambulanceAssignment && isClosureStatus(ambulanceAssignment.status))) {
      return true;
    }
    return false;
  };

  const handleCloseCall = async () => {
    try {
      if (!assignments || assignments.length === 0) {
        throw new Error("No assignments found");
      }
      if (!canCloseCall()) {
        throw new Error("Cannot close call: Conditions not met");
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

  const handleSendMessage = async () => {
    try {
      await HomePageService.sendEMmessage({
        assignment_id: call.id,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
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
  `;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  console.log("nearestUnit", call);

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

      <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
        <Grid container spacing={3}>
          {/* Call Details Card */}
          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 600, borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
                  CALL DETAILS
                </Typography>

                {/* Map Layers Toggle - At Top */}
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Map Layers</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={showPoliceLayers} onChange={(e) => setShowPoliceLayers(e.target.checked)} size="small" />}
                      label="Show Police Vehicles"
                    />
                    <FormControlLabel
                      control={<Switch checked={showPoiLayers} onChange={(e) => setShowPoiLayers(e.target.checked)} size="small" />}
                      label="Show Police Stations (POI)"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Emergency Call ID</Typography>
                    <Typography variant="body1" fontWeight={500}>{call?.id}</Typography>
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
                  <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2, mt: 1 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 700, letterSpacing: '0.5px' }}>
                      DRIVER INFORMATION
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                      {call?.call?.device?.drivers?.[0]?.photo && (
                        <Box
                          component="img"
                          src={`${BASE_URL}${call.call.device.drivers[0].photo}`}
                          alt="Driver"
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '2px solid',
                            borderColor: 'background.paper',
                            boxShadow: theme.shadows[2]
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Name</Typography>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {call?.call?.device?.drivers?.[0]?.name || "N/A"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Phone</Typography>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {call?.call?.device?.drivers?.[0]?.phone_no || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>License Number</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {call?.call?.device?.drivers?.[0]?.license_no || "N/A"}
                      </Typography>
                    </Box>
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
                    <Typography variant="caption" color="text.secondary">Emergency alert type</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {call?.call?.packet_type || "SOS"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Latitude</Typography>
                      <Typography variant="body2" fontWeight={500}>{sosLocations[0]?.latitude?.toFixed(6) || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Longitude</Typography>
                      <Typography variant="body2" fontWeight={500}>{sosLocations[0]?.longitude?.toFixed(6) || "N/A"}</Typography>
                    </Box>
                  </Box>

                  {/* Nearest Police Station Info - Moved here and styled as a highlight */}
                  {nearestPolice && (
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      border: '1px solid',
                      borderColor: 'secondary.light'
                    }}>
                      <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'secondary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalPoliceIcon fontSize="small" /> NEAREST POLICE STATION
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Station Name</Typography>
                          <Typography variant="body2" fontWeight={600} color="primary.dark">
                            {nearestPolice.name || nearestPolice.description || "Police Station"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {nearestPolice.phone ||
                              nearestPolice.mobile ||
                              nearestPolice.phoneno ||
                              nearestPolice.contact ||
                              "N/A"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Distance</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {nearestPoliceDistance !== null ? `${nearestPoliceDistance.toFixed(2)} km` : "N/A"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Address</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                            {nearestPoliceAddress || "Fetching address..."}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {assignments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Assignment Statuses</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {assignments.map((assignment, index) => (
                          <Box key={assignment.id} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: getStatusBgColor(assignment.status),
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: getStatusBorderColor(assignment.status)
                          }}>
                            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '12px', bgcolor: 'background.paper' }}>
                              {getServiceIcon(assignment.type)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>Assignment #{index + 1} ({assignment.type})</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(assignment.status)}
                                <Typography variant="body2" sx={{ color: getStatusColor(assignment.status), fontWeight: 600 }}>
                                  {getStatusText(assignment.status)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
              <CardContent sx={{ p: 2, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" flexDirection="column" gap={1} sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={() => handleBroadcast("police_ex")} disabled={broadcastDisabled} size="small">
                    Broadcast Police
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleBroadcast("ambulance_ex")} disabled={broadcastDisabled} size="small">
                    Broadcast Ambulance
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleBroadcast("both")} disabled={broadcastDisabled} size="small">
                    Broadcast Both
                  </Button>
                  <Button variant="contained" color="error" onClick={handleCloseCall} disabled={!canCloseCall()} size="small">
                    Close Call
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={9}>
            <Card elevation={3} sx={{ height: '100%', minHeight: '400px', borderRadius: 2, overflow: 'hidden' }}>
              <BhuvanMapComponent
                gpsData={sosLocations}
                policeData={showPoliceLayers ? policeLocations : []}
                pois={showPoiLayers ? policePois : []}
                width="100%"
                height="100%"
                autoFit={false}
                focusEntry={sosLocations.length > 0 ? sosLocations[0] : null}
                showMapTypeToggle={true}
                showDrawControls={false}
                showLogos={true}
                defaultMapType="normal"
                markerLabelMode="vehicle"
                center={sosLocations.length > 0 ? [sosLocations[0].longitude, sosLocations[0].latitude] : [91.829437, 26.131644]}
                zoom={sosLocations.length > 0 ? 16 : 7}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EMCall;