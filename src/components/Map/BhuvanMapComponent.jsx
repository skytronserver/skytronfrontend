import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Tooltip, Box } from "@mui/material";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, TileWMS, XYZ } from "ol/source";
import {
    Icon,
    Style,
    Fill,
    Stroke,
    Circle as CircleStyle,
    Text,
} from "ol/style";
import { Draw } from "ol/interaction";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import "ol/ol.css";

/**
 * Reusable Bhuvan Map Component with OpenLayers
 * Supports Normal (Bhuvan) and Satellite (OSM) base layers
 * 
 * @param {Object} props
 * @param {Array} props.gpsData - Array of GPS data points to display as markers
 * @param {Array} props.policeData - Array of police data points (optional)
 * @param {Array} props.pois - Array of Points of Interest to display (optional)
 * @param {string} props.width - Map width (default: "100%")
 * @param {string} props.height - Map height (default: "400px")
 * @param {Function} props.onPolygonComplete - Callback when polygon drawing is complete
 * @param {Function} props.onMarkerClick - Callback when a marker is clicked (receives entryData)
 * @param {boolean} props.autoFit - Auto-fit map to markers (default: false)
 * @param {Object} props.focusEntry - Entry to focus/center on the map
 * @param {string} props.markerLabelMode - Label mode: "vehicle", "block", "route" (default: "vehicle")
 * @param {boolean} props.showMapTypeToggle - Show map type toggle buttons (default: true)
 * @param {boolean} props.showDrawControls - Show polygon drawing controls (default: true)
 * @param {boolean} props.showLogos - Show ISRO/Skytron logos (default: true)
 * @param {string} props.defaultMapType - Default map type: "normal" or "satellite" (default: "normal")
 * @param {Array} props.center - Initial map center [lng, lat] (default: Guwahati)
 * @param {number} props.zoom - Initial zoom level (default: 10)
 */
