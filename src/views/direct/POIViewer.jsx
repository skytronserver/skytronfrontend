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
  Public as PublicIcon,
  People as PeopleIcon,
  List as ListIcon,
} from '@mui/icons-material';
 import { Draw } from "ol/interaction";
 import Feature from "ol/Feature";
 import Point from "ol/geom/Point";
 import Polygon from "ol/geom/Polygon";
 import Circle from "ol/geom/Circle";
 import LineString from "ol/geom/LineString";
 import { Fill, Stroke, Style, Circle as CircleStyle, Text } from "ol/style";
 import "ol/ol.css";
import POIService from '../../services/POIService';
import HomePageService from '../../services/HomePage';
import axios from 'axios';
import BhuvanMapComponent from '../../components/Map/BhuvanMapComponent';

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





  const mapRef = useRef(null);
  const poiVectorLayerRef = useRef(null);
  const drawVectorLayerRef = useRef(null);
  const drawInteractionRef = useRef(null);
  const searchFeatureRef = useRef(null);
  const poiClickHandlerRef = useRef(null);



  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    status: 'Active',
    mark_type: 'Point',
    use_type: 'School',
    location: '',
    radius: '100.5',
    alert_type: '',
    speed_limit: 0,
  });
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

  const handleMapReady = ({ map, poiVectorLayer, drawVectorLayer }) => {
    if (mapRef.current && poiClickHandlerRef.current) {
      try {
        mapRef.current.un('singleclick', poiClickHandlerRef.current);
      } catch (e) {
        // ignore
      }
      poiClickHandlerRef.current = null;
    }

    mapRef.current = map || null;
    poiVectorLayerRef.current = poiVectorLayer || null;
    drawVectorLayerRef.current = drawVectorLayer || null;

    const poiLayer = poiVectorLayerRef.current;
    const source = poiLayer?.getSource?.();
    if (source) {
      source.clear();
      pois.forEach((poi) => {
        const feature = createPoiFeature(poi);
        if (feature) source.addFeature(feature);
      });
    }

    searchFeatureRef.current = null;

    if (mapRef.current) {
      const clickHandler = (evt) => {
        let foundPoi = null;
        try {
          mapRef.current.forEachFeatureAtPixel(evt.pixel, (feature) => {
            const poi = feature?.get?.('poi');
            if (poi) {
              foundPoi = poi;
              return true;
            }
            return false;
          });
        } catch (e) {
          // ignore
        }

        if (foundPoi) {
          setSelectedPoi(foundPoi);
          setSelectedPoiId(foundPoi.id);
          setPopoverAnchor(evt.pixel);
          setPopoverOpen(true);
        } else {
          setPopoverOpen(false);
        }
      };

      poiClickHandlerRef.current = clickHandler;
      mapRef.current.on('singleclick', clickHandler);
    }
  };

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
    fetchPOIs();
  }, []);

  const getPoiStyles = (poi) => {
    const baseColor = getUseTypeColor(poi);
    const fillColor = hexToRgba(baseColor, 0.18);

    const primaryLabel = poi?.name?.trim();
    const secondaryLabel = poi?.use_type?.trim();
    const fallbackLabel = poi?.description?.trim();
    const displayText =
      primaryLabel || secondaryLabel || fallbackLabel || `POI ${poi?.id ?? ''}`;

    const createText = (overrides = {}) =>
      new Text({
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

  const createPoiFeature = (poi) => {
    let coordinates;
    try {
      coordinates = JSON.parse(poi.location);
    } catch (e) {
      return null;
    }

    if (!Array.isArray(coordinates) || coordinates.length === 0) return null;

    if (poi.mark_type === 'Point' || poi.mark_type === 'Circle') {
      const first = coordinates[0];
      if (!Array.isArray(first) || first.length < 2) return null;
      const lat = Number(first[0]);
      const lng = Number(first[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      if (poi.mark_type === 'Point') {
        const feature = new Feature({ geometry: new Point([lng, lat]) });
        feature.set('poi', poi);
        feature.setStyle(getPoiStyles(poi));
        return feature;
      }

      const radius = Number(poi.radius) || 100;
      const feature = new Feature({ geometry: new Circle([lng, lat], radius) });
      feature.set('poi', poi);
      feature.setStyle(getPoiStyles(poi));
      return feature;
    }

    if (poi.mark_type === 'Polygon') {
      if (coordinates.length < 3) return null;
      const ring = coordinates
        .map((pt) => [Number(pt[1]), Number(pt[0])])
        .filter((pt) => Number.isFinite(pt[0]) && Number.isFinite(pt[1]));
      if (ring.length < 3) return null;
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([...ring[0]]);
      }
      const feature = new Feature({ geometry: new Polygon([ring]) });
      feature.set('poi', poi);
      feature.setStyle(getPoiStyles(poi));
      return feature;
    }

    if (poi.mark_type === 'Road') {
      if (coordinates.length < 2) return null;
      const lineCoords = coordinates
        .map((pt) => [Number(pt[1]), Number(pt[0])])
        .filter((pt) => Number.isFinite(pt[0]) && Number.isFinite(pt[1]));
      if (lineCoords.length < 2) return null;
      const feature = new Feature({ geometry: new LineString(lineCoords) });
      feature.set('poi', poi);
      feature.setStyle(getPoiStyles(poi));
      return feature;
    }

    return null;
  };

  useEffect(() => {
    const poiLayer = poiVectorLayerRef.current;
    const source = poiLayer?.getSource?.();
    if (!source) return;

    source.clear();
    pois.forEach((poi) => {
      const feature = createPoiFeature(poi);
      if (feature) source.addFeature(feature);
    });
  }, [pois]);

  useEffect(() => {
    const mapInstance = mapRef.current;
    const drawLayer = drawVectorLayerRef.current;
    if (!mapInstance || !drawLayer) return;

    if (drawInteractionRef.current) {
      try {
        mapInstance.removeInteraction(drawInteractionRef.current);
      } catch (e) {
        // ignore
      }
      drawInteractionRef.current = null;
    }

    if (!drawingMode) return;

    const modeToType = {
      point: 'Point',
      circle: 'Circle',
      polygon: 'Polygon',
      road: 'LineString',
    };

    const type = modeToType[drawingMode];
    if (!type) return;

    const source = drawLayer.getSource();
    source.clear();

    const draw = new Draw({ source, type });
    draw.on('drawend', (evt) => {
      const geom = evt.feature.getGeometry();
      if (!geom) return;

      if (drawingMode === 'point') {
        const [lng, lat] = geom.getCoordinates();
        setFormData((prev) => ({ ...prev, location: JSON.stringify([[lat, lng]]), mark_type: 'Point', radius: prev.radius || '100.5' }));
        handleReverseGeocode(lat, lng);
        setDialogOpen(true);
        setDrawingMode(null);
        return;
      }

      if (drawingMode === 'circle') {
        const [lng, lat] = geom.getCenter();
        setFormData((prev) => ({ ...prev, location: JSON.stringify([[lat, lng]]), mark_type: 'Circle', radius: prev.radius || '100' }));
        handleReverseGeocode(lat, lng);
        setDialogOpen(true);
        setDrawingMode(null);
        return;
      }

      if (drawingMode === 'polygon') {
        const ring = geom.getCoordinates()?.[0] || [];
        const latLng = ring.map(([lng, lat]) => [lat, lng]);
        setFormData((prev) => ({ ...prev, location: JSON.stringify(latLng), mark_type: 'Polygon', radius: '0' }));
        setDialogOpen(true);
        setDrawingMode(null);
        return;
      }

      if (drawingMode === 'road') {
        const coords = geom.getCoordinates() || [];
        const latLng = coords.map(([lng, lat]) => [lat, lng]);
        setFormData((prev) => ({ ...prev, location: JSON.stringify(latLng), mark_type: 'Road', use_type: 'PermitRoute', radius: '0' }));
        setDialogOpen(true);
        setDrawingMode(null);
      }
    });

    mapInstance.addInteraction(draw);
    drawInteractionRef.current = draw;

    return () => {
      if (drawInteractionRef.current && mapInstance) {
        try {
          mapInstance.removeInteraction(drawInteractionRef.current);
        } catch (e) {
          // ignore
        }
       }
       drawInteractionRef.current = null;
     };
   }, [drawingMode]);

   const handleEditClick = (poi) => {
     setFormData({
       name: poi.name,
       address: poi.address || '',
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

      // Explicitly append fields as requested
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('address', formData.address);
      formDataObj.append('status', formData.status);
      formDataObj.append('status2', formData.status); // Mapping status to status2
      formDataObj.append('mark_type', formData.mark_type);
      formDataObj.append('use_type', formData.use_type);
      formDataObj.append('location', formData.location);

      // Add other fields conditionally
      if (formData.radius) {
        formDataObj.append('radius', formData.radius);
      }
      if (formData.alert_type) {
        formDataObj.append('alert_type', formData.alert_type);
      }
      if (formData.speed_limit) {
        formDataObj.append('speed_limit', formData.speed_limit);
      }

      // Send separate lat/lon for Point type
      if (formData.mark_type === 'Point') {
        try {
          const loc = JSON.parse(formData.location);
          if (Array.isArray(loc) && loc.length > 0 && Array.isArray(loc[0])) {
            formDataObj.append('lat', loc[0][0]);
            formDataObj.append('lon', loc[0][1]);
          }
        } catch (e) {
          console.error('Error extracting lat/lon:', e);
        }
      }

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
      try {
        mapRef.current?.updateSize?.();
      } catch (e) {
        // ignore
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
      address: '',
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
    // Center map on selected POI (OpenLayers)
    const mapInstance = mapRef.current;
    if (poi.location && mapInstance) {
      try {
        const location = JSON.parse(poi.location);
        if (Array.isArray(location) && location.length > 0) {
          const [lat, lon] = location[0];
          const view = mapInstance.getView();
          view.setCenter([Number(lon), Number(lat)]);
          view.setZoom(15);
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
    const mapInstance = mapRef.current;
    if (mapInstance) {
      const latRaw = result.latitude || result.lat;
      const lngRaw = result.longitude || result.lng || result.lon;
      const lat = Number(latRaw);
      const lng = Number(lngRaw);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const view = mapInstance.getView();
        view.setCenter([lng, lat]);
        view.setZoom(16);

        const poiLayer = poiVectorLayerRef.current;
        if (poiLayer) {
          const source = poiLayer.getSource();
          const previous = searchFeatureRef.current;
          if (previous) {
            try {
              source.removeFeature(previous);
            } catch (e) {
              // ignore
            }
          }

          const feature = new Feature({
            geometry: new Point([lng, lat]),
          });
          feature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: "#E53935" }),
                stroke: new Stroke({ color: "#ffffff", width: 2 }),
              }),
            })
          );
          source.addFeature(feature);
          searchFeatureRef.current = feature;
        }
      } else {
        showSnackbar('Selected location is missing coordinates', 'error');
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
            address: address, // Pre-fill address
            description: prev.description,
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


      {/* Main Map Containers (OpenLayers) */}
      <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
        <BhuvanMapComponent
          gpsData={[]}
          policeData={[]}
          pois={[]}
          width="100%"
          height="100%"
          autoFit={false}
          showMapTypeToggle={true}
          showDrawControls={false}
          showLogos={true}
          defaultMapType="normal"
          center={[91.7362, 26.1445]}
          zoom={10}
          onMapReady={handleMapReady}
        />
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
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
