import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Grid, Card, CardContent, Typography, Button, Box, TextField,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat } from 'ol/proj';

import { Icon, Style } from "ol/style";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import axios from 'axios';
import 'ol/ol.css';
import HomePageService from '../../services/HomePage';

const EMCall = () => {
    const { state } = useLocation();
    const { call } = state || {};
    const mapElement = useRef();
    const [broadcastDisabled, setBroadcastDisabled] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [vectorLayer, setVectorLayer] = useState(new VectorLayer({ source: new VectorSource() }));
    const mapRef = useRef(null);

    // Initialize map
    useEffect(() => {
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new TileLayer({
                    source: new TileWMS({
                        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
                        params: {
                            'LAYERS': 'basemap%3Aadmin_group',
                            'TILED': true,
                            'VERSION': '1.1.1',
                            'FORMAT': 'image/png',
                            'TRANSPARENT': 'true',
                            'SRS': 'EPSG:4326',
                            'WIDTH': 256,   // Set the tile width to 256 pixels
                            'HEIGHT': 256,   // Set the tile height to 256 pixels
                            'pixelRatio': 1,

                        },
                        serverType: 'geoserver',
                        projection: 'EPSG:4326', // Ensure the projection is set:' 



                    })
                }),
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
            const response = await HomePageService.getEMCallloc({ assignment_id: call.id });
            const locations = response.data.target || [];

            // Clear previous features
            const source = vectorLayer.getSource();
            source.clear();

            // Add new features
            locations.forEach((location) => {
                const { longitude, latitude } = location;
                const coordinates = fromLonLat([longitude, latitude]);
                const feature = new Feature({ geometry: new Point(coordinates) });
                feature.setStyle(new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: "https://skytrack.tech:2000/static/logo/red-skytron-transparent.png",
                        scale: 0.06,
                    }),
                }))

                source.addFeature(feature);
                // mapRef.current.getView().setCenter(coordinates);
            });
        } catch (error) {
            console.error('Fetch Locations Error:', error);
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
        } catch (error) {
            console.error('Close Call Error:', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            await HomePageService.sendEMmessage({ assignment_id: call.id, message: newMessage });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Send Message Error:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await HomePageService.getEMmessage({ assignment_id: call.id });
            setMessages(response.data);
        } catch (error) {
            console.error('Fetch Messages Error:', error);
        }
    };

    return (
        <Grid container spacing={3} style={{ padding: '20px' }}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Call Details</Typography>
                        <Typography variant="body1">Emergency Call ID: {call?.id}</Typography>
                        <Typography variant="body1">IMEI: {call?.call?.device?.device?.imei || 'N/A'}</Typography>
                        <Typography variant="body1">
                            Vehicle RegNo: {call?.call?.device?.vehicle_reg_no || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                            Owner Name: {call?.call?.device?.vehicle_owner?.users?.[0]?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body1">Call Status: {call?.call?.status || 'N/A'}</Typography>
                    </CardContent>
                    <CardContent>
                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={2} // Adds space between buttons
                        >
                            <Button variant="contained" color="primary" onClick={() => handleBroadcast('police_ex')} disabled={broadcastDisabled}>
                                Broadcast Police
                            </Button>
                            <Button variant="contained" color="primary" onClick={() => handleBroadcast('ambulance_ex')} disabled={broadcastDisabled}>
                                Broadcast Ambulance
                            </Button>
                            <Button variant="contained" color="primary" onClick={() => handleBroadcast('both')} disabled={broadcastDisabled}>
                                Broadcast Police and Ambulance
                            </Button>
                            <Button variant="contained" color="error" onClick={handleCloseCall}>
                                Close Call
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Map Display</Typography>


                        <div ref={mapElement} style={{ height: '300px', position: 'relative' }}>
                            {/* Position logos using absolute positioning within the map container */}
                            <img src="https://skytrack.tech:2000/static/logo/inspace.png" style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
                            <img src="https://skytrack.tech:2000/static/logo/isro.png" style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
                            <img src="https://skytrack.tech:2000/static/logo/skytron.png" style={{ position: 'absolute', bottom: 0, right: 0, width: '200px', zIndex: 1000, backgroundColor: '#FFFFFF' }} />

                        </div>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Chat Box</Typography>
                        <Box sx={{ border: '1px solid #ccc', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>



                            {messages.map((msg) => (
                                <Typography key={msg.id}>
                                    {msg.assignment.admin.users[0].name}: {msg.message}
                                </Typography>
                            ))}
                        </Box>
                        <Box display="flex" gap={1} marginTop={2}>
                            <TextField
                                fullWidth
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={handleSendMessage}>
                                Send
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default EMCall;
