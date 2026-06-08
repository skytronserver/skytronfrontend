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
  FormControlLabel,
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
import { getUseOldGeocodingApi, setUseOldGeocodingApi } from '../../services/HomePage';
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
  // Educational Institutions - Bright Blue
  school: "#2196F3",
  schools: "#2196F3",
  college: "#1976D2",
  colleges: "#1976D2",
  university: "#0D47A1",
  universities: "#0D47A1",

  // Medical & Healthcare - Red/Crimson
  hospital: "#D32F2F",
  hospitals: "#D32F2F",
  clinic: "#F44336",
  clinics: "#F44336",
  pharmacy: "#E91E63",
  pharmacies: "#E91E63",
  medical: "#C62828",
  veterinary: "#AD1457",

  // Religious Places - Gold/Yellow/Saffron (highly distinct)
  temple: "#FF6F00",
  temples: "#FF6F00",
  church: "#FFC107",
  churches: "#FFC107",
  mosque: "#00BCD4",
  mosques: "#00BCD4",
  gurudwara: "#FF9800",
  gurudwaras: "#FF9800",
  religious: "#FFD54F",
  meditation: "#9C27B0",

  // Food & Dining - Orange/Coral
  restaurant: "#FF5722",
  restaurants: "#FF5722",
  cafe: "#FF7043",
  cafes: "#FF7043",
  bakery: "#FF8A65",
  bakeries: "#FF8A65",
  bar: "#D84315",
  bars: "#D84315",
  juice: "#FFAB40",

  // Hospitality - Deep Orange/Burnt Orange
  hotel: "#E65100",
  hotels: "#E65100",
  guest: "#F4511E",
  lodge: "#BF360C",
  lodges: "#BF360C",

  // Shopping & Commerce - Purple/Magenta
  market: "#9C27B0",
  markets: "#9C27B0",
  shopping: "#AB47BC",
  mall: "#BA68C8",
  supermarket: "#8E24AA",
  supermarkets: "#8E24AA",
  grocery: "#CE93D8",
  bookstore: "#7B1FA2",
  bookstores: "#7B1FA2",
  salon: "#E1BEE7",
  salons: "#E1BEE7",

  // Fuel & Automotive - Bright Green/Lime
  fuel: "#76FF03",
  fuelstation: "#64DD17",
  petrol: "#AEEA00",
  car: "#00E676",
  repair: "#00C853",
  vehicale: "#00BFA5",

  // Transportation - Indigo/Navy
  airport: "#3F51B5",
  airports: "#3F51B5",
  railway: "#303F9F",
  train: "#1A237E",
  bus: "#5C6BC0",
  taxi: "#FFEB3B",
  ferries: "#536DFE",

  // Public Services - Cyan/Turquoise
  police: "#0097A7",
  fire: "#FF1744",
  post: "#00ACC1",
  traffic: "#00838F",
  municipal: "#006064",

  // Banking & Finance - Teal/Emerald
  bank: "#009688",
  banks: "#009688",
  atm: "#00796B",

  // Entertainment & Recreation - Hot Pink/Fuchsia
  cinema: "#E91E63",
  cinemas: "#E91E63",
  movie: "#F50057",
  theater: "#C51162",
  amusement: "#FF4081",
  club: "#F48FB1",
  nightclub: "#880E4F",
  nightclubs: "#880E4F",

  // Arts & Culture - Rose/Magenta
  art: "#D81B60",
  museum: "#AD1457",
  museums: "#AD1457",
  gallery: "#C2185B",
  cultural: "#E91E63",
  exhibition: "#F06292",
  aquarium: "#00BCD4",

  // Parks & Nature - Forest Green/Olive
  park: "#558B2F",
  parks: "#558B2F",
  garden: "#689F38",
  gardens: "#689F38",
  playground: "#7CB342",
  playgrounds: "#7CB342",
  nature: "#33691E",
  wildlife: "#827717",
  zoo: "#9E9D24",

  // Sports & Fitness - Lime/Chartreuse
  sports: "#CDDC39",
  stadium: "#C0CA33",
  stadiums: "#C0CA33",
  gym: "#AFB42B",
  gyms: "#AFB42B",
  fitness: "#9E9D24",
  swimming: "#00BCD4",
  yoga: "#8BC34A",
  spa: "#4CAF50",
  spas: "#4CAF50",

  // Government & Administration - Royal Blue
  government: "#1565C0",
  court: "#0D47A1",
  public: "#01579B",
  community: "#0277BD",
  convention: "#0288D1",

  // Infrastructure & Utilities - Brown/Tan
  bridge: "#5D4037",
  bridges: "#5D4037",
  overbridge: "#4E342E",
  overbridges: "#4E342E",
  weighbridge: "#6D4C41",
  weighbridges: "#6D4C41",
  industrial: "#795548",
  it: "#00BCD4",

  // Boundaries - Deep Purple/Violet
  cityboundary: "#6A1B9A",
  stateboundary: "#4A148C",

  // Routes & Restrictions - Bright Red/Warning
  permitroute: "#FF9800",
  prohibited_area: "#F44336",
  Prohibited_Area: "#F44336",
  unauthorised_stop: "#F44336",
  no_parking: "#D50000",
  NoParking: "#D50000",
  noparking: "#D50000",

  // Tourist Attractions - Violet/Lavender
  tourist: "#673AB7",
  historical: "#512DA8",
  monument: "#5E35B1",

  // Personal & Other - Neutral/Grey
  personal: "#4CAF50",
  other: "#607D8B",
  business: "#455A64",
};

