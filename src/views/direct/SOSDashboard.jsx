/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  Grid, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button
} from "@mui/material";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import "ol/ol.css";
import HomePageService from "../../services/HomePage";
import MiniBoard from "../../ui-component/MiniBoard";
import DetailCard from "../../ui-component/DetailCard";
import { useDispatch } from 'react-redux';
import { getAllSOSCall } from '../../actions/commonDataActions';
import { useNavigate } from "react-router";
import { useTranslation } from 'react-i18next';
const audio = new Audio(`${process.env.REACT_APP_BASE_URL}static/bell.wav`);
const SOSDashboard = ({ role, calls, deskCalls }) => {
  const mapElement = useRef();
  const [call, setCall] = useState({})
  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [vectorLayer, setVectorLayer] = useState(
    new VectorLayer({ source: new VectorSource() })
  );
  const mapRef = useRef(null);
  const navigate = useNavigate();
  //Call Details
  const dispatch = useDispatch();
  const previousCallsRef = useRef([]);
  const [load, setLoad] = useState(false);
  const [newPendingCall, setNewPendingCall] = useState(null);
  const [showDetails, setShowDetails] = useState(false)
  const { t } = useTranslation();
  // Initialize map
  useEffect(() => {
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        // India3 layer
        new TileLayer({
          source: new TileWMS({
            url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
            params: {
              'LAYERS': 'india3',
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png',
              'TRANSPARENT': 'true',
              'SRS': 'EPSG:4326',
              'WIDTH': 256,
              'HEIGHT': 256,
              'pixelRatio': 1,
            },
            serverType: 'geoserver',
            projection: 'EPSG:4326',
          }),
        }),
        // Admin group layer (basemap)
        new TileLayer({
          source: new TileWMS({
            url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
            params: {
              'LAYERS': 'basemap%3Aadmin_group',
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png',
              'TRANSPARENT': 'true',
              'SRS': 'EPSG:4326',
              'WIDTH': 256,
              'HEIGHT': 256,
              'pixelRatio': 1,
            },
            serverType: 'geoserver',
            projection: 'EPSG:4326',
          }),
        }),
        // Roads layer (mmi_india)
        new TileLayer({
          source: new TileWMS({
            url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
            params: {
              'LAYERS': 'mmi:mmi_india',
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png',
              'TRANSPARENT': 'true',
              'SRS': 'EPSG:4326',
              'WIDTH': 256,
              'HEIGHT': 256,
              'pixelRatio': 1,
            },
            serverType: 'geoserver',
            projection: 'EPSG:4326',
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
        zoom: 7,
      }),

      pixelRatio: 1,
    });

    mapRef.current = map;
    return () => map.setTarget(null); // Cleanup on unmount
  }, []);
  //fetching live location
  useEffect(() => {
    fetchAndPlotLocations();
    // Set interval to update locations every 30 seconds
    const interval = setInterval(fetchAndPlotLocations, 30000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
      const response = await HomePageService.getEMCallloc({
        assignment_id: call.id,
      });
      const locations = response.data.target || [];
      // Clear previous features
      const source = vectorLayer.getSource();
      source.clear();
      // Add new features
      locations.forEach((location) => {
        console.log(location);
        const { longitude, latitude } = location;
        const coordinates = fromLonLat([longitude, latitude]);
        const feature = new Feature({ geometry: new Point(coordinates) });
        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: `${process.env.REACT_APP_BASE_URL}static/logo/red-skytron-transparent.png`,
              scale: 0.06,
            }),
          })
        );

        source.addFeature(feature);
      });
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
        <div ref={mapElement} style={{ height: "65vh", position: "relative" }}>
          {/* Position logos using absolute positioning within the map container */}
          <img
            src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "120px",
              zIndex: 1000,
            }}
            alt="space-logo"
          />
          <img
            src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "70px",
              zIndex: 1000,
            }}
            alt="logo"
          />
          <img
            src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
            style={{
              position: "absolute",
              bottom: "20px",
              right: 0,
              width: "200px",
              zIndex: 1000,
              backgroundColor: "transparent",
            }}
            alt="skytron-logo"
          />
        </div>
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
