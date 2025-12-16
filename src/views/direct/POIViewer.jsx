import React, { useEffect, useRef, useState } from 'react';


import {
  ButtonGroup,
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  Fade,
  Dialog,
  DialogContent,
  Chip,
  Divider,
  useTheme,
  alpha,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Drawer,
  ListItemButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Circle as CircleIcon,
  Timeline as PolylineIcon,
  Route as RouteIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  Search as SearchIcon,
  Map as MapIcon,
  LocationCity as CityIcon,
  Terrain as TerrainIcon,
  Satellite as SatelliteIcon,
  People as PeopleIcon,
  List as ListIcon,
} from '@mui/icons-material';
import POIService from '../../services/POIService';
import HomePageService from '../../services/HomePage';
import axios from 'axios';

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
      script.src && script.src.includes("mappls.com/advancedmaps/api/")
    );

    if (sdkScript) {
      const match = sdkScript.src.match(/api\/([^/]+)\/map_sdk/i);
      if (match && match[1]) {
        return match[1];
      }
    }
  }

  return null;
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
    /* ... truncated styles for brevity, using LiveMap styles ... */
    .mappls-hd-popup-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px; }
    .mappls-hd-popup-title { font-weight: 600; font-size: 13px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mappls-hd-popup-pill { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; border: 1px solid transparent; }
    .mappls-hd-popup-pill--normal { background-color: #ecfdf3; color: #15803d; border-color: #bbf7d0; }
    
    /* Cursor Override for Drawing Modes */
    .drawing-mode-active, 
    .drawing-mode-active * {
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(styleElement);
};

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(30, 136, 229, ${alpha})`;
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) normalized = normalized.split("").map((char) => char + char).join("");
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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

const getUseTypeColor = (poi) => {
  const key = poi?.use_type?.toLowerCase();
  return USE_TYPE_COLORS[key] || "#1E88E5";
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

const POIViewer = () => {





  // Map References
  const hdMapContainerRef = useRef(null);
  const hdMapInnerRef = useRef(null);
  const hdPoiMarkersRef = useRef([]);
  const mapplsMapRef = useRef(null);
  const mapplsInstanceRef = useRef(null);
  const mapplsInitializedRef = useRef(false);
  const mapplsInitInProgressRef = useRef(false);
  const mapplsLibraryPollRef = useRef(null);
  const hdMapContainerIdRef = useRef(null);



  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    mark_type: 'Point',
    use_type: 'School',
    location: '',
    radius: '100.5',
    alert_type: '',
    speed_limit: 0,
  });
  const [mapInitialized, setMapInitialized] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Removed old layers state
  const theme = useTheme();
  const [routePoints, setRoutePoints] = useState([]);
  const [poiListOpen, setPoiListOpen] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const tempPolyRef = useRef(null);
  const tempMarkersRef = useRef([]);

  // Geocoding State
  const [geoSearchDialogOpen, setGeoSearchDialogOpen] = useState(false);
  const [geoSearchQuery, setGeoSearchQuery] = useState('');
  const [geoSearchResults, setGeoSearchResults] = useState([]);
  const [geoSearchLoading, setGeoSearchLoading] = useState(false);
  const MAPPLS_GEOCODING_TOKEN = "hbetrqpnyaoqssztkakwzjjmoxkowalvbwus";



  // Initialize HD Map (Mappls)
  useEffect(() => {
    ensureHdPopupStyles(); // Inject CSS styles including cursor overrides
    if (!hdMapContainerRef.current) return;

    setMapInitialized(true);

    let isMounted = true;
    const cleanup = () => {
      if (mapplsLibraryPollRef.current) {
        clearInterval(mapplsLibraryPollRef.current);
        mapplsLibraryPollRef.current = null;
      }
      hdPoiMarkersRef.current.forEach((marker) => {
        try { marker?.remove?.(); } catch (e) { }
      });
      if (mapplsMapRef.current) {
        try {
          if (typeof mapplsMapRef.current.remove === "function") mapplsMapRef.current.remove();
        } catch (e) { console.warn("Error removing HD map:", e); }
      }
      if (hdMapInnerRef.current) hdMapInnerRef.current.innerHTML = "";
      hdMapContainerIdRef.current = null;
      mapplsMapRef.current = null;
      hdPoiMarkersRef.current = [];
    };

    const instantiateHdMap = () => {
      if (!isMounted || !hdMapInnerRef.current) return;
      if (mapplsMapRef.current) return;
      if (typeof window.mappls === 'undefined') {
        console.log('Mappls library not loaded yet');
        return;
      }

      const hostElement = hdMapInnerRef.current;
      hostElement.innerHTML = "";
      const mapElement = document.createElement("div");
      mapElement.style.width = "100%";
      mapElement.style.height = "100%";
      const containerId = `mappls-hd-map-${Date.now()}`;
      mapElement.id = containerId;
      hdMapContainerIdRef.current = containerId;
      hostElement.appendChild(mapElement);

      try {
        console.log('Creating Mappls map with ID:', containerId);
        // Use correct Mappls API syntax from documentation
        const hdMap = new window.mappls.Map(containerId, {
          center: { lat: 26.1445, lng: 91.7362 },
          zoom: 12,
          draggable: true,
          zoomControl: true,
          location: true
        });
        mapplsMapRef.current = hdMap;
        console.log('Mappls map created successfully', hdMap);

        // Add a test marker to verify Mappls marker API works


      } catch (e) {
        console.error("Failed to create Mappls HD map instance", e);
      }
    };

    const ensureMapplsInitialized = () => {
      if (!isMounted) return;

      // Check if Mappls is available
      if (typeof window.mappls === 'undefined') {
        console.log('Mappls not available yet');
        return;
      }

      console.log('Mappls library is available, creating map...');
      instantiateHdMap();
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

    return () => { isMounted = false; cleanup(); };
  }, []);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const response = await POIService.getAllPOIs();
      console.log('POI Response:', response);
      if (response && response.data) {
        console.log('POIs fetched:', response.data.length, 'items');
        setPois(response.data);
      } else {
        showSnackbar('Invalid response format from server', 'error');
      }
    } catch (error) {
      console.error('Error fetching POIs:', error);
      showSnackbar('Error fetching POIs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapInitialized) return;
    fetchPOIs();
  }, [mapInitialized]);

  // Handle Map Clicks for Point, Circle, Polygon, Road
  useEffect(() => {
    const hdMap = mapplsMapRef.current;

    // Manage Cursor with CSS Class
    if (hdMapContainerIdRef.current) {
      const container = document.getElementById(hdMapContainerIdRef.current);
      if (container) {
        if (['point', 'circle', 'polygon', 'road'].includes(drawingMode)) {
          container.classList.add('drawing-mode-active');
        } else {
          container.classList.remove('drawing-mode-active');
        }
      }
    }

    if (!['point', 'circle', 'polygon', 'road'].includes(drawingMode) || !hdMap) return;

    const clickHandler = (e) => {
      let lat, lng;
      if (e.lngLat) { lat = e.lngLat.lat; lng = e.lngLat.lng; }
      else if (e.latLng) { lat = e.latLng.lat; lng = e.latLng.lng; }

      if (lat && lng) {
        if (drawingMode === 'point') {
          setFormData(prev => ({
            ...prev,
            location: JSON.stringify([[lat, lng]]),
            mark_type: 'Point',
            radius: '100.5'
          }));
          handleReverseGeocode(lat, lng);
          setDialogOpen(true);
          setDrawingMode(null);
        }
        else if (drawingMode === 'circle') {
          setFormData(prev => ({
            ...prev,
            location: JSON.stringify([[lat, lng]]),
            mark_type: 'Circle',
            radius: '100'
          }));
          handleReverseGeocode(lat, lng);
          setDialogOpen(true);
          setDrawingMode(null);
        }
        else if (drawingMode === 'polygon' || drawingMode === 'road') {
          setDrawingPoints(prev => [...prev, [lat, lng]]);
        }
      }
    };

    if (hdMap.addListener) hdMap.addListener('click', clickHandler);
    else if (hdMap.on) hdMap.on('click', clickHandler);

    return () => {
      if (hdMap.removeListener) hdMap.removeListener('click', clickHandler);
      else if (hdMap.off) hdMap.off('click', clickHandler);

      // Reset cursor on cleanup
      if (hdMapContainerIdRef.current) {
        const container = document.getElementById(hdMapContainerIdRef.current);
        if (container) container.classList.remove('drawing-mode-active');
      }
    };
  }, [drawingMode]);

  // Visualize Polygon/Road drawing
  useEffect(() => {
    if (!mapplsMapRef.current) return;
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

    if ((drawingMode === 'polygon' || drawingMode === 'road') && drawingPoints.length > 0) {
      // Mappls SDK expects paths like [{lat, lng}]
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
          const marker = new window.mappls.Marker({
            map: hdMap,
            position: pt,
            icon: iconUrl,
            width: 12,
            height: 12
          });
          tempMarkersRef.current.push(marker);
        } catch (e) {
          console.error("Error creating temp marker", e);
        }
      });

      if (drawingPoints.length > 1) {
        try {
          const tempPoly = new window.mappls.Polyline({
            map: hdMap,
            paths: paths,
            strokeColor: '#333333',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            strokeStyle: 'dashed'
          });
          tempPolyRef.current = tempPoly;
        } catch (e) {
          console.error("Error drawing temp polyline", e);
        }
      }
    }
  }, [drawingPoints, drawingMode]);

  // Sync POIs to HD Map
  useEffect(() => {
    if (!mapplsMapRef.current) {
      console.log('HD Map not ready yet');
      return;
    }
    const hdMap = mapplsMapRef.current;
    console.log('Syncing POIs to HD Map, total POIs:', pois.length);

    // Clear existing markers
    hdPoiMarkersRef.current.forEach(m => {
      try {
        if (m && typeof m.remove === 'function') {
          m.remove();
        }
      } catch (e) {
        console.error('Error removing marker:', e);
      }
    });
    hdPoiMarkersRef.current = [];

    // Check if mappls is available
    if (typeof window.mappls === 'undefined') {
      console.log('Mappls library not available');
      return;
    }

    const handleMarkerClick = (poi, marker) => {
      console.log('Marker clicked for POI:', poi.name);
      setSelectedPoi(poi);

      // Create info window for the marker
      const infoContent = `
        <div style="padding: 10px; min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${poi.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${poi.description || 'No description'}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">Type: ${poi.use_type}</p>
        </div>
      `;

      // Show popup on marker
      marker.setPopup(infoContent);
    };

    let markersCreated = 0;
    pois.forEach(poi => {
      try {
        const location = JSON.parse(poi.location);
        // console.log('Processing POI:', poi.name, 'Type:', poi.mark_type);

        // Define colors based on use_type
        const poiColor = getUseTypeColor(poi);

        // Handle different mark types
        if (poi.mark_type === "Point") {
          if (!Array.isArray(location) || location.length === 0 || !location[0]) return;
          const [lat, lon] = location[0];
          const latNum = Number(lat);
          const lonNum = Number(lon);

          if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
            const iconUrl = getPoiMarkerIcon(poiColor);
            const markerOptions = {
              map: hdMap,
              position: { lat: latNum, lng: lonNum },
              title: poi.name,
              icon: iconUrl,
              width: 28,
              height: 36
            };

            const marker = new window.mappls.Marker(markerOptions);
            marker.addListener('click', () => handleMarkerClick(poi, marker));
            hdPoiMarkersRef.current.push(marker);
            markersCreated++;
          }
        }
        else if (poi.mark_type === "Circle") {
          if (!Array.isArray(location) || location.length === 0 || !location[0]) return;
          const [lat, lon] = location[0];
          const radius = Number(poi.radius) || 100;

          const circle = new window.mappls.Circle({
            map: hdMap,
            center: { lat: Number(lat), lng: Number(lon) },
            radius: radius,
            fillColor: poiColor,
            fillOpacity: 0.3,
            strokeColor: poiColor,
            strokeWeight: 2
          });
          // Bind popup mechanism if supported by Circle, otherwise click event
          // Note: Mappls Circle might not support setPopup directly safely, better to use click
          /* 
            // circle.addListener('click', (e) => handleMarkerClick(poi, circle)); 
            // Error handling strictly for safe implementation
          */
          hdPoiMarkersRef.current.push(circle);
          markersCreated++;
        }
        else if (poi.mark_type === "Polygon") {
          if (!Array.isArray(location) || location.length < 3) return;

          // Convert format [[lat, lng], ...] to [{lat, lng}, ...] if needed by SDK or leave as array of objects?
          // Mappls Polygon paths expects [{lat:.., lng:..}] or [[lat,lng]] depending on version. 
          // Standard Mappls usually accepts objects.
          const paths = location.map(pt => ({ lat: Number(pt[0]), lng: Number(pt[1]) }));

          const polygon = new window.mappls.Polygon({
            map: hdMap,
            paths: paths,
            fillColor: poiColor,
            fillOpacity: 0.3,
            strokeColor: poiColor,
            strokeWeight: 2
          });
          hdPoiMarkersRef.current.push(polygon);
          markersCreated++;
        }
        else if (poi.mark_type === "Road") {
          // Road is a Polyline
          if (!Array.isArray(location) || location.length < 2) return;

          const paths = location.map(pt => ({ lat: Number(pt[0]), lng: Number(pt[1]) }));

          const polyline = new window.mappls.Polyline({
            map: hdMap,
            paths: paths,
            strokeColor: poiColor,
            strokeWeight: 4
          });
          hdPoiMarkersRef.current.push(polyline);
          markersCreated++;
        }

      } catch (e) {
        console.error('Error processing POI:', poi.name, e);
      }
    });
    console.log('Total markers created:', markersCreated);
  }, [pois]);

  const handleEditClick = (poi) => {
    setFormData({
      name: poi.name,
      description: poi.description,
      status: poi.status,
      mark_type: poi.mark_type,
      use_type: poi.use_type,
      location: poi.location,
      radius: poi.radius,
      alert_type: poi.alert_type || 'None',
      speed_limit: poi.speed_limit || 0,
    });
    setSelectedPoi(poi);
    setIsEditMode(true);
    setDialogOpen(true);
    setPopoverOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });

      // Ensure backend-required fields are present
      const status2 = formData.status || 'Active';
      let lat = '';
      let lon = '';
      let address = formData.description || formData.name || '';

      try {
        if (formData.location) {
          const parsedLocation = typeof formData.location === 'string'
            ? JSON.parse(formData.location)
            : formData.location;

          if (Array.isArray(parsedLocation) && parsedLocation.length > 0) {
            const firstPoint = parsedLocation[0];
            if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
              lat = firstPoint[0];
              lon = firstPoint[1];
            }
          }
        }
      } catch (e) {
        console.error('Error parsing POI location for lat/lon', e);
      }

      formDataObj.append('status2', status2);
      formDataObj.append('lat', lat);
      formDataObj.append('lon', lon);
      formDataObj.append('address', address);

      if (isEditMode && selectedPoi) {
        formDataObj.append('poi_id', selectedPoi.id);
        await POIService.updatePOI(formDataObj);
        showSnackbar('POI updated successfully', 'success');
      } else {
        await POIService.createPOI(formDataObj);
        showSnackbar('POI created successfully', 'success');
      }

      setDialogOpen(false);
      setIsEditMode(false);
      setSelectedPoi(null);
      fetchPOIs();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving POI. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPoi) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('poi_id', selectedPoi.id);
      const res = await POIService.deletePOI(formDataObj);
      showSnackbar('POI deleted successfully', 'success');

      setSelectedPoi(null);
      setPopoverOpen(false);
      fetchPOIs();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error deleting POI. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const handleResize = () => {
      if (mapplsMapRef.current && mapplsMapRef.current.resize) {
        mapplsMapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrawingModeChange = (event, newMode) => {
    setDrawingMode(newMode);
    setIsEditMode(false);
    setSelectedPoi(null);
    setRoutePoints([]);
    setDrawingPoints([]);

    // Clear any temporary drawing state if needed
    // For Mappls, 'point' mode is handled by map click listener
    // ensure other modes don't break things
  };


  const handleCancel = () => {
    setDialogOpen(false);
    setIsEditMode(false);
    setSelectedPoi(null);
    setDrawingMode(null);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      mark_type: 'Point',
      use_type: 'School',
      location: '',
      radius: '100.5',
      alert_type: '',
      speed_limit: 0,
    });
  };



  // Add route vector layer
  useEffect(() => {
    // Route layer logic for Mappls would go here
  }, []);

  const fetchRoute = async (points) => {
    try {
      setLoading(true);

      // Validate points are not too close to each other
      const distance = Math.sqrt(
        Math.pow(points[1][0] - points[0][0], 2) +
        Math.pow(points[1][1] - points[0][1], 2)
      );

      if (distance < 0.0001) { // Points are too close
        throw new Error('Selected points are too close to each other. Please select points further apart.');
      }

      const response = await HomePageService.getRoute({ points });
      const routeData = response?.data?.data && response.data.data.paths ? response.data.data : response.data;

      if (!routeData?.paths?.[0]?.points) {
        throw new Error('No route found between the selected points');
      }

      const firstPath = routeData.paths[0];
      let coordinates;

      if (firstPath.points.type === "LineString" && Array.isArray(firstPath.points.coordinates)) {
        // Convert coordinates to [lat, lon] format
        coordinates = firstPath.points.coordinates.map(coord => [coord[1], coord[0]]);

        // Validate coordinates
        if (coordinates.length < 2) {
          throw new Error('Invalid route: Not enough points in the route');
        }

        // Check for invalid coordinates
        if (coordinates.some(coord => !coord || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1]))) {
          throw new Error('Invalid coordinates in route');
        }
      } else {
        throw new Error('Invalid route data structure');
      }

      // Display the route
      // displayRoute(coordinates); // Mappls route display pending implementation

      // Update form data with the route coordinates
      setFormData(prev => ({
        ...prev,
        location: JSON.stringify(coordinates),
        mark_type: 'Road',
        use_type: 'PermitRoute',
        name: `Route ${Date.now()}`,
        description: 'Generated route',
        status: 'Active',
        alert_type: prev.alert_type || '',
        speed_limit: prev.speed_limit || 0,
      }));

      // Open the dialog to show the route data
      setDialogOpen(true);

      // Reset points
      setRoutePoints([]);
    } catch (error) {
      console.error('Error fetching route:', error);
      showSnackbar(error.message || 'Error fetching route. Please try again.', 'error');
      setRoutePoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePoiClick = (poi) => {
    setSelectedPoiId(poi.id);
    // Center map on selected POI (Mappls HD Map)
    if (poi.location && mapplsMapRef.current) {
      try {
        const location = JSON.parse(poi.location);
        if (Array.isArray(location) && location.length > 0) {
          const [lat, lon] = location[0];
          // Use Mappls API to pan/zoom
          const mapInstance = mapplsMapRef.current;
          const targetPos = { lat: Number(lat), lng: Number(lon) };

          if (mapInstance.panTo) {
            mapInstance.panTo(targetPos);
          } else if (mapInstance.setCenter) {
            mapInstance.setCenter(targetPos);
          }

          if (mapInstance.setZoom) {
            mapInstance.setZoom(15);
          }
        }
      } catch (error) {
        console.error('Error parsing POI location:', error);
      }
    }
  };

  const handleGeoSearch = async () => {
    if (!geoSearchQuery.trim()) return;

    try {
      setGeoSearchLoading(true);
      // // Use proxy path /mappls/ to avoid CORS
      // const url = `/mappls/search/address/geocode?address=${encodeURIComponent(geoSearchQuery)}&access_token=${MAPPLS_GEOCODING_TOKEN}`;

      const url = `https://api.gromed.in/api/geocode/?q=${encodeURIComponent(geoSearchQuery)}`;

      console.log('Fetching geocode via Axios (Proxy):', url);
      const response = await axios.get(url);

      // Axios treats 2xx as success by default
      if (response.status === 200) {
        const data = response.data;
        console.log('Geocoding response data:', data);

        // Mappls SDK sometimes wraps results differently or returns 200 even with empty results
        let results = [];
        if (data.copResults) {
          if (Array.isArray(data.copResults)) {
            results = data.copResults;
          } else {
            results = [data.copResults];
          }
        } else if (Array.isArray(data)) {
          results = data;
        }

        setGeoSearchResults(results);
        if (results.length === 0) {
          showSnackbar('No results found', 'info');
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
    const hdMap = mapplsMapRef.current;
    if (hdMap && result.eLoc) {
      try {
        // Check for hidden lat/lng
        let lat = result.latitude || result.lat;
        let lng = result.longitude || result.lng;

        // If lat/lng are missing, try to fetch them using eLoc
        if (!lat || !lng) {
          try {
            // Use the user provided URL format
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
            // Fallback to original behavior if fetch fails
          }
        }

        if (lat && lng) {
          const pos = { lat: parseFloat(lat), lng: parseFloat(lng) };

          console.log('Attempting to pan map to:', pos);
          console.log('Current map center before pan:', hdMap.getCenter());
          console.log('Current map zoom before pan:', hdMap.getZoom());

          // Use Mappls API methods as per documentation
          try {
            // Try panTo first
            if (typeof hdMap.panTo === 'function') {
              console.log('Calling panTo with:', { lat: pos.lat, lng: pos.lng });
              hdMap.panTo({ lat: pos.lat, lng: pos.lng });
            }

            // Also try setCenter as backup
            if (typeof hdMap.setCenter === 'function') {
              console.log('Calling setCenter with:', { lat: pos.lat, lng: pos.lng });
              hdMap.setCenter({ lat: pos.lat, lng: pos.lng });
            }

            // Set zoom
            if (typeof hdMap.setZoom === 'function') {
              console.log('Calling setZoom with: 16');
              hdMap.setZoom(16);
            }

            // Clear previous search marker if exists
            if (window.searchMarker) {
              try { window.searchMarker.remove(); } catch (e) { }
            }

            // Add marker at the searched location
            if (window.mappls && window.mappls.Marker) {
              const iconUrl = getPoiMarkerIcon('#FF0000'); // Red marker

              const marker = new window.mappls.Marker({
                map: hdMap,
                position: pos,
                icon: iconUrl,
                width: 30,
                height: 40,
                popupHtml: `
                  <div style="padding: 12px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #333;">
                      ${result.poi || result.placeName || result.locality || 'Location'}
                    </h3>
                    <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.4;">
                      ${result.formattedAddress || result.address || 'No address available'}
                    </p>
                    ${result.district ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">District: ${result.district}</p>` : ''}
                    ${result.state ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #999;">State: ${result.state}</p>` : ''}
                    <p style="margin: 6px 0 0 0; font-size: 10px; color: #999;">
                      ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}
                    </p>
                  </div>
                `
              });

              window.searchMarker = marker;
              console.log('Search marker added at:', pos);
            }

            // Check after panning
            setTimeout(() => {
              console.log('Map center after pan:', hdMap.getCenter());
              console.log('Map zoom after pan:', hdMap.getZoom());
            }, 500);

          } catch (error) {
            console.error('Error during pan:', error);
          }

          console.log('Map panned to:', pos);
        } else {
          // Use eLoc - Avoid panTo as it requires explicit coordinates
          console.log('Using eLoc for navigation:', result.eLoc);

          if (typeof hdMap.setCenter === 'function') {
            hdMap.setCenter({ eloc: result.eLoc, zoom: 16 });
          } else if (typeof hdMap.moveCamera === 'function') {
            hdMap.moveCamera({ center: { eloc: result.eLoc }, zoom: 16 });
          }
        }
      } catch (e) {
        console.error("Error panning to eLoc:", e);
        showSnackbar('Error moving map to location', 'error');
      }
    }
    setGeoSearchDialogOpen(false);
  };


  const handleReverseGeocode = async (lat, lng) => {
    try {
      // // Use proxy path /mappls to avoid CORS
      // const url = `/mappls/search/address/rev-geocode?lat=${lat}&lng=${lng}&access_token=${MAPPLS_GEOCODING_TOKEN}`;
      const url = `https://api.gromed.in/api/reverse_geocode/?lat=${lat}&lon=${lng}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        const data = response.data;
        console.log('Reverse Geocoding response:', data);
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const address = result.formatted_address;
          setFormData(prev => ({
            ...prev,
            description: address, // Pre-fill description with address
            // Use city/district for name if empty? 
            name: prev.name ? prev.name : (result.poi || result.locality || 'New POI')
          }));
          showSnackbar(`Location: ${address}`, 'success');
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const getPoiIcon = (markType) => {
    switch (markType) {
      case 'Point':
        return <LocationOnIcon />;
      case 'Circle':
        return <CircleIcon />;
      case 'Polygon':
        return <PolylineIcon />;
      case 'Road':
        return <RouteIcon />;
      default:
        return <LocationOnIcon />;
    }
  };

  const filteredPois = pois.filter(poi => {
    const searchLower = searchQuery.toLowerCase();
    return (
      poi.name.toLowerCase().includes(searchLower) ||
      (poi.description && poi.description.toLowerCase().includes(searchLower)) ||
      poi.use_type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>


      {/* Main Map Container (HD) */}
      <Box ref={hdMapContainerRef} sx={{ height: '100%', width: '100%', display: 'block', position: 'relative' }}>
        <div ref={hdMapInnerRef} style={{ width: "100%", height: "100%", position: "absolute" }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: "absolute", bottom: 0, left: 0, height: "60px", zIndex: 100, pointerEvents: "none" }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: "absolute", top: 0, right: 0, height: "60px", zIndex: 100, pointerEvents: "none" }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: "absolute", bottom: "20px", right: 0, height: "60px", zIndex: 100, pointerEvents: "none" }} />
      </Box>

      {/* Zoom Controls Container */}
      <Box
        id="zoom-control-container"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          overflow: 'hidden',
          zIndex: 1000,
          '& .custom-zoom-control': {
            display: 'flex',
            flexDirection: 'column',
            '& button': {
              width: 32,
              height: 32,
              padding: 0,
              backgroundColor: 'background.paper',
              border: 'none',
              borderBottom: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              '&:last-child': {
                borderBottom: 'none',
              },
            },
          },
        }}
      />

      {/* POI List Toggle Button */}
      <IconButton
        onClick={() => setPoiListOpen(!poiListOpen)}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
          zIndex: 1000,
        }}
      >
        <ListIcon />
      </IconButton>

      {/* POI List Drawer */}
      <Drawer
        anchor="left"
        open={poiListOpen}
        onClose={() => setPoiListOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">POI List</Typography>
            <IconButton onClick={() => setPoiListOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          <TextField
            fullWidth
            size="small"
            placeholder="Search POIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
          />
        </Box>
        <List sx={{ p: 1 }}>
          {filteredPois.map((poi) => (
            <ListItemButton
              key={poi.id}
              selected={selectedPoiId === poi.id}
              onClick={() => handlePoiClick(poi)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                },
              }}
            >
              <ListItemIcon>
                {getPoiIcon(poi.mark_type)}
              </ListItemIcon>
              <ListItemText
                primary={poi.name}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={poi.use_type}
                      size="small"
                      color="primary"
                      sx={{ height: 20 }}
                    />
                    <Chip
                      label={poi.status}
                      size="small"
                      color={poi.status === 'Active' ? 'success' : 'error'}
                      sx={{ height: 20 }}
                    />
                  </Stack>
                }
              />
            </ListItemButton>
          ))}
          {filteredPois.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No POIs found
              </Typography>
            </Box>
          )}
        </List>
      </Drawer>

      {/* Top Right Controls */}
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Stack spacing={1} p={1.5}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 1 }}>
            Drawing Tools
          </Typography>

          <Stack direction="row" spacing={1} sx={{ pb: 0.5 }}>
            <Tooltip title="Point">
              <span>
                <IconButton
                  color={drawingMode === 'point' ? 'primary' : 'default'}
                  onClick={() => handleDrawingModeChange(null, 'point')}
                  sx={{
                    backgroundColor: drawingMode === 'point' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <LocationOnIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Circle">
              <span>
                <IconButton
                  color={drawingMode === 'circle' ? 'primary' : 'default'}
                  onClick={() => handleDrawingModeChange(null, 'circle')}
                  sx={{
                    backgroundColor: drawingMode === 'circle' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <CircleIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Polygon">
              <span>
                <IconButton
                  color={drawingMode === 'polygon' ? 'primary' : 'default'}
                  onClick={() => handleDrawingModeChange(null, 'polygon')}
                  sx={{
                    backgroundColor: drawingMode === 'polygon' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <PolylineIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Road">
              <span>
                <IconButton
                  color={drawingMode === 'road' ? 'primary' : 'default'}
                  onClick={() => handleDrawingModeChange(null, 'road')}
                  disabled={false}
                  sx={{
                    backgroundColor: drawingMode === 'road' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <RouteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>


          <Divider />

          <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 1 }}>
            Map Controls
          </Typography>

          <Stack direction="row" spacing={1} sx={{ pb: 0.5 }}>
            <Tooltip title="Geocoding Search">
              <IconButton onClick={() => setGeoSearchDialogOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="My Location">
              <IconButton>
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Floating Finish Drawing Button */}
      <Fade in={['polygon', 'road'].includes(drawingMode) && drawingPoints.length > 2}>
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CloseIcon sx={{ transform: 'rotate(45deg)' }} />} // Check mark
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                location: JSON.stringify(drawingPoints),
                mark_type: drawingMode === 'road' ? 'Road' : 'Polygon',
                radius: '0'
              }));
              setDialogOpen(true);
              setDrawingMode(null);
              setDrawingPoints([]);
            }}
            sx={{
              borderRadius: 28,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontWeight: 600,
              fontSize: '1rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            {drawingMode === 'road' ? 'Finish Road' : 'Finish Polygon'}
          </Button>
        </Box>
      </Fade>

      {/* POI Info Tooltip */}
      {selectedPoi && popoverOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            left: popoverAnchor ? popoverAnchor[0] : '50%',
            top: popoverAnchor ? popoverAnchor[1] - 20 : '50%', // Increased offset for better positioning
            width: 280,
            borderRadius: 1,
            overflow: 'visible',
            zIndex: 1000, // Ensure tooltip is above markers
            '&:before': {
              content: '""',
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 12,
              height: 12,
              backgroundColor: 'background.paper',
              boxShadow: 1,
              zIndex: 0,
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              backgroundColor: 'background.paper',
              zIndex: 1,
            }}
          >
            {selectedPoi.image && (
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  backgroundColor: 'grey.100',
                  backgroundImage: `url(${selectedPoi.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              />
            )}
            <Box sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start" mb={1}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedPoi.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedPoi.description || 'No description provided'}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setPopoverOpen(false)}
                  sx={{
                    mt: -0.5,
                    mr: -0.5,
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={0.5} mb={1}>
                <Chip
                  label={selectedPoi.use_type}
                  size="small"
                  color="primary"
                  sx={{
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                    },
                  }}
                />
                <Chip
                  label={selectedPoi.status}
                  size="small"
                  color={selectedPoi.status === 'Active' ? 'success' : 'error'}
                  sx={{
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                    },
                  }}
                />
                {selectedPoi.radius && (
                  <Chip
                    label={`${selectedPoi.radius}m`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      },
                    }}
                  />
                )}
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleEditClick(selectedPoi);
                    setPopoverOpen(false);
                  }}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    py: 0.5,
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => {
                    handleDelete();
                    setPopoverOpen(false);
                  }}
                  disabled={loading}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    py: 0.5,
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Geocoding Search Dialog */}
      <Dialog
        open={geoSearchDialogOpen}
        onClose={() => setGeoSearchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <Box sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Search Location
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              size="medium"
              placeholder="Search address, city, or place..."
              value={geoSearchQuery}
              onChange={(e) => setGeoSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGeoSearch(); }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: geoSearchLoading ? <CircularProgress size={20} /> : null,
                sx: {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleGeoSearch}
              disabled={geoSearchLoading}
              sx={{
                minWidth: 100,
                height: 56,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Search
            </Button>
          </Stack>
        </Box>
        <DialogContent sx={{ p: 0, minHeight: 300, maxHeight: 500, overflow: 'auto' }}>
          {geoSearchResults && geoSearchResults.length > 0 ? (
            <List sx={{ p: 2 }}>
              {geoSearchResults.map((result, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handleGeoResultClick(result)}
                    sx={{ p: 2 }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        }}
                      >
                        <LocationOnIcon color="error" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {result.poi || result.formattedAddress || result.locality}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {[result.district, result.city, result.state].filter(Boolean).join(', ')}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 4,
              flexDirection: 'column'
            }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary" align="center" variant="body1">
                {geoSearchLoading ? 'Searching...' : 'Enter an address to search'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {selectedPoi ? 'Edit POI' : 'New POI'}
            </Typography>
            <IconButton onClick={handleCancel} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              size="small"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              size="small"
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="NotActive">Not Active</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Mark Type</InputLabel>
                <Select
                  value={formData.mark_type}
                  label="Mark Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, mark_type: e.target.value }))}
                >
                  <MenuItem value="Point">Point</MenuItem>
                  <MenuItem value="Circle">Circle</MenuItem>
                  <MenuItem value="Polygon">Polygon</MenuItem>
                  <MenuItem value="Road">Road</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Use Type</InputLabel>
              <Select
                value={formData.use_type}
                label="Use Type"
                onChange={(e) => setFormData(prev => ({ ...prev, use_type: e.target.value }))}
              >
                <MenuItem value="StateBoundary">State Boundary</MenuItem>
                <MenuItem value="DistrictBoundary">District Boundary</MenuItem>
                <MenuItem value="CityBoundary">City Boundary</MenuItem>
                <MenuItem value="VillageBoundary">Village Boundary</MenuItem>
                <MenuItem value="PermitRoute">Permit Route</MenuItem>
                <MenuItem value="School">School</MenuItem>
                <MenuItem value="Hospital">Hospital</MenuItem>
                <MenuItem value="PoliceStation">Police Station</MenuItem>
                <MenuItem value="BusStop">Bus Stop</MenuItem>
                <MenuItem value="RailwayStation">Railway Station</MenuItem>
                <MenuItem value="Airport">Airport</MenuItem>
                <MenuItem value="FuelStation">Fuel Station</MenuItem>
                <MenuItem value="TollGate">Toll Gate</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="dealer">Dealer</MenuItem>
                <MenuItem value="prohibited_area">Prohibited Area</MenuItem>
                <MenuItem value="no_entry">No Entry</MenuItem>
                <MenuItem value="parking">Parking</MenuItem>
                <MenuItem value="no_parking">No Parking</MenuItem>
              </Select>
            </FormControl>

            {formData.mark_type === 'Road' && (
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Alert Type"
                  value={formData.alert_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, alert_type: e.target.value }))}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Speed Limit (km/h)"
                  type="number"
                  value={formData.speed_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed_limit: e.target.value }))}
                  size="small"
                />
              </Stack>
            )}

            {formData.mark_type === 'Circle' && (
              <TextField
                fullWidth
                label="Radius (meters)"
                type="number"
                value={formData.radius}
                onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                size="small"
              />
            )}

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              InputProps={{ readOnly: true }}
              size="small"
              helperText="Click on the map to set location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                },
              }}
            />
          </Stack>
        </DialogContent>

        <Box sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              size="small"
              sx={{ px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.location}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              size="small"
              sx={{ px: 3 }}
            >
              {selectedPoi ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

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


    </Box>
  );
};

export default POIViewer;
