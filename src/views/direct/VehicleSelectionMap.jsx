import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import Cluster from "ol/source/Cluster";
import { fromLonLat } from "ol/proj";
import { Icon, Style, Text, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Overlay from "ol/Overlay";
import "ol/ol.css";

const VehicleSelectionMap = ({
    gpsData,
    width = "100%",
    height = "500px",
    onVehicleSelect,
}) => {
    const mapElement = useRef(null);
    const overlayElement = useRef(null);
    const clickHandlerRef = useRef(null);

    const [map, setMap] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [clusterLayer, setClusterLayer] = useState(null);
    const [dynamicOverlay, setDynamicOverlay] = useState(null);

    // Memoize icon styles to prevent recreation on every render
    const iconStyles = useMemo(() => ({
        red: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/red/bus.png"),
                scale: 0.20,
            }),
        }),
        orange: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/orange/bus.png"),
                scale: 0.20,
            }),
        }),
        blue: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/blue/bus.png"),
                scale: 0.20,
            }),
        }),
        green: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/green/bus.png"),
                scale: 0.20,
            }),
        }),
        grey: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/grey/bus.png"),
                scale: 0.20,
            }),
        }),
        default: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/grey/bus.png"),
                scale: 0.20,
            }),
        }),
    }), []);

    // Calculate time difference in minutes
    const calculateTimeDifference = useCallback((startTime, endTime) => {
        return (endTime - startTime) / (1000 * 60);
    }, []);

    // Get icon style based on data conditions
    const getIconStyle = useCallback((data) => {
        const entryTime = new Date(data.entry_time);
        const currentTime = new Date();
        const timeDifference = calculateTimeDifference(entryTime, currentTime);

        if (data.packet_type === "EA") {
            return iconStyles.red;
        } else if (data.packet_type !== "NR") {
            return iconStyles.orange;
        } else if (String(data.ignition_status) === "1" && data.speed <= 1) {
            return iconStyles.blue;
        } else if (String(data.ignition_status) === "1" && data.speed > 1) {
            return iconStyles.green;
        } else if (timeDifference > 5) {
            return iconStyles.grey;
        } else {
            return iconStyles.default;
        }
    }, [iconStyles, calculateTimeDifference]);

    // Initialize map on mount
    useEffect(() => {
        if (!mapElement.current) return;

        console.log("VehicleSelectionMap: Initializing map with optimized clustering");

        // Define cluster style function inside effect
        const clusterStyleFunction = (feature) => {
            const size = feature.get('features').length;

            if (size > 1) {
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
                const originalFeature = feature.get('features')[0];
                const data = originalFeature.get('entryData');
                return getIconStyle(data);
            }
        };

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: fromLonLat([78.9629, 20.5937]), // Center of India
                zoom: 6, // Increased from 5 for better initial view
            }),
        });

        const initialVectorSource = new VectorSource();
        const clusterSource = new Cluster({
            distance: 60, // Increased from 40 for better clustering (fewer clusters)
            source: initialVectorSource,
        });

        const initialClusterLayer = new VectorLayer({
            source: clusterSource,
            style: clusterStyleFunction,
        });

        initialMap.addLayer(initialClusterLayer);

        const initialOverlay = new Overlay({
            element: overlayElement.current,
        });
        initialMap.addOverlay(initialOverlay);

        console.log("VehicleSelectionMap: Map initialized successfully");

        setMap(initialMap);
        setVectorLayer(initialVectorSource);
        setClusterLayer(initialClusterLayer);
        setDynamicOverlay(initialOverlay);

        return () => {
            initialMap.setTarget(null);
        };
    }, [getIconStyle]);

    // Update markers when GPS data changes
    useEffect(() => {
        console.log("VehicleSelectionMap: GPS data updated", {
            dataLength: gpsData.length,
            hasMap: !!map,
            hasVectorLayer: !!vectorLayer
        });

        if (!map || !vectorLayer || !clusterLayer || gpsData.length === 0) return;

        // Clear previous markers
        vectorLayer.clear();

        // Create features from GPS data
        const features = gpsData.map((entry) => {
            const coordinates = fromLonLat([entry.longitude, entry.latitude]);
            return new Feature({
                geometry: new Point(coordinates),
                entryData: entry,
            });
        });

        console.log("VehicleSelectionMap: Adding features", features.length);

        // Add features to vector layer
        vectorLayer.addFeatures(features);

        // Fit map to show all markers
        const extent = clusterLayer.getSource().getSource().getExtent();
        map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
    }, [gpsData, map, vectorLayer, clusterLayer]);

    // Handle map clicks
    useEffect(() => {
        if (!map || !dynamicOverlay) return;

        // Remove previous click handler if exists
        if (clickHandlerRef.current) {
            map.un('click', clickHandlerRef.current);
        }

        // Create new click handler
        const handleMapClick = (event) => {
            dynamicOverlay.getElement().style.display = "none";

            map.forEachFeatureAtPixel(event.pixel, (clusterFeature) => {
                const features = clusterFeature.get('features');

                if (features.length === 1) {
                    // Single vehicle clicked
                    const feature = features[0];
                    const coordinates = feature.getGeometry().getCoordinates();
                    const entryData = feature.get("entryData");

                    // Set overlay content
                    const overlayContent = document.getElementById("overlay-content");
                    if (overlayContent) {
                        overlayContent.innerHTML =
                            `<strong>${entryData.vehicle_registration_number}</strong><br>` +
                            `<strong>Date:</strong> ${entryData.date}<br>` +
                            `<strong>Time:</strong> ${entryData.time}<br>` +
                            `<strong>Alert:</strong> ${entryData.packet_type}<br>` +
                            `<strong>Speed:</strong> ${entryData.speed > 2 ? entryData.speed : 0} km/h<br>` +
                            `<button id='select-vehicle-btn' style='margin-top: 10px; padding: 5px 10px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;'>Select Vehicle</button>`;
                    }

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

                    // Zoom to vehicle
                    map.getView().animate({
                        center: coordinates,
                        zoom: 14, // Increased from 12 for closer view
                        duration: 500,
                    });
                } else if (features.length > 1) {
                    // Cluster clicked - zoom in faster
                    const coordinates = clusterFeature.getGeometry().getCoordinates();
                    map.getView().animate({
                        center: coordinates,
                        zoom: map.getView().getZoom() + 3, // Increased from +2 for faster zoom
                        duration: 500,
                    });
                }
            });
        };

        // Store reference and add handler
        clickHandlerRef.current = handleMapClick;
        map.on('click', handleMapClick);

        return () => {
            if (clickHandlerRef.current) {
                map.un('click', clickHandlerRef.current);
            }
        };
    }, [map, dynamicOverlay, onVehicleSelect]);

    return (
        <div>
            <div ref={mapElement} style={{ width, height, position: 'relative' }}>
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

                <img
                    src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`}
                    alt="InSpace Logo"
                    style={{ position: 'absolute', bottom: 0, left: 0, height: '60px', width: 'auto', zIndex: 1000 }}
                />
                <img
                    src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`}
                    alt="ISRO Logo"
                    style={{ position: 'absolute', top: 0, right: 0, height: '60px', width: 'auto', zIndex: 1000 }}
                />
                <img
                    src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                    alt="Skytron Logo"
                    style={{ position: 'absolute', bottom: "20px", right: 0, height: '60px', width: 'auto', zIndex: 1000, backgroundColor: 'transparent' }}
                />
            </div>

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

export default React.memo(VehicleSelectionMap);