const BhuvanMapComponent = ({
    gpsData = [],
    policeData = [],
    pois = [],
    width = "100%",
    height = "400px",
    onPolygonComplete,
    onMarkerClick,
    autoFit = false,
    focusEntry = null,
    markerLabelMode = "vehicle",
    showMapTypeToggle = true,
    showDrawControls = true,
    showLogos = true,
    defaultMapType = "normal",
    center = [91.7362, 26.1445], // Guwahati, Assam
    zoom = 10,
}) => {
    const overlayElement = useRef();
    const [map, setMap] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [dynamicOverlay, setDynamicOverlay] = useState(null);
    const [drawVectorLayer, setDrawVectorLayer] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [poiVectorLayer, setPoiVectorLayer] = useState(null);

    // Map type state: 'normal' or 'satellite'
    const [mapType, setMapType] = useState(defaultMapType);
    const normalMapRef = useRef(null);
    const satelliteMapRef = useRef(null);
    const normalMapContainerRef = useRef(null);
    const satelliteMapContainerRef = useRef(null);

    // Bhuvan WMS Configuration
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

    // POI Styling
    const USE_TYPE_COLORS = {
        school: "#1E88E5",
        hospital: "#E53935",
        dealership: "#8E24AA",
        dealer: "#8E24AA",
        personal: "#43A047",
        prohibited_area: "#D81B60",
        permitroute: "#FB8C00",
        tollgate: "#6D4C41",
        parking: "#00897B",
        no_parking: "#C62828",
        villageboundary: "#5E35B1",
        cityboundary: "#3949AB",
        districtboundary: "#00838F",
        stateboundary: "#00695C",
        fuelstation: "#FDD835",
        busstop: "#7CB342",
        railwaystation: "#5C6BC0",
        airport: "#039BE5",
        // Police station POIs (use_type "PoliceStation" -> key "policestation")
        policestation: "#1565C0",
        police: "#1565C0",
        other: "#546E7A",
    };

    const hexToRgba = (hex, alpha) => {
        if (!hex) {
            return `rgba(30, 136, 229, ${alpha})`;
        }

        let normalized = hex.replace("#", "");
        if (normalized.length === 3) {
            normalized = normalized
                .split("")
                .map((char) => char + char)
                .join("");
        }

        const bigint = parseInt(normalized, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const getUseTypeColor = (poi) => {
        const key = poi?.use_type?.toLowerCase();
        return USE_TYPE_COLORS[key] || "#1E88E5";
    };

    const getPoiStyles = (poi) => {
        const baseColor = getUseTypeColor(poi);
        const fillColor = hexToRgba(baseColor, 0.18);

        const primaryLabel = poi?.name?.trim();
        const secondaryLabel = poi?.use_type?.trim();
        const fallbackLabel = poi?.description?.trim();
        const displayText =
            primaryLabel || secondaryLabel || fallbackLabel || `POI ${poi?.id ?? ""}`;

        const createText = (overrides = {}) =>
            new Text({
                text: displayText,
                font: '12px "Roboto", sans-serif',
                fill: new Fill({ color: "#0D47A1" }),
                stroke: new Stroke({ color: "#ffffff", width: 3 }),
                backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.92)" }),
                padding: [2, 4, 2, 4],
                ...overrides,
            });

        switch (poi?.mark_type) {
            case "Point":
                return [
                    new Style({
                        image: new CircleStyle({
                            radius: 7,
                            fill: new Fill({ color: baseColor }),
                            stroke: new Stroke({ color: "#ffffff", width: 2 }),
                        }),
                        text: createText({ offsetY: -20 }),
                        zIndex: 1000,
                    }),
                ];

            case "Circle":
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

            case "Polygon":
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
                            return geometry && geometry.getInteriorPoint
                                ? geometry.getInteriorPoint()
                                : null;
                        },
                        zIndex: 950,
                    }),
                ];

            case "Road":
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
                            stroke: new Stroke({ color: "#ffffff", width: 2 }),
                        }),
                        text: createText({ offsetY: -20 }),
                        zIndex: 1000,
                    }),
                ];
        }
    };

    // Vehicle Icon Styling
    const createIconStyle = (color, vehicleType, labelText) => {
        const normalizedVehicleType = vehicleType
            ? vehicleType.toLowerCase().replace(/\s+/g, "_")
            : "bus";

        const availableTypes = [
            "ambulance",
            "bus",
            "dumper",
            "police",
            "school_bus",
            "tanker",
            "taxi",
            "truck",
        ];
        const iconType = availableTypes.includes(normalizedVehicleType)
            ? normalizedVehicleType
            : "bus";
        const iconPath = require(`../../assets/images/${color}/${iconType}.png`);

        const scaleByColor = {
            blue: 0.055,
            green: 0.065,
            red: 0.065,
            orange: 0.065,
            grey: 0.065,
            default: 0.065,
        };

        const iconScale = scaleByColor[color] || scaleByColor.default;

        return new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: iconPath,
                scale: iconScale,
            }),
            text: labelText
                ? new Text({
                    text: labelText,
                    font: '12px "Roboto", sans-serif',
                    fill: new Fill({ color: "#0D47A1" }),
                    stroke: new Stroke({ color: "#ffffff", width: 3 }),
                    backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.92)" }),
                    padding: [2, 4, 2, 4],
                    offsetY: -25,
                })
                : undefined,
        });
    };

    const getMarkerLabel = (entry, mode) => {
        if (!entry) return "";

        switch (mode) {
            case "block": {
                return (
                    entry.block_name ||
                    entry.block ||
                    entry.blockName ||
                    entry.area_name ||
                    entry.area ||
                    entry.device_tag_info?.block?.name ||
                    entry.device_tag_info?.block_name ||
                    entry.device_tag_info?.device?.block_name ||
                    entry.device_tag_info?.device?.district ||
                    entry.district ||
                    ""
                );
            }
            case "route": {
                return (
                    entry.route_name ||
                    entry.route ||
                    entry.route_id ||
                    entry.route_info ||
                    entry.routeInformation ||
                    entry.route_ref?.name ||
                    (entry.route_ref?.id ? `Route ${entry.route_ref.id}` : "")
                );
            }
            case "vehicle":
            default: {
                return (
                    entry.vehicle_registration_number ||
                    entry.vehicle_reg_no ||
                    entry.device_tag_info?.device?.vehicle_reg_no ||
                    entry.device_tag_info?.vehicle?.vehicle_reg_no ||
                    entry.imei ||
                    ""
                );
            }
        }
    };

    // Helper to calculate time difference in minutes
    const calculateTimeDifference = (startTime, endTime) => {
        const timeDifferenceMillis = endTime - startTime;
        return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
    };

    // Set the correct icon style based on data conditions and vehicle type
    const getIconStyle = (data, vehicleType, labelMode) => {
        const entryTime = new Date(data.entry_time);
        const currentTime = new Date();
        const timeDifference = calculateTimeDifference(entryTime, currentTime);

        const isPoliceMarker = data.markerCategory === "police";
        let color;

        if (isPoliceMarker) {
            color = "blue";
        } else if (data.packet_type === "EA") {
            color = "red"; // EA Packet - Red Icon
        } else if (data.packet_type !== "NR") {
            color = "orange"; // Any Alert Packet except EA - Orange Icon
        } else if (String(data.ignition_status) === "1" && data.speed < 1) {
            color = "blue"; // Ignition ON but stationary - Blue Icon
        } else if (String(data.ignition_status) === "1" && data.speed > 1) {
            color = "green"; // Ignition ON and moving - Green Icon
        } else if (timeDifference > 5) {
            color = "grey"; // Offline device (no packets from device for 5+ minutes) - Grey Icon
        } else {
            color = "default"; // Default color
        }

        const iconVehicleType = isPoliceMarker ? "police" : vehicleType;
        // Do not show any text label below/around the marker icon
        return createIconStyle(color, iconVehicleType, "");
    };

    // Initialize Normal Map (Bhuvan Layers)
    useEffect(() => {
        if (mapType !== "normal" || !normalMapContainerRef.current) return;

        // Create the three WMS layers
        const india3Layer = new TileLayer({
            source: createBhuvanSource("india3"),
            zIndex: 1,
        });

        const adminGroupLayer = new TileLayer({
            source: createBhuvanSource("basemap%3Aadmin_group"),
            zIndex: 2,
        });

        const roadsLayer = new TileLayer({
            source: createBhuvanSource("mmi:mmi_india"),
            zIndex: 3,
        });

        const initialMap = new Map({
            target: normalMapContainerRef.current,
            layers: [india3Layer, adminGroupLayer, roadsLayer],

            view: new View({
                projection: "EPSG:4326",
                center: center,
                zoom: zoom,
                maxZoom: 19,
                constrainResolution: true,
            }),

            pixelRatio: 1,
        });

        // Initialize vector layer for markers
        const initialVectorLayer = new VectorLayer({
            source: new VectorSource(),
            zIndex: 200,
        });
        initialMap.addLayer(initialVectorLayer);

        // Initialize POI vector layer
        const poiSource = new VectorSource();
        const initialPoiVectorLayer = new VectorLayer({
            source: poiSource,
            zIndex: 100,
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
                    color: "rgba(255, 255, 255, 0.2)",
                }),
                stroke: new Stroke({
                    color: "#ffcc33",
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: "#ffcc33",
                    }),
                }),
            }),
        });
        initialMap.addLayer(drawLayer);

        // Create dynamic overlay
        const initialOverlay = new Overlay({
            element: overlayElement.current,
        });
        initialMap.addOverlay(initialOverlay);

        setMap(initialMap);
        setVectorLayer(initialVectorLayer);
        setDynamicOverlay(initialOverlay);
        setDrawVectorLayer(drawLayer);
        normalMapRef.current = initialMap;

        return () => {
            if (normalMapRef.current) {
                normalMapRef.current.setTarget(null);
                normalMapRef.current = null;
            }
        };
    }, [mapType]);

    // Initialize Satellite Map (OpenLayers)
    useEffect(() => {
        if (mapType !== "satellite" || !satelliteMapContainerRef.current) return;

        try {
            // OSM Satellite layer
            const osmLayer = new TileLayer({
                title: "OSM Satellite",
                source: new XYZ({
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attributions: "© Esri",
                    maxZoom: 18,
                }),
                zIndex: 0,
            });

            const satelliteMap = new Map({
                target: satelliteMapContainerRef.current,
                layers: [osmLayer],
                view: new View({
                    projection: "EPSG:4326",
                    center: center,
                    zoom: zoom,
                    maxZoom: 19,
                    constrainResolution: true,
                }),
                pixelRatio: 1,
            });

            // Initialize vector layer for markers
            const initialVectorLayer = new VectorLayer({
                source: new VectorSource(),
                zIndex: 200,
            });
            satelliteMap.addLayer(initialVectorLayer);

            // Initialize POI vector layer
            const poiSource = new VectorSource();
            const initialPoiVectorLayer = new VectorLayer({
                source: poiSource,
                zIndex: 100,
                declutter: true,
            });
            satelliteMap.addLayer(initialPoiVectorLayer);
            setPoiVectorLayer(initialPoiVectorLayer);

            // Initialize vector layer for drawing
            const drawSource = new VectorSource();
            const drawLayer = new VectorLayer({
                source: drawSource,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(255, 255, 255, 0.2)",
                    }),
                    stroke: new Stroke({
                        color: "#ffcc33",
                        width: 2,
                    }),
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
                            color: "#ffcc33",
                        }),
                    }),
                }),
            });
            satelliteMap.addLayer(drawLayer);

            // Create dynamic overlay
            const initialOverlay = new Overlay({
                element: overlayElement.current,
            });
            satelliteMap.addOverlay(initialOverlay);

            setMap(satelliteMap);
            setVectorLayer(initialVectorLayer);
            setDynamicOverlay(initialOverlay);
            setDrawVectorLayer(drawLayer);
            satelliteMapRef.current = satelliteMap;
        } catch (error) {
            console.error("Error initializing satellite map:", error);
        }

        return () => {
            if (satelliteMapRef.current) {
                satelliteMapRef.current.setTarget(null);
                satelliteMapRef.current = null;
            }
        };
    }, [mapType]);

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
                        case "Point":
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

                        case "Circle":
                            if (location[0] && location[0].length === 2) {
                                const [lat, lon] = location[0];
                                const longitude = Number(lon);
                                const latitude = Number(lat);
                                if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                                    const center = [longitude, latitude];
                                    const radiusMeters = parseFloat(poi.radius) || 100;
                                    const metersPerDegree =
                                        111320 * Math.cos((latitude * Math.PI) / 180) || 111320;
                                    const radiusDegrees = radiusMeters / metersPerDegree;
                                    feature = new Feature({
                                        geometry: new Circle(center, radiusDegrees),
                                        data: poi,
                                    });
                                }
                            }
                            break;

                        case "Polygon":
                            if (location.length >= 3) {
                                const polygonCoords = location
                                    .map((coord) => {
                                        if (coord && coord.length === 2) {
                                            const [lat, lon] = coord;
                                            const longitude = Number(lon);
                                            const latitude = Number(lat);
                                            if (
                                                Number.isFinite(longitude) &&
                                                Number.isFinite(latitude)
                                            ) {
                                                return [longitude, latitude];
                                            }
                                        }
                                        return null;
                                    })
                                    .filter((coord) => coord !== null);

                                if (polygonCoords.length >= 3) {
                                    feature = new Feature({
                                        geometry: new Polygon([polygonCoords]),
                                        data: poi,
                                    });
                                }
                            }
                            break;

                        case "Road":
                            if (location.length >= 2) {
                                const roadCoords = location
                                    .map((coord) => {
                                        if (coord && coord.length === 2) {
                                            const [lat, lon] = coord;
                                            const longitude = Number(lon);
                                            const latitude = Number(lat);
                                            if (
                                                Number.isFinite(longitude) &&
                                                Number.isFinite(latitude)
                                            ) {
                                                return [longitude, latitude];
                                            }
                                        }
                                        return null;
                                    })
                                    .filter((coord) => coord !== null);

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
                console.error("Error processing POI:", poi.id, error);
            }
        });
    }, [pois, poiVectorLayer]);

    // Update GPS markers
    useEffect(() => {
        if (!map || !vectorLayer) {
            return;
        }

        const allMarkers = [...gpsData, ...policeData];

        if (allMarkers.length > 0) {
            // Clear the previous markers
            vectorLayer.getSource().clear();

            const features = allMarkers
                .map((entry) => {
                    const longitude = Number(entry.longitude);
                    const latitude = Number(entry.latitude);

                    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
                        return null;
                    }

                    // Get vehicle type from entry data
                    const vehicleType = entry?.device_tag_info?.category_info?.category;

                    // Create the marker feature
                    const markerFeature = new Feature({
                        geometry: new Point([longitude, latitude]),
                        entryData: entry, // Store entry data for overlay
                        vehicleType: vehicleType, // Store vehicle type on the feature
                    });

                    // Set the appropriate style for the marker with vehicle type
                    markerFeature.setStyle(
                        getIconStyle(entry, vehicleType, markerLabelMode)
                    );

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

                    const speedValue = entryData.speed > 2 ? entryData.speed : 0;
                    const alertType = entryData.packet_type || "NR";
                    const alertClass =
                        alertType === "NR" ? "overlay-pill--normal" : "overlay-pill--alert";

                    // Add Select Vehicle button if onMarkerClick callback is provided
                    const selectButtonHtml = onMarkerClick ? `
                        <button 
                            id="select-vehicle-btn" 
                            style="
                                margin-top: 10px; 
                                padding: 8px 16px; 
                                background-color: #1976d2; 
                                color: white; 
                                border: none; 
                                border-radius: 4px; 
                                cursor: pointer;
                                font-size: 12px;
                                font-weight: 500;
                                width: 100%;
                                transition: background-color 0.2s;
                            "
                            onmouseover="this.style.backgroundColor='#1565c0'"
                            onmouseout="this.style.backgroundColor='#1976d2'"
                        >
                            Select Vehicle
                        </button>
                    ` : '';

                    // Set overlay content with styled card layout
                    document.getElementById("overlay-content").innerHTML = `
            <div class="overlay-card">
              <div class="overlay-header">
                <div class="overlay-title">${entryData.vehicle_registration_number || "-"
                        }</div>
                <div class="overlay-pill ${alertClass}">${alertType}</div>
              </div>
              <div class="overlay-body">
                <div class="overlay-row">
                  <span class="overlay-label">Date</span>
                  <span class="overlay-value">${entryData.date || "-"}</span>
                </div>
                <div class="overlay-row">
                  <span class="overlay-label">Time</span>
                  <span class="overlay-value">${entryData.time || "-"}</span>
                </div>
                <div class="overlay-row">
                  <span class="overlay-label">Speed</span>
                  <span class="overlay-value">${speedValue} km/h</span>
                </div>
                <div class="overlay-row">
                  <span class="overlay-label">Battery</span>
                  <span class="overlay-value">${entryData.internal_battery_voltage || "-"
                        } - ${entryData.main_input_voltage || "-"}</span>
                </div>
              </div>
              ${selectButtonHtml}
            </div>
          `;

                    dynamicOverlay.setPosition(coordinates);
                    dynamicOverlay.getElement().style.display = "block";

                    // Add click handler for select button if it exists
                    if (onMarkerClick) {
                        setTimeout(() => {
                            const selectBtn = document.getElementById('select-vehicle-btn');
                            if (selectBtn) {
                                selectBtn.onclick = () => {
                                    onMarkerClick(entryData);
                                    dynamicOverlay.getElement().style.display = "none";
                                };
                            }
                        }, 0);
                    }

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
        } else {
            vectorLayer.getSource().clear();
        }
    }, [
        gpsData,
        policeData,
        map,
        vectorLayer,
        dynamicOverlay,
        markerLabelMode,
        autoFit,
        onMarkerClick,
    ]);

    // Focus on specific entry
    useEffect(() => {
        if (!focusEntry) return;

        const longitude = Number(focusEntry.longitude);
        const latitude = Number(focusEntry.latitude);

        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

        if (map) {
            map
                .getView()
                .animate({ center: [longitude, latitude], zoom: 16, duration: 500 });
        }
    }, [focusEntry, map]);

    // Polygon Drawing Functions
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
            type: "Polygon",
        });

        draw.on("drawend", (event) => {
            const feature = event.feature;
            const geometry = feature.getGeometry();
            const coordinates = geometry.getCoordinates()[0]; // Outer ring

            // Transform to [Lat, Lon]
            const transformedCoords = coordinates.map((coord) => {
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
        <div style={{ width, height, position: 'relative' }}>
            {/* Map container */}
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
                {/* Map Type Toggle Buttons */}
                {showMapTypeToggle && (
                    <Box
                        sx={{ position: "absolute", top: "10px", left: "40px", zIndex: 10000 }}
                    >
                        <ButtonGroup variant="outlined" size="small">
                            <Tooltip title="Normal Map - Bhuvan Layers">
                                <Button
                                    onClick={() => setMapType("normal")}
                                    variant={mapType === "normal" ? "contained" : "outlined"}
                                    sx={{
                                        backgroundColor:
                                            mapType === "normal" ? "#1976d2" : "transparent",
                                        color: mapType === "normal" ? "white" : "inherit",
                                    }}
                                >
                                    Normal
                                </Button>
                            </Tooltip>
                            <Tooltip title="Satellite Map - OSM Satellite">
                                <Button
                                    onClick={() => setMapType("satellite")}
                                    variant={mapType === "satellite" ? "contained" : "outlined"}
                                    sx={{
                                        backgroundColor:
                                            mapType === "satellite" ? "#1976d2" : "transparent",
                                        color: mapType === "satellite" ? "white" : "inherit",
                                    }}
                                >
                                    Satellite
                                </Button>
                            </Tooltip>
                        </ButtonGroup>
                    </Box>
                )}

                {/* Normal Map Container */}
                {mapType === "normal" && (
                    <div
                        ref={normalMapContainerRef}
                        style={{ width: "100%", height: "100%", position: "relative" }}
                    >
                        {showDrawControls && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50px",
                                    left: "10px",
                                    zIndex: 1000,
                                    display: "flex",
                                    gap: "10px",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={startDrawing}
                                    color={drawInteraction ? "secondary" : "primary"}
                                >
                                    {drawInteraction ? "Drawing..." : "Draw Polygon"}
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={clearPolygon}
                                    color="error"
                                >
                                    Clear
                                </Button>
                            </div>
                        )}
                        {showLogos && (
                            <>
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        height: "60px",
                                        width: "auto",
                                        zIndex: 1000,
                                    }}
                                    alt="InSpace Logo"
                                />
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        height: "60px",
                                        width: "auto",
                                        zIndex: 1000,
                                    }}
                                    alt="ISRO Logo"
                                />
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        right: 0,
                                        height: "60px",
                                        width: "auto",
                                        zIndex: 1000,
                                        backgroundColor: "transparent",
                                    }}
                                    alt="Skytron Logo"
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Satellite Map Container */}
                {mapType === "satellite" && (
                    <div
                        ref={satelliteMapContainerRef}
                        style={{ width: "100%", height: "100%", position: "relative" }}
                    >
                        {showDrawControls && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50px",
                                    left: "10px",
                                    zIndex: 1000,
                                    display: "flex",
                                    gap: "10px",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={startDrawing}
                                    color={drawInteraction ? "secondary" : "primary"}
                                >
                                    {drawInteraction ? "Drawing..." : "Draw Polygon"}
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={clearPolygon}
                                    color="error"
                                >
                                    Clear
                                </Button>
                            </div>
                        )}
                        {showLogos && (
                            <>
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        height: "60px",
                                        width: "auto",
                                        zIndex: 1000,
                                    }}
                                    alt="InSpace Logo"
                                />
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        height: "60px",
                                        width: "auto",
                                        zIndex: 1000,
                                    }}
                                    alt="ISRO Logo"
                                />
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        right: 0,
                                        height: "60px",
                                        width: "auto",
                                        zIndex: 1000,
                                        backgroundColor: "transparent",
                                    }}
                                    alt="Skytron Logo"
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Overlay for displaying marker details */}
            <div ref={overlayElement} className="dynamic-overlay">
                <div id="overlay-content"></div>
            </div>

            <style>{`
        .dynamic-overlay {
          position: absolute;
          display: none;
          transform: translate(-5%, 0%);
          z-index: 1001; /* above logos */
        }

        .overlay-card {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 6px 8px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(0, 0, 0, 0.08);
          min-width: 160px;
          max-width: 180px;
          font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 10px;
          color: #1f2933;
        }

        .overlay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          gap: 8px;
        }

        .overlay-title {
          font-weight: 600;
          font-size: 13px;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .overlay-pill {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .overlay-pill--normal {
          background-color: #ecfdf3;
          color: #15803d;
          border-color: #bbf7d0;
        }

        .overlay-pill--alert {
          background-color: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .overlay-body {
          border-top: 1px solid #f1f5f9;
          padding-top: 6px;
          margin-top: 4px;
          display: grid;
          row-gap: 4px;
        }

        .overlay-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
        }

        .overlay-label {
          font-size: 11px;
          color: #6b7280;
        }

        .overlay-value {
          font-size: 11px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
        }
      `}</style>
        </div>
    );
};

export default BhuvanMapComponent;
