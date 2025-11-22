import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import Cluster from "ol/source/Cluster";
import { fromLonLat } from "ol/proj";
import { Icon, Style, Text, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Overlay from "ol/Overlay";
import "ol/ol.css";

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

const VehicleSelectionMap = ({
    gpsData,
    width = "100%",
    height = "500px",
    onVehicleSelect,
    customBaseLayers = [],
}) => {
    const mapElement = useRef();
    const overlayElement = useRef();
    const [map, setMap] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [clusterLayer, setClusterLayer] = useState(null);
    const [dynamicOverlay, setDynamicOverlay] = useState(null);

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

    // Cluster style function
    const clusterStyle = (feature) => {
        const size = feature.get('features').length;

        if (size > 1) {
            // Cluster style
            return new Style({
                image: new CircleStyle({
                    radius: 15 + Math.min(size / 2, 15),
                    stroke: new Stroke({
                        color: '#fff',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: '#3399CC',
                    }),
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff',
                    }),
                    font: 'bold 14px sans-serif',
                }),
            });
        } else {
            // Single vehicle - use the icon style
            const originalFeature = feature.get('features')[0];
            const data = originalFeature.get('entryData');
            return getIconStyle(data);
        }
    };

    useEffect(() => {
        // Initialize the map on first render
        console.log("VehicleSelectionMap: Initializing map");
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                ...[...DEFAULT_BHUVAN_LAYER_NAMES, ...customBaseLayers]
                    .filter(Boolean)
                    .map(
                        (layerName) =>
                            new TileLayer({
                                source: createBhuvanSource(layerName),
                            })
                    ),
            ],

            view: new View({
                center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
                zoom: 5,
            }),

            pixelRatio: 1,
        });

        // Initialize vector source for markers
        const initialVectorSource = new VectorSource();

        // Create cluster source
        const clusterSource = new Cluster({
            distance: 40, // Distance in pixels for clustering
            source: initialVectorSource,
        });

        // Initialize cluster layer
        const initialClusterLayer = new VectorLayer({
            source: clusterSource,
            style: clusterStyle,
        });

        // Add cluster layer to map
        initialMap.addLayer(initialClusterLayer);

        // Create dynamic overlay
        const initialOverlay = new Overlay({
            element: overlayElement.current,
        });
        initialMap.addOverlay(initialOverlay);

        console.log("VehicleSelectionMap: Map initialized successfully");
        setMap(initialMap);
        setVectorLayer(initialVectorSource);
        setClusterLayer(initialClusterLayer);
        setDynamicOverlay(initialOverlay);
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

        if (data.packet_type === "EA") {
            return iconStyles.red; // EA Packet - Red Icon
        } else if (data.packet_type !== "NR") {
            return iconStyles.orange; // Any Alert Packet except EA - Orange Icon
        } else if (String(data.ignition_status) === "1" && data.speed <= 1) {
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
        console.log("VehicleSelectionMap: GPS data updated", {
            dataLength: gpsData.length,
            hasMap: !!map,
            hasVectorLayer: !!vectorLayer
        });

        if (map && vectorLayer && gpsData.length > 0) {
            // Clear the previous markers
            vectorLayer.clear();

            const features = gpsData.map((entry) => {
                const coordinates = fromLonLat([entry.longitude, entry.latitude]);

                // Create the marker feature
                const markerFeature = new Feature({
                    geometry: new Point(coordinates),
                    entryData: entry, // Store entry data for overlay
                });

                return markerFeature;
            });

            console.log("VehicleSelectionMap: Adding features", features.length);

            // Add all features (markers) to the vector layer
            vectorLayer.addFeatures(features);

            // Automatically center the map based on the locations of the markers
            const extent = clusterLayer.getSource().getSource().getExtent();
            map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });

            // Handle map click to display the overlay and select vehicle
            map.on("click", function (event) {
                dynamicOverlay.getElement().style.display = "none";

                // Check if a feature is clicked
                map.forEachFeatureAtPixel(event.pixel, function (clusterFeature) {
                    const features = clusterFeature.get('features');

                    if (features.length === 1) {
                        // Single vehicle clicked
                        const feature = features[0];
                        const coordinates = feature.getGeometry().getCoordinates();
                        const entryData = feature.get("entryData");

                        // Set overlay content
                        document.getElementById("overlay-content").innerHTML =
                            "<strong>" + entryData.vehicle_registration_number + "</strong> <br>" + ""
                            + "<strong>Date:</strong> " + entryData.date + ".<br>" +
                            "" + "<strong>Time:</strong> " + entryData.time + ".<br>" +
                            "" + "<strong>Alert:</strong> " + entryData.packet_type + ".<br>" +
                            "" + "<strong>Speed:</strong> " + (entryData.speed > 2 ? entryData.speed : 0) + "km/h.<br>" +
                            "<button id='select-vehicle-btn' style='margin-top: 10px; padding: 5px 10px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;'>Select Vehicle</button>";

                        dynamicOverlay.setPosition(coordinates);
                        dynamicOverlay.getElement().style.display = "block";

                        // Add click handler for select button
                        setTimeout(() => {
                            const selectBtn = document.getElementById('select-vehicle-btn');
                            if (selectBtn) {
                                selectBtn.onclick = () => {
                                    if (onVehicleSelect) {
                                        onVehicleSelect(entryData.vehicle_registration_number);
                                    }
                                    dynamicOverlay.getElement().style.display = "none";
                                };
                            }
                        }, 0);

                        // Zoom to street level when clicked (zoom level 18)
                        map.getView().animate({
                            center: coordinates,
                            zoom: 12,
                            duration: 500, // Animate the zoom for 500ms
                        });
                    } else if (features.length > 1) {
                        // Cluster clicked - zoom in
                        const extent = clusterFeature.getGeometry().getExtent
                            ? clusterFeature.getGeometry().getExtent()
                            : null;

                        if (extent) {
                            map.getView().fit(extent, {
                                duration: 500,
                                padding: [50, 50, 50, 50],
                                maxZoom: map.getView().getZoom() + 2,
                            });
                        } else {
                            // If no extent, just zoom in at the cluster location
                            const coordinates = clusterFeature.getGeometry().getCoordinates();
                            map.getView().animate({
                                center: coordinates,
                                zoom: map.getView().getZoom() + 2,
                                duration: 500,
                            });
                        }
                    }
                });
            });
        }
    }, [gpsData, map, vectorLayer, clusterLayer, dynamicOverlay, onVehicleSelect]);

    return (
        <div>
            {/* Map container */}
            <div ref={mapElement} style={{ width, height, position: 'relative' }}>
                {/* No data message */}
                {gpsData.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        zIndex: 1002,
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>
                            Loading vehicle data...
                        </p>
                    </div>
                )}

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
          max-height: 300px;
          overflow-y: auto;
          z-index: 1001;
        }
      `}</style>
        </div>
    );
};

export default VehicleSelectionMap;
