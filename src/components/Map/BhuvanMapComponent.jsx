import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Tooltip, Box, Divider, Paper, Switch, Typography } from "@mui/material";
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
import HomePageService from "../../services/HomePage";

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
    lookupPois,
    width = "100%",
    height = "400px",
    onPolygonComplete,
    onMarkerClick,
    onMapReady,
    autoFit = false,
    focusEntry = null,
    markerLabelMode = "vehicle",
    showMapTypeToggle = true,
    showDrawControls = true,
    showLogos = true,
    showSoiLayerPanel = true,
    defaultMapType = "normal",
    center = [91.7362, 26.1445], // Guwahati, Assam
    zoom = 10,
    routes = [], // New prop for routes: [{ from: [lon, lat], to: [lon, lat], type: 'police'|'ambulance' }]
}) => {
    const poisForLookup = Array.isArray(lookupPois) ? lookupPois : pois;
    const overlayElement = useRef();
    const trackingDetailCacheRef = useRef({});
    const lastClickedVehicleRef = useRef(null);
    const [map, setMap] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [routeVectorLayer, setRouteVectorLayer] = useState(null); // Layer for routes
    const [dynamicOverlay, setDynamicOverlay] = useState(null);
    const [drawVectorLayer, setDrawVectorLayer] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [poiVectorLayer, setPoiVectorLayer] = useState(null);

    useEffect(() => {
        const container = overlayElement.current;
        if (!container) return;

        const handleClick = (e) => {
            const tabButton = e.target?.closest?.("[data-overlay-tab]");
            if (!tabButton) return;

            const tabName = tabButton.getAttribute("data-overlay-tab");
            if (!tabName) return;

            const tabsRoot = tabButton.closest("[data-overlay-tabs]");
            if (!tabsRoot) return;

            const allTabs = tabsRoot.querySelectorAll("[data-overlay-tab]");
            allTabs.forEach((btn) => {
                btn.classList.toggle("overlay-tab--active", btn === tabButton);
            });

            const panels = tabsRoot.querySelectorAll("[data-overlay-panel]");
            panels.forEach((panel) => {
                panel.classList.toggle(
                    "overlay-panel--active",
                    panel.getAttribute("data-overlay-panel") === tabName
                );
            });
        };

        container.addEventListener("click", handleClick);
        return () => container.removeEventListener("click", handleClick);
    }, []);

    // Map type state: 'normal' | 'satellite' | 'soi'
    const [mapType, setMapType] = useState(defaultMapType);
    const normalMapRef = useRef(null);
    const satelliteMapRef = useRef(null);
    const soiMapRef = useRef(null);
    const vectorLayerByTypeRef = useRef({ normal: null, satellite: null, soi: null });
    const normalMapContainerRef = useRef(null);
    const satelliteMapContainerRef = useRef(null);
    const soiMapContainerRef = useRef(null);

    const [soiLayerVisibility, setSoiLayerVisibility] = useState({
        states: false,
        assamDistrict: false,
        assamDistrictBdy2: false,
        assamDistrictHq: false,
        assamStateBdy: false,
        assamSubdistrictBdy: false,
        cartTrackHills: false,
        contours: false,
        kamrupRural: false,
        majorTowns: false,
        name: false,
        railwayTracks: false,
        roads: false,
        roadsAllWeatherMotorable: false,
        roadsMotorableInFairWeather: false,
        roadsNationalHighway: false,
        roadOthers: false,
        roadTunnel: false,
        stateHighway: false,
        buildingFootprint: false,
        roadSurface: false,
        busStop: false,
        block: false,
        skytronAssamCombined: false,
        assamTowns: false,
    });

    const soiLayersRef = useRef({
        states: null,
        assamDistrict: null,
        assamDistrictBdy2: null,
        assamDistrictHq: null,
        assamStateBdy: null,
        assamSubdistrictBdy: null,
        cartTrackHills: null,
        contours: null,
        kamrupRural: null,
        majorTowns: null,
        name: null,
        railwayTracks: null,
        roads: null,
        roadsAllWeatherMotorable: null,
        roadsMotorableInFairWeather: null,
        roadsNationalHighway: null,
        roadOthers: null,
        roadTunnel: null,
        stateHighway: null,
        buildingFootprint: null,
        roadSurface: null,
        busStop: null,
        block: null,
        skytronAssamCombined: null,
        assamTowns: null,
    });

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

    const attachTileSourceDebug = (source, label) => {
        if (!source || typeof source.on !== "function") return;

        try {
            source.on("tileloadstart", () => {
                console.debug(`[BhuvanMap] tileloadstart: ${label}`);
            });
            source.on("tileloadend", () => {
                console.debug(`[BhuvanMap] tileloadend: ${label}`);
            });
            source.on("tileloaderror", (evt) => {
                // evt.tile may expose getKey / getImage
                console.error(`[BhuvanMap] tileloaderror: ${label}`, evt);
            });
        } catch (e) {
            // ignore
        }
    };

    // POI Styling
    const USE_TYPE_COLORS = {
        school: "#1E88E5",
        hospital: "#E53935",
        hospitals: "#E53935",
        dealership: "#8E24AA",
        dealer: "#8E24AA",
        personal: "#43A047",
        prohibited_area: "#D81B60",
        unauthorised_stop: "#D81B60",
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
        const key = String(poi?.use_type || "").trim().toLowerCase();
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

        const formatPoiLabel = (text, { maxCharsPerLine = 14 } = {}) => {
            const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
            if (!normalized) return "";

            const words = normalized.split(" ");
            const lines = [];
            let current = "";

            const pushCurrent = () => {
                if (current) lines.push(current);
                current = "";
            };

            for (const word of words) {
                if (!word) continue;

                if (!current) {
                    current = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine) : word;
                    continue;
                }

                if (`${current} ${word}`.length <= maxCharsPerLine) {
                    current = `${current} ${word}`;
                    continue;
                }

                pushCurrent();
                current = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine) : word;
            }

            pushCurrent();

            return lines.join("\n");
        };

        const labelText = formatPoiLabel(displayText);

        const createText = (overrides = {}) =>
            new Text({
                text: labelText,
                font: '12px "Roboto", sans-serif',
                fill: new Fill({ color: "#0D47A1" }),
                stroke: new Stroke({ color: "#ffffff", width: 2 }),
                backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.72)" }),
                padding: [1, 3, 1, 3],
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
        const categoryName = typeof vehicleType === 'object' ? vehicleType?.category : vehicleType;
        const normalizedVehicleType = categoryName
            ? categoryName.toLowerCase().replace(/\s+/g, "_")
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
        const labelGap = color === "grey" ? 15 : 5;
        const labelOffsetY = -(Math.round(iconScale * 1000) + labelGap);

        return new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: iconPath,
                scale: iconScale,
            }),
            text: labelText
                ? new Text({
                    text: labelText,
                    font: '11px "Roboto", sans-serif',
                    fill: new Fill({ color: "#0D47A1" }),
                    stroke: new Stroke({ color: "#ffffff", width: 3 }),
                    backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.92)" }),
                    padding: [1, 3, 1, 3],
                    textAlign: 'center',
                    textBaseline: 'bottom',
                    offsetY: labelOffsetY,
                })
                : undefined,
        });
    };

    const getMarkerLabel = (entry, mode) => {
        if (!entry) return "";
        console.debug(`[BhuvanMap] getMarkerLabel: mode=${mode}, imei=${entry.imei || entry.device_tag_info?.device?.imei}`);

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
                    entry.device_tag_info?.district_info?.district ||
                    entry.device_tag_info?.state_info?.state ||
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

    const fetchVehicleTrackingDetail = async (entry) => {
        const imei =
            entry?.imei ||
            entry?.imei_no ||
            entry?.imeiNo ||
            entry?.device_tag_info?.device?.imei ||
            entry?.device_tag_info?.imei;
        const regno =
            entry?.vehicle_registration_number ||
            entry?.vehicle_reg_no ||
            entry?.device_tag_info?.device?.vehicle_reg_no ||
            entry?.device_tag_info?.vehicle?.vehicle_reg_no ||
            "";

        const cacheKey = imei ? `imei:${imei}` : regno ? `regno:${regno}` : null;
        if (!cacheKey) return null;

        const cached = trackingDetailCacheRef.current[cacheKey];
        if (cached) return cached;

        try {
            console.debug("[BhuvanMap] Fetching gps_track_data_api", { imei, regno });
            const resp = await HomePageService.getLiveTracking_data({
                imei: imei || "",
                regno,
                owner: "",
                poi: "",
                roads: "",
                polygon: "",
                category: "",
                make: "",
                district: "",
                speed_limit: "",
                poi_id: "",
                in_range: false,
                poi_as_polygon: false,
            });

            const detail = Array.isArray(resp?.data?.data) ? resp.data.data[0] : null;
            if (detail) {
                trackingDetailCacheRef.current[cacheKey] = detail;
                return detail;
            }
        } catch (e) {
            console.error("[BhuvanMap] gps_track_data_api fetch failed", e);
        }

        return null;
    };

    const resolveNearestPoliceAddress = (entry) => {
        if (!entry) return "-";
        return (
            entry.nearestPoliceAddress ||
            entry.nearest_police_address ||
            entry.nearest_police_station_address ||
            entry.nearest_police?.data?.address ||
            entry.nearest_police?.address ||
            entry.nearest_police_station?.data?.address ||
            entry.nearest_police_station?.address ||
            entry.nearestPolice?.address ||
            "-"
        );
    };

    const getPoiLatLon = (poi) => {
        if (!poi?.location) return null;

        try {
            const parsed = typeof poi.location === "string" ? JSON.parse(poi.location) : poi.location;
            if (!Array.isArray(parsed) || parsed.length === 0) return null;

            const first = parsed[0];
            if (!Array.isArray(first) || first.length < 2) return null;

            const lat = Number(first[0]);
            const lon = Number(first[1]);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
            return { lat, lon };
        } catch (e) {
            return null;
        }
    };

    const haversineKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const resolveNearestPoliceFromPois = (entry) => {
        const lat = Number(entry?.latitude);
        const lon = Number(entry?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        if (!Array.isArray(poisForLookup) || poisForLookup.length === 0) return null;

        const policePois = poisForLookup.filter((poi) => {
            const useType = String(poi?.use_type || "").toLowerCase();
            return useType === "policestation" || useType === "police" || useType === "police_station" || useType === "police station";
        });
        if (policePois.length === 0) return null;

        let best = null;
        let bestDist = Infinity;
        for (const poi of policePois) {
            const coords = getPoiLatLon(poi);
            if (!coords) continue;
            const dist = haversineKm(lat, lon, coords.lat, coords.lon);
            if (dist < bestDist) {
                bestDist = dist;
                best = poi;
            }
        }

        if (!best) return null;
        const name = best?.name ? String(best.name) : "-";
        const address = best?.address || best?.description || "-";
        const phone = (
            best?.phone ||
            best?.phoneno ||
            best?.mobile ||
            best?.contact ||
            best?.data?.phone ||
            best?.data?.phoneno ||
            best?.data?.mobile ||
            best?.data?.contact ||
            "-"
        );
        return { name, address: String(address), phone: String(phone), distanceKm: bestDist };
    };

    const resolveNearestHospitalFromPois = (entry) => {
        const lat = Number(entry?.latitude);
        const lon = Number(entry?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        if (!Array.isArray(poisForLookup) || poisForLookup.length === 0) return null;

        const hospitalPois = poisForLookup.filter((poi) => {
            const useType = String(poi?.use_type || "").trim().toLowerCase();
            return useType === "hospital" || useType === "hospitals" || useType === "hospital_name";
        });
        if (hospitalPois.length === 0) return null;

        let best = null;
        let bestDist = Infinity;
        for (const poi of hospitalPois) {
            const coords = getPoiLatLon(poi);
            if (!coords) continue;
            const dist = haversineKm(lat, lon, coords.lat, coords.lon);
            if (dist < bestDist) {
                bestDist = dist;
                best = poi;
            }
        }

        if (!best) return null;
        const name = best?.name ? String(best.name) : "-";
        const address = best?.address || best?.description || "-";
        const phone = (
            best?.phone ||
            best?.phoneno ||
            best?.mobile ||
            best?.contact ||
            best?.data?.phone ||
            best?.data?.phoneno ||
            best?.data?.mobile ||
            best?.data?.contact ||
            "-"
        );
        return { name, address: String(address), phone: String(phone), distanceKm: bestDist };
    };

    const mergePoliceFields = (baseEntry, detailEntry) => {
        if (!baseEntry) return baseEntry;
        if (!detailEntry) return baseEntry;

        const merged = { ...baseEntry };

        const keys = [
            "nearestPoliceAddress",
            "nearest_police_address",
            "nearest_police_station_address",
            "nearestPoliceStation",
            "nearest_police_station_name",
            "nearest_police_name",
            "nearest_police",
            "nearest_police_station",
            "nearestPolice",
            "nearestPoliceLat",
            "nearestPoliceLng",
        ];

        for (const key of keys) {
            const value = detailEntry?.[key];
            if (value !== undefined && value !== null && value !== "") {
                merged[key] = value;
            }
        }

        return merged;
    };

    const renderVehicleOverlay = (entryData, coordinates, alertType, alertClass, speedValue, selectButtonHtml) => {
        const policeAddressRaw = resolveNearestPoliceAddress(entryData);
        const poiFallback = policeAddressRaw === "-" ? resolveNearestPoliceFromPois(entryData) : null;
        const policeDistanceFallback = resolveNearestPoliceFromPois(entryData);
        const policeName = (
            entryData?.nearestPoliceStation ||
            entryData?.nearest_police_station_name ||
            entryData?.nearest_police?.data?.name ||
            entryData?.nearest_police?.name ||
            entryData?.nearest_police_station?.data?.name ||
            entryData?.nearest_police_station?.name ||
            entryData?.nearestPolice?.name ||
            poiFallback?.name ||
            "-"
        );

        const policeDescription = (
            entryData?.nearest_police?.data?.description ||
            entryData?.nearest_police?.description ||
            entryData?.nearest_police_station?.data?.description ||
            entryData?.nearest_police_station?.description ||
            entryData?.nearestPolice?.description ||
            poiFallback?.description ||
            poiFallback?.address ||
            "-"
        );

        const policePhone = (
            entryData?.nearestPoliceContact ||
            entryData?.nearest_police?.data?.phone ||
            entryData?.nearest_police?.phone ||
            entryData?.nearest_police_station?.data?.phone ||
            entryData?.nearest_police_station?.phone ||
            entryData?.nearestPolice?.phone ||
            poiFallback?.phone ||
            poiFallback?.phoneno ||
            poiFallback?.mobile ||
            poiFallback?.contact ||
            poiFallback?.data?.phone ||
            poiFallback?.data?.phoneno ||
            poiFallback?.data?.mobile ||
            poiFallback?.data?.contact ||
            "-"
        );

        const hospitalFallback = resolveNearestHospitalFromPois(entryData);
        const hospitalName = hospitalFallback?.name || "-";
        const hospitalDescription = hospitalFallback?.address || "-";
        const hospitalPhone = hospitalFallback?.phone || "-";

        const safeValue = (value) => {
            if (value === null || value === undefined) return "-";
            if (typeof value === "string" && value.trim() === "") return "-";
            return String(value);
        };

        const resolveVehicleNo = (entry) =>
            safeValue(
                entry?.vehicle_registration_number ||
                entry?.vehicle_reg_no ||
                entry?.vehicle_no ||
                entry?.device_tag_info?.device?.vehicle_reg_no ||
                entry?.device_tag_info?.vehicle?.vehicle_reg_no
            );

        const resolveDateTime = (entry) => {
            const pad2 = (v) => String(v).padStart(2, "0");

            const formatDate = (dt) => {
                try {
                    return new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }).format(dt);
                } catch (e) {
                    return "-";
                }
            };

            const formatTime = (dt) => `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}:${pad2(dt.getSeconds())}`;

            const parseDDMMYYYY = (value) => {
                const s = safeValue(value);
                if (!/^[0-9]{8}$/.test(s)) return null;
                const dd = Number(s.slice(0, 2));
                const mm = Number(s.slice(2, 4));
                const yyyy = Number(s.slice(4, 8));
                const dt = new Date(yyyy, mm - 1, dd);
                return Number.isNaN(dt.getTime()) ? null : dt;
            };

            const parseHHMMSS = (value) => {
                const s = safeValue(value);
                if (!/^[0-9]{6}$/.test(s)) return null;
                const hh = Number(s.slice(0, 2));
                const mi = Number(s.slice(2, 4));
                const ss = Number(s.slice(4, 6));
                if (hh > 23 || mi > 59 || ss > 59) return null;
                return { hh, mi, ss };
            };

            const raw = entry?.entry_time || entry?.timestamp || entry?.time_stamp;
            if (raw) {
                const dt = new Date(raw);
                if (!Number.isNaN(dt.getTime())) {
                    return { date: formatDate(dt), time: formatTime(dt) };
                }
            }

            const dateDt = parseDDMMYYYY(entry?.date);
            const timeParts = parseHHMMSS(entry?.time);
            if (dateDt) {
                const outDate = formatDate(dateDt);
                const outTime = timeParts
                    ? `${pad2(timeParts.hh)}:${pad2(timeParts.mi)}:${pad2(timeParts.ss)}`
                    : "-";
                return { date: outDate, time: outTime };
            }

            return { date: safeValue(entry?.date), time: safeValue(entry?.time) };
        };

        const { date, time } = resolveDateTime(entryData);
        const battery = safeValue(
            entryData?.battery ||
            entryData?.battery_voltage ||
            (entryData?.internal_battery_voltage || entryData?.main_input_voltage
                ? `${safeValue(entryData?.internal_battery_voltage)} - ${safeValue(entryData?.main_input_voltage)}`
                : "-")
        );

        const lat = Number(entryData?.latitude);
        const lon = Number(entryData?.longitude);
        const latText = Number.isFinite(lat) ? lat.toFixed(6) : "-";
        const lonText = Number.isFinite(lon) ? lon.toFixed(6) : "-";

        const policePanelHtml = (safeValue(policeName) !== "-" || safeValue(policeDescription) !== "-" || safeValue(policePhone) !== "-")
            ? `
<div class="overlay-section">
<div class="overlay-section-title">Police Support</div>
<div class="overlay-section-body">
<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Station</span><span class="overlay-value overlay-value--multiline">${safeValue(policeName)}</span></div>
<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Address</span><span class="overlay-value overlay-value--multiline">${safeValue(policeDescription)}</span></div>
<div class="overlay-row"><span class="overlay-label">Phone</span><span class="overlay-value">${safeValue(policePhone)}</span></div>
${Number.isFinite(policeDistanceFallback?.distanceKm)
                ? `<div class="overlay-row"><span class="overlay-label">Distance</span><span class="overlay-value">${policeDistanceFallback.distanceKm.toFixed(2)} km</span></div>`
                : ""}
</div>
</div>
`
            : `
<div class="overlay-section">
<div class="overlay-section-title">Police Support</div>
<div class="overlay-section-body">
<div class="overlay-row overlay-row--multiline"><span class="overlay-value overlay-value--multiline">No police details available</span></div>
</div>
</div>
`;

        const hospitalPanelHtml = hospitalFallback
            ? `
<div class="overlay-section">
<div class="overlay-section-title">Health Center</div>
<div class="overlay-section-body">
<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Name</span><span class="overlay-value overlay-value--multiline">${safeValue(hospitalName)}</span></div>
<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Address</span><span class="overlay-value overlay-value--multiline">${safeValue(hospitalDescription)}</span></div>
<div class="overlay-row"><span class="overlay-label">Phone</span><span class="overlay-value">${safeValue(hospitalPhone)}</span></div>
${Number.isFinite(hospitalFallback?.distanceKm)
                ? `<div class="overlay-row"><span class="overlay-label">Distance</span><span class="overlay-value">${hospitalFallback.distanceKm.toFixed(2)} km</span></div>`
                : ""}
</div>
</div>
`
            : `
<div class="overlay-section">
<div class="overlay-section-title">Health Center</div>
<div class="overlay-section-body">
<div class="overlay-row overlay-row--multiline"><span class="overlay-value overlay-value--multiline">No health center details available</span></div>
</div>
</div>
`;

        const el = document.getElementById("overlay-content");
        if (!el) return;

        el.innerHTML = `
            <div class="overlay-card">
              <div class="overlay-header">
                <div class="overlay-title">${resolveVehicleNo(entryData)}</div>
                <div class="overlay-pill ${alertClass}">${alertType}</div>
              </div>
              <div class="overlay-tabs" data-overlay-tabs>
                <div class="overlay-tab-list" role="tablist">
                  <button class="overlay-tab overlay-tab--active" type="button" data-overlay-tab="vehicle" role="tab">Vehicle</button>
                  <button class="overlay-tab" type="button" data-overlay-tab="police" role="tab">Police</button>
                  <button class="overlay-tab" type="button" data-overlay-tab="health" role="tab">Health</button>
                </div>

                <div class="overlay-panel overlay-panel--active" data-overlay-panel="vehicle" role="tabpanel">
                  <div class="overlay-section">
                    <div class="overlay-section-title">Vehicle Information</div>
                    <div class="overlay-section-body">
                      <div class="overlay-row"><span class="overlay-label">Date</span><span class="overlay-value">${safeValue(date)}</span></div>
                      <div class="overlay-row"><span class="overlay-label">Time</span><span class="overlay-value">${safeValue(time)}</span></div>
                      <div class="overlay-row"><span class="overlay-label">Speed</span><span class="overlay-value">${safeValue(speedValue)} km/h</span></div>
                      <div class="overlay-row"><span class="overlay-label">Battery</span><span class="overlay-value">${battery}</span></div>
                      <div class="overlay-row"><span class="overlay-label">Latitude</span><span class="overlay-value">${latText}</span></div>
                      <div class="overlay-row"><span class="overlay-label">Longitude</span><span class="overlay-value">${lonText}</span></div>
                    </div>
                  </div>
                </div>

                <div class="overlay-panel" data-overlay-panel="police" role="tabpanel">
                  ${policePanelHtml}
                </div>

                <div class="overlay-panel" data-overlay-panel="health" role="tabpanel">
                  ${hospitalPanelHtml}
                </div>
              </div>
              ${selectButtonHtml}
            </div>
          `;

        dynamicOverlay.setPosition(coordinates);
        dynamicOverlay.getElement().style.display = "block";
    };

    // Set the correct icon style based on data conditions and vehicle type
    const getIconStyle = (data, vehicleType, labelMode) => {
        const entryTime = new Date(data.entry_time);
        const currentTime = new Date();
        const timeDifference = calculateTimeDifference(entryTime, currentTime);

        const isPoliceMarker = data.markerCategory === "police";
        const isAmbulanceMarker = data.markerCategory === "ambulance";

        let color;

        if (isPoliceMarker) {
            color = "blue";
        } else if (isAmbulanceMarker) {
            color = "red"; // Ambulance - Red Icon
        } else if (data.packet_type === "EA") {
            color = "red"; // EA Packet - Red Icon
        } else if (data.packet_type !== "NR") {
            color = "orange"; // Any Alert Packet except EA - Orange Icon
        } else if (Number(data.speed) > 0) {
            color = "green"; // Moving - Green Icon
        } else if (String(data.ignition_status) === "1" && Number(data.speed) === 0) {
            color = "blue"; // Ignition ON but stationary - Blue Icon
        } else if (timeDifference > 5) {
            color = "grey"; // Offline device (no packets from device for 5+ minutes) - Grey Icon
        } else {
            color = "default"; // Default color
        }

        let iconVehicleType = vehicleType;
        if (isPoliceMarker) iconVehicleType = "police";
        if (isAmbulanceMarker) iconVehicleType = "ambulance";

        const labelText = getMarkerLabel(data, labelMode);
        return createIconStyle(color, iconVehicleType, labelText);
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
            zIndex: 4,
        });

        const roadsLayer = new TileLayer({
            source: new XYZ({
                url: "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
                attributions: '&copy; OpenStreetMap contributors',
                maxZoom: 20,
                projection: "EPSG:3857"
            }),
            zIndex: 3,
            minZoom: 11,
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

        const poiSource = new VectorSource();
        const poiLayer = new VectorLayer({
            source: poiSource,
            zIndex: 150, // Below markers
        });
        initialMap.addLayer(poiLayer);
        setPoiVectorLayer(poiLayer);

        // Initialize Route Layer
        const routeLayer = new VectorLayer({
            source: new VectorSource(),
            zIndex: 100, // Below POIs and Markers
            style: (feature) => {
                const type = feature.get('type');
                const color = type === 'ambulance_ex' ? '#e91e63' : '#1976d2'; // Red/Pink for Ambulance, Blue for Police
                return new Style({
                    stroke: new Stroke({
                        color: color,
                        width: 3,
                    })
                });
            }
        });
        initialMap.addLayer(routeLayer);
        setRouteVectorLayer(routeLayer);

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
        vectorLayerByTypeRef.current.normal = initialVectorLayer;
        setDynamicOverlay(initialOverlay);
        setDrawVectorLayer(drawLayer);
        normalMapRef.current = initialMap;

        try {
            setTimeout(() => initialMap.updateSize(), 0);
        } catch (e) {
            // ignore
        }

        if (typeof onMapReady === "function") {
            onMapReady({
                map: initialMap,
                mapType: "normal",
                vectorLayer: initialVectorLayer,
                poiVectorLayer: poiLayer,
                drawVectorLayer: drawLayer,
                overlay: initialOverlay,
                baseLayers: {
                    india3Layer,
                    adminGroupLayer,
                    roadsLayer,
                },
            });
        }

        return () => {
            if (normalMapRef.current) {
                normalMapRef.current.setTarget(null);
                normalMapRef.current = null;
            }
        };
    }, [mapType]);

    // Initialize SOI Map (Bhuvan base + skytron overlays)
    useEffect(() => {
        if (mapType !== "soi" || !soiMapContainerRef.current) return;

        try {
            const geoserverURL = "https://map.gromed.in/geoserver/skytron/wms";

            const bhuvanIndia3Layer = new TileLayer({
                source: (() => {
                    const src = createBhuvanSource("india3");
                    attachTileSourceDebug(src, "bhuvan:india3");
                    return src;
                })(),
                zIndex: 0,
            });

            const bhuvanAdminLayer = new TileLayer({
                source: (() => {
                    const src = createBhuvanSource("basemap%3Aadmin_group");
                    attachTileSourceDebug(src, "bhuvan:admin_group");
                    return src;
                })(),
                zIndex: 4,
            });

            const bhuvanRoadsLayer = new TileLayer({
                source: new XYZ({
                    url: "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
                    attributions: '&copy; OpenStreetMap contributors',
                    maxZoom: 20,
                    projection: "EPSG:3857"
                }),
                zIndex: 2,
                minZoom: 11,
            });

            const soiStatesLayer = new TileLayer({
                title: "States",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:states",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.7,
                visible: soiLayerVisibility.states,
                zIndex: 10,
            });

            attachTileSourceDebug(soiStatesLayer.getSource?.(), "soi:states");

            const soiAssamDistrictLayer = new TileLayer({
                title: "ASSAM District Boundary",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_DISTRICT_BDY",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamDistrict,
                zIndex: 11,
            });

            attachTileSourceDebug(soiAssamDistrictLayer.getSource?.(), "soi:assamDistrict");

            const soiAssamDistrictBdy2Layer = new TileLayer({
                title: "ASSAM District Boundary 2",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_DISTRICT_BDY2",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamDistrictBdy2,
                zIndex: 12,
            });

            attachTileSourceDebug(soiAssamDistrictBdy2Layer.getSource?.(), "soi:assamDistrictBdy2");

            const soiAssamDistrictHqLayer = new TileLayer({
                title: "ASSAM District HQ",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_DISTRICT_HQ",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.assamDistrictHq,
                zIndex: 13,
            });

            attachTileSourceDebug(soiAssamDistrictHqLayer.getSource?.(), "soi:assamDistrictHq");

            const soiAssamStateBdyLayer = new TileLayer({
                title: "ASSAM State Boundary",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_STATE_BDY",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamStateBdy,
                zIndex: 14,
            });

            attachTileSourceDebug(soiAssamStateBdyLayer.getSource?.(), "soi:assamStateBdy");

            const soiAssamSubdistrictBdyLayer = new TileLayer({
                title: "ASSAM Subdistrict Boundary",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_SUBDISTRICT_BDY",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamSubdistrictBdy,
                zIndex: 15,
            });

            attachTileSourceDebug(soiAssamSubdistrictBdyLayer.getSource?.(), "soi:assamSubdistrictBdy");

            const soiCartTrackHillsLayer = new TileLayer({
                title: "Cart Track Hills",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:CART_TRACK_HILLS",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.cartTrackHills,
                zIndex: 16,
            });

            attachTileSourceDebug(soiCartTrackHillsLayer.getSource?.(), "soi:cartTrackHills");

            const soiContoursLayer = new TileLayer({
                title: "Contours",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:Contours",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.contours,
                zIndex: 12,
            });

            attachTileSourceDebug(soiContoursLayer.getSource?.(), "soi:contours");

            const soiKamrupRuralLayer = new TileLayer({
                title: "Kamrup Rural",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:KAMRUP_RURAL",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.kamrupRural,
                zIndex: 17,
            });

            attachTileSourceDebug(soiKamrupRuralLayer.getSource?.(), "soi:kamrupRural");

            const soiMajorTownsLayer = new TileLayer({
                title: "Major Towns / Headquarters",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:MajortownsHeadquarters",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.majorTowns,
                zIndex: 13,
            });

            attachTileSourceDebug(soiMajorTownsLayer.getSource?.(), "soi:majorTowns");

            const soiNameLayer = new TileLayer({
                title: "Name",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:NAME",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.name,
                zIndex: 18,
            });

            attachTileSourceDebug(soiNameLayer.getSource?.(), "soi:name");

            const soiRailwayTracksLayer = new TileLayer({
                title: "Railway Tracks",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:RailwayTracks",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.railwayTracks,
                zIndex: 14,
            });

            attachTileSourceDebug(soiRailwayTracksLayer.getSource?.(), "soi:railwayTracks");

            const soiRoadsLayer = new TileLayer({
                title: "SOI Roads",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:Roads",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roads,
                zIndex: 15,
            });

            attachTileSourceDebug(soiRoadsLayer.getSource?.(), "soi:roads");

            const soiRoadsAllWeatherMotorableLayer = new TileLayer({
                title: "Roads (All Weather Motorable)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROADS_ALL_WEATHER_MOTORABLE",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadsAllWeatherMotorable,
                zIndex: 19,
            });

            attachTileSourceDebug(soiRoadsAllWeatherMotorableLayer.getSource?.(), "soi:roadsAllWeatherMotorable");

            const soiRoadsMotorableInFairWeatherLayer = new TileLayer({
                title: "Roads (Motorable in Fair Weather)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROADS_MOTORABLE_IN_FAIR_WEATHER",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadsMotorableInFairWeather,
                zIndex: 20,
            });

            attachTileSourceDebug(soiRoadsMotorableInFairWeatherLayer.getSource?.(), "soi:roadsMotorableInFairWeather");

            const soiRoadsNationalHighwayLayer = new TileLayer({
                title: "Roads (National Highway)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROADS_NATIONAL_HIGHWAY",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadsNationalHighway,
                zIndex: 21,
            });

            attachTileSourceDebug(soiRoadsNationalHighwayLayer.getSource?.(), "soi:roadsNationalHighway");

            const soiRoadOthersLayer = new TileLayer({
                title: "Road Others",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROAD_OTHERS",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadOthers,
                zIndex: 22,
            });

            attachTileSourceDebug(soiRoadOthersLayer.getSource?.(), "soi:roadOthers");

            const soiRoadTunnelLayer = new TileLayer({
                title: "Road Tunnel",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROAD_TUNNEL",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadTunnel,
                zIndex: 23,
            });

            attachTileSourceDebug(soiRoadTunnelLayer.getSource?.(), "soi:roadTunnel");

            const soiStateHighwayLayer = new TileLayer({
                title: "State Highway",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:STATE_HIGHWAY",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.stateHighway,
                zIndex: 24,
            });

            attachTileSourceDebug(soiStateHighwayLayer.getSource?.(), "soi:stateHighway");

            const soiBuildingFootprintLayer = new TileLayer({
                title: "Building Footprint",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:building_footprint",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.buildingFootprint,
                zIndex: 25,
            });

            attachTileSourceDebug(soiBuildingFootprintLayer.getSource?.(), "soi:buildingFootprint");

            const soiRoadSurfaceLayer = new TileLayer({
                title: "Road Surface",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:road_surface",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadSurface,
                zIndex: 26,
            });

            attachTileSourceDebug(soiRoadSurfaceLayer.getSource?.(), "soi:roadSurface");

            const soiBusStopLayer = new TileLayer({
                title: "Bus Stop",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:bus_stop",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.busStop,
                zIndex: 27,
            });

            attachTileSourceDebug(soiBusStopLayer.getSource?.(), "soi:busStop");

            const soiBlockLayer = new TileLayer({
                title: "Block",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:block",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.block,
                zIndex: 28,
            });

            attachTileSourceDebug(soiBlockLayer.getSource?.(), "soi:block");

            const soiSkytronAssamCombinedLayer = new TileLayer({
                title: "Assam Combined (skytron)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:assam_combined",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.skytronAssamCombined,
                zIndex: 30,
            });

            attachTileSourceDebug(soiSkytronAssamCombinedLayer.getSource?.(), "soi:skytronAssamCombined");

            const soiAssamTownsLayer = new TileLayer({
                title: "Assam Towns (skytron)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:AssamTowns",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.assamTowns,
                zIndex: 31,
            });

            const soiMap = new Map({
                target: soiMapContainerRef.current,
                layers: [
                    bhuvanIndia3Layer,
                    bhuvanAdminLayer,
                    bhuvanRoadsLayer,
                    soiStatesLayer,
                    soiAssamDistrictLayer,
                    soiAssamDistrictBdy2Layer,
                    soiAssamDistrictHqLayer,
                    soiAssamStateBdyLayer,
                    soiAssamSubdistrictBdyLayer,
                    soiCartTrackHillsLayer,
                    soiContoursLayer,
                    soiKamrupRuralLayer,
                    soiMajorTownsLayer,
                    soiNameLayer,
                    soiRailwayTracksLayer,
                    soiRoadsLayer,
                    soiRoadsAllWeatherMotorableLayer,
                    soiRoadsMotorableInFairWeatherLayer,
                    soiRoadsNationalHighwayLayer,
                    soiRoadOthersLayer,
                    soiRoadTunnelLayer,
                    soiStateHighwayLayer,
                    soiBuildingFootprintLayer,
                    soiRoadSurfaceLayer,
                    soiBusStopLayer,
                    soiBlockLayer,
                    soiSkytronAssamCombinedLayer,
                    soiAssamTownsLayer,
                ],
                view: new View({
                    projection: "EPSG:4326",
                    center: center,
                    zoom: zoom,
                    maxZoom: 19,
                    constrainResolution: true,
                }),
                pixelRatio: 1,
            });

            const initialVectorLayer = new VectorLayer({
                source: new VectorSource(),
                zIndex: 200,
            });
            soiMap.addLayer(initialVectorLayer);

            const poiSource = new VectorSource();
            const initialPoiVectorLayer = new VectorLayer({
                source: poiSource,
                zIndex: 100,
                declutter: true,
            });
            soiMap.addLayer(initialPoiVectorLayer);

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
            soiMap.addLayer(drawLayer);

            const initialOverlay = new Overlay({
                element: overlayElement.current,
            });
            soiMap.addOverlay(initialOverlay);

            soiMapRef.current = soiMap;
            setMap(soiMap);
            setVectorLayer(initialVectorLayer);
            vectorLayerByTypeRef.current.soi = initialVectorLayer;
            setPoiVectorLayer(initialPoiVectorLayer);
            setDrawVectorLayer(drawLayer);
            setDynamicOverlay(initialOverlay);

            try {
                setTimeout(() => soiMap.updateSize(), 0);
            } catch (e) {
                // ignore
            }

            soiLayersRef.current = {
                states: soiStatesLayer,
                assamDistrict: soiAssamDistrictLayer,
                assamDistrictBdy2: soiAssamDistrictBdy2Layer,
                assamDistrictHq: soiAssamDistrictHqLayer,
                assamStateBdy: soiAssamStateBdyLayer,
                assamSubdistrictBdy: soiAssamSubdistrictBdyLayer,
                cartTrackHills: soiCartTrackHillsLayer,
                contours: soiContoursLayer,
                kamrupRural: soiKamrupRuralLayer,
                majorTowns: soiMajorTownsLayer,
                name: soiNameLayer,
                railwayTracks: soiRailwayTracksLayer,
                roads: soiRoadsLayer,
                roadsAllWeatherMotorable: soiRoadsAllWeatherMotorableLayer,
                roadsMotorableInFairWeather: soiRoadsMotorableInFairWeatherLayer,
                roadsNationalHighway: soiRoadsNationalHighwayLayer,
                roadOthers: soiRoadOthersLayer,
                roadTunnel: soiRoadTunnelLayer,
                stateHighway: soiStateHighwayLayer,
                buildingFootprint: soiBuildingFootprintLayer,
                roadSurface: soiRoadSurfaceLayer,
                busStop: soiBusStopLayer,
                block: soiBlockLayer,
                skytronAssamCombined: soiSkytronAssamCombinedLayer,
                assamTowns: soiAssamTownsLayer,
            };


            if (typeof onMapReady === "function") {
                onMapReady({
                    map: soiMap,
                    mapType: "soi",
                    vectorLayer: initialVectorLayer,
                    poiVectorLayer: initialPoiVectorLayer,
                    drawVectorLayer: drawLayer,
                    overlay: initialOverlay,
                    baseLayers: {
                        bhuvanIndia3Layer,
                        bhuvanAdminLayer,
                        bhuvanRoadsLayer,
                    },
                    soiLayers: soiLayersRef.current,
                });
            }
        } catch (error) {
            console.error("Error initializing SOI map:", error);
        }

        return () => {
            if (soiMapRef.current) {
                soiMapRef.current.setTarget(null);
                soiMapRef.current = null;
            }
        };
        // Intentionally do not depend on soiLayerVisibility to avoid re-init on toggle
    }, [mapType, center, zoom, onMapReady]);

    useEffect(() => {
        const activeMap =
            mapType === "normal"
                ? normalMapRef.current
                : mapType === "satellite"
                    ? satelliteMapRef.current
                    : mapType === "soi"
                        ? soiMapRef.current
                        : null;

        if (!activeMap) return;

        try {
            setTimeout(() => {
                try {
                    activeMap.updateSize();
                } catch (e) {
                    // ignore
                }
            }, 0);

            setTimeout(() => {
                try {
                    activeMap.updateSize();
                } catch (e) {
                    // ignore
                }
            }, 250);
        } catch (e) {
            // ignore
        }
    }, [mapType]);

    useEffect(() => {
        if (mapType !== "soi") return;
        const layers = soiLayersRef.current;
        if (!layers) return;

        const soiMap = soiMapRef.current;
        let zoomLevel = 0;
        if (soiMap && soiMap.getView) {
            zoomLevel = soiMap.getView().getZoom();
        }
        const showAssamCombined = zoomLevel >= 5;

        layers.states?.setVisible?.(!!soiLayerVisibility.states);
        layers.assamDistrict?.setVisible?.(!!soiLayerVisibility.assamDistrict);
        layers.assamDistrictBdy2?.setVisible?.(!!soiLayerVisibility.assamDistrictBdy2);
        layers.assamDistrictHq?.setVisible?.(!!soiLayerVisibility.assamDistrictHq);
        layers.assamStateBdy?.setVisible?.(!!soiLayerVisibility.assamStateBdy);
        layers.assamSubdistrictBdy?.setVisible?.(!!soiLayerVisibility.assamSubdistrictBdy);
        layers.cartTrackHills?.setVisible?.(!!soiLayerVisibility.cartTrackHills);
        layers.contours?.setVisible?.(!!soiLayerVisibility.contours);
        layers.kamrupRural?.setVisible?.(!!soiLayerVisibility.kamrupRural);
        layers.majorTowns?.setVisible?.(!!soiLayerVisibility.majorTowns);
        layers.name?.setVisible?.(!!soiLayerVisibility.name);
        layers.railwayTracks?.setVisible?.(!!soiLayerVisibility.railwayTracks);
        layers.roads?.setVisible?.(!!soiLayerVisibility.roads);
        layers.roadsAllWeatherMotorable?.setVisible?.(!!soiLayerVisibility.roadsAllWeatherMotorable);
        layers.roadsMotorableInFairWeather?.setVisible?.(!!soiLayerVisibility.roadsMotorableInFairWeather);
        layers.roadsNationalHighway?.setVisible?.(!!soiLayerVisibility.roadsNationalHighway);
        layers.roadOthers?.setVisible?.(!!soiLayerVisibility.roadOthers);
        layers.roadTunnel?.setVisible?.(!!soiLayerVisibility.roadTunnel);
        layers.stateHighway?.setVisible?.(!!soiLayerVisibility.stateHighway);
        layers.buildingFootprint?.setVisible?.(!!soiLayerVisibility.buildingFootprint);
        layers.roadSurface?.setVisible?.(!!soiLayerVisibility.roadSurface);
        layers.busStop?.setVisible?.(!!soiLayerVisibility.busStop);
        layers.block?.setVisible?.(!!soiLayerVisibility.block);
        layers.skytronAssamCombined?.setVisible?.(!!soiLayerVisibility.skytronAssamCombined && showAssamCombined);
        layers.assamTowns?.setVisible?.(!!soiLayerVisibility.assamTowns);
    }, [mapType, soiLayerVisibility]);

    useEffect(() => {
        if (mapType !== "soi") return;
        const soiMap = soiMapRef.current;
        if (!soiMap) return;
        const handleMoveEnd = () => {
            const zoomLevel = soiMap.getView().getZoom();
            const showAssamCombined = zoomLevel >= 5;
            const layers = soiLayersRef.current;
            if (layers.skytronAssamCombined) {
                layers.skytronAssamCombined.setVisible(!!soiLayerVisibility.skytronAssamCombined && showAssamCombined);
            }
        };
        soiMap.on('moveend', handleMoveEnd);
        return () => {
            soiMap.un('moveend', handleMoveEnd);
        };
    }, [mapType, soiLayerVisibility]);

    // Initialize Satellite Map (OpenLayers)
    useEffect(() => {
        if (mapType !== "satellite" || !satelliteMapContainerRef.current) return;

        try {
            // OSM Satellite layer
            const osmLayer = new TileLayer({
                title: "OSM Satellite",
                source: new XYZ({
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attributions: " Esri",
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
            vectorLayerByTypeRef.current.satellite = initialVectorLayer;
            setDynamicOverlay(initialOverlay);
            setDrawVectorLayer(drawLayer);
            satelliteMapRef.current = satelliteMap;

            try {
                setTimeout(() => satelliteMap.updateSize(), 0);
            } catch (e) {
                // ignore
            }

            if (typeof onMapReady === "function") {
                onMapReady({
                    map: satelliteMap,
                    mapType: "satellite",
                    vectorLayer: initialVectorLayer,
                    poiVectorLayer: initialPoiVectorLayer,
                    drawVectorLayer: drawLayer,
                    overlay: initialOverlay,
                    baseLayers: {
                        osmLayer,
                    },
                });
            }
        } catch (error) {
            console.error("Error initializing satellite map:", error);
        }
    }, [mapType, center, zoom, onMapReady]);

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

                    lastClickedVehicleRef.current = {
                        imei: entryData?.imei,
                        coordinates,
                    };

                    void (async () => {
                        const trackingDetail = await fetchVehicleTrackingDetail(entryData);
                        const resolvedEntry = mergePoliceFields(entryData, trackingDetail);
                        renderVehicleOverlay(
                            resolvedEntry,
                            coordinates,
                            alertType,
                            alertClass,
                            speedValue,
                            selectButtonHtml
                        );

                        // Add click handler for select button if it exists
                        if (onMarkerClick) {
                            setTimeout(() => {
                                const selectBtn = document.getElementById('select-vehicle-btn');
                                if (selectBtn) {
                                    selectBtn.onclick = () => {
                                        onMarkerClick(resolvedEntry);
                                        dynamicOverlay.getElement().style.display = "none";
                                    };
                                }
                            }, 0);
                        }
                    })();

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

    // Render POIs
    useEffect(() => {
        if (!map || !poiVectorLayer) return;

        poiVectorLayer.getSource().clear();

        if (pois && pois.length > 0) {
            const features = pois
                .map((poi) => {
                    if (!poi.location) return null;

                    try {
                        let geometry = null;
                        const locationData = JSON.parse(poi.location);

                        if (!Array.isArray(locationData) || locationData.length === 0) return null;

                        // Check mark_type and create appropriate geometry
                        // Note: Data format assumes [lat, lon], OL expects [lon, lat]
                        if (poi.mark_type === "Point") {
                            const lat = Number(locationData[0][0]);
                            const lon = Number(locationData[0][1]);
                            if (Number.isFinite(lat) && Number.isFinite(lon)) {
                                geometry = new Point([lon, lat]);
                            }
                        } else if (poi.mark_type === "Polygon" || poi.mark_type === "Circle") {
                            // Treat Circle as Polygon for now as per getPoiStyles
                            const coords = locationData.map((pt) => [Number(pt[1]), Number(pt[0])]);
                            geometry = new Polygon([coords]);
                        } else if (poi.mark_type === "Road") {
                            const coords = locationData.map((pt) => [Number(pt[1]), Number(pt[0])]);
                            geometry = new LineString(coords);
                        }

                        if (!geometry) return null;

                        const feature = new Feature({
                            geometry: geometry,
                            poiData: poi,
                        });

                        feature.setStyle(getPoiStyles(poi));
                        return feature;
                    } catch (error) {
                        return null;
                    }
                })
                .filter(Boolean);

            poiVectorLayer.getSource().addFeatures(features);
        }
    }, [pois, map, poiVectorLayer]);

    // Draw Routes with full path coordinates
    useEffect(() => {
        if (!routeVectorLayer || !routes) return;

        const source = routeVectorLayer.getSource();
        source.clear();

        routes.forEach(route => {
            if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
                // Use full path coordinates from Bhuvan API
                const feature = new Feature({
                    geometry: new LineString(route.coordinates),
                    type: route.type,
                    distance: route.distance,
                    time: route.time
                });
                source.addFeature(feature);
            } else if (route.from && route.to) {
                // Fallback to straight line if no coordinates
                const feature = new Feature({
                    geometry: new LineString([route.from, route.to]),
                    type: route.type
                });
                source.addFeature(feature);
            }
        });

    }, [routes, routeVectorLayer]);

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
                            <Tooltip title="SOI Map - Bhuvan base + SOI overlays">
                                <Button
                                    onClick={() => setMapType("soi")}
                                    variant={mapType === "soi" ? "contained" : "outlined"}
                                    sx={{
                                        backgroundColor:
                                            mapType === "soi" ? "#1976d2" : "transparent",
                                        color: mapType === "soi" ? "white" : "inherit",
                                    }}
                                >
                                    SOI
                                </Button>
                            </Tooltip>
                        </ButtonGroup>

                        {mapType === "soi" && showSoiLayerPanel && (
                            <Paper
                                elevation={3}
                                sx={{ mt: 1, p: 1, borderRadius: 1, width: 220, maxHeight: 320, overflowY: "auto" }}
                            >
                                <Typography variant="caption" fontWeight={700} sx={{ display: "block", mb: 0.5 }}>
                                    SOI Layers
                                </Typography>
                                <Divider sx={{ mb: 0.5 }} />
                                {(
                                    [
                                        { key: "states", label: "States" },
                                        { key: "assamStateBdy", label: "ASSAM State BDY" },
                                        { key: "assamDistrict", label: "ASSAM District BDY" },
                                        { key: "assamDistrictBdy2", label: "ASSAM District BDY2" },
                                        { key: "assamDistrictHq", label: "ASSAM District HQ" },
                                        { key: "assamSubdistrictBdy", label: "ASSAM Subdistrict BDY" },
                                        { key: "kamrupRural", label: "Kamrup Rural" },
                                        { key: "cartTrackHills", label: "Cart Track Hills" },
                                        { key: "contours", label: "Contours" },
                                        { key: "majorTowns", label: "Major Towns HQ" },
                                        { key: "name", label: "Name" },
                                        { key: "railwayTracks", label: "Railway Tracks" },
                                        { key: "roads", label: "Roads" },
                                        { key: "roadsAllWeatherMotorable", label: "Roads All Weather" },
                                        { key: "roadsMotorableInFairWeather", label: "Roads Fair Weather" },
                                        { key: "roadsNationalHighway", label: "National Highway" },
                                        { key: "stateHighway", label: "State Highway" },
                                        { key: "roadTunnel", label: "Road Tunnel" },
                                        { key: "roadOthers", label: "Road Others" },
                                        { key: "buildingFootprint", label: "Building Footprint" },
                                        { key: "roadSurface", label: "Road Surface" },
                                        { key: "busStop", label: "Bus Stop" },
                                        { key: "block", label: "Block" },
                                        { key: "skytronAssamCombined", label: "Assam Combined (skytron)" },
                                        { key: "assamTowns", label: "Assam Towns (skytron)" },
                                    ]
                                ).map((item) => (
                                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <Typography variant="caption">{item.label}</Typography>
                                        <Switch
                                            size="small"
                                            checked={!!soiLayerVisibility[item.key]}
                                            onChange={(e) =>
                                                setSoiLayerVisibility((p) => ({
                                                    ...p,
                                                    [item.key]: e.target.checked,
                                                }))
                                            }
                                        />
                                    </Box>
                                ))}
                            </Paper>
                        )}
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
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: "5px",
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

                {/* SOI Map Container */}
                {mapType === "soi" && (
                    <div
                        ref={soiMapContainerRef}
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
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: "5px",
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
                                    src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                                    style={{
                                        position: "absolute",
                                        bottom: "5px",
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
          width: 240px;
          min-width: 240px;
          max-width: 240px;
          height: 260px;
          max-height: 260px;
          display: flex;
          flex-direction: column;
          font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 10px;
          color: #1f2933;
        }

        .overlay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
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

        .overlay-tabs {
          border-top: 1px solid #f1f5f9;
          padding-top: 6px;
          margin-top: 3px;
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .overlay-tab-list {
          display: flex;
          gap: 4px;
          margin-bottom: 6px;
          flex: 0 0 auto;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .overlay-tab {
          appearance: none;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #374151;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 7px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
        }

        .overlay-tab--active {
          background: #eef2ff;
          border-color: #c7d2fe;
          color: #1e3a8a;
        }

        .overlay-panel {
          display: none;
          max-height: 180px;
          overflow: auto;
          padding-right: 2px;
          overflow-x: hidden;
          flex: 1 1 auto;
          min-height: 0;
        }

        .overlay-panel--active {
          display: block;
        }

        .overlay-section {
          border: 1px solid #eef2f7;
          border-radius: 8px;
          padding: 6px 8px;
          background: #ffffff;
        }

        .overlay-section-title {
          font-size: 12px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .overlay-section-body {
          display: grid;
          row-gap: 4px;
        }

        .overlay-row {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 8px;
          align-items: baseline;
        }

        .overlay-row--multiline {
          align-items: start;
        }

        .overlay-label {
          font-size: 11px;
          color: #6b7280;
          white-space: nowrap;
        }

        .overlay-value {
          font-size: 11px;
          font-weight: 500;
          color: #111827;
          text-align: left;
        }

        .overlay-value--multiline {
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          text-align: left;
          max-width: none;
          line-height: 1.2;
          overflow: visible;
        }
      `}</style>
        </div>
    );
};

export default BhuvanMapComponent;
