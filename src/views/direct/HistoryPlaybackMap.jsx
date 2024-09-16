import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Slider, Typography } from "@mui/material";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Icon, Style, Stroke, Circle as CircleStyle, Fill, Text } from "ol/style";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { getCenter } from "ol/extent"; // For centering the map
import axios from "axios";
import Select from "ol/interaction/Select";

const GPSHistoryMap = ({
  startDateTime,
  endDateTime,
  vehicleRegistrationNumber,
  downloadStatus,
  setDownloadStatus,
}) => {
  const [map, setMap] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(0);
  const [streetLevelZoom, setStreetLevelZoom] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const markerRef = useRef(null);
  const animationMarkerRef = useRef(null); // Separate ref for the animation marker
  const animationIntervalId = useRef(null);
  const featureOverlayRef = useRef(null);
  const allFeaturesRef = useRef([]); // To store all features and avoid clearing markers

  const STREET_ZOOM_LEVEL = 18;

  // Fetch map data from the API
  const fetchMapData = async () => {
    setIsPlaying(false);
    setDownloadStatus("Idle");
    try {
      if (vehicleRegistrationNumber !== "") {
        setDownloadStatus("Downloading");
        const response = await axios.get(
          "https://skytrack.tech:2000/api/gps_history_map_data/",
          {
            params: {
              start_datetime: startDateTime,
              end_datetime: endDateTime,
              vehicle_registration_number: vehicleRegistrationNumber,
            },
          }
        );

        const data = response.data.data;
        setDownloadStatus("Processing");
        setMapData(data);
        setMaxSliderValue(data.length - 1);
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  };

  useEffect(() => {
    fetchMapData(); // Fetch data on prop changes
  }, [startDateTime, endDateTime, vehicleRegistrationNumber]);

  useEffect(() => {
    if (!map) {
      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]),
          zoom: 11,
        }),
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

  const zoomIn = () => {
    map.getView().setZoom(map.getView().getZoom() + 1);
  };

  const zoomOut = () => {
    map.getView().setZoom(map.getView().getZoom() - 1);
  };

  const panTo = (lon, lat) => {
    map.getView().setCenter(fromLonLat([lon, lat]));
  };

  // Function to add markers and lines when data is loaded
  const loadMarkersAndLines = (data) => {
    const coordinates = data.map((entry) => fromLonLat([entry.lon, entry.lat]));
    const lineFeature = new Feature({
      geometry: new LineString(coordinates),
    });

    // Styling the line between points
    lineFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
      })
    );

    markerRef.current.addFeature(lineFeature);
    allFeaturesRef.current.push(lineFeature); // Store for later

    const extent = markerRef.current.getExtent(); // Get the extent of all markers

    data.forEach((entry, index) => {
      const point = new Feature({
        geometry: new Point(fromLonLat([entry.lon, entry.lat])),
        data: entry,
      });
      var col = "gray";
      console.log(entry.ps);
      if (entry.ps == "EM") { col = "red" }


      else if (entry.s < 1) { col = "blue" }
      else if (entry.ps == "NR") { col = "green" }
      else { col = "gray" }

      // Adding circular marker for each point
      point.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: col }),
          }),
          text: new Text({
            text: (index + 1).toString(),
            scale: 0.2,
            fill: new Fill({ color: col }),
          }),
        })
      );

      markerRef.current.addFeature(point);
      allFeaturesRef.current.push(point); // Store for later
    });

    // Adjust the map to fit all markers after adding them
    map.getView().fit(markerRef.current.getExtent(), {
      padding: [50, 50, 50, 50],
      duration: 1000,
    });

    attachClickToPoints();
    setIsPlaying(false);
    setDownloadStatus("Play");
  };

  // Attach click event to each point feature
  const attachClickToPoints = () => {
    const select = new Select(); // Create a select interaction
    map.addInteraction(select);

    select.on("select", function (event) {
      const selectedFeatures = event.selected;
      selectedFeatures.forEach((feature) => {
        const data = feature.get("data");
        if (data) {
          displayLocationData(feature.get("data"), fromLonLat([data.lon, data.lat]));
        }
      });
    });
  };

  const displayLocationData = (data, coordinates) => {
    if (data) {
      const content = `
        <h4>Location Info</h4>
        <p><strong>Latitude:</strong> ${data.lat}</p>
        <p><strong>Longitude:</strong> ${data.lon}</p>
        <p><strong>Speed:</strong> ${data.s} km/h</p>
        <p><strong>Heading:</strong> ${data.h}</p>
        <p><strong>Date:</strong> ${data.date}</p>
      `;
      console.log(data);
      document.getElementById("overlay-content").innerHTML = content;

      // Set overlay position and make it visible
      featureOverlayRef.current.setPosition(coordinates);
      overlayRef.current.style.display = "block";
    }
  };

  const updateEmergencyPointer = (lon, lat) => {
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
          anchor: [0.5, 1],
          src: "https://skytrack.tech:2000/static/track.png",
          scale: 0.06,
        }),
      })
    );

    markerRef.current.addFeature(marker);
    animationMarkerRef.current = marker; // Store the reference to the animation marker

    setCurrentCoordinates(currentCoordinates);
    map.getView().setCenter(currentCoordinates);
  };

  const handleSliderChange = (event, value) => {
    setSliderValue(value);
    const entry = mapData[value];
    if (entry) {
      updateEmergencyPointer(entry.lon, entry.lat);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    let currentIndex = sliderValue;
    overlayRef.current.style.display = "none";

    animationIntervalId.current = setInterval(() => {
      if (currentIndex < maxSliderValue) {
        currentIndex += 1;
        setSliderValue(currentIndex);
        const entry = mapData[currentIndex];
        if (entry) {
          updateEmergencyPointer(entry.lon, entry.lat);
        }
      } else {
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
      }
    }, animationSpeed);
  };

  const pauseAnimation = () => {
    clearInterval(animationIntervalId.current);
    setIsPlaying(false);
  };

  const restartAnimation = () => {
    setSliderValue(0);
    updateEmergencyPointer(mapData[0]?.lon, mapData[0]?.lat);
  };

  useEffect(() => {
    if (mapData.length > 0 && markerRef.current) {
      loadMarkersAndLines(mapData);
    }
  }, [mapData]);

  return (
    <Box>
      <Typography
        variant="caption"
        style={{ textAlign: "left", verticalAlign: "top", fontSize: "10px" }}
      >
        {downloadStatus}
      </Typography>


      <Box
        id="controls-container"
        sx={{
          mt: 2,
          visibility: mapData.length ? "visible" : "hidden",
          display: "flex",
          alignItems: "left",
          width: "100%",
        }}
      >
        <Slider
          id="time-slider"
          min={0}
          max={maxSliderValue}
          value={sliderValue}
          onChange={handleSliderChange}
          sx={{
            width: "70%", mr: 2,
            alignItems: "left",
          }}
        />
        <Button onClick={isPlaying ? pauseAnimation : playAnimation} sx={{ ml: 2, alignItems: "left", }}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={restartAnimation} sx={{ ml: 2, alignItems: "left", }}>
          Restart
        </Button>
        <Typography variant="body2" sx={{ ml: 2, alignItems: "right", }}>Animation: Fast</Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          min={10}
          max={500}
          step={10}
          sx={{ width: "10%", ml: 2, alignItems: "right", }}
        />
        <Typography sx={{ ml: 2, alignItems: "right", }} variant="body2">Slow-"{animationSpeed} ms" </Typography>

      </Box>






      <Box ref={mapRef} sx={{ width: "100%", height: "600px" }}></Box>
      <Box
        ref={overlayRef}
        className="dynamic-overlay"
        style={{
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          display: "none", // Initially hidden
        }}
      >
        <p id="overlay-content"></p>
      </Box>
    </Box>
  );
};

export default GPSHistoryMap;