const getUseTypeColor = (poi) => {
  const key = poi?.use_type?.toLowerCase();

  // Check if we have a predefined color
  if (USE_TYPE_COLORS[key]) {
    return USE_TYPE_COLORS[key];
  }

  // Generate a random vibrant color based on the use_type string
  // This ensures the same use_type always gets the same color
  const generateColorFromString = (str) => {
    if (!str) return "#1E88E5";

    // Create a hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Generate vibrant colors using HSL
    // Hue: 0-360 (full color spectrum)
    // Saturation: 60-80% (vibrant but not oversaturated)
    // Lightness: 45-55% (not too dark, not too light)
    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash >> 8) % 20); // 60-80%
    const lightness = 45 + (Math.abs(hash >> 16) % 10); // 45-55%

    // Convert HSL to HEX
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return generateColorFromString(key || poi?.name || poi?.id?.toString() || "default");
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

const EMPTY_POIS = [];
const POIViewer = () => {

  const DEBUG_POI_GEO = true;

  const mapRef = useRef(null);
  const poiVectorLayerRef = useRef(null);
  const drawVectorLayerRef = useRef(null);
  const drawInteractionRef = useRef(null);
  const searchFeatureRef = useRef(null);
  const poiClickHandlerRef = useRef(null);
  const olWasDraggingRef = useRef(false);
  const olPointerDownHandlerRef = useRef(null);
  const olPointerDragHandlerRef = useRef(null);
  const mapMoveEndHandlerRef = useRef(null);
  const mapPointerDragUpdateHandlerRef = useRef(null);
  const popoverOpenRef = useRef(false);
  const selectedPoiCoordRef = useRef(null);
  const popoverRafRef = useRef(null);
  const reverseGeoCacheRef = useRef(new Map());
  const reverseGeoStateRef = useRef({ loading: false, error: null, data: null, key: null });
  // const [reverseGeoState, setReverseGeoState] = useState(reverseGeoStateRef.current);
  const overlappingCoordsRef = useRef(new Map());
  const [pois, setPois] = useState([]);
  const [showAllPois, setShowAllPois] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [selectedPoiCoord, setSelectedPoiCoord] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    pluscode: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    website: '',
    status: 'Active',
    mark_type: 'Point',
    use_type: 'School',
    location: '',
    lat: '',
    lon: '',
    radius: '100.5',
    alert_type: '',
    speed_limit: 0,
  });
  const [drawingMode, setDrawingMode] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const [routePoints, setRoutePoints] = useState([]);
  const [poiListOpen, setPoiListOpen] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const tempPolyRef = useRef(null);
  const tempMarkersRef = useRef([]);

  const [geoSearchDialogOpen, setGeoSearchDialogOpen] = useState(false);
  const [geoSearchQuery, setGeoSearchQuery] = useState('');
  const [geoSearchResults, setGeoSearchResults] = useState([]);
  const [geoSearchLoading, setGeoSearchLoading] = useState(false);

  const [reverseGeoState, setReverseGeoState] = useState({
    loading: false,
    error: null,
    data: null,
    key: null,
  });

  const [useOldGeocodingApi, setUseOldGeocodingApiState] = useState(getUseOldGeocodingApi());

  useEffect(() => {
    popoverOpenRef.current = popoverOpen;
  }, [popoverOpen]);

  useEffect(() => {
    selectedPoiCoordRef.current = selectedPoiCoord;
  }, [selectedPoiCoord]);

  const handleMapReady = ({ map, poiVectorLayer, drawVectorLayer }) => {
    if (mapRef.current && poiClickHandlerRef.current) {
      try {
        mapRef.current.un('singleclick', poiClickHandlerRef.current);
      } catch (e) {
        // ignore
      }
      poiClickHandlerRef.current = null;
    }

    if (mapRef.current && olPointerDownHandlerRef.current) {
      try {
        mapRef.current.un('pointerdown', olPointerDownHandlerRef.current);
      } catch (e) {
        // ignore
      }
      olPointerDownHandlerRef.current = null;
    }

    if (mapRef.current && olPointerDragHandlerRef.current) {
      try {
        mapRef.current.un('pointerdrag', olPointerDragHandlerRef.current);
      } catch (e) {
        // ignore
      }
      olPointerDragHandlerRef.current = null;
    }

    if (mapRef.current && mapMoveEndHandlerRef.current) {
      try {
        mapRef.current.un('moveend', mapMoveEndHandlerRef.current);
      } catch (e) {
        // ignore
      }
      mapMoveEndHandlerRef.current = null;
    }

    if (mapRef.current && mapPointerDragUpdateHandlerRef.current) {
      try {
        mapRef.current.un('pointerdrag', mapPointerDragUpdateHandlerRef.current);
      } catch (e) {
        // ignore
      }
      mapPointerDragUpdateHandlerRef.current = null;
    }

    mapRef.current = map || null;
    poiVectorLayerRef.current = poiVectorLayer || null;
    drawVectorLayerRef.current = drawVectorLayer || null;

    const poiLayer = poiVectorLayerRef.current;
    const source = poiLayer?.getSource?.();
    if (source) {
      source.clear();
      if (showAllPois) {
        pois.forEach((poi) => {
          const feature = createPoiFeature(poi);
          if (feature) source.addFeature(feature);
        });
      }

      if (searchFeatureRef.current) {
        try {
          source.addFeature(searchFeatureRef.current);
        } catch (e) {
          // ignore
        }
      }
    }

    if (mapRef.current) {
      const clickHandler = (evt) => {
        if (olWasDraggingRef.current || evt?.dragging) {
          olWasDraggingRef.current = false;
          return;
        }

        let foundPoi = null;
        let foundFeature = null;
        try {
          mapRef.current.forEachFeatureAtPixel(evt.pixel, (feature) => {
            const poi = feature?.get?.('poi');
            if (poi) {
              foundPoi = poi;
              foundFeature = feature;
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
          setPopoverOpen(true);

          // Zoom/center to the POI like a normal maps app
          try {
            const geom = foundFeature?.getGeometry?.();
            let focusCoord = null;

            if (geom) {
              const type = geom.getType?.();
              if (type === 'Point') {
                focusCoord = geom.getCoordinates?.();
              } else if (type === 'Circle') {
                focusCoord = geom.getCenter?.();
              } else if (type === 'Polygon') {
                focusCoord = geom.getInteriorPoint?.().getCoordinates?.();
              } else if (type === 'LineString') {
                focusCoord = geom.getCoordinateAt?.(0.5);
              }
            }

            if (focusCoord && mapRef.current?.getView) {
              setSelectedPoiCoord(focusCoord);
              try {
                const px = mapRef.current.getPixelFromCoordinate?.(focusCoord);
                if (px) {
                  setPopoverAnchor(px);
                }
              } catch (e) {
                // ignore
              }

              const view = mapRef.current.getView();
              const currentZoom = view.getZoom?.() ?? 0;
              const targetZoom = currentZoom >= 16 ? currentZoom : 16;
              view.animate({ center: focusCoord, zoom: targetZoom, duration: 500 });
            }
          } catch (e) {
            // ignore
          }
        } else {
          setPopoverOpen(false);
          setSelectedPoiCoord(null);
        }
      };

      poiClickHandlerRef.current = clickHandler;
      mapRef.current.on('singleclick', clickHandler);

      const pointerDownHandler = () => {
        olWasDraggingRef.current = false;
      };

      const pointerDragHandler = () => {
        olWasDraggingRef.current = true;
      };

      olPointerDownHandlerRef.current = pointerDownHandler;
      olPointerDragHandlerRef.current = pointerDragHandler;

      mapRef.current.on('pointerdown', pointerDownHandler);
      mapRef.current.on('pointerdrag', pointerDragHandler);

      const syncPopoverPosition = () => {
        if (!popoverOpenRef.current) return;
        const coord = selectedPoiCoordRef.current;
        if (!coord) return;

        if (popoverRafRef.current) return;
        popoverRafRef.current = window.requestAnimationFrame(() => {
          popoverRafRef.current = null;
          try {
            const px = mapRef.current?.getPixelFromCoordinate?.(coord);
            if (px) setPopoverAnchor(px);
          } catch (e) {
            // ignore
          }
        });
      };

      mapMoveEndHandlerRef.current = syncPopoverPosition;
      mapPointerDragUpdateHandlerRef.current = syncPopoverPosition;
      mapRef.current.on('moveend', syncPopoverPosition);
      mapRef.current.on('pointerdrag', syncPopoverPosition);
    }
  };

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const response = await POIService.getAllPOIs();
      console.log('POI Response:', response);
      if (response && response.data) {
        console.log('POIs fetched:', response.data.length, 'items');

        // Log all unique use_type values to see what's coming from API
        const useTypes = new Set();
        response.data.forEach(poi => {
          if (poi.use_type) {
            useTypes.add(poi.use_type);
          }
        });
        console.log('🎨 Unique use_type values from API:', Array.from(useTypes).sort());
        console.log('🎨 Sample POI data:', response.data.slice(0, 3));

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
    const fillColor = hexToRgba(baseColor, 0.1);

    const primaryLabel = poi?.name?.trim();
    const secondaryLabel = poi?.use_type?.trim();
    const fallbackLabel = poi?.description?.trim();
    const displayText =
      primaryLabel || secondaryLabel || fallbackLabel || `POI ${poi?.id ?? ''}`;

    const formatPoiLabel = (text, { maxCharsPerLine = 14 } = {}) => {
      const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
      if (!normalized) return '';

      const words = normalized.split(' ');
      const lines = [];
      let current = '';

      const pushCurrent = () => {
        if (current) lines.push(current);
        current = '';
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

      return lines.join('\n');
    };

    const labelText = formatPoiLabel(displayText);

    const createText = (overrides = {}) =>
      new Text({
        text: labelText,
        font: 'bold 12px "Roboto", sans-serif',
        fill: new Fill({ color: baseColor }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
        padding: [1, 3, 1, 3],
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

    if (poi.mark_type?.trim() === 'Point' || poi.mark_type?.trim() === 'Circle') {
      console.log('[POI][createPoiFeature] Point/Circle', { poiId: poi.id, mark_type: poi.mark_type, coordinates });
      const first = coordinates[0];
      if (!Array.isArray(first) || first.length < 2) {
        console.log('[POI][createPoiFeature] Invalid coordinates array', { poiId: poi.id, first });
        return null;
      }
      let lat = Number(first[0]);
      let lng = Number(first[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.log('[POI][createPoiFeature] Invalid lat/lng', { poiId: poi.id, lat, lng });
        return null;
      }

      // Add small offset for overlapping POIs to prevent exact overlap
      const offsetKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      const offsetCount = overlappingCoordsRef.current.get(offsetKey) || 0;
      overlappingCoordsRef.current.set(offsetKey, offsetCount + 1);

      if (offsetCount > 0) {
        // Apply small offset in a spiral pattern
        const offsetDegrees = 0.0001; // ~10 meters
        const angle = offsetCount * 0.5; // Create spiral effect
        lat += Math.cos(angle) * offsetDegrees;
        lng += Math.sin(angle) * offsetDegrees;
        console.log('[POI][createPoiFeature] Applied offset', { poiId: poi.id, offsetCount, originalLat: first[0], originalLng: first[1], newLat: lat, newLng: lng });
      }

      if (poi.mark_type?.trim() === 'Point') {
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

    if (poi.mark_type?.trim() === 'Polygon') {
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

    if (poi.mark_type?.trim() === 'Road') {
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
    if (!source) {
      console.log('[POI][useEffect] No source found');
      return;
    }

    source.clear();
    overlappingCoordsRef.current.clear(); // Reset overlapping counter

    if (showAllPois) {
      console.log('[POI][useEffect] Processing', pois.length, 'POIs');
      pois.forEach((poi) => {
        const feature = createPoiFeature(poi);
        if (feature) {
          source.addFeature(feature);
        }
      });
    }

    // Preserve search feature if it exists
    if (searchFeatureRef.current) {
      try {
        source.addFeature(searchFeatureRef.current);
      } catch (e) {
        console.error('[POI][useEffect] Error re-adding search feature:', e);
      }
    }

    console.log('[POI][useEffect] Total features in source:', source.getFeatures().length);
  }, [pois, showAllPois]);

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
        setSelectedPoi(null);
        setIsEditMode(false);
        setFormData((prev) => ({ ...prev, location: JSON.stringify([[lat, lng]]), mark_type: 'Point', radius: prev.radius || '100.5' }));
        handleReverseGeocode(lat, lng);
        setDialogOpen(true);
        setDrawingMode(null);
        return;
      }

      if (drawingMode === 'circle') {
        const [lng, lat] = geom.getCenter();
        setSelectedPoi(null);
        setIsEditMode(false);
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
      pluscode: poi.pluscode || '',
      area: poi.area || '',
      city: poi.city || '',
      state: poi.state || '',
      pincode: poi.pincode || '',
      phone: poi.phone || '',
      website: poi.website || '',
      status: poi.status,
      mark_type: poi.mark_type,
      use_type: poi.use_type,
      location: poi.location,
      lat: poi.lat ?? '',
      lon: poi.lon ?? '',
      radius: poi.radius,
      alert_type: poi.alert_type || 'None',
      speed_limit: poi.speed_limit || 0,
    });

    setSelectedPoi(poi);
    setIsEditMode(true);
    setDialogOpen(true);
    setPopoverOpen(false);

    const { lat, lng } = getLatLngFromPoi(poi);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      handleReverseGeocode(lat, lng);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();

      // Explicitly append fields as requested
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);

      formDataObj.append('pluscode', formData.pluscode ?? '');
      formDataObj.append('area', formData.area ?? '');
      formDataObj.append('city', formData.city ?? '');
      formDataObj.append('state', formData.state ?? '');
      formDataObj.append('pincode', formData.pincode ?? '');
      formDataObj.append('phone', formData.phone ?? '');
      formDataObj.append('website', formData.website ?? '');
      formDataObj.append('status', formData.status);
      formDataObj.append('status2', formData.status); // Mapping status to status2
      formDataObj.append('mark_type', formData.mark_type);
      formDataObj.append('use_type', formData.use_type);

      // Location is still required by backend; derive from lat/lon when not explicitly set
      let effectiveLocation = formData.location;
      if (!effectiveLocation) {
        const latNum = Number(formData.lat);
        const lonNum = Number(formData.lon);
        if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
          effectiveLocation = JSON.stringify([[latNum, lonNum]]);
        }
      }
      formDataObj.append('location', effectiveLocation || '');

      // Add other fields conditionally
      if (formData.radius) {
        formDataObj.append('radius', formData.radius);
      }
      if (formData.alert_type) {
        formDataObj.append('alert_type', formData.alert_type);
      }
      if (formData.speed_limit !== undefined && formData.speed_limit !== null) {
        formDataObj.append('speed_limit', formData.speed_limit);
      }

      // Ensure backend-required fields are present
      const status2 = formData.status || 'Active';
      let lat = '';
      let lon = '';
      let address = formData.address || formData.description || formData.name || '';

      const fromLocation = getLatLonFromLocation(effectiveLocation);
      if (fromLocation.lat !== null && fromLocation.lon !== null) {
        lat = String(fromLocation.lat);
        lon = String(fromLocation.lon);
      }

      const latOut = formData.lat !== '' ? String(formData.lat) : lat;
      const lonOut = formData.lon !== '' ? String(formData.lon) : lon;

      formDataObj.append('status2', status2);
      formDataObj.append('lat', latOut);
      formDataObj.append('lon', lonOut);
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
      console.error('Error saving POI:', error);
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
      console.error('Error deleting POI:', error);
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
      pluscode: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      website: '',
      status: 'Active',
      mark_type: 'Point',
      use_type: 'School',
      location: '',
      lat: '',
      lon: '',
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
    setSelectedPoi(poi);
    setSelectedPoiId(poi.id);
    setPopoverOpen(true);

    const mapInstance = mapRef.current;
    const { lat, lng } = getLatLngFromPoi(poi);

    if (Number.isFinite(lat) && Number.isFinite(lng) && mapInstance?.getView) {
      try {
        const coord = [lng, lat];
        setSelectedPoiCoord(coord);
        try {
          const px = mapInstance.getPixelFromCoordinate?.(coord);
          if (px) setPopoverAnchor(px);
        } catch (e) {
          // ignore
        }

        const view = mapInstance.getView();
        const currentZoom = view.getZoom?.() ?? 0;
        const targetZoom = currentZoom >= 16 ? currentZoom : 16;
        view.animate({ center: coord, zoom: targetZoom, duration: 500 });
      } catch (error) {
        console.error('Error centering map on POI:', error);
      }
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      handleReverseGeocode(lat, lng);
    }
  };

  const handleGeoSearch = async () => {
    if (!geoSearchQuery.trim()) return;

    try {
      setGeoSearchLoading(true);

      const response = await HomePageService.getGeocode(geoSearchQuery, 5);

      if (response.status === 200) {
        const data = response.data;

        console.log('Geocoding response data:', data);

        let results = [];
        if (Array.isArray(data?.results)) {
          results = data.results;
        } else if (data?.results) {
          results = [data.results];
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

          const label = result.address || result.name || result.poi || result.formattedAddress || result.locality || '';

          const feature = new Feature({
            geometry: new Point([lng, lat]),
          });
          feature.set('poi', {
            id: 'search-result',
            name: result.name || result.poi || result.formattedAddress || result.locality || 'Searched Location',
            address: result.address || result.formattedAddress || '',
            description: result.description || 'Searched location result',
            use_type: result.type || 'Search',
            status: 'Temporary',
            lat: lat,
            lon: lng,
            mark_type: 'Point',
            city: result.city || result.district || '',
            state: result.state || '',
            pincode: result.pincode || result.postcode || '',
            phone: result.phone || result.tel || '',
            website: result.website || result.url || '',
            speed_limit: result.speed_limit || 40
          });
          feature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: "#E53935" }),
                stroke: new Stroke({ color: "#ffffff", width: 2 }),
              }),
              text: label
                ? new Text({
                  text: label,
                  font: '12px "Roboto", sans-serif',
                  fill: new Fill({ color: '#0D47A1' }),
                  stroke: new Stroke({ color: '#ffffff', width: 3 }),
                  backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.92)' }),
                  padding: [2, 4, 2, 4],
                  offsetY: -20,
                })
                : undefined,
              zIndex: 2000,
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

  const getLatLngFromPoi = (poi) => {
    if (!poi) return { lat: null, lng: null };

    const latDirect = Number(poi.lat);
    const lngDirect = Number(poi.lon);
    if (Number.isFinite(latDirect) && Number.isFinite(lngDirect)) {
      return { lat: latDirect, lng: lngDirect };
    }

    try {
      const location = typeof poi.location === 'string' ? JSON.parse(poi.location) : poi.location;
      if (Array.isArray(location) && location.length > 0 && Array.isArray(location[0])) {
        const lat = Number(location[0][0]);
        const lng = Number(location[0][1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      }
    } catch (e) {
      // ignore
    }

    return { lat: null, lng: null };
  };

  const handleReverseGeocode = async (lat, lng) => {
    try {
      const safeLat = Number(lat);
      const safeLng = Number(lng);
      if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
        console.log('[POI][reverseGeocode] invalid coords', { lat, lng });
        return;
      }

      const cacheKey = `${safeLat.toFixed(6)},${safeLng.toFixed(6)}`;
      console.log('[POI][reverseGeocode] start', {
        cacheKey,
        lat: safeLat,  // Use click coordinates
        lng: safeLng,  // Use click coordinates
        isEditMode,
        selectedPoiId: selectedPoi?.id ?? null,
      });

      const cached = reverseGeoCacheRef.current.get(cacheKey);
      if (cached) {
        console.log('[POI][reverseGeocode] cache hit', { cacheKey, cached });
        setReverseGeoState({ loading: false, error: null, data: cached, key: cacheKey });
        setFormData((prev) => {
          const next = {
            ...prev,
            address: prev.address || cached.address || '',
            name: prev.name || cached.name || '',
            description: prev.description || cached.description || '',
            pluscode: prev.pluscode || cached.pluscode || '',
            area: prev.area || cached.area || '',
            city: prev.city || cached.city || '',
            state: prev.state || cached.state || '',
            pincode: prev.pincode || cached.pincode || '',
            phone: prev.phone || cached.phone || '',
            website: prev.website || cached.website || '',
            lat: prev.lat || (Number.isFinite(safeLat) ? String(safeLat) : ''),
            lon: prev.lon || (Number.isFinite(safeLng) ? String(safeLng) : ''),
            location:
              prev.location ||
              (Number.isFinite(safeLat) && Number.isFinite(safeLng)
                ? JSON.stringify([[safeLat, safeLng]])
                : ''),
          };
          console.log('[POI][reverseGeocode] apply cached -> formData', { before: prev, after: next });
          return next;
        });
        return;
      }

      setReverseGeoState({ loading: true, error: null, data: null, key: cacheKey });
      console.log('[POI][reverseGeocode] request', { cacheKey });

      const response = await HomePageService.getReverseGeocode(safeLat, safeLng);
      console.log('[POI][reverseGeocode] response.status', response?.status);
      console.log('[POI][reverseGeocode] response.data', response?.data);

      if (response?.status !== 200) {
        setReverseGeoState({ loading: false, error: 'Reverse geocoding failed', data: null, key: cacheKey });
        showSnackbar('Reverse geocoding failed (non-200)', 'error');
        return;
      }

      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          // ignore
        }
      }

      const first = Array.isArray(data?.results)
        ? data.results[0]
        : (data && typeof data === 'object' ? data : null);
      console.log('[POI][reverseGeocode] parsed first result', first);

      if (!first) {
        setReverseGeoState({ loading: false, error: null, data: null, key: cacheKey });
        showSnackbar('Reverse geocode: no results', 'info');
        return;
      }

      const result = {
        id: first.id ?? null,
        name: null,
        lat: safeLat,  // Use click coordinates
        lon: safeLng,  // Use click coordinates
        address: first.address ?? null,
        pluscode: first.pluscode ?? null,
        area: first.area ?? null,
        city: first.city ?? null,
        state: first.state ?? null,
        pincode: first.pincode ?? null,
        phone: null,
        website: null,
        description: null,
      };

      reverseGeoCacheRef.current.set(cacheKey, result);
      setReverseGeoState({ loading: false, error: null, data: result, key: cacheKey });

      setFormData((prev) => {
        const isCreating = !isEditMode && !selectedPoi;
        const pick = (current, incoming) => {
          if (isCreating) return incoming !== undefined && incoming !== null ? incoming : current;
          return current ? current : (incoming !== undefined && incoming !== null ? incoming : current);
        };

        const next = {
          ...prev,
          name: pick(prev.name, result.name || prev.name),
          address: pick(prev.address, result.address || prev.address),
          description: pick(prev.description, result.description || prev.description),
          pluscode: pick(prev.pluscode, result.pluscode ?? prev.pluscode),
          area: pick(prev.area, result.area ?? prev.area),
          city: pick(prev.city, result.city ?? prev.city),
          state: pick(prev.state, result.state ?? prev.state),
          pincode: pick(prev.pincode, result.pincode ?? prev.pincode),
          phone: pick(prev.phone, result.phone ?? prev.phone),
          website: pick(prev.website, result.website ?? prev.website),
          lat: pick(prev.lat, Number.isFinite(result.lat) ? String(result.lat) : prev.lat),
          lon: pick(prev.lon, Number.isFinite(result.lon) ? String(result.lon) : prev.lon),
          location: pick(
            prev.location,
            Number.isFinite(result.lat) && Number.isFinite(result.lon)
              ? JSON.stringify([[result.lat, result.lon]])
              : prev.location
          ),
        };

        console.log('[POI][reverseGeocode] apply api -> formData', { before: prev, after: next, result });
        return next;
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setReverseGeoState((prev) => ({ ...prev, loading: false, error: 'Reverse geocoding failed' }));
      showSnackbar('Reverse geocoding failed (exception)', 'error');
    }
  };

  useEffect(() => {
    if (!selectedPoi || !popoverOpen) return;
    const { lat, lng } = getLatLngFromPoi(selectedPoi);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    handleReverseGeocode(lat, lng);
  }, [selectedPoi, popoverOpen]);

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

  const filteredPois = pois.filter((poi) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      poi.name.toLowerCase().includes(searchLower) ||
      (poi.description && poi.description.toLowerCase().includes(searchLower)) ||
      poi.use_type.toLowerCase().includes(searchLower)
    );
  });

  const getLatLonFromLocation = (locationValue) => {
    if (!locationValue) return { lat: null, lon: null };
    try {
      let parsed = typeof locationValue === 'string' ? JSON.parse(locationValue) : locationValue;

      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          // ignore
        }
      }

      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0]) && parsed[0].length >= 2) {
        const lat = Number(parsed[0][0]);
        const lon = Number(parsed[0][1]);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
      }
    } catch (e) {
      // ignore
    }
    return { lat: null, lon: null };
  };

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Main Map Containers (OpenLayers) */}
      <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
        <BhuvanMapComponent
          gpsData={[]}
          policeData={[]}
          pois={EMPTY_POIS}
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
      {/* <IconButton
        onClick={() => setPoiListOpen(!poiListOpen)}
        sx={{
          position: 'absolute',
          top: 60,
          left: 6,
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
          zIndex: 1000,
        }}
      >
        <ListIcon />
      </IconButton> */}

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
            Layers
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 1, pb: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={useOldGeocodingApi}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setUseOldGeocodingApi(next);
                    setUseOldGeocodingApiState(next);
                  }}
                />
              }
              label={<Typography variant="caption" fontWeight={600}>Old Geocoding API</Typography>}
              sx={{ ml: 0 }}
            />
            <Switch
              size="small"
              checked={showAllPois}
              onChange={(e) => setShowAllPois(e.target.checked)}
            />
            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Show All POIs
            </Typography>
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

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedPoi.address || '—'}
                  </Typography>

                  {/* Extended Info */}
                  <Stack spacing={0.5} mb={1}>
                    {(selectedPoi.city || selectedPoi.state || selectedPoi.pincode) && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {[selectedPoi.city, selectedPoi.state, selectedPoi.pincode].filter(Boolean).join(', ')}
                      </Typography>
                    )}

                    {Number(selectedPoi.speed_limit) > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Speed Limit: <strong>{selectedPoi.speed_limit} km/h</strong>
                      </Typography>
                    )}

                    {selectedPoi.phone && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Phone: <a href={`tel:${selectedPoi.phone}`} style={{ color: 'inherit' }}>{selectedPoi.phone}</a>
                      </Typography>
                    )}

                    {selectedPoi.website && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Website: <a href={selectedPoi.website.startsWith('http') ? selectedPoi.website : `https://${selectedPoi.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{selectedPoi.website}</a>
                      </Typography>
                    )}
                  </Stack>
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
                {/* {selectedPoi.radius && (Number(selectedPoi.radius) > 0) && (
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
                )} */}
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1}>
                {selectedPoi.id !== 'search-result' && (
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
                )}
                {selectedPoi.id !== 'search-result' && (
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
                )}
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
            backgroundColor: alpha(theme.palette.background.paper, 0),
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
                          {result.name || result.address || result.poi || result.formattedAddress || result.locality || 'Unknown'}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {result.address || [result.district, result.city, result.state].filter(Boolean).join(', ') || ''}
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
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                size="small"
              />
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Plus Code"
                value={formData.pluscode}
                onChange={(e) => setFormData(prev => ({ ...prev, pluscode: e.target.value }))}
                size="small"
              />
              <TextField
                fullWidth
                label="Area"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                size="small"
              />
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                size="small"
              />
            </Stack>

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => {
                const nextLocation = e.target.value;
                const parsed = getLatLonFromLocation(nextLocation);
                setFormData((prev) => ({
                  ...prev,
                  location: nextLocation,
                  lat: parsed.lat !== null ? String(parsed.lat) : prev.lat,
                  lon: parsed.lon !== null ? String(parsed.lon) : prev.lon,
                }));

                if (parsed.lat !== null && parsed.lon !== null) {
                  handleReverseGeocode(parsed.lat, parsed.lon);
                }
              }}
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
                <MenuItem value="Locality_Boundary">Locality Boundary</MenuItem>
                <MenuItem value="PermitRoute">Permit Route</MenuItem>
                <MenuItem value="School">School</MenuItem>
                <MenuItem value="Hospital">Hospital</MenuItem>
                <MenuItem value="PoliceStation">Police Station</MenuItem>
                <MenuItem value="BusStop">Bus Stop</MenuItem>
                <MenuItem value="RailwayStation">Railway Station</MenuItem>
                <MenuItem value="Airport">Airport</MenuItem>
                <MenuItem value="FuelStation">Fuel Station</MenuItem>
                <MenuItem value="TollGate">Toll Gate</MenuItem>
                <MenuItem value="Locality_Centre">Locality Centre</MenuItem>
                <MenuItem value="SubLocality_Centre">SubLocality Centre</MenuItem>
                <MenuItem value="Village_Centre">Village Centre</MenuItem>
                <MenuItem value="Landuse">Landuse</MenuItem>
                <MenuItem value="Turn_Table">Turn Table</MenuItem>
                <MenuItem value="House_Address">House Address</MenuItem>
                <MenuItem value="Road_Network">Road Network</MenuItem>
                <MenuItem value="SubDistrict_Boundary">SubDistrict Boundary</MenuItem>
                <MenuItem value="Railway_Track">Railway Track</MenuItem>
                <MenuItem value="Point_of_Interest">Point of Interest</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="dealer">Dealer</MenuItem>
                <MenuItem value="prohibited_area">Unauthorized Stop</MenuItem>
                <MenuItem value="Prohibited_Area">Prohibited Area</MenuItem>
                <MenuItem value="no_entry">No Entry</MenuItem>
                <MenuItem value="parking">Parking</MenuItem>
                <MenuItem value="NoParking">Unauthorized Parking</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Speed Limit (km/h)"
                type="number"
                value={formData.speed_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, speed_limit: e.target.value }))}
                size="small"
              />
            </Stack>

            <TextField
              fullWidth
              label="Alert Type"
              value={formData.alert_type}
              onChange={(e) => setFormData(prev => ({ ...prev, alert_type: e.target.value }))}
              size="small"
            />

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
              disabled={(() => {
                if (loading) return true;
                if (formData.location) {
                  const parsed = getLatLonFromLocation(formData.location);
                  if (parsed.lat !== null && parsed.lon !== null) return false;
                }
                return !(Number.isFinite(Number(formData.lat)) && Number.isFinite(Number(formData.lon)));
              })()}
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