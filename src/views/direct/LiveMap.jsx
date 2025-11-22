import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat, getCenter, toLonLat } from "ol/proj";
import { Icon, Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import { Draw } from 'ol/interaction';
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { boundingExtent } from "ol/extent";

const BHUVAN_WMS_URL =
  process.env.REACT_APP_BHUVAN_URL ||
  "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms";

const DEFAULT_BHUVAN_LAYER_NAMES = [
  "basemap:admin_group",
  "india3",
  "mmi:mmi_india",
];

const createBhuvanSource = (layerName) =>
  new TileWMS({
    url: BHUVAN_WMS_URL,
    params: {
      LAYERS: layerName,
      TILED: true,
      VERSION: "1.1.1",
      FORMAT: "image/png",
      TRANSPARENT: "true",
      SRS: "EPSG:4326",
      WIDTH: 256,
      HEIGHT: 256,
    },
    serverType: "geoserver",
    projection: "EPSG:4326",
    transition: 0,
  });

const MapComponent = ({
  gpsData,
  width = "100%",
  height = "400px",
  customBaseLayers = [],
  onPolygonComplete,
}) => {
  const mapElement = useRef();
  const overlayElement = useRef();
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [dynamicOverlay, setDynamicOverlay] = useState(null);
  const [drawVectorLayer, setDrawVectorLayer] = useState(null);
  const [drawInteraction, setDrawInteraction] = useState(null);

  const logoOverlays = useRef([]);

  // Icon styles based on the packet type and conditions
  const iconStyles = {
    red: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/red-skytron-transparent.png`,
        scale: 0.20,
      }),
    }),
    orange: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/orange-skytron-transparent.png`,
        scale: 0.20,
      }),
    }),
    blue: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/blue-skytron-transparent.png`,
        scale: 0.20,
      }),
    }),
    green: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/green-skytron-transparent.png`,
        scale: 0.20,
      }),
    }),
    grey: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/grey-skytron-transparent.png`,
        scale: 0.20,
      }),
    }),
    default: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
        scale: 0.20,
      }),
    }),
  };
  useEffect(() => {
    // Initialize the map on first render
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new TileWMS({
            url: process.env.REACT_APP_BHUVAN_URL,
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

    // Initialize vector layer for markers
    const initialVectorLayer = new VectorLayer({
      source: new VectorSource(),
    });

    // Add vector layer to map
    initialMap.addLayer(initialVectorLayer);

    // Initialize vector layer for drawing
    const drawSource = new VectorSource();
    const drawLayer = new VectorLayer({
      source: drawSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
    });
    initialMap.addLayer(drawLayer);

    //initialMap.addLayer(administrativeLayer);

    // Create dynamic overlay
    const initialOverlay = new Overlay({
      element: overlayElement.current,
    });
    initialMap.addOverlay(initialOverlay);



    // Create overlays for each logo
    /* logos.forEach(logo => {
       const element = document.createElement('img');
       element.src = logo.src;
       element.style.width = '50px'; // Adjust size as necessary
       const logoOverlay = new Overlay({
         element: element,
         position: fromLonLat(logo.coordinates),
         positioning: `${logo.position.includes('top') ? 'top' : 'bottom'}-${logo.position.includes('left') ? 'left' : 'right'}`
       });
       initialMap.addOverlay(logoOverlay);
       logoOverlays.current.push(logoOverlay);
     });
     */

    setMap(initialMap);
    setVectorLayer(initialVectorLayer);
    setDynamicOverlay(initialOverlay);
    setDrawVectorLayer(drawLayer);
  }, []);

  // Helper to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const timeDifferenceMillis = endTime - startTime;
    return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
  };

  // Set the correct icon style based on data conditions
  const getIconStyle = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);
    console.log("timediff", timeDifference);
    console.log("data.packet_type ", data.packet_type);
    console.log("data.ignition_status ", data.ignition_status);
    console.log("data.speed  ", data.speed);

    if (data.packet_type === "EA") {
      return iconStyles.red; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      return iconStyles.orange; // Any Alert Packet except EA - Orange Icon
    } else if (String(data.ignition_status) === "1" && data.speed < 1) {
      return iconStyles.blue; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      return iconStyles.green; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      return iconStyles.grey; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      return iconStyles.default; // Default icon for all other conditions
    }
  };

  useEffect(() => {
    if (map && vectorLayer && gpsData.length > 0) {
      // Clear the previous markers
      vectorLayer.getSource().clear();

      const features = gpsData.map((entry) => {
        const coordinates = fromLonLat([entry.longitude, entry.latitude]);

        // Create the marker feature
        const markerFeature = new Feature({
          geometry: new Point(coordinates),
          entryData: entry, // Store entry data for overlay
        });

        // Set the appropriate style for the marker
        markerFeature.setStyle(getIconStyle(entry));

        return markerFeature;
      });

      // Add all features (markers) to the vector layer
      vectorLayer.getSource().addFeatures(features);

      // Automatically center the map based on the locations of the markers
      const extent = vectorLayer.getSource().getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });

      // Handle map click to display the overlay and zoom to street level
      const clickHandler = function (event) {
        dynamicOverlay.getElement().style.display = "none";

        // Check if a feature is clicked
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
          const coordinates = feature.getGeometry().getCoordinates();
          const entryData = feature.get("entryData");

          if (!entryData) return;

          // Set overlay content
          document.getElementById("overlay-content").innerHTML =
            "<strong>" + entryData.vehicle_registration_number + "</strong> <br>" + ""
            + "<strong>Date:</strong> " + entryData.date + ".<br>" +
            "" + "<strong>Time:</strong> " + entryData.time + ".<br>" +
            "" + "<strong>Allert:</strong> " + entryData.packet_type + ".<br>" +
            "" + "<strong>Speed:</strong> " + (entryData.speed > 2 ? entryData.speed : 0) + "km/h.<br>" +
            "" + "<strong>Battery:</strong> " + entryData.internal_battery_voltage + "-" + entryData.main_input_voltage + ".<br>" +
            "";

          dynamicOverlay.setPosition(coordinates);
          dynamicOverlay.getElement().style.display = "block";

          // Zoom to street level when clicked (zoom level 18)
          map.getView().animate({
            center: coordinates,
            zoom: 18,
            duration: 500, // Animate the zoom for 500ms
          });
        });
      };

      map.on("click", clickHandler);

      return () => {
        map.un("click", clickHandler);
      };
    }
  }, [gpsData, map, vectorLayer, dynamicOverlay]);

  const startDrawing = () => {
    if (!map || !drawVectorLayer) return;

    // Clear previous drawings
    drawVectorLayer.getSource().clear();

    // Remove existing interaction if any
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }

    const draw = new Draw({
      source: drawVectorLayer.getSource(),
      type: 'Polygon',
    });

    draw.on('drawend', (event) => {
      const feature = event.feature;
      const geometry = feature.getGeometry();
      const coordinates = geometry.getCoordinates()[0]; // Outer ring

      // Transform to [Lat, Lon]
      const transformedCoords = coordinates.map(coord => {
        const lonLat = toLonLat(coord);
        return [lonLat[1], lonLat[0]];
      });

      if (onPolygonComplete) {
        onPolygonComplete(transformedCoords);
      }

      // Remove interaction after drawing
      map.removeInteraction(draw);
      setDrawInteraction(null);
    });

    map.addInteraction(draw);
    setDrawInteraction(draw);
  };

  const clearPolygon = () => {
    if (drawVectorLayer) {
      drawVectorLayer.getSource().clear();
    }
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      setDrawInteraction(null);
    }
    if (onPolygonComplete) {
      onPolygonComplete([]);
    }
  };

  return (
    <div>
      {/* Map container */}

      <div ref={mapElement} style={{ width, height, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10px', left: '50px', zIndex: 1000, display: 'flex', gap: '10px' }}>
          <Button variant="contained" size="small" onClick={startDrawing} color={drawInteraction ? "secondary" : "primary"}>
            {drawInteraction ? "Drawing..." : "Draw Polygon"}
          </Button>
          <Button variant="contained" size="small" onClick={clearPolygon} color="error">
            Clear
          </Button>
        </div>
        {/* Position logos using absolute positioning within the map container */}
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />

      </div>

      {/* Overlay for displaying marker details */}
      <div ref={overlayElement} className="dynamic-overlay">
        <p id="overlay-content"> </p>
      </div>

      <style>{`
        .dynamic-overlay {
          position: absolute;
          background-color: white;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: none;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;