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
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import HomePageService from "../../services/HomePage";
import CustomModal from "../../ui-component/CustomModal";
import "./emcall.css";
import BhuvanMapComponent from "../../components/Map/BhuvanMapComponent";

const EMCall = () => {
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

  // Initial Fetch and Polling
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
            <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 600, borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
                  CALL DETAILS
                </Typography>
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
                  <Box>
                    <Typography variant="caption" color="text.secondary">Owner Email</Typography>
                    <Typography variant="body1" fontWeight={500}>{call?.call?.device?.vehicle_owner?.users?.[0]?.email || "N/A"}</Typography>
                  </Box>

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
              <CardContent>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Button variant="contained" color="primary" onClick={() => handleBroadcast("police_ex")} disabled={broadcastDisabled}>
                    Broadcast Police
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleBroadcast("ambulance_ex")} disabled={broadcastDisabled}>
                    Broadcast Ambulance
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleBroadcast("both")} disabled={broadcastDisabled}>
                    Broadcast Both
                  </Button>
                  <Button variant="contained" color="error" onClick={handleCloseCall} disabled={!canCloseCall()}>
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
                width="100%"
                height="100%"
                autoFit={true}
                showMapTypeToggle={true}
                showDrawControls={false}
                showLogos={true}
                defaultMapType="normal"
                markerLabelMode="vehicle"
                center={[91.829437, 26.131644]}
                zoom={7}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EMCall;