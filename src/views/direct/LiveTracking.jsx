import React, { useCallback, useEffect, useRef, useState } from "react";

import axios from "axios";
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Grid,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Collapse,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";

import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import { getUseOldGeocodingApi, setUseOldGeocodingApi } from "../../services/HomePage";
import MapComponent from "./LiveMap";
import { none } from "ol/centerconstraint";
import SearchIcon from "@mui/icons-material/Search"; // Import the search icon
import FilterListIcon from "@mui/icons-material/FilterList";
import { keyMapping, iconData, iconStyles, fullText, isoDatePattern } from "../../store/constant";
import { formatDateTime, getRole } from "../../helper"
import CircularProgress from '@mui/material/CircularProgress';
import "./tabstyle.css";

const vehicleIconContext = require.context('../../assets/images', true, /\.png$/);

const LiveTracking = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const normalizeCategoryKey = useCallback((value) => {
    return String(value || '').trim().toLowerCase();
  }, []);

  const [vehicleNo, setVehicleNo] = useState("");
  const [imeiNo, setImeiNo] = useState("");
  const [owner, setOwner] = useState("");
  const [poi, setPoi] = useState("");
  const [roads, setRoads] = useState("");
  const [polygon, setPolygon] = useState("");
  const [category, setCategory] = useState("");
  const [categoryMaxSpeed, setCategoryMaxSpeed] = useState("");
  const [categorySpeedMap, setCategorySpeedMap] = useState({});
  const [make, setMake] = useState("");
  const [district, setDistrict] = useState("");
  const [speedLimit, setSpeedLimit] = useState("");
  const [inRange, setInRange] = useState(false);
  const [poiAsPolygon, setPoiAsPolygon] = useState(false);
  const userRole = getRole();
  const [typeFilter, setTypeFilter] = useState("default");
  const [tableDataTop, setTableDataTop] = useState([]); // Data for the scrollable table
  const [selectedId, setSelectedId] = useState(null); // Track the selected button ID
  const [filteredData, setFilteredData] = useState([]); // Data for the bottom table
  const [focusedEntry, setFocusedEntry] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [markerLabelMode, setMarkerLabelMode] = useState('vehicle');
  const [policeLocations, setPoliceLocations] = useState([]);
  const [ambulanceLocations, setAmbulanceLocations] = useState([]);
  const [showPolice, setShowPolice] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);
  const [incidentData, setIncidentData] = useState([]);
  const [useNmrLocation, setUseNmrLocation] = useState(false);
  const [useOldGeocodingApi, setUseOldGeocodingApiState] = useState(getUseOldGeocodingApi());
  const [nmrArea, setNmrArea] = useState(null);
  const [reverseGeocodeCache, setReverseGeocodeCache] = useState({});
  const fullDataRef = useRef([]); // processed items we've appended so far
  const fullRawRef = useRef([]);  // raw items from API (unprocessed)
  const listContainerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [poiOptions, setPoiOptions] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [poiLoading, setPoiLoading] = useState(false);
  const [poiTypes, setPoiTypes] = useState([]);
  const [selectedPoiType, setSelectedPoiType] = useState(null);
  const [poiTypeLoading, setPoiTypeLoading] = useState(false);
  const [selectedTransitLayer, setSelectedTransitLayer] = useState([]);

  const [schoolRoutes, setSchoolRoutes] = useState([]);
  const [pisRoutes, setPisRoutes] = useState([]);
  const [schoolBuses, setSchoolBuses] = useState([]);
  const [pisBuses, setPisBuses] = useState([]);
  const [pisStops, setPisStops] = useState([]);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState("");  // Handle input changes
  const [selectedPoiId, setSelectedPoiId] = useState("");
  const [alertHeatmapData, setAlertHeatmapData] = useState([]);

  const [showAlertHeatmap, setShowAlertHeatmap] = useState(false);

  const [selectedAlertTypes, setSelectedAlertTypes] = useState([]);
const COLUMN_OPTIONS = [
  // Vehicle
  { key: "vehicle_registration_number", label: "Vehicle No" },
  { key: "imei", label: "IMEI" },

  // Packet
  { key: "entry_time", label: "Entry Time" },
  { key: "packet_type", label: "Packet Type" },
  { key: "alert_id", label: "Alert ID" },
  { key: "packet_status", label: "Packet Status" },
  { key: "gps_status", label: "GPS Status" },

  // Location
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "latitude", label: "Latitude" },
  { key: "latitude_dir", label: "Latitude Dir" },
  { key: "longitude", label: "Longitude" },
  { key: "longitude_dir", label: "Longitude Dir" },

  // Telemetry
  { key: "speed", label: "Speed" },
  { key: "heading", label: "Heading" },
  { key: "satellites", label: "Satellites" },
  { key: "altitude", label: "Altitude" },
  { key: "pdop", label: "PDOP" },
  { key: "hdop", label: "HDOP" },

  // Power
  { key: "network_operator", label: "Network Operator" },
  { key: "ignition_status", label: "Ignition Status" },
  { key: "main_power_status", label: "Main Power Status" },
  { key: "main_input_voltage", label: "Main Input Voltage" },
  { key: "internal_battery_voltage", label: "Internal Battery Voltage" },

  // Alerts
  { key: "emergency_status", label: "Emergency Status" },
  { key: "box_tamper_alert", label: "Box Tamper Alert" },

  // GSM
  { key: "gsm_signal_strength", label: "GSM Signal Strength" },
  { key: "mcc", label: "MCC" },
  { key: "mnc", label: "MNC" },
  { key: "lac", label: "LAC" },
  { key: "cell_id", label: "Cell ID" },

  // Neighbour Towers
  { key: "nbr1_cell_id", label: "NBR1 Cell ID" },
  { key: "nbr1_lac", label: "NBR1 LAC" },
  { key: "nbr1_signal_strength", label: "NBR1 Signal" },

  { key: "nbr2_cell_id", label: "NBR2 Cell ID" },
  { key: "nbr2_lac", label: "NBR2 LAC" },
  { key: "nbr2_signal_strength", label: "NBR2 Signal" },

  { key: "nbr3_cell_id", label: "NBR3 Cell ID" },
  { key: "nbr3_lac", label: "NBR3 LAC" },
  { key: "nbr3_signal_strength", label: "NBR3 Signal" },

  { key: "nbr4_cell_id", label: "NBR4 Cell ID" },
  { key: "nbr4_lac", label: "NBR4 LAC" },
  { key: "nbr4_signal_strength", label: "NBR4 Signal" },

  // Digital
  { key: "digital_input_status", label: "Digital Input Status" },
  { key: "digital_output_status", label: "Digital Output Status" },

  // Misc
  { key: "frame_number", label: "Frame Number" },
  { key: "odometer", label: "Odometer" },
  { key: "packet_datetime", label: "Packet Datetime" },

  // Category
  { key: "category_name", label: "Category" },
  { key: "max_speed", label: "Max Speed" },
  { key: "warn_speed", label: "Warn Speed" },

  // Vehicle Details
  { key: "vehicle_make", label: "Vehicle Make" },
  { key: "vehicle_model", label: "Vehicle Model" },
  { key: "engine_no", label: "Engine No" },
  { key: "chassis_no", label: "Chassis No" },
  { key: "sale_type", label: "Sale Type" },

  // Owner Details
  { key: "owner_name", label: "Owner Name" },
  { key: "owner_email", label: "Owner Email" },
  { key: "owner_mobile", label: "Owner Mobile" },
  { key: "owner_role", label: "Owner Role" },

  // Device Details
  { key: "device_id", label: "Device ID" },
  { key: "dealer_name", label: "Dealer Name" },
  { key: "manufacturer_name", label: "Manufacturer Name" },

  // Status
  { key: "tag_status", label: "Tag Status" },
  { key: "tagged_date", label: "Tagged Date" },

  // Nearby
  { key: "nearest_poi", label: "Nearest POI" },
  { key: "nearest_police", label: "Nearest Police" }
];

