import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Slider, Typography, Paper, CircularProgress } from "@mui/material";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM, TileWMS } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Icon, Style, Stroke, Circle as CircleStyle, Fill, Text } from "ol/style";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { getCenter } from "ol/extent";
import Select from "ol/interaction/Select";

const TripPlanningMap = ({
  routeCoordinates,
  startTime,
  endTime,
  onEtaUpdate,
  onTripComplete,
  onTripCancelled,
  isActive,
  tripId
}) => {
  const [map, setMap] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const [eta, setEta] = useState(null);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [tripStatus, setTripStatus] = useState("scheduled");
  
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const markerRef = useRef(null);
  const animationMarkerRef = useRef(null);
  const animationIntervalId = useRef(null);
  const featureOverlayRef = useRef(null);
  const allFeaturesRef = useRef([]);
  const etaIntervalRef = useRef(null);

  // Calculate total trip duration in minutes
  const calculateTripDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60));
  };

  // Initialize map
  useEffect(() => {
    if (!map) {
      const initialMap = new Map({
        target: mapRef.current,
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
            })
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
            })
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
            })
          }),
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]),
          zoom: 7,
        }),
        pixelRatio: 1,
      });

      const overlay = new Overlay({
        element: overlayRef.current,
        autoPan: true,
        autoPanAnimation: {
          duration: 2,
        },
      });

      initialMap.addOverlay(overlay);

      const markerSource = new VectorSource();
      const markerLayer = new VectorLayer({
        source: markerSource,
      });

      initialMap.addLayer(markerLayer);

      setMap(initialMap);
      markerRef.current = markerSource;
      featureOverlayRef.current = overlay;
    }
  }, [map]);

  // Load route when coordinates change
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0 && markerRef.current) {
      loadRoute(routeCoordinates);
    }
  }, [routeCoordinates]);

  // Handle trip status changes
  useEffect(() => {
    if (isActive) {
      setTripStatus("in-progress");
      startEtaTimer();
    } else {
      setTripStatus("scheduled");
      clearEtaTimer();
    }
    
    return () => {
      clearEtaTimer();
    };
  }, [isActive]);

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalId.current) {
        clearInterval(animationIntervalId.current);
      }
      if (etaIntervalRef.current) {
        clearInterval(etaIntervalRef.current);
      }
    };
  }, []);

  // Load route on the map
  const loadRoute = (coordinates) => {
    try {
      if (!coordinates || coordinates.length < 2) {
        console.warn('Invalid route data: Need at least 2 points to display a route');
        return;
      }

      markerRef.current.clear();
      allFeaturesRef.current = [];

      // Create point features only for start and end points
      const startPoint = new Feature({
        geometry: new Point(fromLonLat(coordinates[0])),
      });
      const endPoint = new Feature({
        geometry: new Point(fromLonLat(coordinates[coordinates.length - 1])),
      });

      // Set style for start and end points
      [startPoint, endPoint].forEach(point => {
        point.setStyle(
          new Style({
            image: new Icon({
              src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
              scale: 0.051,
              anchor: [0.5, 1],
              anchorXUnits: "fraction",
              anchorYUnits: "fraction",
            }),
          })
        );
      });

      markerRef.current.addFeatures([startPoint, endPoint]);
      allFeaturesRef.current.push(startPoint, endPoint);

      // Create and add the route line
      const lineCoordinates = coordinates.map(coords => fromLonLat(coords));
      
      if (lineCoordinates.some(coord => !coord || coord.length < 2)) {
        throw new Error('Invalid coordinates in route');
      }

      const line = new Feature({
        geometry: new LineString(lineCoordinates),
      });
      
      line.setStyle(new Style({
        stroke: new Stroke({
          color: '#0066ff',
          width: 3
        })
      }));
      
      markerRef.current.addFeature(line);
      allFeaturesRef.current.push(line);

      // Get the extent and verify it's valid before fitting
      const extent = line.getGeometry().getExtent();
      if (extent && extent.every(coord => typeof coord === 'number' && !isNaN(coord))) {
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 18
        });
      } else {
        console.warn('Invalid extent calculated for route');
      }

      // Set up animation points
      setMaxSliderValue(coordinates.length - 1);
      setSliderValue(0);
    } catch (error) {
      console.error('Error loading route:', error);
    }
  };

  // Start ETA timer
  const startEtaTimer = () => {
    if (!startTime || !endTime) return;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const totalDuration = end - start;
    
    // Calculate initial progress
    let initialProgress = 0;
    let initialRemainingTime = totalDuration;
    
    if (now > start) {
      initialProgress = Math.min(100, Math.round(((now - start) / totalDuration) * 100));
      initialRemainingTime = Math.max(0, end - now);
    }
    
    setProgress(initialProgress);
    setRemainingTime(initialRemainingTime);
    
    // Update ETA every second
    etaIntervalRef.current = setInterval(() => {
      const currentTime = new Date();
      const elapsed = currentTime - start;
      const newProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      const newRemainingTime = Math.max(0, end - currentTime);
      
      setProgress(newProgress);
      setRemainingTime(newRemainingTime);
      
      // Update ETA for parent component
      if (onEtaUpdate) {
        onEtaUpdate(newRemainingTime);
      }
      
      // Check if trip is complete
      if (currentTime >= end) {
        clearInterval(etaIntervalRef.current);
        setTripStatus("completed");
        if (onTripComplete) {
          onTripComplete(tripId);
        }
      }
    }, 1000);
  };

  // Clear ETA timer
  const clearEtaTimer = () => {
    if (etaIntervalRef.current) {
      clearInterval(etaIntervalRef.current);
      etaIntervalRef.current = null;
    }
  };

  // Format remaining time
  const formatRemainingTime = (ms) => {
    if (!ms || ms <= 0) return "0:00";
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle slider change
  const handleSliderChange = (event, value) => {
    setSliderValue(value);
    if (routeCoordinates && routeCoordinates[value]) {
      updateCurrentPosition(routeCoordinates[value][0], routeCoordinates[value][1]);
    }
  };

  // Update current position on map
  const updateCurrentPosition = (lon, lat) => {
    const currentCoordinates = fromLonLat([lon, lat]);

    // Remove the previous animation marker if it exists
    if (animationMarkerRef.current) {
      markerRef.current.removeFeature(animationMarkerRef.current);
    }

    // Add the new animation marker
    const marker = new Feature({
      geometry: new Point(currentCoordinates),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          src: `${process.env.REACT_APP_BASE_URL}static/logo/blue-skytron-transparent.png`,
          scale: 0.06,
          anchor: [0.5, 1],
        }),
      })
    );

    markerRef.current.addFeature(marker);
    animationMarkerRef.current = marker;

    setCurrentCoordinates(currentCoordinates);
    map.getView().setCenter(currentCoordinates);
  };

  // Play animation
  const playAnimation = () => {
    setIsPlaying(true);
    let currentIndex = sliderValue;
    overlayRef.current.style.display = "none";

    animationIntervalId.current = setInterval(() => {
      if (currentIndex < maxSliderValue) {
        currentIndex += 1;
        setSliderValue(currentIndex);
        if (routeCoordinates && routeCoordinates[currentIndex]) {
          updateCurrentPosition(routeCoordinates[currentIndex][0], routeCoordinates[currentIndex][1]);
        }
      } else {
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
      }
    }, animationSpeed);
  };

  // Pause animation
  const pauseAnimation = () => {
    clearInterval(animationIntervalId.current);
    setIsPlaying(false);
  };

  // Restart animation
  const restartAnimation = () => {
    setSliderValue(0);
    if (routeCoordinates && routeCoordinates[0]) {
      updateCurrentPosition(routeCoordinates[0][0], routeCoordinates[0][1]);
    }
  };

  // Cancel trip
  const cancelTrip = () => {
    clearEtaTimer();
    setTripStatus("cancelled");
    if (onTripCancelled) {
      onTripCancelled(tripId);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '500px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* ETA Info Overlay */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          minWidth: '200px'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Trip Status
        </Typography>
        <Typography variant="body1">
          Status: {isActive ? 'In Progress' : 'Scheduled'}
        </Typography>
        {eta !== null && (
          <Typography variant="body1" color="primary">
            ETA: {formatRemainingTime(eta)}
          </Typography>
        )}
        {progress > 0 && (
          <Typography variant="body1">
            Progress: {Math.round(progress)}%
          </Typography>
        )}
      </Paper>

      {/* Animation Controls */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Button onClick={isPlaying ? pauseAnimation : playAnimation} sx={{ ml: 2 }}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={restartAnimation} sx={{ ml: 2 }}>
          Restart
        </Button>
        <Typography variant="body2" sx={{ ml: 2 }}>Faster</Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          min={10}
          max={500}
          step={10}
          sx={{ width: "10%", ml: 2 }}
        />
        <Typography sx={{ ml: 2 }} variant="body2">Slower</Typography>
      </Paper>
    </Box>
  );
};

export default TripPlanningMap; 