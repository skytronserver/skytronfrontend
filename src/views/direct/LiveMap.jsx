
import React, { useEffect, useRef, useState } from "react";
import { useTheme, alpha } from '@mui/material/styles';
import {
  Button,
  ButtonGroup,
  Tooltip,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  InputBase,
  Divider,
  Collapse,
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  Layers as LayersIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Map as MapIcon,
  Satellite as SatelliteIcon,
  Public as PublicIcon,
  Hd as HdIcon,
  Terrain as TerrainIcon
} from "@mui/icons-material";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, TileWMS, XYZ, Cluster } from "ol/source";
import { ZoomSlider, FullScreen, ScaleLine } from "ol/control";
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
import POIService from "../../services/POIService";
import axios from "axios";
import { renderSecureIncidentMedia } from "../../utils/incidentImageLoader";

const formatDateDDMMYY = (raw) => {
  if (!raw || raw.length < 8) return raw || "-";
  const d = raw.slice(0, 2);   // 16
  const m = raw.slice(2, 4);   // 12
  const y = raw.slice(6, 8);   // 25 from 2025
  return `${d}-${m}-${y}`;
};

const formatTimeHHMMSS = (raw) => {
  if (!raw || raw.length < 6) return raw || "-";

  const h24 = parseInt(raw.slice(0, 2), 10); // 0–23
  const m = raw.slice(2, 4);
  const s = raw.slice(4, 6);

  if (Number.isNaN(h24)) return raw;

  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12; // 0 -> 12 AM/PM

  const h = String(h12).padStart(2, "0");
  return `${h}:${m}:${s} ${period}`;
};

const MAPPLS_TOKEN_ENV_KEYS = [
  "REACT_APP_MAPPLS_TOKEN",
  "REACT_APP_MAPPLS_REST_KEY",
  "REACT_APP_MAPPLS_MAP_KEY",
  "REACT_APP_MAPPLS_API_KEY",
];

const DEFAULT_HD_CENTER = { lat: 26.1445, lng: 91.7362 };

const resolveMapplsToken = () => {
  if (typeof process !== "undefined" && process?.env) {
    for (const key of MAPPLS_TOKEN_ENV_KEYS) {
      const value = process.env[key];
      if (value) {
        return value;
      }
    }
  }

  if (typeof document !== "undefined") {
    const scripts = Array.from(document.getElementsByTagName("script"));
    const sdkScript = scripts.find((script) =>
      script.src && (
        script.src.includes("mappls.com/advancedmaps/api/") ||
        script.src.includes("mappls.com/map/sdk/")
      )
    );

    if (sdkScript) {
      // Try legacy path-based token
      const match = sdkScript.src.match(/api\/([^/]+)\/map_sdk/i);
      if (match && match[1]) {
        return match[1];
      }

      // Try query param based token (new SDK)
      try {
        const url = new URL(sdkScript.src);
        const accessToken = url.searchParams.get("access_token");
        if (accessToken) return accessToken;
      } catch (e) {
        // Fallback regex if URL parsing fails
        const tokenMatch = sdkScript.src.match(/[?&]access_token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) return tokenMatch[1];
      }
    }
  }

  return null;
};

