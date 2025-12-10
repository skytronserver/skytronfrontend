/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  Grid, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button
} from "@mui/material";
import "ol/ol.css";
import HomePageService from "../../services/HomePage";
import MiniBoard from "../../ui-component/MiniBoard";
import DetailCard from "../../ui-component/DetailCard";
import { useDispatch } from 'react-redux';
import { getAllSOSCall } from '../../actions/commonDataActions';
import { useNavigate } from "react-router";
import { useTranslation } from 'react-i18next';
import BhuvanMapComponent from "../../components/Map/BhuvanMapComponent";

const audio = new Audio(`${process.env.REACT_APP_BASE_URL}static/bell.wav`);

const SOSDashboard = ({ role, calls, deskCalls }) => {
  const [call, setCall] = useState({})
  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  const navigate = useNavigate();
  //Call Details
  const dispatch = useDispatch();
  const previousCallsRef = useRef([]);
  const [load, setLoad] = useState(false);
  const [newPendingCall, setNewPendingCall] = useState(null);
  const [showDetails, setShowDetails] = useState(false)
  const [sosLocations, setSosLocations] = useState([]);
  const { t } = useTranslation();

  //fetching live location
  useEffect(() => {
    fetchAndPlotLocations();
    // Set interval to update locations every 10 seconds
    const interval = setInterval(fetchAndPlotLocations, 10000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [call.id]); // Add call.id as dependency since fetch depends on it

  //fetching pending call
  useEffect(() => {
    const fetchCallList = async () => {
      try {
        const response = await HomePageService.getPendingSOSCall();
        const calls = response?.data?.calls || [];
        dispatch(getAllSOSCall(calls));
        checkForNewPendingCall(calls); // Check for new "pending" assignments
      } catch (error) {
        console.error('Error fetching call list:', error);
        dispatch(getAllSOSCall([]));
      }
      setLoad(true);
    };
    // Fetch data every 10 seconds
    fetchCallList();
    const interval = setInterval(fetchCallList, 10000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [dispatch]);

  const fetchAndPlotLocations = async () => {
    try {
      if (!call.id) {
        setSosLocations([]);
        return;
      }
      const response = await HomePageService.getEMCallloc({
        assignment_id: call.id,
      });
      const locations = response.data.target || [];

      // Map locations to format expected by BhuvanMapComponent
      // We force 'EA' packet type for Red color and ensure vehicle type is set
      const mappedLocations = locations.map(loc => ({
        ...loc,
        packet_type: 'EA', // Force Red
        device_tag_info: {
          ...loc.device_tag_info,
          category_info: {
            category: 'bus' // Default to bus icon if not present
          }
        }
      }));

      setSosLocations(mappedLocations);
    } catch (error) {
      console.error("Fetch Locations Error:", error);
    }
  };

  const handleBroadcast = async (type) => {
    try {
      let broadcastType = type;
      if (type === "both") {
        await HomePageService.broadCast({ assignment_id: call.id, radius: 5, type: "police_ex" });
        await HomePageService.broadCast({ assignment_id: call.id, radius: 5, type: "ambulance_ex" });
        broadcastType = "Police and Ambulance";
      } else {
        await HomePageService.broadCast({ assignment_id: call.id, radius: 5, type });
        broadcastType = type === "police_ex" ? "Police" : "Ambulance";
      }
      setBroadcastDisabled(true);
      alert(`${broadcastType} broadcast successful!`);
    } catch (error) {
      console.error('Broadcast Error:', error);
    }
  };

  const handleCloseCall = async () => {
    try {
      await HomePageService.closeCase({ assignment_id: call.id });
      alert('Call closed successfully!');
      setShowDetails(false)
    } catch (error) {
      console.error('Close Call Error:', error);
    }
  };

  const checkForNewPendingCall = (calls) => {
    const newPendingCall = calls.find(
      (call) =>
        call.call?.status === 'pending' &&
        call?.status === 'pending' &&
        !previousCallsRef.current.some((prevCall) => prevCall.id === call.id)
    );
    if (newPendingCall) {
      setNewPendingCall(newPendingCall);
      playBuzzer(); // Play the buzzer sound
    }
    previousCallsRef.current = calls;
  };

  const playBuzzer = () => {
    audio.play();
  };

  const handleAccept = async (id, show) => {
    const response = await HomePageService.acceptEMCall({ assignment_id: id, accept: true });
    const acceptedCall = response.data;
    setNewPendingCall(null); // Close the popup after accepting
    audio.pause();
    if (show === "here") {
      handleShow(acceptedCall)
      setShowDetails(true)
    } else {
      handleNavigate(acceptedCall)
    }

  };

  const handleShow = (callObj) => {
    setCall(callObj)
  };

  const handleNavigate = (call) => {
    navigate('/emcall', { state: { call } });
  };

  let data = [
    { title: t('dashboard.labels.calls').split(',')[0], value: "0" },
    { title: t('dashboard.labels.calls').split(',')[1], value: "0" },
    { title: t('dashboard.labels.calls').split(',')[2], value: "0" },
    { title: t('dashboard.labels.calls').split(',')[3], value: "0" },
  ];

  if (role === 'desk_ex') {
    data = [
      { title: t('dashboard.headings.averageAcceptanceTime'), value: deskCalls.averageTime },
      { title: t('dashboard.headings.weekly'), value: deskCalls.Total_Assignemnt_thisweek },
      { title: t('dashboard.headings.daily'), value: deskCalls.Total_Assignemnt_today },
      { title: t('dashboard.headings.total'), value: deskCalls.Total_Assignemnt },
    ];
  }

  if (role === 'teamlead') {
    data = [
      { title: t('dashboard.labels.calls').split(',')[0], value: calls.Total_Active_Calls },
      { title: t('dashboard.labels.calls').split(',')[1], value: calls.Total_Closed_Calls },
      { title: t('dashboard.labels.calls').split(',')[2], value: calls.Total_Pending_Calls },
      { title: t('dashboard.labels.calls').split(',')[3], value: calls.Average_time_to_Accept },
    ];
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <MiniBoard data={data} />
      </Grid>
      <Grid item xs={12} md={12}>
        <BhuvanMapComponent
          gpsData={sosLocations}
          width="100%"
          height="65vh"
          autoFit={false}
          showMapTypeToggle={true}
          showDrawControls={false}
          showLogos={true}
          defaultMapType="normal"
          markerLabelMode="vehicle"
          center={[91.829437, 26.131644]} // Use original center
          zoom={7}
        />
      </Grid>
      <DetailCard
        handleBroadcast={handleBroadcast}
        handleCloseCall={handleCloseCall}
        broadcastDisabled={broadcastDisabled}
        call={call}
        showDetails={showDetails}
      />

      {/* Popup Dialog for New Pending Call */}
      <Dialog open={!!newPendingCall} onClose={() => setNewPendingCall(null)}>
        <DialogTitle
          sx={{
            backgroundColor: "darkred",
            color: "white",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          New Pending Assignment
        </DialogTitle>
        <DialogContent sx={{ padding: "16px !important" }}>
          <Typography>
            A new assignment with ID {newPendingCall?.id} is pending. Do you
            want to accept it?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => handleAccept(newPendingCall?.id, "detail")}
            color="secondary"
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default SOSDashboard;
