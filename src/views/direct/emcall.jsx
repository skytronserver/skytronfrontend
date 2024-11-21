/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import "ol/ol.css";
import HomePageService from "../../services/HomePage";
import "./emcall.css";
import CustomModal from "../../ui-component/CustomModal";
import { useNavigate } from 'react-router-dom';
const EMCall = () => {
  const { state } = useLocation();
  const { call } = state || {};
  const mapElement = useRef();
  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [vectorLayer, setVectorLayer] = useState(
    new VectorLayer({ source: new VectorSource() })
  );
  const mapRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate(); 
  // Initialize map
  useEffect(() => {
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new TileWMS({
            url: "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms",
            params: {
              LAYERS: "basemap%3Aadmin_group",
              TILED: true,
              VERSION: "1.1.1",
              FORMAT: "image/png",
              TRANSPARENT: "true",
              SRS: "EPSG:4326",
              WIDTH: 256, // Set the tile width to 256 pixels
              HEIGHT: 256, // Set the tile height to 256 pixels
              pixelRatio: 1,
            },
            serverType: "geoserver",
            projection: "EPSG:4326", // Ensure the projection is set:'
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

  // Fetch locations and plot them on the map
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
              src: "https://skytrack.tech:2000/static/logo/red-skytron-transparent.png",
              scale: 0.06,
            }),
          })
        );

        source.addFeature(feature);
        //console.log("location updated ");
        //mapRef.current.getView().setCenter(coordinates);
      });
    } catch (error) {
      console.error("Fetch Locations Error:", error);
    }
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    fetchAndPlotLocations();

    // Set interval to update locations every 30 seconds
    const interval = setInterval(fetchAndPlotLocations, 30000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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

  const handleCloseCall = async () => {
    try {
      await HomePageService.closeCase({ assignment_id: call.id });
      setModalOpen(true); 
    } catch (error) {
      console.error("Close Call Error:", error);
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

  const fetchMessages = async () => {
    try {
      const response = await HomePageService.getEMmessage({
        assignment_id: call.id,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Fetch Messages Error:", error);
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleRedirectToDashboard = () => {
    navigate('/dashboard');  // Redirect to dashboard
  };
  return (
    <>
    <CustomModal
        open={modalOpen}
        onClose={handleModalClose}
        title="Success"
        content="Call closed successfully!"
        actions={
          <>
            <Button onClick={handleRedirectToDashboard} color="secondary" variant="outlined">
              Done
            </Button>
          </>
        }
      />
    <Grid container spacing={3} style={{ padding: "20px" }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4">CALL DETAILS</Typography>
            <Typography variant="body1">
              Emergency Call ID: <strong>{call?.id}</strong>
            </Typography>
            <Typography variant="body1">
              IMEI: <strong>{call?.call?.device?.device?.imei || "N/A"}</strong>
            </Typography>
            <Typography variant="body1">
              Vehicle RegNo:{" "}
              <strong>{call?.call?.device?.vehicle_reg_no || "N/A"}</strong>
            </Typography>
            <Typography variant="body1">
              Owner Name:{" "}
              <strong>
                {call?.call?.device?.vehicle_owner?.users?.[0]?.name || "N/A"}
              </strong>
            </Typography>
            <Typography variant="body1">
              Call Status: <strong>{call?.call?.status || "N/A"}</strong>
            </Typography>
          </CardContent>
          <CardContent>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBroadcast("police_ex")}
                disabled={broadcastDisabled}
              >
                Broadcast Police
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBroadcast("ambulance_ex")}
                disabled={broadcastDisabled}
              >
                Broadcast Ambulance
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBroadcast("both")}
                disabled={broadcastDisabled}
              >
                Broadcast Police & Ambulance
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseCall}
              >
                Close Call
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={9}>
        <div ref={mapElement} className="map-container">
          {/* Position logos using absolute positioning within the map container */}
          <img
            src="https://skytrack.tech:2000/static/logo/inspace.png"
            className="logo-map inspace-logo"
            alt="img-logo"
          />
          <img
            src="https://skytrack.tech:2000/static/logo/isro.png"
            className="logo-map isro-logo"
            alt="img-iso"
          />
          <img
            src="https://skytrack.tech:2000/static/logo/skytron.png"
            className="logo-map skytron-logo"
            alt="img-skytrack"
          />
        </div>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5">Chat Box</Typography>
            <Box className="chat-box">
              {messages.map((msg) => (
                <Box key={msg.id} className="chat-message">
                  <Typography variant="body2" className="chat-username">
                    {msg.assignment.admin.users[0].name}:
                  </Typography>{" "}
                  <Typography variant="body2" className="chat-text">
                    {msg.message}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box className="chat-input-container">
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent newline from being added
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </>
  );
};

export default EMCall;