const findFirstValidLatLng = (entries) => {
  if (!Array.isArray(entries)) return null;

  for (const item of entries) {
    const latValue = item?.latitude ?? item?.lat;
    const lngValue = item?.longitude ?? item?.lng ?? item?.lon;

    const lat = Number(latValue);
    const lng = Number(lngValue);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return null;
};

const setMapCenterSafely = (mapInstance, lat, lng) => {
  if (!mapInstance || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

  // Mappls prefers object format {lat, lng}, but we try both formats
  try {
    if (typeof mapInstance.setCenter === "function") {
      mapInstance.setCenter([lng, lat]);
      return;
    }
  } catch (primaryError) {
    try {
      mapInstance.setCenter({ lat, lng });
      return;
    } catch (secondaryError) {
      try {
        mapInstance.panTo?.([lng, lat]);
        return;
      } catch (tertiaryError) {
        console.warn(
          "Unable to update Mappls map center",
          primaryError,
          secondaryError,
          tertiaryError
        );
      }
    }
  }

  try {
    mapInstance.panTo?.({ lat, lng });
  } catch (error) {
    // Silently ignore - best effort
  }
};

const MAPPLS_HD_POPUP_STYLE_ID = "mappls-hd-popup-styles";

const ensureHdPopupStyles = () => {
  if (typeof document === "undefined") return;

  if (document.getElementById(MAPPLS_HD_POPUP_STYLE_ID)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = MAPPLS_HD_POPUP_STYLE_ID;
  styleElement.textContent = `
    .mappls-hd-popup-card {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 8px 10px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      border: 1px solid rgba(0, 0, 0, 0.08);
      min-width: 170px;
      max-width: 200px;
      font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 11px;
      color: #1f2933;
    }

    .mappls-hd-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      gap: 8px;
    }

    .mappls-hd-popup-title {
      font-weight: 600;
      font-size: 13px;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mappls-hd-popup-pill {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      border: 1px solid transparent;
    }

    .mappls-hd-popup-pill--normal {
      background-color: #ecfdf3;
      color: #15803d;
      border-color: #bbf7d0;
    }

    .mappls-hd-popup-pill--alert {
      background-color: #fef2f2;
      color: #b91c1c;
      border-color: #fecaca;
    }

    .mappls-hd-popup-body {
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      margin-top: 4px;
      display: grid;
      row-gap: 4px;
    }

    .mappls-hd-popup-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .mappls-hd-popup-label {
      font-size: 11px;
      color: #6b7280;
    }

    .mappls-hd-popup-value {
      font-size: 11px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
    }

    .drawing-mode-active, 
    .drawing-mode-active * {
      cursor: crosshair!important;
    }
  `;

  document.head.appendChild(styleElement);
};

const formatDisplayValue = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const getMarkerLabelText = (entry, mode = "vehicle") => {
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
        entry.address ||
        entry.nearest_poi?.data?.address ||
        ""
      );
    }
    case "route": {
      const routeId = entry.route_id ||
        entry.route_ref?.id ||
        entry.device_tag_info?.route?.id ||
        entry.nearby_routes_within_100m?.[0]?.data?.id;
      return (
        entry.route_name ||
        entry.route ||
        (routeId ? `Route: ${routeId}` : "") ||
        entry.route_info ||
        entry.routeInformation ||
        entry.route_ref?.name ||
        ""
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

const buildHdPopupHtml = (entry, markerLabelMode = "vehicle") => {
  const displayLabel = getMarkerLabelText(entry, markerLabelMode) || "-";
  const alertType = formatDisplayValue(entry?.packet_type, "NR");
  const alertClass =
    alertType === "NR" ? "mappls-hd-popup-pill--normal" : "mappls-hd-popup-pill--alert";

  const speedValue =
    typeof entry?.speed === "number" && entry.speed > 2
      ? `${entry.speed.toFixed(2)} km / h`
      : "0 km/h";

  const dateValue = formatDisplayValue(entry?.date);
  const timeValue = formatDisplayValue(entry?.time);
  const addressValue = formatDisplayValue(entry?.address);
  const nearestStationValue =
    entry?.markerCategory === "police" ? formatDisplayValue(entry?.nearestPoliceStation) : null;
  const policeContactValue =
    entry?.markerCategory === "police" ? formatDisplayValue(entry?.nearestPoliceContact) : null;
  const batteryValue = `${formatDisplayValue(
    entry?.internal_battery_voltage
  )
    } - ${formatDisplayValue(entry?.main_input_voltage)} `;

  const policeRows = [
    nearestStationValue
      ? `<div class="mappls-hd-popup-row"><span class="mappls-hd-popup-label">Nearest Police Station</span><span class="mappls-hd-popup-value">${nearestStationValue}</span></div>`
      : "",
    policeContactValue
      ? `<div class="mappls-hd-popup-row"><span class="mappls-hd-popup-label">Police Contact</span><span class="mappls-hd-popup-value">${policeContactValue}</span></div>`
      : "",
  ].join("");

  return `
  < div class="mappls-hd-popup-card" >
      <div class="mappls-hd-popup-header">
        <div class="mappls-hd-popup-title">${displayLabel}</div>
        <div class="mappls-hd-popup-pill ${alertClass}">${alertType}</div>
      </div>
      <div class="mappls-hd-popup-body">
        <div class="mappls-hd-popup-row">
          <span class="mappls-hd-popup-label">Date</span>
          <span class="mappls-hd-popup-value">${dateValue}</span>
        </div>
        <div class="mappls-hd-popup-row">
          <span class="mappls-hd-popup-label">Time</span>
          <span class="mappls-hd-popup-value">${timeValue}</span>
        </div>
        <div class="mappls-hd-popup-row">
          <span class="mappls-hd-popup-label">Address</span>
          <span class="mappls-hd-popup-value">${addressValue}</span>
        </div>
        ${policeRows}
        <div class="mappls-hd-popup-row">
          <span class="mappls-hd-popup-label">Speed</span>
          <span class="mappls-hd-popup-value">${speedValue}</span>
        </div>
        <div class="mappls-hd-popup-row">
          <span class="mappls-hd-popup-label">Battery</span>
          <span class="mappls-hd-popup-value">${batteryValue}</span>
        </div>
      </div>
    </div >
  `;
};

const ensureHdZoomLevel = (mapInstance, targetZoom = 12) => {
  if (!mapInstance) return;

  try {
    const currentZoom =
      typeof mapInstance.getZoom === "function" ? mapInstance.getZoom() : null;
    if (!Number.isFinite(currentZoom) || currentZoom < targetZoom) {
      if (typeof mapInstance.setZoom === "function") {
        mapInstance.setZoom(targetZoom);
      }
    }
  } catch (error) {
    // Ignore zoom errors - best effort only
  }
};

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
  policeData = [],
  incidentData = [],
  width = "100%",
  height = "400px",
  onVehicleClick,
  onPolygonComplete,
  autoFit = false, // Set to true to auto-fit map to markers, false to keep Guwahati center
  focusEntry = null,
  markerLabelMode = "vehicle",
  nmrArea = null,
}) => {
  const overlayElement = useRef();
  const lastClickedVehicleRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [dynamicOverlay, setDynamicOverlay] = useState(null);
  const [drawVectorLayer, setDrawVectorLayer] = useState(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [poiVectorLayer, setPoiVectorLayer] = useState(null);
  const [incidentVectorLayer, setIncidentVectorLayer] = useState(null);
  const [nmrVectorLayer, setNmrVectorLayer] = useState(null);
  const [pois, setPois] = useState([]);

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
  });

  // Map type state for 3-layer system
  const [mapType, setMapType] = useState("normal"); // 'normal', 'satellite', 'hd'
  const mapplsMapRef = useRef(null);
  const olMapRef = useRef(null);
  const normalMapRef = useRef(null);
  const olWasDraggingRef = useRef(false);
  const normalMapContainerRef = useRef(null);
  const satelliteMapContainerRef = useRef(null);
  const soiMapContainerRef = useRef(null);
  const hdMapContainerRef = useRef(null); // Mappls SDK Refs
  const hdMapInnerRef = useRef(null);
  const hdVehicleMarkersRef = useRef([]); // Store vehicle markers for HD map
  const hdPoiMarkersRef = useRef([]);     // Store POI markers for HD map
  const hdIncidentMarkersRef = useRef([]); // Store incident markers for HD map
  const mapplsInstanceRef = useRef(null);
  const mapplsInitializedRef = useRef(false);
  const mapplsInitInProgressRef = useRef(false);
  const mapplsLibraryPollRef = useRef(null);
  const hdMapContainerIdRef = useRef(null);

  // HD Map Drawing State & Refs
  const [drawingMode, setDrawingMode] = useState(null); // 'polygon' or null
  const [drawingPoints, setDrawingPoints] = useState([]);
  const tempPolyRef = useRef(null);
  const tempMarkersRef = useRef([]);

  // Geocoding State
  const [geoSearchQuery, setGeoSearchQuery] = useState('');
  const [geoSearchResults, setGeoSearchResults] = useState([]); // Store search results
  const [showVehicles, setShowVehicles] = useState(true);
  const [showPois, setShowPois] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);
  const [geoSearchLoading, setGeoSearchLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const MAPPLS_GEOCODING_TOKEN = "hbetrqpnyaoqssztkakwzjjmoxkowalvbwus";
  const theme = useTheme();

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
          entry.device_tag_info?.state_info?.state ||
          entry.district ||
          entry.address ||
          entry.nearest_poi?.data?.address ||
          ""
        );
      }
      case "route": {
        const routeId = entry.route_id ||
          entry.route_ref?.id ||
          entry.device_tag_info?.route?.id ||
          entry.nearby_routes_within_100m?.[0]?.data?.id;
        return (
          entry.route_name ||
          entry.route ||
          (routeId ? `Route: ${routeId}` : "") ||
          entry.route_info ||
          entry.routeInformation ||
          entry.route_ref?.name ||
          ""
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

  const getVehicleMarkerIconUrl = (color, vehicleType) => {
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

    const allowedColors = ["red", "orange", "blue", "green", "grey", "default"];
    const safeColor = allowedColors.includes(color) ? color : "default";

    try {
      return require(`../../assets/images/${safeColor}/${iconType}.png`);
    } catch (error) {
      try {
        return require(`../../assets/images/default/bus.png`);
      } catch (fallbackError) {
        console.error("Failed to resolve vehicle icon for HD map marker", {
          error,
          fallbackError,
        });
        return null;
      }
    }
  };

  const getPoiMarkerIcon = (color) => {
    const safeColor = color || "#1E88E5";
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g fill="none" fill-rule="evenodd">
          <path d="M0 0h24v24H0z"/>
          <path fill="${safeColor}" d="M12 2c4.418 0 8 3.134 8 7 0 5.25-8 13-8 13S4 14.25 4 9c0-3.866 3.582-7 8-7Zm0 4a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 6Z"/>
        </g>
      </svg>`;

    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return `data:image/svg+xml;base64,${window.btoa(svg)}`;
    }

    return null;
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

  const clusterStyleFunction = (feature) => {
    const features = feature.get('features');
    const size = features.length;

    if (size === 1) {
      // Return the style of the original feature
      return features[0].getStyle();
    }

    return new Style({
      image: new CircleStyle({
        radius: 12 + Math.min(size * 0.5, 8),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        fill: new Fill({ color: '#1976d2' }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: '#fff' }),
        font: 'bold 12px "Roboto", sans-serif',
      }),
    });
  };

  // Initialize Normal Map (Default)
  useEffect(() => {
    if (mapType !== "normal" || !normalMapContainerRef.current) return;

    // Create the three WMS layers matching POIViewer.jsx configuration exactly
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
        center: [91.7362, 26.1445], // Guwahati, Assam
        zoom: 6,
        maxZoom: 32,
        constrainResolution: true,
      }),

      controls: [
        new ZoomSlider(),
        new FullScreen(),
        // new ScaleLine()
      ],

      pixelRatio: 1,
    });

    // Initialize vector layer for markers
    // Initialize vector layer for markers (with Clustering)
    const initialVectorLayer = new VectorLayer({
      source: new Cluster({
        distance: 40,
        source: new VectorSource(),
      }),
      zIndex: 200,
      style: clusterStyleFunction,
    });
    initialMap.addLayer(initialVectorLayer);

    // Initialize POI vector layer
    const poiSource = new VectorSource();
    const initialPoiVectorLayer = new VectorLayer({
      source: poiSource,
      zIndex: 100,
      declutter: true,
      visible: false,
    });
    initialMap.addLayer(initialPoiVectorLayer);
    setPoiVectorLayer(initialPoiVectorLayer);

    // Initialize incident vector layer
    const incidentSource = new VectorSource();
    const initialIncidentVectorLayer = new VectorLayer({
      source: incidentSource,
      zIndex: 300,
      visible: false,
    });
    initialMap.addLayer(initialIncidentVectorLayer);
    setIncidentVectorLayer(initialIncidentVectorLayer);

    // Initialize NMR circle vector layer
    const nmrSource = new VectorSource();
    const initialNmrVectorLayer = new VectorLayer({
      source: nmrSource,
      zIndex: 250,
      visible: true,
    });
    initialMap.addLayer(initialNmrVectorLayer);
    setNmrVectorLayer(initialNmrVectorLayer);

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
          center: [91.7362, 26.1445],
          zoom: 13,
          maxZoom: 22,
          constrainResolution: true,
        }),
        controls: [
          new ZoomSlider(),
          new FullScreen(),
          new ScaleLine()
        ],
        pixelRatio: 1,
      });

      // Initialize vector layer for markers
      // Initialize vector layer for markers (with Clustering)
      const initialVectorLayer = new VectorLayer({
        source: new Cluster({
          distance: 40,
          source: new VectorSource(),
        }),
        zIndex: 200,
        style: clusterStyleFunction,
      });
      satelliteMap.addLayer(initialVectorLayer);

      // Initialize POI vector layer
      const poiSource = new VectorSource();
      const initialPoiVectorLayer = new VectorLayer({
        source: poiSource,
        zIndex: 100,
        declutter: true,
        visible: false,
      });
      satelliteMap.addLayer(initialPoiVectorLayer);
      setPoiVectorLayer(initialPoiVectorLayer);

      // Initialize incident vector layer for satellite
      const incidentSource = new VectorSource();
      const initialIncidentVectorLayer = new VectorLayer({
        source: incidentSource,
        zIndex: 300,
        visible: false,
      });
      satelliteMap.addLayer(initialIncidentVectorLayer);
      setIncidentVectorLayer(initialIncidentVectorLayer);

      // Initialize NMR circle vector layer for satellite
      const nmrSource = new VectorSource();
      const initialNmrVectorLayer = new VectorLayer({
        source: nmrSource,
        zIndex: 250,
        visible: true,
      });
      satelliteMap.addLayer(initialNmrVectorLayer);
      setNmrVectorLayer(initialNmrVectorLayer);

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
      olMapRef.current = satelliteMap;
    } catch (error) {
      console.error("Error initializing satellite map:", error);
    }

    return () => {
      if (olMapRef.current) {
        olMapRef.current.setTarget(null);
        olMapRef.current = null;
      }
    };
  }, [mapType]);

  // Initialize Survey of India Map
  useEffect(() => {
    if (mapType !== "soi" || !soiMapContainerRef.current) return;

    try {
      const geoserverURL = "https://map.gromed.in/geoserver/skytron/wms";

      // Bhuvan base map (same as normal map)
      const bhuvanIndia3Layer = new TileLayer({
        source: createBhuvanSource("india3"),
        zIndex: 0,
      });

      const bhuvanAdminLayer = new TileLayer({
        source: createBhuvanSource("basemap%3Aadmin_group"),
        zIndex: 1,
      });

      const bhuvanRoadsLayer = new TileLayer({
        source: createBhuvanSource("mmi:mmi_india"),
        zIndex: 2,
      });

      // SOI / skytron overlays
      const soiStatesLayer = new TileLayer({
        title: "States",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:states",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.7,
        visible: soiLayerVisibility.states,
        zIndex: 10,
      });

      const soiAssamDistrictLayer = new TileLayer({
        title: "ASSAM District Boundary",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ASSAM_DISTRICT_BDY",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.8,
        visible: soiLayerVisibility.assamDistrict,
        zIndex: 11,
      });

      const soiAssamDistrictBdy2Layer = new TileLayer({
        title: "ASSAM District Boundary 2",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ASSAM_DISTRICT_BDY2",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.8,
        visible: soiLayerVisibility.assamDistrictBdy2,
        zIndex: 12,
      });

      const soiAssamDistrictHqLayer = new TileLayer({
        title: "ASSAM District HQ",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ASSAM_DISTRICT_HQ",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.assamDistrictHq,
        zIndex: 13,
      });

      const soiAssamStateBdyLayer = new TileLayer({
        title: "ASSAM State Boundary",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ASSAM_STATE_BDY",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.8,
        visible: soiLayerVisibility.assamStateBdy,
        zIndex: 14,
      });

      const soiAssamSubdistrictBdyLayer = new TileLayer({
        title: "ASSAM Subdistrict Boundary",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ASSAM_SUBDISTRICT_BDY",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.8,
        visible: soiLayerVisibility.assamSubdistrictBdy,
        zIndex: 15,
      });

      const soiCartTrackHillsLayer = new TileLayer({
        title: "Cart Track Hills",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:CART_TRACK_HILLS",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.cartTrackHills,
        zIndex: 16,
      });

      const soiContoursLayer = new TileLayer({
        title: "Contours",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:Contours",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.8,
        visible: soiLayerVisibility.contours,
        zIndex: 12,
      });

      const soiKamrupRuralLayer = new TileLayer({
        title: "Kamrup Rural",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:KAMRUP_RURAL",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.kamrupRural,
        zIndex: 17,
      });

      const soiMajorTownsLayer = new TileLayer({
        title: "Major Towns / Headquarters",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:MajortownsHeadquarters",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.majorTowns,
        zIndex: 13,
      });

      const soiNameLayer = new TileLayer({
        title: "Name",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:NAME",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.name,
        zIndex: 18,
      });

      const soiRailwayTracksLayer = new TileLayer({
        title: "Railway Tracks",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:RailwayTracks",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.railwayTracks,
        zIndex: 14,
      });

      const soiRoadsLayer = new TileLayer({
        title: "SOI Roads",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:Roads",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.roads,
        zIndex: 15,
      });

      const soiRoadsAllWeatherMotorableLayer = new TileLayer({
        title: "Roads (All Weather Motorable)",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ROADS_ALL_WEATHER_MOTORABLE",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.roadsAllWeatherMotorable,
        zIndex: 19,
      });

      const soiRoadsMotorableInFairWeatherLayer = new TileLayer({
        title: "Roads (Motorable in Fair Weather)",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ROADS_MOTORABLE_IN_FAIR_WEATHER",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.roadsMotorableInFairWeather,
        zIndex: 20,
      });

      const soiRoadsNationalHighwayLayer = new TileLayer({
        title: "Roads (National Highway)",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ROADS_NATIONAL_HIGHWAY",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.roadsNationalHighway,
        zIndex: 21,
      });

      const soiRoadOthersLayer = new TileLayer({
        title: "Road Others",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ROAD_OTHERS",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.roadOthers,
        zIndex: 22,
      });

      const soiRoadTunnelLayer = new TileLayer({
        title: "Road Tunnel",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:ROAD_TUNNEL",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.roadTunnel,
        zIndex: 23,
      });

      const soiStateHighwayLayer = new TileLayer({
        title: "State Highway",
        source: new TileWMS({
          url: geoserverURL,
          params: {
            LAYERS: "skytron:STATE_HIGHWAY",
            TILED: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        opacity: 0.9,
        visible: soiLayerVisibility.stateHighway,
        zIndex: 24,
      });

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
      };

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
        ],
        view: new View({
          projection: "EPSG:4326",
          center: [91.7362, 26.1445],
          zoom: 13,
          maxZoom: 19,
          constrainResolution: true,
        }),
        pixelRatio: 1,
      });

      // Initialize vector layer for markers
      // Initialize vector layer for markers (with Clustering)
      const initialVectorLayer = new VectorLayer({
        source: new Cluster({
          distance: 40,
          source: new VectorSource(),
        }),
        zIndex: 200,
        style: clusterStyleFunction,
      });
      soiMap.addLayer(initialVectorLayer);

      // Initialize POI vector layer
      const poiSource = new VectorSource();
      const initialPoiVectorLayer = new VectorLayer({
        source: poiSource,
        zIndex: 100,
        declutter: true,
      });
      soiMap.addLayer(initialPoiVectorLayer);
      setPoiVectorLayer(initialPoiVectorLayer);

      // Initialize incident vector layer for SOI
      const incidentSource = new VectorSource();
      const initialIncidentVectorLayer = new VectorLayer({
        source: incidentSource,
        zIndex: 300,
        visible: false,
      });
      soiMap.addLayer(initialIncidentVectorLayer);
      setIncidentVectorLayer(initialIncidentVectorLayer);

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
      soiMap.addLayer(drawLayer);

      // Create dynamic overlay
      const initialOverlay = new Overlay({
        element: overlayElement.current,
      });
      soiMap.addOverlay(initialOverlay);

      setMap(soiMap);
      setVectorLayer(initialVectorLayer);
      setDynamicOverlay(initialOverlay);
      setDrawVectorLayer(drawLayer);

    } catch (error) {
      console.error("Error initializing SOI map:", error);
    }

    return () => {
      // Cleanup logic if needed, but usually strictly setting target null is enough for OL
      // React strict mode might cause double init so we just let it be replaced
    };
  }, [mapType]);

  useEffect(() => {
    const layers = soiLayersRef.current;
    if (!layers) return;

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
  }, [soiLayerVisibility]);

  // Initialize HD Map (Mappls)
  useEffect(() => {
    if (mapType !== "hd" || !hdMapContainerRef.current) return;

    let isMounted = true;

    const cleanup = () => {
      if (mapplsLibraryPollRef.current) {
        clearInterval(mapplsLibraryPollRef.current);
        mapplsLibraryPollRef.current = null;
      }

      // Clear all markers first
      hdVehicleMarkersRef.current.forEach((marker) => {
        try {
          marker?.remove?.();
        } catch (e) { }
      });
      hdPoiMarkersRef.current.forEach((marker) => {
        try {
          marker?.remove?.();
        } catch (e) { }
      });

      // Try to remove/destroy the map instance
      if (mapplsMapRef.current) {
        try {
          if (typeof mapplsMapRef.current.remove === "function") {
            mapplsMapRef.current.remove();
          }
        } catch (e) {
          console.warn("Error removing HD map:", e);
        }
      }

      if (hdMapInnerRef.current) {
        hdMapInnerRef.current.innerHTML = "";
      }

      hdMapContainerIdRef.current = null;
      mapplsMapRef.current = null;
      hdVehicleMarkersRef.current = [];
      hdPoiMarkersRef.current = [];
    };

    const instantiateHdMap = () => {
      if (!isMounted || !hdMapInnerRef.current) return;

      const mapplsInstance = mapplsInstanceRef.current;
      if (!mapplsInstance || typeof mapplsInstance.Map !== "function") {
        console.error("Mappls instance is not ready or Map method unavailable");
        return;
      }

      // If map already exists, don't reset it - just return
      if (mapplsMapRef.current) {
        return;
      }

      // Use fixed Guwahati center like normal map, not dynamic GPS data
      const initialCenter = DEFAULT_HD_CENTER;

      const hostElement = hdMapInnerRef.current;
      if (!hostElement) return;
      hostElement.innerHTML = "";

      const mapElement = document.createElement("div");
      mapElement.style.width = "100%";
      mapElement.style.height = "100%";
      const containerId = `mappls-hd-map-${Date.now()}`;
      mapElement.id = containerId;
      hdMapContainerIdRef.current = containerId;
      hostElement.appendChild(mapElement);

      try {
        const centerToUse = { lng: 91.7362, lat: 26.1445 };
        console.log('Creating HD map with center:', centerToUse);

        const hdMap = mapplsInstance.Map({
          id: containerId,
          properties: {
            center: [26.1445, 91.7362], // Guwahati - [lat, lng] array format
            draggable: true,
            zoom: 13,
            minZoom: 4,
            maxZoom: 18,
            backgroundColor: "#fff",
            traffic: false,
            geolocation: false,
            disableDoubleClickZoom: false,
            fullscreenControl: false,
            scrollWheel: true,
            scrollZoom: true,
            rotateControl: false,
            scaleControl: false,
            zoomControl: false,
            clickableIcons: true,
          },
        });

        console.log('HD map created, instance:', hdMap);

        // Mappls ignores center in properties, set it explicitly
        const guwahatiCenter = { lng: 91.7362, lat: 26.1445 };

        if (typeof hdMap.setCenter === 'function') {
          hdMap.setCenter(guwahatiCenter);
        }

        if (typeof hdMap.setZoom === 'function') {
          hdMap.setZoom(14);
        }

        // Verify after a short delay
        setTimeout(() => {
          if (typeof hdMap.getCenter === 'function') {
            const actualCenter = hdMap.getCenter();
            console.log('HD map center after setCenter:', actualCenter);
          }
        }, 100);

        mapplsMapRef.current = hdMap;

        // Hide Mappls controls using CSS after map loads
        setTimeout(() => {
          try {
            const mapContainer = document.getElementById(containerId);
            if (mapContainer) {
              // Hide all Mappls control elements
              const style = document.createElement('style');
              style.id = 'mappls-controls-hide';
              style.textContent = `
                #${containerId} .mappls-ctrl-zoom,
                #${containerId} .mappls-ctrl-fullscreen,
                #${containerId} .mappls-ctrl-rotate,
                #${containerId} .mappls-ctrl-scale,
                #${containerId} .mappls-ctrl-geolocate,
                #${containerId} .mapboxgl-ctrl-zoom-in,
                #${containerId} .mapboxgl-ctrl-zoom-out,
                #${containerId} .mapboxgl-ctrl-compass,
                #${containerId} .mapboxgl-ctrl-scale,
                #${containerId} .mapboxgl-ctrl-group,
                #${containerId} .mapboxgl-ctrl-top-right,
                #${containerId} .mapboxgl-ctrl-bottom-right,
                #${containerId} .mapboxgl-ctrl-bottom-left {
                  display: none !important;
                }
              `;
              // Remove existing style if present
              const existingStyle = document.getElementById('mappls-controls-hide');
              if (existingStyle) {
                existingStyle.remove();
              }
              document.head.appendChild(style);
            }
          } catch (error) {
            console.warn('Could not hide Mappls controls:', error);
          }
        }, 500);

        // Map will use the initial center set in properties above
        // Don't reset on load event to preserve user's zoom/pan
      } catch (error) {
        console.error("Failed to create Mappls HD map instance", error);
      }
    };

    const ensureMapplsInitialized = () => {
      if (!isMounted) return;

      if (!mapplsInstanceRef.current) {
        try {
          let instanceCandidate = null;

          if (typeof window.mappls === "function") {
            try {
              instanceCandidate = new window.mappls();
            } catch (ctorError) {
              instanceCandidate = window.mappls();
            }
          } else if (window.mappls) {
            instanceCandidate = window.mappls;
          }

          if (!instanceCandidate) {
            throw new Error("Mappls SDK instance could not be created");
          }

          mapplsInstanceRef.current = instanceCandidate;
        } catch (error) {
          console.error("Unable to instantiate Mappls SDK", error);
          return;
        }
      }

      const mapplsInstance = mapplsInstanceRef.current;
      const initializeFn = mapplsInstance?.initialize;

      if (mapplsInitializedRef.current) {
        instantiateHdMap();
        return;
      }

      if (mapplsInitInProgressRef.current) {
        return;
      }

      const token = resolveMapplsToken();

      if (!token) {
        console.error(
          "Mappls SDK token not found. Set REACT_APP_MAPPLS_TOKEN or include key in script URL."
        );
        return;
      }

      const markReady = () => {
        if (!isMounted) return;
        mapplsInitInProgressRef.current = false;
        mapplsInitializedRef.current = true;
        instantiateHdMap();
      };

      if (typeof initializeFn === "function") {
        mapplsInitInProgressRef.current = true;

        try {
          initializeFn.call(
            mapplsInstance,
            token,
            { map: true, plugins: ["marker"] },
            markReady
          );
        } catch (error) {
          mapplsInitInProgressRef.current = false;
          console.error("Failed to initialize Mappls SDK", error);
        }

        return;
      }

      // Some SDK variants expose a pre-initialized object without explicit initialize call.
      markReady();
    };

    if (window.mappls) {
      ensureMapplsInitialized();
    } else {
      mapplsLibraryPollRef.current = setInterval(() => {
        if (window.mappls) {
          clearInterval(mapplsLibraryPollRef.current);
          mapplsLibraryPollRef.current = null;
          ensureMapplsInitialized();
        }
      }, 400);
    }

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [mapType]); // Only reinitialize when map type changes, not on data updates

  // Plot vehicles and POIs on HD map
  useEffect(() => {
    if (mapType !== "hd" || !mapplsMapRef.current) return;

    const hdMap = mapplsMapRef.current;
    const mapplsInstance = mapplsInstanceRef.current;

    const markerFactoryAvailable =
      typeof mapplsInstance?.marker === "function" ||
      typeof window.mappls?.Marker === "function";

    if (!mapplsInstance || !markerFactoryAvailable) {
      console.warn(
        "Mappls marker plugin not ready. Skipping HD markers render for now."
      );
      return;
    }

    const clearVehicleMarkers = () => {
      hdVehicleMarkersRef.current.forEach((marker) => {
        try {
          marker?.remove?.();
        } catch (error) {
          console.warn("Error removing vehicle marker from HD map", error);
        }
      });
      hdVehicleMarkersRef.current = [];
    };

    const clearPoiMarkers = () => {
      hdPoiMarkersRef.current.forEach((marker) => {
        try {
          marker?.remove?.();
        } catch (error) {
          console.warn("Error removing POI marker from HD map", error);
        }
      });
      hdPoiMarkersRef.current = [];
    };

    const clearIncidentMarkers = () => {
      hdIncidentMarkersRef.current.forEach((marker) => {
        try {
          marker?.remove?.();
        } catch (error) {
          console.warn("Error removing incident marker from HD map", error);
        }
      });
      hdIncidentMarkersRef.current = [];
    };

    const createMarker = (options) => {
      const markerFactory = mapplsInstance?.marker;

      try {
        if (typeof markerFactory === "function") {
          return markerFactory.call(mapplsInstance, options);
        }

        if (typeof window.mappls?.Marker === "function") {
          try {
            return new window.mappls.Marker(options);
          } catch (ctorError) {
            return window.mappls.Marker(options);
          }
        }
      } catch (error) {
        console.error("Failed to create Mappls marker", { options, error });
      }

      return null;
    };

    clearVehicleMarkers();
    clearPoiMarkers();
    clearIncidentMarkers();

    let allMarkers = [];

    try {
      // Add vehicle markers
      allMarkers = [...gpsData, ...policeData];
      if (allMarkers.length > 0) {
        allMarkers.forEach((entry) => {
          const longitude = Number(entry.longitude);
          const latitude = Number(entry.latitude);

          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return;
          }

          const entryTime = new Date(entry.entry_time);
          const currentTime = new Date();
          const timeDifference = calculateTimeDifference(
            entryTime,
            currentTime
          );
          const isPoliceMarker = entry.markerCategory === "police";

          let markerColor = "blue";
          if (isPoliceMarker) {
            markerColor = "blue";
          } else if (entry.packet_type === "EA") {
            markerColor = "red";
          } else if (entry.packet_type !== "NR") {
            markerColor = "orange";
          } else if (String(entry.ignition_status) === "1" && entry.speed > 1) {
            markerColor = "green";
          } else if (String(entry.ignition_status) === "1" && entry.speed < 1) {
            markerColor = "blue";
          } else if (timeDifference > 5) {
            markerColor = "grey";
          }

          const vehicleType = entry?.device_tag_info?.category_info?.category;
          const iconUrl = getVehicleMarkerIconUrl(markerColor, vehicleType);

          // Build the styled popup HTML matching normal map
          ensureHdPopupStyles();
          const popupContent = buildHdPopupHtml(entry, markerLabelMode);
          const labelText = getMarkerLabelText(entry, markerLabelMode) || undefined;

          const markerOptions = iconUrl
            ? {
              map: hdMap,
              position: { lat: latitude, lng: longitude },
              icon: iconUrl,
              label: labelText,
              title: labelText,
              width: 60,
              height: 60,
              popupHtml: popupContent,
              popupOptions: {
                openPopup: false,
              },
            }
            : {
              map: hdMap,
              position: { lat: latitude, lng: longitude },
              label: labelText,
              title: labelText,
              popupHtml: popupContent,
              popupOptions: {
                openPopup: false,
              },
            };

          const markerInstance = createMarker(markerOptions);
          if (markerInstance) {
            hdVehicleMarkersRef.current.push(markerInstance);
          }
        });
      }

      // Add POI markers
      if (pois.length > 0) {
        pois.forEach((poi) => {
          try {
            const location = JSON.parse(poi.location);
            if (!Array.isArray(location) || location.length === 0) return;

            if (
              poi.mark_type === "Point" &&
              location[0] &&
              location[0].length === 2
            ) {
              const [lat, lon] = location[0];
              const longitude = Number(lon);
              const latitude = Number(lat);

              if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
                return;
              }

              const poiColor = getUseTypeColor(poi);
              const poiIconUrl = getPoiMarkerIcon(poiColor);

              const markerOptions = {
                map: showPois ? hdMap : null,
                position: { lat: latitude, lng: longitude },
                label: poi.name || undefined,
                title: poi.name || "Point of Interest",
                draggable: false,
                icon: poiIconUrl
                  ? {
                    url: poiIconUrl,
                    width: 28,
                    height: 36,
                  }
                  : undefined,
              };

              const markerInstance = createMarker(markerOptions);
              if (markerInstance) {
                hdPoiMarkersRef.current.push(markerInstance);
              }
            }
          } catch (error) {
            console.error("Error processing POI for HD map:", poi?.id, error);
          }
        });
      }
    } catch (error) {
      console.error("Error updating HD map markers:", error);
    }

    // Add Incident Markers
    if (incidentData.length > 0) {
      incidentData.forEach((incident) => {
        try {
          const longitude = Number(incident.longitude);
          const latitude = Number(incident.latitude);

          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

          const hdMediaContainerId = `incident-media-hd-${incident.id}-${Date.now()}`;

          const popupContent = `
            <div style="padding: 12px; min-width: 250px; font-family: 'Roboto', sans-serif;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                 <h4 style="margin: 0; color: #d32f2f; font-size: 16px;">Incident #${incident.id}</h4>
                 <span style="background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; border: 1px solid #ffcdd2;">ALERT</span>
              </div>
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151; line-height: 1.4;">${incident.details || "No details available."}</p>
              ${incident.image_file ? `<div id="${hdMediaContainerId}" style="margin-top: 8px;"></div>` : ''}
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
                 <span>Registered:</span>
                 <span style="font-weight: 500;">${incident.registered_at ? new Date(incident.registered_at).toLocaleString() : '-'}</span>
              </div>
            </div>
          `;

          const svgIcon = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L1 21H23L12 2Z" fill="#F44336" stroke="#B71C1C" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M12 9V15" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 18V18.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `;
          const iconUrl = `data:image/svg+xml;base64,${window.btoa(svgIcon)}`;

          const markerOptions = {
            map: showIncidents ? hdMap : null,
            position: { lat: latitude, lng: longitude },
            icon: {
              url: iconUrl,
              width: 40,
              height: 40
            },
            popupHtml: popupContent,
          };

          const markerInstance = createMarker(markerOptions);
          if (markerInstance) {
            hdIncidentMarkersRef.current.push(markerInstance);

            if (incident.image_file) {
              const loadMedia = () => {
                // Wait a tick for popup DOM to be mounted
                setTimeout(() => {
                  try {
                    renderSecureIncidentMedia(incident.image_file, hdMediaContainerId, {
                      maxWidth: "100%",
                      maxHeight: "160px",
                      borderRadius: "6px",
                    });
                  } catch (e) {
                    console.error("Failed to load secure incident media in HD popup", e);
                  }
                }, 50);
              };

              try {
                if (typeof markerInstance.addListener === "function") {
                  markerInstance.addListener("click", loadMedia);
                } else if (typeof markerInstance.on === "function") {
                  markerInstance.on("click", loadMedia);
                }
              } catch (e) {
                // Best-effort only (SDK variants differ)
              }
            }
          }
        } catch (error) {
          console.error("Error creating incident marker", error);
        }
      });
    }

    // Don't reset center/zoom on marker updates - let user control the map
    // Only set initial center/zoom when map is first created

    return () => {
      clearVehicleMarkers();
      clearPoiMarkers();
      clearIncidentMarkers();
    };
  }, [mapType, gpsData, policeData, pois, incidentData]);

  // HD Map Drawing Logic - Handle Clicks
  useEffect(() => {
    if (mapType !== 'hd' || !mapplsMapRef.current) return;

    const hdMap = mapplsMapRef.current;

    // Manage Cursor with CSS Class
    if (hdMapContainerIdRef.current) {
      const container = document.getElementById(hdMapContainerIdRef.current);
      if (container) {
        if (drawingMode === 'polygon') {
          container.classList.add('drawing-mode-active');
        } else {
          container.classList.remove('drawing-mode-active');
        }
      }
    }

    if (drawingMode !== 'polygon') return;

    const clickHandler = (e) => {
      let lat, lng;
      if (e.lngLat) { lat = e.lngLat.lat; lng = e.lngLat.lng; }
      else if (e.latLng) { lat = e.latLng.lat; lng = e.latLng.lng; }

      if (lat && lng) {
        setDrawingPoints(prev => [...prev, [lat, lng]]);
      }
    };

    if (hdMap.addListener) hdMap.addListener('click', clickHandler);
    else if (hdMap.on) hdMap.on('click', clickHandler);

    return () => {
      if (hdMap.removeListener) hdMap.removeListener('click', clickHandler);
      else if (hdMap.off) hdMap.off('click', clickHandler);

      // Cleanup cursor class
      if (hdMapContainerIdRef.current) {
        const container = document.getElementById(hdMapContainerIdRef.current);
        if (container) container.classList.remove('drawing-mode-active');
      }
    };
  }, [mapType, drawingMode]);

  // HD Map Drawing Logic - Visualization
  useEffect(() => {
    if (mapType !== 'hd' || !mapplsMapRef.current) return;
    const hdMap = mapplsMapRef.current;

    // Cleanup temp poly
    if (tempPolyRef.current) {
      try { tempPolyRef.current.remove(); } catch (e) { }
      tempPolyRef.current = null;
    }

    // Cleanup temp markers
    if (tempMarkersRef.current) {
      tempMarkersRef.current.forEach(m => {
        try { m.remove(); } catch (e) { }
      });
      tempMarkersRef.current = [];
    }

    if (drawingMode === 'polygon' && drawingPoints.length > 0) {
      const paths = drawingPoints.map(pt => ({ lat: pt[0], lng: pt[1] }));

      // Draw markers for each point to give feedback
      paths.forEach(pt => {
        // Create a small dot icon
        const dotSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
                  <circle cx="6" cy="6" r="4" fill="#333" stroke="#fff" stroke-width="2"/>
                </svg>`;
        const iconUrl = `data:image/svg+xml;base64,${window.btoa(dotSvg)}`;

        try {
          if (window.mappls && window.mappls.Marker) {
            const marker = new window.mappls.Marker({
              map: hdMap,
              position: pt,
              icon: iconUrl,
              width: 12,
              height: 12
            });
            tempMarkersRef.current.push(marker);
          }
        } catch (e) {
          console.error("Error creating temp marker", e);
        }
      });

      if (drawingPoints.length > 1) {
        try {
          if (window.mappls && window.mappls.Polyline) {
            const tempPoly = new window.mappls.Polyline({
              map: hdMap,
              paths: paths,
              strokeColor: '#333333',
              strokeWeight: 2,
              strokeOpacity: 0.8,
              strokeStyle: 'dashed'
            });
            tempPolyRef.current = tempPoly;
          }
        } catch (e) {
          console.error("Error drawing temp polyline", e);
        }
      }
    }
  }, [mapType, drawingMode, drawingPoints]);

  const startHdDrawing = () => {
    setDrawingMode('polygon');
    setDrawingPoints([]);
    if (onPolygonComplete) onPolygonComplete([]);
  };

  const clearHdDrawing = () => {
    setDrawingMode(null);
    setDrawingPoints([]);

    // Cleanup temp elements immediately
    if (tempPolyRef.current) {
      try { tempPolyRef.current.remove(); } catch (e) { }
      tempPolyRef.current = null;
    }
    if (tempMarkersRef.current) {
      tempMarkersRef.current.forEach(m => {
        try { m.remove(); } catch (e) { }
      });
      tempMarkersRef.current = [];
    }

    if (onPolygonComplete) onPolygonComplete([]);
  };

  const finishHdDrawing = () => {
    setDrawingMode(null);
    if (onPolygonComplete && drawingPoints.length >= 3) {
      onPolygonComplete(drawingPoints);

      // We keep the drawing visualized until cleared? 
      // Or maybe we change style to closed polygon?
      // For now, let's just leave the temp drawing or clear it?
      // Usually "Finish" implies committing. 
      // The calling component might use these points to filter.
      // But we should probably visualize the closed polygon if we want to be nice.
      // However, LiveMap seems to use 'drawVectorLayer' for OL. 
      // Let's create a "closed" polygon visualization if needed or just leave it.
      // Modifying behavior: we will clear temp drawing and let the parent component handle it?
      // Actually, if onPolygonComplete is used for filtering, maybe we should keep the polygon visible.
      // But let's stick to simple "Finish" -> Callback flow.
      // We will create a closed polygon to show "it is done" if we want, 
      // but simplistic approach is fine.

      // Let's create a closed polygon visualization for persistency until cleared
      if (mapplsMapRef.current && window.mappls && window.mappls.Polygon) {
        // Clear temp lines/dots
        if (tempPolyRef.current) try { tempPolyRef.current.remove(); } catch (e) { }
        tempMarkersRef.current.forEach(m => { try { m.remove(); } catch (e) { } });
        tempMarkersRef.current = [];

        // Draw closed polygon
        const paths = drawingPoints.map(pt => ({ lat: pt[0], lng: pt[1] }));
        try {
          const finalPoly = new window.mappls.Polygon({
            map: mapplsMapRef.current,
            paths: paths,
            fillColor: 'rgba(255, 255, 255, 0.2)',
            strokeColor: '#ffcc33',
            strokeWeight: 2
          });
          // Store it in tempPolyRef so "Clear" can remove it
          tempPolyRef.current = finalPoly;
        } catch (e) { console.error("Error drawing final polygon", e); }
      }
    }
  };

  // Fetch POIs on component mount
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const response = await POIService.getAllPOIs();
        if (response && response.data) {
          setPois(response.data);
        }
      } catch (error) {
        console.error("Error fetching POIs:", error);
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
    const labelText = getMarkerLabel(data, labelMode);
    console.debug(`[LiveMap] getIconStyle: color=${color}, type=${iconVehicleType}, mode=${labelMode}, label="${labelText}"`);
    return createIconStyle(color, iconVehicleType, labelText);
  };

  useEffect(() => {
    if (!map || !vectorLayer) {
      return;
    }

    const allMarkers = [...gpsData, ...policeData];

    if (allMarkers.length > 0) {
      // Clear the previous markers (Access inner source from Cluster)
      const vectorSource = vectorLayer.getSource().getSource();
      vectorSource.clear();

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
      vectorSource.addFeatures(features);

      // Only auto-fit if autoFit prop is true and there are markers
      if (autoFit && features.length > 0) {
        // Use Cluster source extent (which covers all features)
        const extent = vectorLayer.getSource().getExtent();
        map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      }

      // Handle map click to display the overlay and zoom to street level or expand cluster
      const clickHandler = function (event) {
        // Ignore clicks that are actually the end of a drag-pan.
        // OpenLayers may still emit a click/singleclick after small drags on some devices.
        if (olWasDraggingRef.current || event?.dragging) {
          olWasDraggingRef.current = false;
          return;
        }

        dynamicOverlay.getElement().style.display = "none";

        let allHits = [];
        // Collect ALL features at pixel
        map.forEachFeatureAtPixel(event.pixel, (feature) => {
          allHits.push(feature);
        }, { hitTolerance: 5 });

        if (allHits.length === 0) return;

        // Temporary compatibility: define 'feature' as the first hit so subsequent code works
        const feature = allHits[0];

        const aggregatedItems = [];

        allHits.forEach(f => {
          if (f.get("isIncident")) {
            aggregatedItems.push({ type: 'incident', data: f.get("data"), coord: f.getGeometry().getCoordinates() });
            return;
          }
          const subFeatures = f.get('features');
          if (subFeatures && subFeatures.length > 0) {
            subFeatures.forEach(sf => {
              const entry = sf.get('entryData');
              if (entry) aggregatedItems.push({ type: 'vehicle', data: entry, coord: sf.getGeometry().getCoordinates() });
            });
          } else {
            const entry = f.get('entryData');
            if (entry) aggregatedItems.push({ type: 'vehicle', data: entry, coord: f.getGeometry().getCoordinates() });
          }
        });

        const uniqueItems = [];
        const seen = new Set();
        aggregatedItems.forEach(item => {
          const id = item.type === 'incident' ? `inc_${item.data.id}` : `veh_${item.data.vehicle_registration_number}`;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueItems.push(item);
          }
        });

        if (uniqueItems.length > 0) {
          // Logic for Handling Consolidated Items
          const firstHit = allHits[0];
          const firstHitFeatures = firstHit.get('features');
          const isVisualCluster = allHits.length === 1 && firstHitFeatures && firstHitFeatures.length > 1;

          if (isVisualCluster) {
            const currentZoom = map.getView().getZoom();
            const isSameLocation = firstHitFeatures.every(f => {
              const c = f.getGeometry().getCoordinates();
              const c0 = firstHitFeatures[0].getGeometry().getCoordinates();
              return c[0] === c0[0] && c[1] === c0[1];
            });

            if (!isSameLocation && currentZoom < 16) {
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              firstHitFeatures.forEach(f => {
                const c = f.getGeometry().getCoordinates();
                if (c[0] < minX) minX = c[0];
                if (c[0] > maxX) maxX = c[0];
                if (c[1] < minY) minY = c[1];
                if (c[1] > maxY) maxY = c[1];
              });
              map.getView().fit([minX, minY, maxX, maxY], { padding: [100, 100, 100, 100], duration: 500 });
              return;
            }
          }

          if (uniqueItems.length > 1) {
            renderListView(uniqueItems);
            return;
          }

          renderSingleView(uniqueItems[0]);
          return; // Important: Stop processing OLD logic
        }

        // --- Helper Functions Definitions ---
        function renderListView(items) {
          let listHtml = `
              <div class="overlay-card" style="min-width: 280px; max-height: 320px; overflow-y: auto; font-family: 'Roboto', sans-serif;">
                <div class="overlay-header" style="position: sticky; top: 0; background: white; z-index: 1; border-bottom: 1px solid #eee; margin-bottom: 0;">
                  <div class="overlay-title">${items.length} Items Here</div>
                </div>
                <div class="overlay-body" style="padding: 0;">
            `;

          items.forEach(item => {
            if (item.type === 'incident') {
              listHtml += `
                 <div class="clustered-vehicle-row" style="padding: 10px; border-bottom: 1px solid #ffebee; background: #fff5f5; cursor: pointer;">
                    <div style="font-weight: 600; color: #b71c1c; margin-bottom: 2px;">Incident #${item.data.id}</div> 
                    <div style="font-size: 11px; color: #6b7280;">${item.data.details || "Alert"}</div>
                 </div>`;
            } else {
              const entry = item.data;
              const title = entry.vehicle_registration_number || entry.imei || "Unknown";
              const speed = entry.speed > 0 ? `${entry.speed} km/h` : "Stopped";
              listHtml += `
                 <div class="clustered-vehicle-row" style="padding: 10px; border-bottom: 1px solid #f3f4f6; cursor: pointer;">
                    <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${title}</div>
                    <div style="font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
                       <span>${speed}</span>
                       <span>${entry.time || ""}</span>
                    </div>
                 </div>`;
            }
          });
          listHtml += `</div></div>`;

          const el = document.getElementById("overlay-content");
          if (el) el.innerHTML = listHtml;
          dynamicOverlay.setPosition(items[0].coord);
          dynamicOverlay.getElement().style.display = "block";
        }

        function renderSingleView(item) {
          const coordinates = item.coord;

          if (item.type === 'incident') {
            const incident = item.data;
            const imageContainerId = `incident-media-${incident.id}-${Date.now()}`;
            document.getElementById("overlay-content").innerHTML = `
                <div class="overlay-card" style="min-width: 250px; font-family: 'Roboto', sans-serif;">
                  <div class="overlay-header">
                    <div class="overlay-title">Incident #${incident.id}</div> 
                    <div class="overlay-pill overlay-pill--alert">ALERT</div>
                  </div>
                  <div class="overlay-body">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151; line-height: 1.4;">${incident.details || "No details available."}</p>
                    ${incident.image_file ? `<div id="${imageContainerId}" style="margin-top: 8px;"></div>` : ''}
                    <div class="overlay-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
                      <span class="overlay-label">Registered:</span>
                      <span class="overlay-value" style="font-weight: 500;">${incident.registered_at ? new Date(incident.registered_at).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                </div>
              `;

            dynamicOverlay.setPosition(coordinates);
            dynamicOverlay.getElement().style.display = "block";

            const currentZoom = map.getView().getZoom();
            const targetZoom = currentZoom > 16 ? currentZoom : 16;
            map.getView().animate({ center: coordinates, zoom: targetZoom, duration: 500 });

            // Load secure incident media asynchronously if it exists
            if (incident.image_file) {
              renderSecureIncidentMedia(incident.image_file, imageContainerId, {
                maxWidth: "100%",
                maxHeight: "160px",
                borderRadius: "6px",
              }).catch((err) => {
                console.error("Failed to load incident media:", err);
              });
            }

          } else {
            const entryData = item.data;
            const speedValue = entryData.speed > 2 ? entryData.speed : 0;
            const alertType = entryData.packet_type || "NR";
            const alertClass = alertType === "NR" ? "overlay-pill--normal" : "overlay-pill--alert";

            if (typeof onVehicleClick === "function") {
              onVehicleClick(entryData);
            }

            lastClickedVehicleRef.current = {
              imei: entryData?.imei,
              coordinates,
            };

            const addressValue = entryData?.address ? entryData.address : "-";
            const nearestPoliceStationValue =
              entryData?.markerCategory === "police"
                ? (entryData.nearestPoliceStation || "uzanbazr policestation")
                : null;
            const policeContactValue =
              entryData?.markerCategory === "police"
                ? (entryData.nearestPoliceContact || "987654123")
                : null;

            const policeInfoRows = [
              nearestPoliceStationValue
                ? `<div class="overlay-row"><span class="overlay-label">Nearest Police Station</span><span class="overlay-value">${nearestPoliceStationValue}</span></div>`
                : "",
              policeContactValue
                ? `<div class="overlay-row"><span class="overlay-label">Police Contact</span><span class="overlay-value">${policeContactValue}</span></div>`
                : "",
            ].join("");

            document.getElementById("overlay-content").innerHTML = `
                <div class="overlay-card">
                  <div class="overlay-header">
                    <div class="overlay-title">${entryData.vehicle_registration_number || "-"}</div>
                    <div class="overlay-pill ${alertClass}">${alertType}</div>
                  </div>
                  <div class="overlay-body">
                    <div class="overlay-row">
                      <span class="overlay-label">Date</span>
                      <span class="overlay-value">${formatDateDDMMYY(entryData.date)}</span>
                    </div>
                    <div class="overlay-row">
                      <span class="overlay-label">Time</span>
                      <span class="overlay-value">${formatTimeHHMMSS(entryData.time)}</span>
                    </div>
                    <div class="overlay-row">
                      <span class="overlay-label">Address</span>
                      <span class="overlay-value">${addressValue}</span>
                    </div>
                    ${policeInfoRows}
                    <div class="overlay-row">
                      <span class="overlay-label">Speed</span>
                      <span class="overlay-value">${speedValue} km/h</span>
                    </div>
                    <div class="overlay-row">
                      <span class="overlay-label">Battery</span>
                      <span class="overlay-value">${entryData.internal_battery_voltage || "-"} - ${entryData.main_input_voltage || "-"}</span>
                    </div>
                    <div class="overlay-row">
                      <span class="overlay-label">Latitude</span>
                      <span class="overlay-value">${entryData.latitude || "-"}</span>
                    </div>
                    <div class="overlay-row">
                      <span class="overlay-label">Longitude</span>
                      <span class="overlay-value">${entryData.longitude || "-"}</span>
                    </div>
                  </div>
                </div>
              `;

            dynamicOverlay.setPosition(coordinates);
            dynamicOverlay.getElement().style.display = "block";

            const currentZoom = map.getView().getZoom();
            const targetZoom = currentZoom > 18 ? currentZoom : 18;
            map.getView().animate({ center: coordinates, zoom: targetZoom, duration: 500 });
          }
        }



        if (false) {
          // Check if we can't separate them further (same duplicate location or max zoom)
          const currentZoom = map.getView().getZoom();
          const isSameLocation = features.every(f => {
            const c = f.getGeometry().getCoordinates();
            const c0 = features[0].getGeometry().getCoordinates();
            return c[0] === c0[0] && c[1] === c0[1];
          });

          if (currentZoom >= 16 || isSameLocation) {
            // Show list of vehicles
            let listHtml = `
              <div class="overlay-card" style="min-width: 260px; max-height: 320px; overflow-y: auto; font-family: 'Roboto', sans-serif;">
                <div class="overlay-header" style="position: sticky; top: 0; background: white; z-index: 1; border-bottom: 1px solid #eee; margin-bottom: 0;">
                  <div class="overlay-title">${features.length} Vehicles Here</div>
                </div>
                <div class="overlay-body" style="padding: 0;">
            `;

            features.forEach(f => {
              const entry = f.get('entryData');
              if (!entry) return;

              const vehicleNum = entry.vehicle_registration_number || entry.imei || "Unknown";
              const speed = entry.speed > 0 ? `${entry.speed} km/h` : "Stopped";

              listHtml += `
                 <div class="clustered-vehicle-row" style="padding: 10px; border-bottom: 1px solid #f3f4f6; cursor: pointer;">
                    <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${vehicleNum}</div>
                    <div style="font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
                       <span>${speed}</span>
                       <span>${entry.time || ""}</span>
                    </div>
                 </div>
              `;
            });

            listHtml += `</div></div>`;

            document.getElementById("overlay-content").innerHTML = listHtml;
            dynamicOverlay.setPosition(features[0].getGeometry().getCoordinates());
            dynamicOverlay.getElement().style.display = "block";
            return;
          }

          // Calculate extent of all features in cluster
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          features.forEach(f => {
            const coords = f.getGeometry().getCoordinates();
            if (coords[0] < minX) minX = coords[0];
            if (coords[0] > maxX) maxX = coords[0];
            if (coords[1] < minY) minY = coords[1];
            if (coords[1] > maxY) maxY = coords[1];
          });
          map.getView().fit([minX, minY, maxX, maxY], { padding: [100, 100, 100, 100], duration: 500 });
          return;
        }

        if (false) {
          const originalFeature = features[0];
          const entryData = originalFeature.get("entryData");
          const coordinates = originalFeature.getGeometry().getCoordinates();

          if (!entryData) return;

          const speedValue = entryData.speed > 2 ? entryData.speed : 0;
          const alertType = entryData.packet_type || "NR";
          const alertClass =
            alertType === "NR" ? "overlay-pill--normal" : "overlay-pill--alert";

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
            </div>
          `;

          dynamicOverlay.setPosition(coordinates);
          dynamicOverlay.getElement().style.display = "block";

          // Zoom to street level when clicked (zoom level 18)
          map.getView().animate({
            center: coordinates,
            zoom: 18,
            duration: 500, // Animate the zoom for 500ms
          });
        }
      };

      const pointerDownHandler = () => {
        olWasDraggingRef.current = false;
      };

      const pointerDragHandler = () => {
        olWasDraggingRef.current = true;
      };

      map.on("pointerdown", pointerDownHandler);
      map.on("pointerdrag", pointerDragHandler);
      map.on("singleclick", clickHandler);

      return () => {
        map.un("singleclick", clickHandler);
        map.un("pointerdown", pointerDownHandler);
        map.un("pointerdrag", pointerDragHandler);
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
    onVehicleClick,
    markerLabelMode,
    autoFit,
  ]);

  useEffect(() => {
    if (!dynamicOverlay || !map || !focusEntry?.address) return;

    const lastClicked = lastClickedVehicleRef.current;
    if (!lastClicked?.imei || lastClicked.imei !== focusEntry?.imei) return;

    const overlayContent = document.getElementById("overlay-content");
    if (!overlayContent) return;

    const speedValue = focusEntry.speed > 2 ? focusEntry.speed : 0;
    const alertType = focusEntry.packet_type || "NR";
    const alertClass = alertType === "NR" ? "overlay-pill--normal" : "overlay-pill--alert";

    const nearestPoliceStationValue =
      focusEntry?.markerCategory === "police"
        ? (focusEntry.nearestPoliceStation || "uzanbazr policestation")
        : null;
    const policeContactValue =
      focusEntry?.markerCategory === "police"
        ? (focusEntry.nearestPoliceContact || "987654123")
        : null;

    const policeInfoRows = [
      nearestPoliceStationValue
        ? `<div class="overlay-row"><span class="overlay-label">Nearest Police Station</span><span class="overlay-value">${nearestPoliceStationValue}</span></div>`
        : "",
      policeContactValue
        ? `<div class="overlay-row"><span class="overlay-label">Police Contact</span><span class="overlay-value">${policeContactValue}</span></div>`
        : "",
    ].join("");

    overlayContent.innerHTML = `
      <div class="overlay-card">
        <div class="overlay-header">
          <div class="overlay-title">${focusEntry.vehicle_registration_number || "-"}</div>
          <div class="overlay-pill ${alertClass}">${alertType}</div>
        </div>
        <div class="overlay-body">
          <div class="overlay-row">
            <span class="overlay-label">Date</span>
            <span class="overlay-value">${formatDateDDMMYY(focusEntry.date)}</span>
          </div>
          <div class="overlay-row">
            <span class="overlay-label">Time</span>
            <span class="overlay-value">${formatTimeHHMMSS(focusEntry.time)}</span>
          </div>
          <div class="overlay-row">
            <span class="overlay-label">Address</span>
            <span class="overlay-value">${focusEntry.address}</span>
          </div>
          ${policeInfoRows}
          <div class="overlay-row">
            <span class="overlay-label">Speed</span>
            <span class="overlay-value">${speedValue} km/h</span>
          </div>
          <div class="overlay-row">
            <span class="overlay-label">Battery</span>
            <span class="overlay-value">${focusEntry.internal_battery_voltage || "-"} - ${focusEntry.main_input_voltage || "-"}</span>
          </div>
          <div class="overlay-row">
            <span class="overlay-label">Latitude</span>
            <span class="overlay-value">${focusEntry.latitude || "-"}</span>
          </div>
          <div class="overlay-row">
            <span class="overlay-label">Longitude</span>
            <span class="overlay-value">${focusEntry.longitude || "-"}</span>
          </div>
        </div>
      </div>
    `;
  }, [dynamicOverlay, map, focusEntry?.imei, focusEntry?.address]);

  // Handle Incident Data for OpenLayers (Normal/Satellite)
  useEffect(() => {
    if (!map || !incidentVectorLayer) return;

    const source = incidentVectorLayer.getSource();
    source.clear();

    if (incidentData.length > 0) {
      const features = incidentData
        .map((incident) => {
          const longitude = Number(incident.longitude);
          const latitude = Number(incident.latitude);

          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

          const feature = new Feature({
            geometry: new Point([longitude, latitude]),
            data: incident,
            isIncident: true,
          });

          // Style for incident
          const svgIcon = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L1 21H23L12 2Z" fill="#F44336" stroke="#B71C1C" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M12 9V15" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 18V18.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `;
          const iconUrl = `data:image/svg+xml;base64,${window.btoa(svgIcon)}`;

          feature.setStyle(
            new Style({
              image: new Icon({
                anchor: [0.5, 1],
                src: iconUrl,
                scale: 1.0,
              }),
            })
          );
          return feature;
        })
        .filter(Boolean);

      source.addFeatures(features);
    }
  }, [incidentData, map, incidentVectorLayer]);

  // Handle NMR circular area (normal / satellite OpenLayers maps)
  useEffect(() => {
    if (!map || !nmrVectorLayer) return;

    const source = nmrVectorLayer.getSource();
    source.clear();

    if (!nmrArea) return;

    const lat = Number(nmrArea.latitude);
    const lon = Number(nmrArea.longitude);
    const radiusKm = Number(nmrArea.radiusKm) || 5;

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    // Approximate conversion: 1 degree of latitude ~ 111.32 km
    const radiusDeg = radiusKm / 111.32;

    const circleGeom = new Circle([lon, lat], radiusDeg);
    const feature = new Feature({ geometry: circleGeom });

    feature.setStyle(
      new Style({
        fill: new Fill({ color: 'rgba(33, 150, 243, 0.15)' }), // light blue fill
        stroke: new Stroke({ color: '#2196F3', width: 2 }), // blue border
      })
    );

    source.addFeature(feature);
  }, [map, nmrVectorLayer, nmrArea]);

  // Handle clustering distance based on zoom level to reveal tight clusters
  useEffect(() => {
    if (!map || !vectorLayer) return;

    const source = vectorLayer.getSource();
    // Ensure we are working with a Cluster source which supports setDistance
    if (!source || typeof source.setDistance !== 'function') return;

    const handleZoomChange = () => {
      const zoom = map.getView().getZoom();
      // Disable clustering at high zoom levels (e.g., >= 17) to reveal individual items
      // 40 is the default distance we set during initialization
      const targetDistance = zoom >= 14 ? 0 : 30;

      if (source.getDistance() !== targetDistance) {
        source.setDistance(targetDistance);
      }
    };

    const view = map.getView();
    // Initial check
    handleZoomChange();

    // Listen to changes
    view.on('change:resolution', handleZoomChange);

    return () => {
      view.un('change:resolution', handleZoomChange);
    };
  }, [map, vectorLayer]);

  useEffect(() => {
    if (!focusEntry) return;

    const longitude = Number(focusEntry.longitude);
    const latitude = Number(focusEntry.latitude);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

    // Handle OpenLayers maps (normal and satellite)
    if (map && mapType !== "hd") {
      map
        .getView()
        .animate({ center: [longitude, latitude], zoom: 16, duration: 500 });
    }

    // Handle HD Mappls map
    if (mapType === "hd" && mapplsMapRef.current) {
      const hdMap = mapplsMapRef.current;

      // Try to pan to the location
      // Note: Mappls expects object format {lat, lng}
      try {
        if (typeof hdMap.setCenter === "function") {
          hdMap.setCenter({ lat: latitude, lng: longitude });
        } else if (typeof hdMap.panTo === "function") {
          hdMap.panTo({ lat: latitude, lng: longitude });
        }

        // Set zoom level
        if (typeof hdMap.setZoom === "function") {
          hdMap.setZoom(16);
        }
      } catch (error) {
        console.warn("Could not focus on vehicle in HD map:", error);
      }
    }
  }, [focusEntry, map, mapType]);

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

  // Geocoding Handlers
  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleGeoSearch = async () => {
    if (!geoSearchQuery.trim()) return;

    try {
      setGeoSearchLoading(true);
      // const url = `/mappls/search/address/geocode?address=${encodeURIComponent(geoSearchQuery)}&access_token=${MAPPLS_GEOCODING_TOKEN}`;
      const url = `https://api.gromed.in/api/geocode/?q=${encodeURIComponent(geoSearchQuery)}`;
      console.log('Fetching geocode via Axios (Proxy):', url);
      const response = await axios.get(url);

      if (response.status === 200) {
        const data = response.data;
        console.log('Geocoding response data:', data);

        let results = [];
        if (data.copResults) {
          if (Array.isArray(data.copResults)) {
            results = data.copResults;
          } else {
            results = [data.copResults];
          }
        } else if (Array.isArray(data)) {
          results = data;
        } else if (Array.isArray(data.results)) {
          // Support gromed.in geocode format: { results: [...] }
          results = data.results;
        }

        setGeoSearchResults(results);
        if (results.length === 0) {
          showSnackbar('No results found', 'info');
        } else {
          // Auto-focus map on the first geocode result
          try {
            handleGeoResultClick(results[0]);
          } catch (e) {
            console.error('Error focusing map on geocode result:', e);
          }
        }
      } else {
        console.warn('Geocoding status:', response.status);
        showSnackbar(`Error: ${response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Geocoding exception:', error);
      if (error.code === "ERR_NETWORK") {
        showSnackbar('Network Error (Likely CORS). Try using the SDK or a proxy.', 'error');
      } else {
        showSnackbar('Error searching address', 'error');
      }
    } finally {
      setGeoSearchLoading(false);
    }
  };

  const handleGeoResultClick = async (result) => {
    console.log('Selected geo result:', result);

    // Support multiple response formats:
    // - Mappls: { latitude, longitude }
    // - Generic: { lat, lng }
    // - Gromed geocode: { lat, lon, address }
    let lat = result.latitude || result.lat;
    let lng = result.longitude || result.lng || result.lon;

    // If lat/lng are missing, try to fetch them using eLoc
    if (!lat || !lng && result.eLoc) {
      try {
        const url = `https://place.mappls.com/O2O/entity/place-details/${result.eLoc}?access_token=${MAPPLS_GEOCODING_TOKEN}`;
        console.log('Fetching detailed place info for eLoc:', result.eLoc);
        const response = await axios.get(url);
        if (response.status === 200 && response.data) {
          lat = response.data.latitude;
          lng = response.data.longitude;
          console.log('Resolved eLoc to coordinates:', lat, lng);
        }
      } catch (err) {
        console.error('Error resolving eLoc details:', err);
      }
    }

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      // Handle HD Map (Mappls)
      if (mapType === "hd" && mapplsMapRef.current) {
        const hdMap = mapplsMapRef.current;
        const pos = { lat: latNum, lng: lngNum };

        try {
          if (typeof hdMap.panTo === 'function') {
            hdMap.panTo({ lat: pos.lat, lng: pos.lng });
          }
          if (typeof hdMap.setCenter === 'function') {
            hdMap.setCenter({ lat: pos.lat, lng: pos.lng });
          }
          if (typeof hdMap.setZoom === 'function') {
            hdMap.setZoom(16);
          }

          // Clear previous search marker if exists
          if (window.searchMarker) {
            try { window.searchMarker.remove(); } catch (e) { }
          }

          // Add marker at the searched location
          if (window.mappls && window.mappls.Marker) {
            const iconUrl = getPoiMarkerIcon('#FF0000');
            const marker = new window.mappls.Marker({
              map: hdMap,
              position: pos,
              icon: iconUrl,
              width: 30,
              height: 40,
              popupHtml: `
                <div style="padding: 10px; width: 250px; font-family: 'Roboto', sans-serif;">
                  <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #333; line-height: 1.3; overflow-wrap: break-word;">
                    ${result.poi || result.placeName || result.locality || result.name || 'Location'}
                  </h3>
                  <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; line-height: 1.4; overflow-wrap: break-word;">
                    ${result.formattedAddress || result.address || result.description || 'No address available'}
                  </p>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
                    ${result.district ? `<span style="font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${result.district}</span>` : ''}
                    ${result.state ? `<span style="font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${result.state}</span>` : ''}
                  </div>
                  <p style="margin: 8px 0 0 0; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 6px;">
                    ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}
                  </p>
                </div>
              `
            });
            window.searchMarker = marker;
          }
        } catch (error) {
          console.error('Error during pan on HD map:', error);
          showSnackbar('Error moving map to location', 'error');
        }
      }
      // Handle OpenLayers maps (Normal, Satellite, SOI)
      else if (map && ["normal", "satellite", "soi"].includes(mapType)) {
        try {
          // Pan to location
          map.getView().animate({
            center: [lngNum, latNum],
            zoom: 16,
            duration: 500
          });

          // Clear previous search marker if exists
          if (window.olSearchMarker) {
            try {
              vectorLayer.getSource().removeFeature(window.olSearchMarker);
            } catch (e) { }
          }

          // Add marker at the searched location
          const markerFeature = new Feature({
            geometry: new Point([lngNum, latNum]),
          });

          markerFeature.setStyle(new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: 'data:image/svg+xml;base64,' + window.btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24">
                  <path fill="#FF0000" d="M12 2c4.418 0 8 3.134 8 7 0 5.25-8 13-8 13S4 14.25 4 9c0-3.866 3.582-7 8-7Zm0 4a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 6Z"/>
                </svg>
              `),
              scale: 1.2,
            }),
          }));

          vectorLayer.getSource().addFeature(markerFeature);
          window.olSearchMarker = markerFeature;

          // Show popup with location info
          if (dynamicOverlay) {
            const overlayContent = document.getElementById('overlay-content');
            if (overlayContent) {
              overlayContent.innerHTML = `
                <div class="overlay-card" style="max-width: 250px; overflow: hidden;">
                  <div class="overlay-header">
                    <div class="overlay-title" style="word-wrap: break-word;">${result.poi || result.placeName || result.locality || 'Location'}</div>
                  </div>
                  <div class="overlay-body">
                    <div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;">
                      <span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">Address</span>
                      <span class="overlay-value" style="flex: 1; word-break: break-word; overflow-wrap: break-word; color: #333;">${result.formattedAddress || result.address || 'N/A'}</span>
                    </div>
                    ${result.district ? `<div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;"><span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">District</span><span class="overlay-value" style="flex: 1; word-break: break-word; overflow-wrap: break-word; color: #333;">${result.district}</span></div>` : ''}
                    ${result.state ? `<div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;"><span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">State</span><span class="overlay-value" style="flex: 1; word-break: break-word; overflow-wrap: break-word; color: #333;">${result.state}</span></div>` : ''}
                    <div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;">
                      <span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">Coordinates</span>
                      <span class="overlay-value" style="flex: 1; word-break: break-all; color: #333;">${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              `;
              dynamicOverlay.setPosition([lngNum, latNum]);
              overlayElement.current.style.display = 'block';
            }
          }
        } catch (error) {
          console.error('Error during pan on OpenLayers map:', error);
          showSnackbar('Error moving map to location', 'error');
        }
      }
    } else {
      showSnackbar('Could not determine location coordinates', 'error');
    }

    // Clear search results and query after selection
    setGeoSearchResults([]);
    setGeoSearchQuery('');
  };


  // Handle Layer Visibility Toggles (OpenLayers)
  useEffect(() => {
    if (vectorLayer) {
      vectorLayer.setVisible(showVehicles);
    }
  }, [showVehicles, vectorLayer]);

  useEffect(() => {
    if (poiVectorLayer) {
      poiVectorLayer.setVisible(showPois);
    }
  }, [showPois, poiVectorLayer]);

  useEffect(() => {
    if (incidentVectorLayer) {
      incidentVectorLayer.setVisible(showIncidents);
    }
  }, [showIncidents, incidentVectorLayer]);

  // Handle Layer Visibility Toggles (Mappls HD)
  useEffect(() => {
    // Toggle Vehicle Markers
    if (hdVehicleMarkersRef.current) {
      hdVehicleMarkersRef.current.forEach(marker => {
        try {
          if (showVehicles) {
            if (!marker.getMap()) marker.addTo(mapplsMapRef.current);
          } else {
            marker.remove();
          }
        } catch (e) { console.warn("Error toggling HD vehicle marker", e); }
      });
    }

    // Toggle POI Markers
    if (hdPoiMarkersRef.current) {
      hdPoiMarkersRef.current.forEach(marker => {
        try {
          if (showPois) {
            if (!marker.getMap()) marker.addTo(mapplsMapRef.current);
          } else {
            marker.remove();
          }
        } catch (e) { console.warn("Error toggling HD POI marker", e); }
      });
    }
    // Toggle Incident Markers
    if (hdIncidentMarkersRef.current) {
      hdIncidentMarkersRef.current.forEach(marker => {
        try {
          if (showIncidents) {
            if (!marker.getMap()) marker.addTo(mapplsMapRef.current);
          } else {
            marker.remove();
          }
        } catch (e) { console.warn("Error toggling HD incident marker", e); }
      });
    }
  }, [showVehicles, showPois, showIncidents, mapType]);


  // Controls State
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  return (
    <div style={{ width, height, position: "relative", overflow: "hidden", borderRadius: '12px' }}>

      {/* --- Top Left: Search Bar --- */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          left: 30,
          zIndex: 1100,
          width: '320px',
          maxWidth: 'calc(100% - 80px)', // Leave room for right controls
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            borderRadius: '12px',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              backgroundColor: alpha(theme.palette.background.paper, 0.98),
            }
          }}
        >
          <IconButton sx={{ p: '8px' }} aria-label="search">
            <SearchIcon color="action" />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '0.95rem' }}
            placeholder="Search location..."
            value={geoSearchQuery}
            onChange={(e) => setGeoSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGeoSearch();
              if (e.key === 'Escape') {
                setGeoSearchQuery('');
                setGeoSearchResults([]);
              }
            }}
          />
          {geoSearchQuery && (
            <IconButton
              size="small"
              onClick={() => {
                setGeoSearchQuery('');
                setGeoSearchResults([]);
              }}
              sx={{ p: '8px' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            color="primary"
            sx={{ p: '8px' }}
            onClick={handleGeoSearch}
            disabled={geoSearchLoading}
          >
            {geoSearchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
          </IconButton>
        </Paper>

        {/* Search Results Dropdown */}
        {geoSearchResults && geoSearchResults.length > 0 && (
          <Paper
            elevation={6}
            sx={{
              mt: 1,
              maxHeight: '300px',
              overflowY: 'auto',
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(12px)',
            }}
          >
            <List disablePadding>
              {geoSearchResults.map((result, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleGeoResultClick(result)}
                  divider={index !== geoSearchResults.length - 1}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocationOnIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={result.poi || result.formattedAddress || result.locality}
                    secondary={[result.district, result.state].filter(Boolean).join(', ')}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* --- Top Right: Map Controls (Layers & Tools) --- */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'end',
        }}
      >
        {/* Layer Toggle */}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
          <Tooltip title="Map Layers" placement="left">
            <Paper
              elevation={4}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'white', transform: 'scale(1.05)' }
              }}
              onClick={() => setShowLayerMenu(!showLayerMenu)}
            >
              <LayersIcon color="primary" />
            </Paper>
          </Tooltip>

          {/* Expanded Layer Menu */}
          {showLayerMenu && (
            <Paper
              elevation={6}
              sx={{
                mr: 1,
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxHeight: '70vh',
                overflowY: 'auto'
              }}
            >
              {/* Map Type Selection */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[
                  { id: 'normal', label: 'Normal', icon: <MapIcon /> },
                  { id: 'satellite', label: 'Satellite', icon: <SatelliteIcon /> },
                  { id: 'hd', label: 'Mappls HD', icon: <HdIcon /> },
                  { id: 'soi', label: 'SOI', icon: <PublicIcon /> }
                ].map((type) => (
                  <Tooltip key={type.id} title={type.label} arrow>
                    <IconButton
                      size="small"
                      onClick={() => setMapType(type.id)}
                      sx={{
                        color: mapType === type.id ? 'primary.main' : 'text.secondary',
                        bgcolor: mapType === type.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        borderRadius: '8px',
                        border: mapType === type.id ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent'
                      }}
                    >
                      {type.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>

              <Divider />

              {/* Layer Toggles */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showVehicles}
                      onChange={(e) => setShowVehicles(e.target.checked)}
                    />
                  }
                  label={<Typography variant="caption" fontWeight={500}>Vehicles</Typography>}
                  sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showPois}
                      onChange={(e) => setShowPois(e.target.checked)}
                    />
                  }
                  label={<Typography variant="caption" fontWeight={500}>POIs</Typography>}
                  sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showIncidents}
                      onChange={(e) => setShowIncidents(e.target.checked)}
                    />
                  }
                  label={<Typography variant="caption" fontWeight={500}>Incidents</Typography>}
                  sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                />
              </Box>

              {mapType === 'soi' && (
                <>
                  <Divider />
                  <Typography variant="caption" fontWeight={700} sx={{ px: 0.5, color: 'text.secondary' }}>
                    SOI Layers
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.assamStateBdy}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamStateBdy: e.target.checked }))}
                        />
                      }
                      label="ASSAM State BDY"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.states}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, states: e.target.checked }))}
                        />
                      }
                      label="States"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.assamDistrict}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamDistrict: e.target.checked }))}
                        />
                      }
                      label="ASSAM District BDY"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.assamDistrictBdy2}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamDistrictBdy2: e.target.checked }))}
                        />
                      }
                      label="ASSAM District BDY2"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.assamDistrictHq}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamDistrictHq: e.target.checked }))}
                        />
                      }
                      label="ASSAM District HQ"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.assamSubdistrictBdy}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamSubdistrictBdy: e.target.checked }))}
                        />
                      }
                      label="ASSAM Subdistrict BDY"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.kamrupRural}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, kamrupRural: e.target.checked }))}
                        />
                      }
                      label="Kamrup Rural"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.cartTrackHills}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, cartTrackHills: e.target.checked }))}
                        />
                      }
                      label="Cart Track Hills"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.contours}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, contours: e.target.checked }))}
                        />
                      }
                      label="Contours"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.majorTowns}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, majorTowns: e.target.checked }))}
                        />
                      }
                      label="Major Towns HQ"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.name}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, name: e.target.checked }))}
                        />
                      }
                      label="Name"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.railwayTracks}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, railwayTracks: e.target.checked }))}
                        />
                      }
                      label="Railway Tracks"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.roads}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roads: e.target.checked }))}
                        />
                      }
                      label="Roads"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.roadsAllWeatherMotorable}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadsAllWeatherMotorable: e.target.checked }))}
                        />
                      }
                      label="Roads All Weather"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.roadsMotorableInFairWeather}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadsMotorableInFairWeather: e.target.checked }))}
                        />
                      }
                      label="Roads Fair Weather"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.roadsNationalHighway}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadsNationalHighway: e.target.checked }))}
                        />
                      }
                      label="National Highway"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.stateHighway}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, stateHighway: e.target.checked }))}
                        />
                      }
                      label="State Highway"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.roadTunnel}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadTunnel: e.target.checked }))}
                        />
                      }
                      label="Road Tunnel"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={soiLayerVisibility.roadOthers}
                          onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadOthers: e.target.checked }))}
                        />
                      }
                      label="Road Others"
                    />
                  </Box>
                </>
              )}

            </Paper>
          )}
        </Box>

        {/* Drawing Tools */}
        {(mapType !== "soi") && ( // Only show drawing tools if supported (Normal, Sat, HD)
          <Paper
            elevation={4}
            sx={{
              p: 0.5,
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Tooltip title={drawingMode === 'polygon' || drawInteraction ? "Drawing Active" : "Draw Polygon"} placement="left">
              <IconButton
                onClick={mapType === 'hd' ? startHdDrawing : startDrawing}
                color={(drawingMode === 'polygon' || drawInteraction) ? "secondary" : "default"}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-active': { bgcolor: alpha(theme.palette.secondary.main, 0.1) }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            {/* Clear Button - Show only if something is drawn or drawing */}
            <Tooltip title="Clear Map" placement="left">
              <IconButton
                onClick={mapType === 'hd' ? clearHdDrawing : clearPolygon}
                color="error"
                size="small"
                sx={{ borderRadius: '8px' }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        )}
      </Box>

      {/* --- Finish Drawing Action (Floating Bottom Center) --- */}
      {((drawingMode === 'polygon' && drawingPoints.length > 2) || (drawInteraction)) && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
          }}
        >
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={mapType === 'hd' ? finishHdDrawing : () => { /* OpenLayers handles finish automatically on double click usually, but we can add manual finish if customization allows */ }}
            sx={{
              borderRadius: '24px',
              px: 3,
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Finish Drawing
          </Button>
        </Box>
      )}

      {/* --- Map Containers --- */}
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* Normal Map */}
        <div
          ref={normalMapContainerRef}
          style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
            visibility: mapType === "normal" ? "visible" : "hidden",
            zIndex: mapType === "normal" ? 1 : 0
          }}
        />

        {/* Satellite Map */}
        <div
          ref={satelliteMapContainerRef}
          style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
            visibility: mapType === "satellite" ? "visible" : "hidden",
            zIndex: mapType === "satellite" ? 1 : 0
          }}
        />

        {/* HD Map */}
        <div
          ref={hdMapContainerRef}
          style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
            visibility: mapType === "hd" ? "visible" : "hidden",
            zIndex: mapType === "hd" ? 1 : 0
          }}
        >
          <div ref={hdMapInnerRef} style={{ width: "100%", height: "100%", position: "absolute" }} />
        </div>

        {/* SOI Map */}
        <div
          ref={soiMapContainerRef}
          style={{
            width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
            visibility: mapType === "soi" ? "visible" : "hidden",
            zIndex: mapType === "soi" ? 1 : 0
          }}
        >
          {/* Map div injected by useEffect */}
        </div>
      </div>

      {/* --- Attribution Logos --- */}
      <Box sx={{ position: 'absolute', bottom: 4, left: 4, zIndex: 1000, pointerEvents: 'none', display: 'flex', alignItems: 'end', gap: 1 }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ height: '40px' }} alt="InSpace" />
      </Box>
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1000, pointerEvents: 'none' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ height: '50px' }} alt="ISRO" />
      </Box>
      <Box sx={{ position: 'absolute', bottom: 4, right: 4, zIndex: 1000, pointerEvents: 'none' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ height: '50px' }} alt="Skytron" />
      </Box>

      {/* Overlay for displaying marker details */}
      <div ref={overlayElement} className="dynamic-overlay">
        <div id="overlay-content"></div>
      </div>

      <style>{`
        .dynamic-overlay {
          position: absolute;
          display: none;
          transform: translate(-5%, 0%);
          z-index: 1200; /* above all else */
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default MapComponent;