const [selectedColumns, setSelectedColumns] = useState([]);
  const ALERT_TYPES = [
    "HarshBreak",
    "HarshAcceleration",
    "HarshTurn",
    "OverSpeed",
    "GPSLoss",
    "NetworkLoss",
    "LowExtBat",
    "ExtBatDiscnt",
  ];
  const alertDropdownRef =
    useRef(null);
  const [alertPanelOpen, setAlertPanelOpen] =
    useState(false);
  const [alertFilter, setAlertFilter] = useState({
    start_datetime: "",
    end_datetime: new Date().toISOString().slice(0, 16),
    state_id: "",
    district_id: "",
    vehicle_category_id: "",
  });

  const fetchAlertHeatmap = async () => {
    try {

      if (
        !selectedAlertTypes.length ||
        !alertFilter.start_datetime ||
        !alertFilter.end_datetime
      ) {
        return;
      }

      const requests = selectedAlertTypes.map(
        (alertType) =>
          HomePageService.getAlertHeatmap({
            start_datetime:
              alertFilter.start_datetime,
            end_datetime:
              alertFilter.end_datetime,
            alert_type:
              alertType,
            vehicle_category_id:
              alertFilter.vehicle_category_id,
            state_id:
              alertFilter.state_id,
          })
      );

      const responses =
        await Promise.all(requests);

      const mergedData =
        responses.flatMap((res) => {

          const payload =
            res?.data;


          if (
            Array.isArray(
              payload?.data?.alerts
            )
          )

            return payload.data.alerts;

          return [];
        });



      setAlertHeatmapData(
        mergedData
      );

      setShowAlertHeatmap(true);

    } catch (err) {
      console.error(
        "Alert Heatmap Error",
        err
      );
    }
  };

  useEffect(() => {

    const handleOutsideClick = (
      event
    ) => {

      if (
        alertDropdownRef.current &&
        !alertDropdownRef.current.contains(
          event.target
        )
      ) {

        if (
          selectedAlertTypes.length &&
          alertFilter.start_datetime &&
          alertFilter.end_datetime
        ) {
          fetchAlertHeatmap();
        }
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

  }, [
    selectedAlertTypes,
    alertFilter,
  ]);

  // Handle input changes
  const handleInput = (event) => {
    const { name, value } = event.target;
    if (name === "vehicleNo") {
      setVehicleNo(value);
    } else if (name === "imeiNo") {
      setImeiNo(value);
    } else if (name === "owner") {
      setOwner(value);
    } else if (name === "poi") {
      setPoi(value);
    } else if (name === "roads") {
      setRoads(value);
    } else if (name === "polygon") {
      setPolygon(value);

    } else if (name === "category") {
      setCategory(value);
    } else if (name === "make") {
      setMake(value);
    } else if (name === "district") {
      setDistrict(value);
    } else if (name === "speedLimit") {
      setSpeedLimit(value);
    }
  };

  useEffect(() => {
    const fetchPoiTypes = async () => {
      try {
        setPoiTypeLoading(true);

        const response = await HomePageService.getPoiTypes();

        setPoiTypes(response?.data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setPoiTypeLoading(false);
      }
    };

    fetchPoiTypes();
  }, []);

  const fetchPois = async (searchText = "") => {
    try {
      setPoiLoading(true);

      const response = await HomePageService.getPoiList({
        name: searchText,
        use_type: selectedPoiType || "",
      });

      setPoiOptions(response?.data?.data || []);
    } catch (error) {
      setPoiOptions([]);
    } finally {
      setPoiLoading(false);
    }
  };

  const handlePoiTypeChange = async (event, value) => {
    setSelectedPoiType(value);
    setSelectedPoi(null);
    setSelectedPoiId("");
    setPoi("");
    setPoiOptions([]);

    if (!value) return;

    try {
      setPoiLoading(true);

      const response = await HomePageService.getPoiList({
        use_type: value,
      });

      setPoiOptions(response?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPoiLoading(false);
    }
  };

  const handleTransitLayerChange = async (
    event
  ) => {
    const values = event.target.value;

    setSelectedTransitLayer(values);

    try {
      if (
        values.includes("school_routes") &&
        schoolRoutes.length === 0
      ) {
        const res =
          await HomePageService.getSchoolBusRoutes();

        setSchoolRoutes(
          res?.data?.data ||
          res?.data ||
          []
        );
      }

      if (
        values.includes("pis_routes") &&
        pisRoutes.length === 0
      ) {
        const res =
          await HomePageService.getPisRoutes();

        setPisRoutes(
          res?.data?.data ||
          res?.data ||
          []
        );
      }

      if (
        values.includes("school_buses") &&
        schoolBuses.length === 0
      ) {
        const res =
          await HomePageService.getSchoolBusLocations();

        setSchoolBuses(
          res?.data?.data ||
          res?.data ||
          []
        );
      }

      if (
        values.includes("pis_buses") &&
        pisBuses.length === 0
      ) {
        const res =
          await HomePageService.getPisBusLocations();

        setPisBuses(
          res?.data?.data ||
          res?.data ||
          []
        );
      }

      if (
        values.includes("pis_stops") &&
        pisStops.length === 0
      ) {
        const res =
          await HomePageService.getPisBusStops();

        setPisStops(
          res?.data?.data ||
          res?.data ||
          []
        );
      }
    } catch (err) {
      console.error(
        "Transit Layer Error",
        err
      );
    }
  };
  const computeRow = (processedItem) => {
    // Extract block_name and route_name
    const blockName = processedItem?.device_tag_info?.block?.name ||
      processedItem?.device_tag_info?.block_name ||
      processedItem?.device_tag_info?.device?.block_name ||
      processedItem?.device_tag_info?.device?.district ||
      processedItem?.device_tag_info?.district_info?.district ||
      processedItem?.device_tag_info?.state_info?.state ||
      processedItem?.block_name ||
      processedItem?.address ||
      processedItem?.nearest_poi?.data?.address ||
      '';

    const routeId = processedItem?.route_id ||
      processedItem?.device_tag_info?.route?.id ||
      processedItem?.nearby_routes_within_100m?.[0]?.data?.id;

    const routeName = processedItem?.device_tag_info?.route?.name ||
      processedItem?.device_tag_info?.route_name ||
      processedItem?.device_tag_info?.route_ref?.name ||
      processedItem?.route_name ||
      (routeId ? `Route: ${routeId}` : '');

    // Precompute status/icon
    const entryTimeMs = resolveEntryTimestampMs(processedItem);
    const nowMs = Date.now();
    const diffMin = Number.isFinite(entryTimeMs) ? calculateTimeDifference(entryTimeMs, nowMs) : Number.POSITIVE_INFINITY;
    const isStale = diffMin > 15;
    const ignitionOn = resolveIgnitionOn(processedItem);
    const speedValue = resolveSpeedValue(processedItem);

    let alartType;
    if (isStale) alartType = 'grey';
    else if (processedItem.packet_type === 'EA') alartType = 'red';
    else if (processedItem.packet_type !== 'NR') alartType = 'orange';
    else if (speedValue > 0) alartType = 'green';
    else if (ignitionOn && speedValue === 0) alartType = 'blue';
    else alartType = 'default';

    const vehicleType = processedItem?.device_tag_info?.category_info?.category;
    const colorMap = { grey: 'grey', red: 'red', orange: 'orange', blue: 'blue', green: 'green', default: 'default' };
    const color = colorMap[alartType] || 'default';
    const preIcon = createIconPath(color, vehicleType);

    return {
      ...processedItem,
      block_name: blockName,
      route_name: routeName,
      __alartType: alartType,
      __iconSrc: preIcon,
    };
  };

  const handleListScroll = useCallback(() => {
    const el = listContainerRef.current;
    if (!el || !fullRawRef.current) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    if (!nearBottom) return;

    const BATCH = 200;
    const nextEnd = Math.min(visibleCount + BATCH, fullRawRef.current.length);
    if (nextEnd <= visibleCount) return;

    const nextSlice = fullRawRef.current.slice(visibleCount, nextEnd).map(computeRow);
    fullDataRef.current = [...fullDataRef.current, ...nextSlice];
    setTableDataTop((prev) => [...prev, ...nextSlice]);
    if (typeFilter === 'default') {
      setFilteredData((prev) => [...prev, ...nextSlice]);
    }
    setVisibleCount(nextEnd);
  }, [visibleCount, typeFilter]);

  const handleVehicleMarkerClick = async (entry) => {
    if (!entry?.imei) return;

    setSelectedId(`vehicle-${entry.imei}`);
    setFilteredData([entry]);
    setFocusedEntry(entry);
    setUseNmrLocation(false);
    setNmrArea(null);
    if (isBadGnss(entry)) {
      const updated = await applyNmrLocation(entry);
      setFilteredData([updated]);
      setFocusedEntry(updated);
    }
  };

  const computeSearchCenter = useCallback((entries = []) => {
    const coords = entries
      .map((item) => {
        const latitude = Number(item.latitude);
        const longitude = Number(item.longitude);
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          return { latitude, longitude };
        }
        return null;
      })
      .filter(Boolean);

    if (coords.length === 0) {
      return { latitude: 26.1445, longitude: 91.7362 }; // Guwahati default
    }

    const totals = coords.reduce(
      (acc, point) => {
        acc.latitude += point.latitude;
        acc.longitude += point.longitude;
        return acc;
      },
      { latitude: 0, longitude: 0 }
    );

    return {
      latitude: totals.latitude / coords.length,
      longitude: totals.longitude / coords.length,
    };
  }, []);

  const fetchPoliceLocations = useCallback(async (entries = []) => {
    try {
      // Build API params - only include lat/lon when a vehicle is selected
      const params = {
        user_type: 'police_ex',
      };

      // If entries exist (vehicle selected), add location-based filtering
      if (entries && entries.length > 0) {
        const center = computeSearchCenter(entries);
        params.lat = center.latitude;
        params.lon = center.longitude;
        params.radius_km = 10000;
      }

      const response = await HomePageService.getEmergencyUserLocations(params);

      // Parse the nested response structure
      const payload = response?.data ?? {};
      let records = [];

      // Handle the structure: { results: { data: [...] } }
      if (payload?.results?.data && Array.isArray(payload.results.data)) {
        records = payload.results.data;
      } else if (Array.isArray(payload?.results)) {
        records = payload.results;
      } else if (Array.isArray(payload?.data)) {
        records = payload.data;
      } else if (Array.isArray(payload)) {
        records = payload;
      }

      const normalized = records
        .map((item, index) => {
          // Extract location from em_lat and em_lon at root level
          const latitude = Number(item?.em_lat ?? item?.latitude ?? item?.lat);
          const longitude = Number(item?.em_lon ?? item?.longitude ?? item?.lon);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          // Extract user info from field_ex
          const fieldEx = item?.field_ex ?? {};
          const users = fieldEx?.users ?? [];
          const primaryUser = users[0] ?? {};

          // Extract timestamp from time field or field_ex
          const lastUpdatedRaw = item?.time ?? fieldEx?.created ?? item?.timestamp;
          const lastUpdated = lastUpdatedRaw ? new Date(lastUpdatedRaw).toISOString() : new Date().toISOString();

          // Create label from user name or fallback
          const userName = primaryUser?.name || fieldEx?.idProofno || `Police #${index + 1}`;
          const labelFallback = userName;

          return {
            id: item?.id || fieldEx?.id || `police-${index}`,
            vehicle_registration_number: userName,
            block_name: fieldEx?.district_info?.district || fieldEx?.state_info?.state || '',
            route_name: '',
            markerLabel: labelFallback,
            markerCategory: 'police',
            packet_type: 'POLICE',
            device_tag_info: { category_info: { category: 'police' } },
            ignition_status: 1, // Assume active
            speed: Number(item?.speed) || 0,
            entry_time: lastUpdated,
            date: lastUpdated.split('T')[0] ?? '',
            time: lastUpdated.split('T')[1]?.split('Z')[0] ?? '',
            internal_battery_voltage: '--',
            main_input_voltage: '--',
            latitude,
            longitude,
          };
        })
        .filter(Boolean);

      setPoliceLocations(normalized);
    } catch (error) {
      console.error('Error fetching police locations:', error);
      setPoliceLocations([]);
    }
  }, [computeSearchCenter]);

  const fetchAmbulanceLocations = useCallback(async (entries = []) => {
    try {
      const params = { user_type: 'ambulance_ex' };
      if (entries && entries.length > 0) {
        const center = computeSearchCenter(entries);
        params.lat = center.latitude;
        params.lon = center.longitude;
        params.radius_km = 10000;
      }
      const response = await HomePageService.getEmergencyUserLocations(params);
      const payload = response?.data ?? {};
      let records = [];
      if (payload?.results?.data && Array.isArray(payload.results.data)) {
        records = payload.results.data;
      } else if (Array.isArray(payload?.results)) {
        records = payload.results;
      } else if (Array.isArray(payload?.data)) {
        records = payload.data;
      } else if (Array.isArray(payload)) {
        records = payload;
      }
      const normalized = records
        .map((item, index) => {
          const latitude = Number(item?.em_lat ?? item?.latitude ?? item?.lat);
          const longitude = Number(item?.em_lon ?? item?.longitude ?? item?.lon);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
          const fieldEx = item?.field_ex ?? {};
          const users = fieldEx?.users ?? [];
          const primaryUser = users[0] ?? {};
          const lastUpdatedRaw = item?.time ?? fieldEx?.created ?? item?.timestamp;
          const lastUpdated = lastUpdatedRaw ? new Date(lastUpdatedRaw).toISOString() : new Date().toISOString();
          const userName = primaryUser?.name || fieldEx?.idProofno || `Ambulance #${index + 1}`;
          return {
            id: item?.id || fieldEx?.id || `ambulance-${index}`,
            vehicle_registration_number: userName,
            block_name: fieldEx?.district_info?.district || fieldEx?.state_info?.state || '',
            route_name: '',
            markerLabel: userName,
            markerCategory: 'ambulance',
            packet_type: 'AMBULANCE',
            device_tag_info: { category_info: { category: 'ambulance' } },
            ignition_status: 1,
            speed: Number(item?.speed) || 0,
            entry_time: lastUpdated,
            date: lastUpdated.split('T')[0] ?? '',
            time: lastUpdated.split('T')[1]?.split('Z')[0] ?? '',
            internal_battery_voltage: '--',
            main_input_voltage: '--',
            latitude,
            longitude,
          };
        })
        .filter(Boolean);
      setAmbulanceLocations(normalized);
    } catch (error) {
      console.error('Error fetching ambulance locations:', error);
      setAmbulanceLocations([]);
    }
  }, [computeSearchCenter]);

  const fetchIncidents = useCallback(async (entries = []) => {
    try {
      const center = computeSearchCenter(entries);
      const response = await HomePageService.getIncidentData({
        latitude: center.latitude,
        longitude: center.longitude,
        radius_km: 50, // Default radius
        page: 1,
        page_size: 100,
        // Add date range if needed, e.g., current year
        registered_at_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        registered_at_to: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      });

      if (response && response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
        setIncidentData(response.data.data);
      } else {
        setIncidentData([]);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidentData([]);
    }
  }, [computeSearchCenter]);

  const isBadGnss = (entry) => {
    const lat = Number(entry?.latitude);
    const lon = Number(entry?.longitude);
    return (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      (lat === 0 && lon === 0)
    );
  };

  const applyNmrLocation = async (entry) => {
    const mcc = entry?.mcc;
    const mnc = entry?.mnc;
    const lac = entry?.lac;
    const cellId = entry?.cell_id;

    if (!mcc || !mnc || !lac || !cellId) {
      return entry;
    }

    try {
      const payload = {
        mcc: String(mcc),
        mnc: String(mnc),
        lac: String(lac),
        cell_id: String(cellId),
      };

      const nmrResponse = await HomePageService.getCellLocation(payload);
      const latValue = nmrResponse?.data?.average_latitude ?? nmrResponse?.data?.lat ?? nmrResponse?.data?.latitude;
      const lonValue = nmrResponse?.data?.average_longitude ?? nmrResponse?.data?.lon ?? nmrResponse?.data?.lng ?? nmrResponse?.data?.longitude;

      const lat = Number(latValue);
      const lon = Number(lonValue);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return entry;
      }

      // Automatic NMR fallback: update coordinates only, do NOT show circle
      return { ...entry, latitude: lat, longitude: lon };
    } catch (e) {
      return entry;
    }
  };

  let activeCancel = null;
  const retriveMapData = async (data) => {
    try {
      if (activeCancel) {
        activeCancel.cancel('replaced by a newer request');
      }
      activeCancel = axios.CancelToken.source();

      const retriveData_table = await HomePageService.getLiveTracking_data(
        { ...data },
        { cancelToken: activeCancel.token }
      );

      if (Array.isArray(retriveData_table.data.data)) {
        const rawData = retriveData_table.data.data;
        fullRawRef.current = rawData;

        const nextCategorySpeedMap = rawData.reduce((acc, item) => {
          const catRaw =
            item?.device_tag_info?.category_info?.category ??
            item?.category_info?.category ??
            item?.category;
          const cat = normalizeCategoryKey(catRaw);
          if (!cat) return acc;
          const speedValue = item?.device_tag_info?.category_info?.maxSpeed ??
            item?.device_tag_info?.category_info?.max_speed ??
            item?.category_info?.maxSpeed ??
            item?.category_info?.max_speed ??
            '';
          if (speedValue !== '' && speedValue !== null && speedValue !== undefined) {
            acc[cat] = String(speedValue);
          }
          return acc;
        }, {});
        setCategorySpeedMap(nextCategorySpeedMap);

        const maxSpeedValue = rawData?.[0]?.device_tag_info?.category_info?.maxSpeed ??
          rawData?.[0]?.device_tag_info?.category_info?.max_speed ??
          rawData?.[0]?.category_info?.maxSpeed ??
          rawData?.[0]?.category_info?.max_speed ??
          '';
        setCategoryMaxSpeed(category && rawData.length > 0 ? String(maxSpeedValue || '') : '');

        // Lazy rendering: keep full list in ref and render initial chunk only
        const INITIAL_CHUNK = 50; // smaller initial paint for faster perceived load
        const CHUNK_SIZE = 200;

        const firstSlice = rawData.slice(0, INITIAL_CHUNK).map(computeRow);
        fullDataRef.current = firstSlice;
        setTableDataTop(firstSlice);
        setFilteredData(firstSlice);
        setVisibleCount(firstSlice.length);
        setLoad(true);

        setNoDataMessage(
          owner
            ? `No vehicle owner found for "${owner}"`
            : "No data found"
        );

        setOpenSnackbar(true);

        // If there's exactly one vehicle, select it automatically
        if (rawData.length === 1) {
          setSelectedId(`vehicle-${rawData[0].imei}`);
          setFocusedEntry(computeRow(rawData[0]));
        } else {
          setSelectedId(null);
          setFocusedEntry(null);
        }

        // Defer auxiliary data fetches to avoid blocking first paint
        setTimeout(() => {
          const all = fullRawRef.current?.length ? fullRawRef.current : rawData;
          fetchPoliceLocations(all);
          fetchAmbulanceLocations(all);
          fetchIncidents(all);
        }, 0);
      } else {
        setTableDataTop([]);
        setFilteredData([]);
        setSelectedId(null);
        setFocusedEntry(null);
        setCategoryMaxSpeed('');
        setCategorySpeedMap({});
        setUseNmrLocation(false);
        setNmrArea(null);
        fetchPoliceLocations();
        fetchAmbulanceLocations();
        fetchIncidents();
      }
      // load state now set earlier for faster perceived rendering
    } catch (error) {
      setTableDataTop([]);
      setFilteredData([]);
      setSelectedId(null);
      setFocusedEntry(null);
      setCategoryMaxSpeed('');
      setCategorySpeedMap({});
      setUseNmrLocation(false);
      setNmrArea(null);
      fetchPoliceLocations();
      fetchAmbulanceLocations();
      fetchIncidents();
    }
  };

  const getReverseGeocodeCacheKey = (lat, lon) => {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
    return `${latNum.toFixed(5)},${lonNum.toFixed(5)}`;
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await HomePageService.getReverseGeocode(lat, lon);
      const payload = response?.data;

      let city = "";
      let area = "";
      let address = "";

      // 1. Check for the flat structure shown by the user
      if (payload && typeof payload === 'object' && !payload.results) {
        city = payload.city || "";
        area = payload.area || "";
        address = payload.address || "";
        return { address, city, area };
      }

      // 2. Fallback to nested results structure
      const result = payload?.results?.[0];
      if (result) {
        if (Array.isArray(result.address_components)) {
          const cityComp = result.address_components.find((c) =>
            c.types.includes("locality") ||
            c.types.includes("administrative_area_level_2") ||
            c.types.includes("administrative_area_level_3")
          );
          if (cityComp) city = cityComp.long_name;
        }
        address = result.formatted_address || (typeof payload?.address === "string" ? payload.address.trim() : "");
        return { address, city, area: "" };
      }

      const fallbackAddress = typeof payload?.address === "string" ? payload.address.trim() : "";
      return { address: fallbackAddress, city: "", area: "" };
    } catch (error) {
      console.error("Reverse geocode error:", error);
      return { address: "", city: "" };
    }
  };

  useEffect(() => {
    const lat = focusedEntry?.latitude;
    const lon = focusedEntry?.longitude;
    const cacheKey = getReverseGeocodeCacheKey(lat, lon);

    if (!focusedEntry || !cacheKey) return;
    // Remove the early return for address so we can ensure geocoding (which populates block_name) runs
    // if block_name is missing or a fallback.
    const hasValidBlock = focusedEntry.block_name && focusedEntry.block_name !== "" && focusedEntry.block_name !== "china";
    if (focusedEntry.address && hasValidBlock) return;

    const cached = reverseGeocodeCache[cacheKey];
    if (cached && typeof cached === "object") {
      const { address, block_name } = cached;
      if (!address && !block_name) return;

      setFocusedEntry((prev) => (prev ? { ...prev, address, block_name: block_name || prev.block_name } : prev));
      setFilteredData((prev) =>
        prev.map((row) =>
          row?.imei === focusedEntry?.imei ? { ...row, address, block_name: block_name || row.block_name } : row
        )
      );
      setTableDataTop((prev) =>
        prev.map((row) =>
          row?.imei === focusedEntry?.imei ? { ...row, address, block_name: block_name || row.block_name } : row
        )
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        console.debug(`[LiveTracking] Fetching reverse geocode for: ${lat}, ${lon}`);
        const { address, city, area } = await reverseGeocode(lat, lon);
        if (cancelled) return;

        const effectiveBlockName = city || area || address || "";
        setReverseGeocodeCache((prev) => ({ ...prev, [cacheKey]: { address: address || "", block_name: effectiveBlockName } }));

        setFocusedEntry((prev) => (prev ? { ...prev, address: address || "", block_name: effectiveBlockName || prev.block_name } : prev));
        setFilteredData((prev) =>
          prev.map((row) =>
            row?.imei === focusedEntry?.imei ? { ...row, address: address || "", block_name: effectiveBlockName || row.block_name } : row
          )
        );
        setTableDataTop((prev) =>
          prev.map((row) =>
            row?.imei === focusedEntry?.imei ? { ...row, address: address || "", block_name: effectiveBlockName || row.block_name } : row
          )
        );
      } catch (error) {
        if (cancelled) return;
        setReverseGeocodeCache((prev) => ({ ...prev, [cacheKey]: { address: "", block_name: "" } }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [focusedEntry?.imei, focusedEntry?.latitude, focusedEntry?.longitude, focusedEntry?.address, reverseGeocodeCache]);

  // Handle button click, update selectedId and filtered data
  const handleButtonClick = async (id) => {
    let selectedRow = tableDataTop.find((row) => `vehicle-${row.imei}` === id);
    if (!selectedRow) {
      selectedRow = (fullDataRef.current || []).find((row) => `vehicle-${row.imei}` === id);
    }

    if (selectedRow) {
      setSelectedId(id);
      setFilteredData([selectedRow]);
      setFocusedEntry(selectedRow);
      setUseNmrLocation(false);
      setNmrArea(null);
      if (isBadGnss(selectedRow)) {
        const updated = await applyNmrLocation(selectedRow);
        setFilteredData([updated]);
        setFocusedEntry(updated);
      }
    } else {
      setSelectedId(null);
      setFilteredData(tableDataTop);
      setFocusedEntry(null);
      setUseNmrLocation(false);
      setNmrArea(null);
    }
  };

  // Triggered on form submit to fetch new data
  const handleSubmit = (event) => {
    event.preventDefault();
    const isPoiSelected = !!selectedPoiId;

    const isPolygonPoi =
      selectedPoi &&
      String(selectedPoi.mark_type).toLowerCase() === "polygon";
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: selectedPoiId,
      roads: roads,
      route_id: '',
      polygon: polygon,
      category: category,
      make: make,
      district: district,
      district_id: '',
      manufacturer_id: '',
      speed_limit: speedLimit,
      // Required logic
      in_range: isPoiSelected ? true : inRange,
      poi_as_polygon: isPolygonPoi,
      poi_t: "",
    };

    setSelectedId(null); // Reset selection when submitting new search
    setFocusedEntry(null);
    setUseNmrLocation(false);
    setNmrArea(null);

    retriveMapData(params);
  };

  useEffect(() => {
    const isPoiSelected = !!selectedPoiId;

    const isPolygonPoi =
      selectedPoi &&
      String(selectedPoi.mark_type).toLowerCase() === "polygon";

    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: selectedPoiId,
      roads: roads,
      route_id: '',
      polygon: polygon,
      category: category,
      make: make,
      district: district,
      district_id: '',
      manufacturer_id: '',
      speed_limit: speedLimit,
      // Required logic
      in_range: isPoiSelected ? true : inRange,
      poi_as_polygon: isPolygonPoi,
      poi_t: "",
    };

    // Single fetch when filters/inputs change, no repeating interval
    retriveMapData(params);
  }, [imeiNo, vehicleNo, owner, poi, roads, polygon, category, make, district, inRange, poiAsPolygon, selectedPoiId]);

  const refreshSelectedVehicle = async () => {
    if (!selectedId) return;

    const selectedRow = tableDataTop.find((row) => `vehicle-${row.imei}` === selectedId);
    if (!selectedRow) return;
    const isPoiSelected = !!selectedPoiId;

    const isPolygonPoi =
      selectedPoi &&
      String(selectedPoi.mark_type).toLowerCase() === "polygon";

    const params = {
      imei: selectedRow.imei,
      regno: '',
      owner: '',
      poi: selectedPoiId,
      roads: '',
      route_id: '',
      polygon: '',
      category: '',
      make: '',
      district: '',
      district_id: '',
      manufacturer_id: '',
      speed_limit: speedLimit,
      // Required logic
      in_range: isPoiSelected ? true : inRange,
      poi_as_polygon: isPolygonPoi,
      poi_t: "",
    };

    try {
      const response = await HomePageService.getLiveTracking_data(params);
      if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
        let updated = response.data.data[0];

        if (isBadGnss(updated)) {
          updated = await applyNmrLocation(updated);
        } else if (useNmrLocation) {
          updated = await applyNmrLocation(updated);
        }

        setFilteredData([updated]);
        setFocusedEntry(updated);
      }
    } catch (error) {
      // Ignore refresh errors for selected vehicle
    }
  };

  useEffect(() => {
    if (!selectedId) return;

    const intervalId = setInterval(() => {
      refreshSelectedVehicle();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedId, tableDataTop]);

  // Helper to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const timeDifferenceMillis = endTime - startTime;
    return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
  };

  const resolveEntryTimestampMs = (data) => {
    if (!data) return NaN;

    const raw = data.entry_time ?? data.timestamp ?? null;

    const normalizeEpoch = (value) => {
      const num = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(num)) return NaN;
      return num < 1e12 ? num * 1000 : num;
    };

    if (typeof raw === "number") {
      return normalizeEpoch(raw);
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (/^\d+$/.test(trimmed)) {
        return normalizeEpoch(trimmed);
      }
      const parsed = new Date(trimmed).getTime();
      if (Number.isFinite(parsed)) return parsed;
    }

    const parseDateTimeParts = (dateStr, timeStr) => {
      if (!dateStr || !timeStr) return NaN;

      const dateTrimmed = String(dateStr).trim();
      const timeTrimmed = String(timeStr).trim();

      // Format: DDMMYYYY + HHMMSS (e.g., 15122025 + 234041)
      const dmyCompact = dateTrimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
      const hmsCompact = timeTrimmed.match(/^(\d{2})(\d{2})(\d{2})$/);
      if (dmyCompact && hmsCompact) {
        const day = Number(dmyCompact[1]);
        const month = Number(dmyCompact[2]);
        const year = Number(dmyCompact[3]);
        const hours = Number(hmsCompact[1]);
        const minutes = Number(hmsCompact[2]);
        const seconds = Number(hmsCompact[3]);
        const dt = new Date(year, month - 1, day, hours, minutes, seconds);
        const ms = dt.getTime();
        return Number.isFinite(ms) ? ms : NaN;
      }

      // Format: DD-MM-YY or DD-MM-YYYY
      const dmy = dateTrimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
      if (dmy) {
        const day = Number(dmy[1]);
        const month = Number(dmy[2]);
        let year = Number(dmy[3]);
        if (String(dmy[3]).length === 2) year = 2000 + year;

        // Time: HH:MM(:SS)? (AM/PM optional)
        const tm = timeTrimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
        if (!tm) return NaN;
        let hours = Number(tm[1]);
        const minutes = Number(tm[2]);
        const seconds = Number(tm[3] ?? 0);
        const ampm = tm[4]?.toUpperCase();
        if (ampm === "AM") {
          if (hours === 12) hours = 0;
        } else if (ampm === "PM") {
          if (hours !== 12) hours += 12;
        }

        const dt = new Date(year, month - 1, day, hours, minutes, seconds);
        const ms = dt.getTime();
        return Number.isFinite(ms) ? ms : NaN;
      }

      // Fallback: try native parsing for other formats
      const fallbackMs = new Date(`${dateTrimmed} ${timeTrimmed}`).getTime();
      return Number.isFinite(fallbackMs) ? fallbackMs : NaN;
    };

    const datePart = data?.date;
    const timePart = data?.time;
    if (datePart && timePart) {
      const compositeMs = parseDateTimeParts(datePart, timePart);
      if (Number.isFinite(compositeMs)) return compositeMs;

      const compositeParsed = new Date(`${datePart}T${timePart}`).getTime();
      if (Number.isFinite(compositeParsed)) return compositeParsed;
    }

    return NaN;
  };

  const createIconPath = (color, vehicleType) => {
    const normalizedVehicleType = vehicleType ? String(vehicleType).toLowerCase().trim() : 'bus';
    const availableTypes = ['ambulance', 'bus', 'dumper', 'police', 'school bus', 'tanker', 'taxi', 'truck'];
    const iconType = availableTypes.includes(normalizedVehicleType) ? normalizedVehicleType : 'bus';
    const fileName = `${iconType}.png`;

    try {
      return vehicleIconContext(`./${color}/${fileName}`);
    } catch (error) {
      try {
        return vehicleIconContext(`./${color}/bus.png`);
      } catch (fallbackError) {
        return vehicleIconContext(`./default/bus.png`);
      }
    }
  };

  const resolveIgnitionOn = (entry) => String(entry?.ignition_status ?? entry?.ignitionStatus ?? "") === "1";

  const resolveSpeedValue = (entry) => {
    const raw = entry?.speed ?? entry?.vehicle_speed ?? entry?.vehicleSpeed;
    const num = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const getIconStyle = (data) => {
    const entryTimeMs = resolveEntryTimestampMs(data);
    const currentTimeMs = new Date().getTime();
    const timeDifference = Number.isFinite(entryTimeMs)
      ? calculateTimeDifference(entryTimeMs, currentTimeMs)
      : Number.POSITIVE_INFINITY;
    const isStale = timeDifference > 15;

    // Get vehicle type from data
    const vehicleType = data?.device_tag_info?.category_info?.category;

    const ignitionOn = resolveIgnitionOn(data);
    const speedValue = resolveSpeedValue(data);

    let color;
    if (isStale) {
      color = 'grey'; // Offline device (no packets from device for 15+ minutes) - Grey Icon
    } else if (data.packet_type === "EA") {
      color = 'red'; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      color = 'orange'; // Any Alert Packet except EA - Orange Icon
    } else if (speedValue > 0) {
      color = 'green'; // Moving - Green Icon
    } else if (ignitionOn && speedValue === 0) {
      color = 'blue'; // Ignition ON but stationary - Blue Icon
    } else {
      color = 'default'; // Default icon for all other conditions
    }

    return createIconPath(color, vehicleType);
  };

  const getAlartType = (data) => {
    const entryTimeMs = resolveEntryTimestampMs(data);
    const currentTimeMs = new Date().getTime();
    const timeDifference = Number.isFinite(entryTimeMs)
      ? calculateTimeDifference(entryTimeMs, currentTimeMs)
      : Number.POSITIVE_INFINITY;
    const isStale = timeDifference > 15;

    const ignitionOn = resolveIgnitionOn(data);
    const speedValue = resolveSpeedValue(data);

    if (isStale) {
      return "grey"; // Offline device (no packets from device for 15+ minutes) - Grey Icon
    } else if (data.packet_type === "EA") {
      return "red"; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      return "orange"; // Any Alert Packet except EA - Orange Icon
    } else if (speedValue > 0) {
      return "green"; // Moving - Green Icon
    } else if (ignitionOn && speedValue === 0) {
      return "blue"; // Ignition ON but stationary - Blue Icon
    } else {
      return "default"; // Default icon for all other conditions
    }
  };

  const filterByType = (data) => {
    setTypeFilter(data);
    setSelectedId(null); // Reset selection when changing filter

    if (data === "default") {
      setFilteredData(tableDataTop);
      setFocusedEntry(null);
    } else if (data === "online") {
      const filteredRows = tableDataTop.filter(row => (row.__alartType ?? getAlartType(row)) !== "grey");
      setFilteredData(filteredRows);

      if (filteredRows.length === 1) {
        setSelectedId(`vehicle-${filteredRows[0].imei}`);
        setFocusedEntry(filteredRows[0]);
      } else {
        setSelectedId(null);
        setFocusedEntry(null);
      }
    } else {
      const filteredRows = tableDataTop.filter(row => (row.__alartType ?? getAlartType(row)) === data);
      setFilteredData(filteredRows);

      // If there's exactly one result after filtering, select it automatically
      if (filteredRows.length === 1) {
        setSelectedId(`vehicle-${filteredRows[0].imei}`);
        setFocusedEntry(filteredRows[0]);
      } else {
        setSelectedId(null);
        setFocusedEntry(null);
      }
    }
  };

  const checkType = (type, data) => {
    const alartType = data?.__alartType ?? getAlartType(data);
    if (type === "default") return true;
    if (type === "online") return alartType !== "grey";
    return alartType === type;
  };

  const getDisplayCellValue = (row, key) => {
    if (!row) return "";
switch (key) {
  case "category_name":
    return row?.device_tag_info?.category_info?.category || "-";

  case "max_speed":
    return row?.device_tag_info?.category_info?.maxSpeed || "-";

  case "warn_speed":
    return row?.device_tag_info?.category_info?.warnSpeed || "-";

  case "vehicle_make":
    return row?.device_tag_info?.vehicle_make || "-";

  case "vehicle_model":
    return row?.device_tag_info?.vehicle_model || "-";

  case "engine_no":
    return row?.device_tag_info?.engine_no || "-";

  case "chassis_no":
    return row?.device_tag_info?.chassis_no || "-";

  case "sale_type":
    return row?.device_tag_info?.sale_type || "-";

  case "owner_name":
    return row?.device_tag_info?.vehicle_owner?.users?.[0]?.name || "-";

  case "owner_email":
    return row?.device_tag_info?.vehicle_owner?.users?.[0]?.email || "-";

  case "owner_mobile":
    return row?.device_tag_info?.vehicle_owner?.users?.[0]?.mobile || "-";

  case "owner_role":
    return row?.device_tag_info?.vehicle_owner?.users?.[0]?.role || "-";

  case "device_id":
    return row?.device_tag_info?.device_info?.id || "-";

  case "dealer_name":
    return row?.device_tag_info?.device_info?.dealer?.company_name || "-";

  case "manufacturer_name":
    return row?.device_tag_info?.device_info?.manufacturer?.company_name || "-";

  case "tag_status":
    return row?.device_tag_info?.status || "-";

  case "tagged_date":
    return row?.device_tag_info?.tagged || "-";

   default:
      break;
  }

    if (key === "packet_type" || key === "packet_status") {
      const entryTimeMs = resolveEntryTimestampMs(row);
      const currentTimeMs = new Date().getTime();
      const timeDifference = Number.isFinite(entryTimeMs)
        ? calculateTimeDifference(entryTimeMs, currentTimeMs)
        : Number.POSITIVE_INFINITY;
      if (timeDifference > 15) return "Offline";
    }

    if (key === "ignition_status") {
      const ignitionOn = resolveIgnitionOn(row);
      if (!ignitionOn) return "Engine OFF";
      const speedValue = resolveSpeedValue(row);
      return speedValue <= 1 ? "Engine ON (Stationary)" : "Engine ON";
    }

    const rawValue = row[key];
    return (
      fullText?.[rawValue] ||
      (isoDatePattern.test(rawValue) && formatDateTime(rawValue)) ||
      rawValue ||
      ""
    );
  };
   const visibleColumns =
  selectedColumns.length > 0
    ? COLUMN_OPTIONS.filter((col) =>
        selectedColumns.includes(col.key)
      )
    : COLUMN_OPTIONS;
  return (
    <MainCard>
      <Typography variant="h4">{t('liveTracking.title')}</Typography>

      {/* Scrollable Table (First Table) */}
      <div className="container">
        <div
          className={
            selectedId
              ? "first-div first-div-small"
              : "first-div first-div-large"
          }
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} className="form-grid-container">
              <Grid item className="grid-item">
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <TextField
                      fullWidth
                      label={t('liveTracking.vehicleRegistrationNo')}
                      type="text"
                      value={vehicleNo}
                      name="vehicleNo"
                      onChange={handleInput}
                      variant="outlined"
                      size="small"
                      InputProps={{ sx: { borderRadius: 1 } }}
                    />
                    <Tooltip title="Toggle Advanced Filters">
                      <IconButton
                        onClick={() => setShowFilters(!showFilters)}
                        color={showFilters ? "primary" : "default"}
                        sx={{ border: '1px solid #ccc', borderRadius: 1 }}
                      >
                        <FilterListIcon />
                      </IconButton>
                    </Tooltip>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ minWidth: '50px', height: '40px', borderRadius: 1 }}
                    >
                      <SearchIcon />
                    </Button>
                  </Box>

                  {/* Collapsible Advanced Filters */}
                  <Collapse in={showFilters}>
                    <Grid container spacing={1} sx={{ mt: 0.5, p: 1, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #eee' }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Vehicle Owner"
                          type="text"
                          value={owner}
                          name="owner"
                          onChange={handleInput}
                          variant="outlined"
                          size="small"
                          InputProps={{ sx: { bgcolor: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                          <InputLabel id="live-tracking-category-label">Category/MaxSpeed</InputLabel>
                          <Select
                            labelId="live-tracking-category-label"
                            label="Category/MaxSpeed"
                            value={category}
                            name="category"
                            onChange={handleInput}
                            renderValue={(selected) => {
                              if (!selected) return 'All';
                              const spd = categorySpeedMap?.[normalizeCategoryKey(selected)] || categoryMaxSpeed;
                              if (spd) return `${selected} (${spd} km/h)`;
                              return selected;
                            }}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Ambulance">{`Ambulance${categorySpeedMap?.[normalizeCategoryKey('Ambulance')] ? ` (${categorySpeedMap[normalizeCategoryKey('Ambulance')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="Bus">{`Bus${categorySpeedMap?.[normalizeCategoryKey('Bus')] ? ` (${categorySpeedMap[normalizeCategoryKey('Bus')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="Dumper">{`Dumper${categorySpeedMap?.[normalizeCategoryKey('Dumper')] ? ` (${categorySpeedMap[normalizeCategoryKey('Dumper')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="Police">{`Police${categorySpeedMap?.[normalizeCategoryKey('Police')] ? ` (${categorySpeedMap[normalizeCategoryKey('Police')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="School bus">{`School bus${categorySpeedMap?.[normalizeCategoryKey('School bus')] ? ` (${categorySpeedMap[normalizeCategoryKey('School bus')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="Tanker">{`Tanker${categorySpeedMap?.[normalizeCategoryKey('Tanker')] ? ` (${categorySpeedMap[normalizeCategoryKey('Tanker')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="Taxi">{`Taxi${categorySpeedMap?.[normalizeCategoryKey('Taxi')] ? ` (${categorySpeedMap[normalizeCategoryKey('Taxi')]} km/h)` : ''}`}</MenuItem>
                            <MenuItem value="Truck">{`Truck${categorySpeedMap?.[normalizeCategoryKey('Truck')] ? ` (${categorySpeedMap[normalizeCategoryKey('Truck')]} km/h)` : ''}`}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Autocomplete
                                options={poiTypes}
                                loading={poiTypeLoading}
                                value={selectedPoiType}
                                onChange={handlePoiTypeChange}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="POI Type"
                                    size="small"
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <Autocomplete
                                options={poiOptions}
                                loading={poiLoading}
                                value={selectedPoi}
                                disabled={!selectedPoiType}
                                filterOptions={(x) => x}
                                getOptionLabel={(option) => option?.name || ""}
                                isOptionEqualToValue={(option, value) =>
                                  option?.id === value?.id
                                }
                                onInputChange={(event, value, reason) => {
                                  if (reason !== "input") return;

                                  if (!selectedPoiType) return;

                                  fetchPois(value);
                                }}
                                onChange={(event, value) => {
                                  if (!selectedPoiType) return;

                                  setSelectedPoi(value);

                                  if (value) {

                                    setPoi(value.name);        // keep existing logic
                                    setSelectedPoiId(value.id); // NEW
                                  } else {
                                    setPoi("");
                                    setSelectedPoiId("");
                                  }
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={
                                      selectedPoiType
                                        ? `POI (${selectedPoiType})`
                                        : "Select POI Type First"
                                    }
                                    size="small"
                                    InputProps={{
                                      ...params.InputProps,
                                      endAdornment: (
                                        <>
                                          {poiLoading && <CircularProgress size={20} />}
                                          {params.InputProps.endAdornment}
                                        </>
                                      ),
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                          {/* <Box display="flex" flexWrap="wrap" gap={2}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  color="primary"
                                  checked={inRange}
                                  onChange={(e) => setInRange(e.target.checked)}
                                />
                              }
                              label="In Range Only"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  color="primary"
                                  checked={poiAsPolygon}
                                  onChange={(e) => setPoiAsPolygon(e.target.checked)}
                                />
                              }
                              label="POI as Polygon"
                            />
                          </Box> */}
                        </Box>
                      </Grid>
                      {/* <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Roads"
                          type="text"
                          value={roads}
                          name="roads"
                          onChange={handleInput}
                          variant="outlined"
                          size="small"
                          InputProps={{ sx: { bgcolor: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Polygon"
                          type="text"
                          value={polygon}
                          name="polygon"
                          onChange={handleInput}
                          variant="outlined"
                          size="small"
                          InputProps={{ sx: { bgcolor: 'white' } }}
                        />
                      </Grid> */}
                      {userRole === "stateadmin" && (
                        <>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Make"
                              type="text"
                              value={make}
                              name="make"
                              onChange={handleInput}
                              variant="outlined"
                              size="small"
                              InputProps={{ sx: { bgcolor: 'white' } }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="District"
                              type="text"
                              value={district}
                              name="district"
                              onChange={handleInput}
                              variant="outlined"
                              size="small"
                              InputProps={{ sx: { bgcolor: 'white' } }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Collapse>
                </Box>
              </Grid>
            </Grid>
          </form>
          <TableContainer
            component={Paper}
            className="table-container"
            sx={{ maxHeight: '80vh', overflow: 'auto' }}
            ref={listContainerRef}
            onScroll={handleListScroll}
          >
            <Table>
              {iconData && <TableHead>
                <TableRow>
                  {iconData.slice(0, 4).map((item, index) => (
                    <TableCell
                      key={index}
                      onClick={() => filterByType(item.key)}
                      className="tracking-icon"
                      sx={{ backgroundColor: '#f5f5f5' }}
                    >
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.text} style={{ width: '24px', height: '24px' }} />
                      ) : null}

                      <Typography variant="caption" className="icon-text">
                        {item.text}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {iconData.slice(4, 8).map((item, index) => (
                    <TableCell
                      key={index}
                      onClick={() => filterByType(item.key)}
                      className="tracking-icon"
                      sx={{ backgroundColor: '#f5f5f5' }}
                    >
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.text} style={{ width: '24px', height: '24px' }} />
                      ) : null}

                      <Typography variant="caption" className="icon-text">
                        {item.text}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              }
              <TableBody>
                {tableDataTop.length > 0 ? (
                  tableDataTop.map(
                    (row, index) =>
                      checkType(typeFilter, row) && (
                        <TableRow
                          key={`${row.id || ''}-${index}`}
                          className="table-row"
                          sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                        >
                          <TableCell
                            colSpan={6}
                            onClick={() => handleButtonClick(`vehicle-${row.imei}`)}
                            className={`table-cell ${selectedId === `vehicle-${row.imei}` ? "table-cell-selected" : ""
                              }`}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <img
                                src={
                                  typeFilter === "default"
                                    ? createIconPath("default", row?.device_tag_info?.category_info?.category)
                                    : getIconStyle(row)
                                }
                                alt="status icon"
                                style={{ width: '24px', height: '24px' }}
                              />
                              <Typography>{row.vehicle_registration_number}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                  )
                ) : (
                  <TableRow key="no-data">
                    <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                      <CircularProgress size="30px" title={t('liveTracking.noData')} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* HTML Content (iframe) */}
        <div className="live-tracking-map-panel" style={{ width: "80%" }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="marker-label-mode-label">Marker Label</InputLabel>
              <Select
                labelId="marker-label-mode-label"
                value={markerLabelMode}
                label="Marker Label"
                onChange={(event) => setMarkerLabelMode(event.target.value)}
              >
                <MenuItem value="vehicle">Vehicle ID / Registration</MenuItem>
                <MenuItem value="block">Block / Area</MenuItem>
                <MenuItem value="route">Route Information</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              sx={{ ml: 2 }}
              control={
                <Switch
                  color="primary"
                  checked={showPolice}
                  onChange={(event) => setShowPolice(event.target.checked)}
                />
              }
              label="Police"
            />
            <FormControlLabel
              sx={{ ml: 2 }}
              control={
                <Switch
                  color="primary"
                  checked={showAmbulance}
                  onChange={(event) => setShowAmbulance(event.target.checked)}
                />
              }
              label="Ambulance"
            />
            <FormControlLabel
              sx={{ ml: 2 }}
              control={
                <Switch
                  color="primary"
                  checked={useOldGeocodingApi}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setUseOldGeocodingApi(enabled);
                    setUseOldGeocodingApiState(enabled);
                  }}
                />
              }
              label="Old Geocoding API"
            />
            <FormControlLabel
              sx={{ ml: 2 }}
              control={
                <Switch
                  color="primary"
                  checked={useNmrLocation}
                  onChange={async (event) => {
                    const enabled = event.target.checked;
                    setUseNmrLocation(enabled);

                    // When turning OFF, revert to latest GNSS for selected vehicle
                    if (!enabled) {
                      // Clear NMR area so circle disappears
                      setNmrArea(null);
                      if (selectedId) {
                        await refreshSelectedVehicle();
                      }
                      return;
                    }

                    // Require a focused entry to apply manual NMR
                    if (!focusedEntry) {
                      return;
                    }

                    const mcc = focusedEntry.mcc;
                    const mnc = focusedEntry.mnc;
                    const lac = focusedEntry.lac;
                    const cellId = focusedEntry.cell_id;

                    if (!mcc || !mnc || !lac || !cellId) {
                      return;
                    }

                    try {
                      const payload = {
                        mcc: String(mcc),
                        mnc: String(mnc),
                        lac: String(lac),
                        cell_id: String(cellId),
                      };
                      const response = await HomePageService.getCellLocation(payload);
                      const latValue =
                        response?.data?.average_latitude ??
                        response?.data?.lat ??
                        response?.data?.latitude;
                      const lonValue =
                        response?.data?.average_longitude ??
                        response?.data?.lon ??
                        response?.data?.lng ??
                        response?.data?.longitude;

                      const lat = Number(latValue);
                      const lon = Number(lonValue);

                      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                        return;
                      }

                      // Set NMR circle radius to 0.5 km (~500 meters)
                      setNmrArea({ latitude: lat, longitude: lon, radiusKm: 0.5 });
                      const nmrEntry = { ...focusedEntry, latitude: lat, longitude: lon };
                      setFilteredData([nmrEntry]);
                      setFocusedEntry(nmrEntry);
                    } catch (e) {
                    }
                  }}
                />
              }
              label="Use NMR Location"
            />

          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              mb: 1,
            }}
          >
            <FormControl
              size="small"
              sx={{ minWidth: 250 }}
            >
              <InputLabel>
                Transit Layer
              </InputLabel>

              <Select
                multiple
                value={selectedTransitLayer}
                onChange={handleTransitLayerChange}
                renderValue={(selected) =>
                  selected
                    .map((item) =>
                      item
                        .replaceAll("_", " ")
                        .toUpperCase()
                    )
                    .join(", ")
                }
              >
                <MenuItem value="">
                  None
                </MenuItem>

                <MenuItem value="school_routes">

                  <Checkbox
                    checked={selectedTransitLayer.includes(
                      "school_routes"
                    )}
                  />
                  School Bus Routes
                </MenuItem>

                <MenuItem value="pis_routes">
                  <Checkbox
                    checked={selectedTransitLayer.includes(
                      "pis_routes"
                    )}
                  />
                  Public Bus Routes
                </MenuItem>

                <MenuItem value="school_buses">
                  <Checkbox
                    checked={selectedTransitLayer.includes(
                      "school_buses"
                    )}
                  />
                  School Bus Live Location
                </MenuItem>

                <MenuItem value="pis_buses">
                  <Checkbox
                    checked={selectedTransitLayer.includes(
                      "pis_buses"
                    )}
                  />
                  Public Bus Live Location
                </MenuItem>

                <MenuItem value="pis_stops">
                  <Checkbox
                    checked={selectedTransitLayer.includes(
                      "pis_stops"
                    )}
                  />
                  Public Bus Stops
                </MenuItem>
              </Select>
            </FormControl>


            <Box
              ref={alertDropdownRef}
              sx={{
                minWidth: 250
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  onClick={() =>
                    setAlertPanelOpen(
                      !alertPanelOpen
                    )
                  }
                  sx={{
                    p: 1.5,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    bgcolor: "#fafafa",
                  }}
                >
                  <Typography
                    fontWeight={600}
                  >
                    Alert Heatmap Filters
                  </Typography>

                  {alertPanelOpen
                    ? "▲"
                    : "▼"}
                </Box>

                <Collapse
                  in={alertPanelOpen}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 2,
                    }}
                  >
                    <FormControl

                      size="small"
                    >
                      <InputLabel>
                        Alert Types
                      </InputLabel>

                      <Select
                        multiple
                        value={
                          selectedAlertTypes
                        }
                        label="Alert Types"
                        onChange={(e) =>
                          setSelectedAlertTypes(
                            e.target.value
                          )
                        }
                        renderValue={(
                          selected
                        ) =>
                          selected.join(
                            ", "
                          )
                        }
                      >
                        {ALERT_TYPES.map(
                          (
                            type
                          ) => (
                            <MenuItem
                              key={
                                type
                              }
                              value={
                                type
                              }
                            >
                              <Checkbox
                                checked={selectedAlertTypes.includes(
                                  type
                                )}
                              />
                              {
                                type
                              }
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>

                    <TextField

                      size="small"
                      type="datetime-local"
                      label="Start Datetime"
                      InputLabelProps={{
                        shrink:
                          true,
                      }}
                      value={
                        alertFilter.start_datetime
                      }
                      onChange={(
                        e
                      ) =>
                        setAlertFilter(
                          (
                            prev
                          ) => ({
                            ...prev,
                            start_datetime:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                    />

                    <TextField

                      size="small"
                      type="datetime-local"
                      label="End Datetime"
                      InputLabelProps={{
                        shrink:
                          true,
                      }}
                      value={
                        alertFilter.end_datetime
                      }
                      onChange={(
                        e
                      ) =>
                        setAlertFilter(
                          (
                            prev
                          ) => ({
                            ...prev,
                            end_datetime:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                    />

                    <Button
                      variant="contained"

                      onClick={() => {
                        fetchAlertHeatmap();
                        setAlertPanelOpen(
                          false
                        );
                      }}
                    >
                      Apply Heatmap
                    </Button>
                  </Box>
                </Collapse>
              </Paper>
            </Box>
          </Box>
          <MapComponent
            gpsData={filteredData}
            policeData={[...(showPolice ? policeLocations : []), ...(showAmbulance ? ambulanceLocations : [])]}
            incidentData={incidentData}
            onVehicleClick={handleVehicleMarkerClick}
            width="100%"
            height={selectedId ? "400px" : "600px"}
            onPolygonComplete={(coords) => setPolygon(JSON.stringify(coords))}
            focusEntry={focusedEntry}
            markerLabelMode={markerLabelMode}
            nmrArea={nmrArea}
            allMode={typeFilter === "default"}
            selectedPoi={selectedPoi}
            selectedTransitLayer={selectedTransitLayer}
            schoolRoutes={schoolRoutes}
            pisRoutes={pisRoutes}
            schoolBuses={schoolBuses}
            pisBuses={pisBuses}
            pisStops={pisStops}
            alertHeatmapData={
              alertHeatmapData
            }
            showAlertHeatmap={
              showAlertHeatmap
            }
            selectedColumns={selectedColumns}
          />
        </div>
      </div>

<FormControl size="small" sx={{ minWidth: 220, mb: 1 }}>
  <InputLabel>Select Columns</InputLabel>

  <Select
    multiple
    value={selectedColumns}
    label="Select Columns"
   renderValue={(selected) => {
    if (!selected.length) return "All Columns";

    const selectedLabels = COLUMN_OPTIONS
      .filter((col) => selected.includes(col.key))
      .map((col) => col.label);

    return selectedLabels.length > 1
      ? `${selectedLabels[0]} (+${selectedLabels.length - 1})`
      : selectedLabels[0];
  }}
  >
    {COLUMN_OPTIONS.map((column) => (
      <MenuItem key={column.key} value={column.key}>
        <Checkbox
          checked={selectedColumns.includes(column.key)}
          onChange={() => {
            if (selectedColumns.includes(column.key)) {
              setSelectedColumns(
                selectedColumns.filter(
                  (item) => item !== column.key
                )
              );
            } else {
              setSelectedColumns([
                ...selectedColumns,
                column.key,
              ]);
            }
          }}
        />
        {column.label}
      </MenuItem>
    ))}
  </Select>
</FormControl>

      {selectedId && (
     
        <TableContainer component={Paper} className="skytron-table-container" sx={{ mt: 2, maxHeight: '400px' }}>
          <Table stickyHeader className="skytron-table">
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="skytron-table-header-cell"
                    sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <TableRow
                    key={`filtered-${row.id || ''}-${rowIndex}`}
                    className="skytron-table-row"
                    sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    {visibleColumns.map((column, cellIndex) => (
                      <TableCell
                        key={`cell-${column.key}-${cellIndex}`}
                        className="skytron-table-cell"
                      >
                        {getDisplayCellValue(row, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow key="no-filtered-data">
                  <TableCell
                    colSpan={visibleColumns.length}
                    className="skytron-no-data-cell"
                  >
                    {t('liveTracking.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity="warning"
          onClose={() => setOpenSnackbar(false)}
        >
          {noDataMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default LiveTracking;
