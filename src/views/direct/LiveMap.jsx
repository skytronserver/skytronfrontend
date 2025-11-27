
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { Icon, Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";
import { Draw } from 'ol/interaction';
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { boundingExtent } from "ol/extent";
import POIService from "../../services/POIService";

const resolveBhuvanWmsUrl = () => {
  const envUrl = process.env.REACT_APP_BHUVAN_URL;
  if (!envUrl) {
    return "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms";
  }

  const normalizedUrl = envUrl.replace(/\/$/, "");
  if (normalizedUrl.includes("/bhuvan/gwc/service/wms")) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/bhuvan/gwc/service/wms`;
};

const BHUVAN_WMS_URL = resolveBhuvanWmsUrl();

const DEFAULT_BHUVAN_LAYER_NAMES = [
  "basemap:admin_group",
  "india3",
  "mmi:mmi_india",
];

const BHUVAN_CROSS_ORIGIN =
  process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true" ? "anonymous" : undefined;

const createBhuvanSource = (layerName) => {
  const options = {
    url: BHUVAN_WMS_URL,
    params: {
      LAYERS: layerName,
      STYLES: "",
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
  };

  if (BHUVAN_CROSS_ORIGIN) {
    options.crossOrigin = BHUVAN_CROSS_ORIGIN;
  }

  return new TileWMS(options);
};

const MapComponent = ({
  gpsData,
  width = "100%",
  height = "400px",
  customBaseLayers = [],
  onPolygonComplete,
  autoFit = false, // Set to true to auto-fit map to markers, false to keep Guwahati center
  focusEntry = null,
}) => {
  const mapElement = useRef();
  const overlayElement = useRef();
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [dynamicOverlay, setDynamicOverlay] = useState(null);
  const [drawVectorLayer, setDrawVectorLayer] = useState(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [poiVectorLayer, setPoiVectorLayer] = useState(null);
  const [pois, setPois] = useState([]);
  const logoOverlays = useRef([]);

  const USE_TYPE_COLORS = {
    school: '#1E88E5',
    hospital: '#E53935',
    dealership: '#8E24AA',
    dealer: '#8E24AA',
    personal: '#43A047',
    prohibited_area: '#D81B60',
    permitroute: '#FB8C00',
    tollgate: '#6D4C41',
    parking: '#00897B',
    no_parking: '#C62828',
    villageboundary: '#5E35B1',
    cityboundary: '#3949AB',
    districtboundary: '#00838F',
    stateboundary: '#00695C',
    fuelstation: '#FDD835',
    busstop: '#7CB342',
    railwaystation: '#5C6BC0',
    airport: '#039BE5',
    other: '#546E7A',
  };

  const hexToRgba = (hex, alpha) => {
    if (!hex) {
      return `rgba(30, 136, 229, ${alpha})`;
    }

    let normalized = hex.replace('#', '');
    if (normalized.length === 3) {
      normalized = normalized.split('').map((char) => char + char).join('');
    }

    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getUseTypeColor = (poi) => {
    const key = poi?.use_type?.toLowerCase();
    return USE_TYPE_COLORS[key] || '#1E88E5';
  };

  const createIconStyle = (color, vehicleType) => {
    const normalizedVehicleType = vehicleType ? vehicleType.toLowerCase().replace(/\s+/g, '_') : 'bus';

    const availableTypes = ['ambulance', 'bus', 'dumper', 'police', 'school_bus', 'tanker', 'taxi', 'truck'];
    const iconType = availableTypes.includes(normalizedVehicleType) ? normalizedVehicleType : 'bus';
    const iconPath = require(`../../assets/images/${color}/${iconType}.png`);

    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: iconPath,
        scale: 0.10,
      }),
    });
  };

  const getPoiStyles = (poi) => {
    const baseColor = getUseTypeColor(poi);
    const fillColor = hexToRgba(baseColor, 0.18);

    const primaryLabel = poi?.name?.trim();
    const secondaryLabel = poi?.use_type?.trim();
    const fallbackLabel = poi?.description?.trim();
    const displayText = primaryLabel || secondaryLabel || fallbackLabel || `POI ${poi?.id ?? ""}`;

    const createText = (overrides = {}) => new Text({
      text: displayText,
      font: '12px "Roboto", sans-serif',
      fill: new Fill({ color: '#0D47A1' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 }),
      backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.92)' }),
      padding: [2, 4, 2, 4],
      ...overrides,
    });

    switch (poi?.mark_type) {
      case 'Point':
        return [
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: baseColor }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: createText({ offsetY: -20 }),
            zIndex: 1000,
          }),
        ];

      case 'Circle':
        return [
          new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: baseColor, width: 2 }),
            zIndex: 900,
          }),
          new Style({
            text: createText(),
            geometry: (feature) => {
              const geometry = feature.getGeometry();
              if (!geometry || !geometry.getCenter) return null;
              return new Point(geometry.getCenter());
            },
            zIndex: 950,
          }),
        ];

      case 'Polygon':
        return [
          new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: baseColor, width: 2 }),
            zIndex: 900,
          }),
          new Style({
            text: createText(),
            geometry: (feature) => {
              const geometry = feature.getGeometry();
              return geometry && geometry.getInteriorPoint ? geometry.getInteriorPoint() : null;
            },
            zIndex: 950,
          }),
        ];

      case 'Road':
        return [
          new Style({
            stroke: new Stroke({ color: baseColor, width: 3 }),
            zIndex: 900,
          }),
          new Style({
            text: createText(),
            geometry: (feature) => {
              const geometry = feature.getGeometry();
              if (!geometry || !geometry.getCoordinateAt) return null;
              const coordinate = geometry.getCoordinateAt(0.5);
              return coordinate ? new Point(coordinate) : null;
            },
            zIndex: 950,
          }),
        ];

      default:
        return [
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: baseColor }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: createText({ offsetY: -20 }),
            zIndex: 1000,
          }),
        ];
    }
  };

  useEffect(() => {
    // Initialize the map on first render
    // Create the three WMS layers matching POIViewer.jsx configuration exactly
    const india3Layer = new TileLayer({
      source: createBhuvanSource('india3'),
      zIndex: 1,
    });

    const adminGroupLayer = new TileLayer({
      source: createBhuvanSource('basemap%3Aadmin_group'),
      zIndex: 2,
    });

    const roadsLayer = new TileLayer({
      source: createBhuvanSource('mmi:mmi_india'),
      zIndex: 3,
    });

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        india3Layer,
        adminGroupLayer,
        roadsLayer,
      ],


      view: new View({
        projection: "EPSG:4326",
        center: [91.7362, 26.1445], // Guwahati, Assam (same as SuperAdminDashboard)
        zoom: 10,
        maxZoom: 19,
        constrainResolution: true,
      }),

      pixelRatio: 1,
    });

    // Initialize vector layer for markers
    const initialVectorLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 200, // Ensure vehicle markers are on top
    });

    // Add vector layer to map
    initialMap.addLayer(initialVectorLayer);

    // Initialize POI vector layer
    const poiSource = new VectorSource();
    const initialPoiVectorLayer = new VectorLayer({
      source: poiSource,
      zIndex: 100, // POI layer below vehicle markers
      declutter: true,
    });
    initialMap.addLayer(initialPoiVectorLayer);
    setPoiVectorLayer(initialPoiVectorLayer);

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

  // Fetch POIs on component mount
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const response = await POIService.getAllPOIs();
        if (response && response.data) {
          setPois(response.data);
        }
      } catch (error) {
        console.error('Error fetching POIs:', error);
      }
    };

    fetchPOIs();
  }, []);

  // Update POI markers when POIs change
  useEffect(() => {
    if (!poiVectorLayer || pois.length === 0) return;

    const poiSource = poiVectorLayer.getSource();
    poiSource.clear();

    pois.forEach((poi) => {
      try {
        const location = JSON.parse(poi.location);
        if (Array.isArray(location) && location.length > 0) {
          let feature;

          switch (poi.mark_type) {
            case 'Point':
              if (location[0] && location[0].length === 2) {
                const [lat, lon] = location[0];
                const longitude = Number(lon);
                const latitude = Number(lat);
                if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                  const coordinates = [longitude, latitude];
                  feature = new Feature({
                    geometry: new Point(coordinates),
                    data: poi,
                  });
                }
              }
              break;

            case 'Circle':
              if (location[0] && location[0].length === 2) {
                const [lat, lon] = location[0];
                const longitude = Number(lon);
                const latitude = Number(lat);
                if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                  const center = [longitude, latitude];
                  const radiusMeters = parseFloat(poi.radius) || 100;
                  const metersPerDegree = 111320 * Math.cos((latitude * Math.PI) / 180) || 111320;
                  const radiusDegrees = radiusMeters / metersPerDegree;
                  feature = new Feature({
                    geometry: new Circle(center, radiusDegrees),
                    data: poi,
                  });
                }
              }
              break;

            case 'Polygon':
              if (location.length >= 3) {
                const polygonCoords = location.map(coord => {
                  if (coord && coord.length === 2) {
                    const [lat, lon] = coord;
                    const longitude = Number(lon);
                    const latitude = Number(lat);
                    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                      return [longitude, latitude];
                    }
                  }
                  return null;
                }).filter(coord => coord !== null);

                if (polygonCoords.length >= 3) {
                  feature = new Feature({
                    geometry: new Polygon([polygonCoords]),
                    data: poi,
                  });
                }
              }
              break;

            case 'Road':
              if (location.length >= 2) {
                const roadCoords = location.map(coord => {
                  if (coord && coord.length === 2) {
                    const [lat, lon] = coord;
                    const longitude = Number(lon);
                    const latitude = Number(lat);
                    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                      return [longitude, latitude];
                    }
                  }
                  return null;
                }).filter(coord => coord !== null);

                if (roadCoords.length >= 2) {
                  feature = new Feature({
                    geometry: new LineString(roadCoords),
                    data: poi,
                  });
                }
              }
              break;
          }

          if (feature) {
            const styles = getPoiStyles(poi);
            feature.setStyle(styles);
            poiSource.addFeature(feature);
          }
        }
      } catch (error) {
        console.error('Error processing POI:', poi.id, error);
      }
    });
  }, [pois, poiVectorLayer]);

  // Helper to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const timeDifferenceMillis = endTime - startTime;
    return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
  };

  // Set the correct icon style based on data conditions and vehicle type
  const getIconStyle = (data, vehicleType) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);

    let color;

    if (data.packet_type === "EA") {
      color = 'red'; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      color = 'orange'; // Any Alert Packet except EA - Orange Icon
    } else if (String(data.ignition_status) === "1" && data.speed < 1) {
      color = 'blue'; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      color = 'green'; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      color = 'grey'; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      color = 'default'; // Default color
    }

    return createIconStyle(color, vehicleType);
  };

  useEffect(() => {
    if (map && vectorLayer && gpsData.length > 0) {
      // Clear the previous markers
      vectorLayer.getSource().clear();

      const features = gpsData
        .map((entry) => {
          const longitude = Number(entry.longitude);
          const latitude = Number(entry.latitude);

          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return null;
          }

          // Get vehicle type from entry data
          const vehicleType = entry?.device_tag_info?.category_info?.category;
          console.log("entry bus", entry.vehicle_registration_number, "vehicleType:", vehicleType);

          // Create the marker feature
          const markerFeature = new Feature({
            geometry: new Point([longitude, latitude]),
            entryData: entry, // Store entry data for overlay
            vehicleType: vehicleType, // Store vehicle type on the feature
          });

          // Set the appropriate style for the marker with vehicle type
          markerFeature.setStyle(getIconStyle(entry, vehicleType));

          return markerFeature;
        })
        .filter(Boolean);

      // Add all features (markers) to the vector layer
      vectorLayer.getSource().addFeatures(features);

      // Only auto-fit if autoFit prop is true and there are markers
      if (autoFit && features.length > 0) {
        const extent = vectorLayer.getSource().getExtent();
        map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      }

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

  useEffect(() => {
    if (!map || !focusEntry) return;

    const longitude = Number(focusEntry.longitude);
    const latitude = Number(focusEntry.latitude);

    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
      map.getView().animate({ center: [longitude, latitude], zoom: 16, duration: 500 });
    }
  }, [focusEntry, map]);

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
        const [longitude, latitude] = coord;
        return [latitude, longitude];
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
