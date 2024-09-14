import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Slider } from "@mui/material";
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
import axios from "axios";

const GPSHistoryMap = ({ startDateTime, endDateTime, vehicleRegistrationNumber }) => {
  const [map, setMap] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(0);
  const [streetLevelZoom, setStreetLevelZoom] = useState(false); // For zoom control
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const markerRef = useRef(null);
  const animationIntervalId = useRef(null);
  const featureOverlayRef = useRef(null);

  const STREET_ZOOM_LEVEL = 18;

  // Fetch map data from the API
  const fetchMapData = async () => {
    try {
      const response = await axios.get("https://skytrack.tech:2000/api/gps_history_map_data/", {
        params: {
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          vehicle_registration_number: vehicleRegistrationNumber,
        },
      });

      const data = response.data.data;
      setMapData(data);
      setMaxSliderValue(data.length - 1);
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
          duration: 250,
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

    data.forEach((entry, index) => {
      const point = new Feature({
        geometry: new Point(fromLonLat([entry.lon, entry.lat])),
        data: entry,
      });

      // Adding circular marker for each point
      point.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "red" }),
          }),
          text: new Text({
            text: (index + 1).toString(),
            scale: 1.2,
            fill: new Fill({ color: "#fff" }),
          }),
        })
      );

      markerRef.current.addFeature(point);

      // Add click interaction for zoom and data display
      map.on("click", function (event) {
        const clickedFeatures = map.getFeaturesAtPixel(event.pixel);
        clickedFeatures.forEach((clickedFeature) => {
          if (clickedFeature === point) {
            handleMarkerClick(point, fromLonLat([entry.lon, entry.lat]));
          }
        });
      });
    });
  };

  const handleMarkerClick = (feature, coordinates) => {
    const currentZoom = map.getView().getZoom();

    if (currentZoom < STREET_ZOOM_LEVEL) {
      // First click: Zoom in to street level
      map.getView().animate({
        zoom: STREET_ZOOM_LEVEL,
        center: coordinates,
        duration: 500,
      });
      setStreetLevelZoom(true);
    } else if (currentZoom >= STREET_ZOOM_LEVEL && streetLevelZoom) {
      // Second click: Show overlay with data
      displayLocationData(feature.get("data"), coordinates);
      setStreetLevelZoom(false);
    }
  };

  const displayLocationData = (data, coordinates) => {
    const content = `
      <h4>Location Info</h4>
      <p><strong>Latitude:</strong> ${data.lat}</p>
      <p><strong>Longitude:</strong> ${data.lon}</p>
      <p><strong>Speed:</strong> ${data.s} km/h</p>
      <p><strong>Heading:</strong> ${data.h}</p>
      <p><strong>Date:</strong> ${data.date}</p>
    `;
    document.getElementById("overlay-content").innerHTML = content;
    featureOverlayRef.current.setPosition(coordinates);
  };

  const updateEmergencyPointer = (lon, lat) => {
    const currentCoordinates = fromLonLat([lon, lat]);

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

    markerRef.current.clear();
    markerRef.current.addFeature(marker);

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
    }, 1000);
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
      loadMarkersAndLines(mapData); // Load markers and lines when data is available
    }
  }, [mapData]);

  return (
    <Box>
      <Box ref={mapRef} sx={{ width: "100%", height: "600px" }}></Box>
      <Box ref={overlayRef} className="dynamic-overlay" style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", display: "none" }}>
        <p id="overlay-content"></p>
      </Box>
      <Box
        id="controls-container"
        sx={{ mt: 2, visibility: mapData.length ? "visible" : "hidden", display: "flex", alignItems: "center" }}
      >
        <Slider
          id="time-slider"
          min={0}
          max={maxSliderValue}
          value={sliderValue}
          onChange={handleSliderChange}
          sx={{ width: "80%", mr: 2 }}
        />
        <Button onClick={isPlaying ? pauseAnimation : playAnimation}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={restartAnimation} sx={{ ml: 2 }}>
          Restart
        </Button>
      </Box>
    </Box>
  );
};

export default GPSHistoryMap;
