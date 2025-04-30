import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat, getCenter } from "ol/proj";
import { Icon, Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { boundingExtent } from "ol/extent";
import POIService from '../../services/POIService';

const MapComponent = ({ gpsData, width = "100%", height = "400px" }) => {
  const mapElement = useRef();
  const overlayElement = useRef();
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [dynamicOverlay, setDynamicOverlay] = useState(null);
  const [pois, setPois] = useState([]);
  const [poiLayer, setPoiLayer] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    osm: true,
    indiaBase: true,
    indiaRoads: true,
    markers: true,
    pois: true
  });

  const logoOverlays = useRef([]);
  const layersRef = useRef({
    osm: null,
    indiaBase: null,
    indiaRoads: null,
    markers: null,
    pois: null
  });

  // Icon styles based on the packet type and conditions
  const iconStyles = {
    red: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/red-skytron-transparent.png`,
        scale: 0.06,
      }),
    }),
    orange: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/orange-skytron-transparent.png`,
        scale: 0.06,
      }),
    }),
    blue: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/blue-skytron-transparent.png`,
        scale: 0.06,
      }),
    }),
    green: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/green-skytron-transparent.png`,
        scale: 0.06,
      }),
    }),
    grey: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/logo/grey-skytron-transparent.png`,
        scale: 0.06,
      }),
    }),
    default: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
        scale: 0.06,
      }),
    }),
  };

  // POI marker styles
  const poiStyles = {
    Point: new Style({
      image: new Icon({
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="%231976D2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
        anchor: [0.5, 1],
        scale: 1.2,
      }),
      zIndex: 1000,
    }),
    Circle: new Style({
      fill: new Fill({
        color: 'rgba(66, 165, 245, 0.2)',
      }),
      stroke: new Stroke({
        color: '#42A5F5',
        width: 2,
      }),
      zIndex: 900,
    }),
    Polygon: new Style({
      fill: new Fill({
        color: 'rgba(76, 175, 80, 0.2)',
      }),
      stroke: new Stroke({
        color: '#4CAF50',
        width: 2,
      }),
      zIndex: 900,
    }),
    Road: new Style({
      stroke: new Stroke({
        color: '#FF9800',
        width: 3,
      }),
      zIndex: 900,
    }),
  };

  // Fetch POIs
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

  useEffect(() => {
    // Initialize the map on first render
    const initialMap = new Map({
      target: mapElement.current,
      layers: [],
      view: new View({
        center: fromLonLat([91.829437, 26.131644]),
        zoom: 7,
      }),
      pixelRatio: 1,
    });

    // Create and store all layers
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: activeLayers.osm
    });

    const indiaBaseLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
        params: {
          'LAYERS': 'basemap:admin_group',
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
        projection: 'EPSG:4326'
      }),
      visible: activeLayers.indiaBase
    });

    const indiaRoadsLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
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
        projection: 'EPSG:4326'
      }),
      visible: activeLayers.indiaRoads
    });

    const markersLayer = new VectorLayer({
      source: new VectorSource(),
      visible: activeLayers.markers
    });

    const poiVectorLayer = new VectorLayer({
      source: new VectorSource(),
      visible: activeLayers.pois
    });

    // Store layer references
    layersRef.current = {
      osm: osmLayer,
      indiaBase: indiaBaseLayer,
      indiaRoads: indiaRoadsLayer,
      markers: markersLayer,
      pois: poiVectorLayer
    };

    // Add layers to map
    initialMap.addLayer(osmLayer);
    initialMap.addLayer(indiaBaseLayer);
    initialMap.addLayer(indiaRoadsLayer);
    initialMap.addLayer(markersLayer);
    initialMap.addLayer(poiVectorLayer);

    // Initialize vector layer for markers
    const initialVectorLayer = markersLayer;

    // Create dynamic overlay
    const initialOverlay = new Overlay({
      element: overlayElement.current,
    });
    initialMap.addOverlay(initialOverlay);

    setMap(initialMap);
    setVectorLayer(initialVectorLayer);
    setPoiLayer(poiVectorLayer);
    setDynamicOverlay(initialOverlay);
  }, []);

  // Update POIs on the map
  useEffect(() => {
    if (map && poiLayer && pois.length > 0) {
      const source = poiLayer.getSource();
      source.clear();

      pois.forEach((poi) => {
        try {
          const location = JSON.parse(poi.location);
          if (Array.isArray(location) && location.length > 0) {
            let feature;
            let style = poiStyles[poi.mark_type];

            switch (poi.mark_type) {
              case 'Point':
                if (location[0] && location[0].length === 2) {
                  const [lat, lon] = location[0];
                  const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);
                  feature = new Feature({
                    geometry: new Point(coordinates),
                    data: poi,
                  });
                }
                break;

              case 'Circle':
                if (location[0] && location[0].length === 2) {
                  const [lat, lon] = location[0];
                  const center = fromLonLat([parseFloat(lon), parseFloat(lat)]);
                  const radius = parseFloat(poi.radius) || 100;
                  feature = new Feature({
                    geometry: new Circle(center, radius),
                    data: poi,
                  });
                }
                break;

              case 'Polygon':
                if (location.length >= 3) {
                  const polygonCoords = location.map(coord => {
                    if (coord && coord.length === 2) {
                      const [lat, lon] = coord;
                      return fromLonLat([parseFloat(lon), parseFloat(lat)]);
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
                      return fromLonLat([parseFloat(lon), parseFloat(lat)]);
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
              feature.setStyle(style);
              source.addFeature(feature);
            }
          }
        } catch (error) {
          console.error('Error processing POI:', poi.id, error);
        }
      });
    }
  }, [pois, map, poiLayer]);

  // Function to toggle layer visibility
  const toggleLayer = (layerName) => {
    if (layersRef.current[layerName]) {
      const newVisibility = !layersRef.current[layerName].getVisible();
      layersRef.current[layerName].setVisible(newVisibility);
      setActiveLayers(prev => ({
        ...prev,
        [layerName]: newVisibility
      }));
    }
  };

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
      map.on("click", function (event) {
        dynamicOverlay.getElement().style.display = "none";

        // Check if a feature is clicked
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
          const coordinates = feature.getGeometry().getCoordinates();
          const entryData = feature.get("entryData");


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
      });
    }
  }, [gpsData, map, vectorLayer, dynamicOverlay]);

  return (
    <div>
      {/* Map container */}
      <div ref={mapElement} style={{ width, height, position: 'relative' }}>
        {/* Position logos using absolute positioning within the map container */}
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />

        {/* Layer Control Panel - Positioned under ISRO logo */}
        <div style={{
          position: 'absolute',
          top: '80px', // Position below ISRO logo (70px height + 10px gap)
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '200px',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0',
            color: '#333',
            fontSize: '16px',
            fontWeight: '600'
          }}>Map Layers</h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            fontSize: '14px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="checkbox"
                checked={activeLayers.osm}
                onChange={() => toggleLayer('osm')}
                style={{ cursor: 'pointer' }}
              />
              OpenStreetMap
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="checkbox"
                checked={activeLayers.indiaBase}
                onChange={() => toggleLayer('indiaBase')}
                style={{ cursor: 'pointer' }}
              />
              India Base Map
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="checkbox"
                checked={activeLayers.indiaRoads}
                onChange={() => toggleLayer('indiaRoads')}
                style={{ cursor: 'pointer' }}
              />
              India Roads
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="checkbox"
                checked={activeLayers.markers}
                onChange={() => toggleLayer('markers')}
                style={{ cursor: 'pointer' }}
              />
              Vehicle Markers
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="checkbox"
                checked={activeLayers.pois}
                onChange={() => toggleLayer('pois')}
                style={{ cursor: 'pointer' }}
              />
              POIs
            </label>
          </div>
        </div>
      </div>

      {/* Overlay for displaying marker details */}
      <div ref={overlayElement} className="dynamic-overlay">
        <p id="overlay-content"> </p>
      </div>

      <style jsx>{`
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
