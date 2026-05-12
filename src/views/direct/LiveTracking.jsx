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
  const [clusterLevel, setClusterLevel] = useState("none"); // "none", "district", "state", "city", "road", "grid"
  const [mapZoom, setMapZoom] = useState(13); // Start in sync with the map's default zoom
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
  const [incidentData, setIncidentData] = useState([]);
  const [useNmrLocation, setUseNmrLocation] = useState(false);
  const [useOldGeocodingApi, setUseOldGeocodingApiState] = useState(getUseOldGeocodingApi());
  const [nmrArea, setNmrArea] = useState(null);
  const [reverseGeocodeCache, setReverseGeocodeCache] = useState({});
  const fullDataRef = useRef([]); // processed items we've appended so far
  const fullRawRef = useRef([]);  // raw items from API (unprocessed)
  const listContainerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageLength, setPageLength] = useState(100);
  const [pagination, setPagination] = useState({ total: 0, page: 0, page_length: 100, total_pages: 0 });
  const zoomDebounceRef = useRef(null);
  const isRequestingRef = useRef(false);
  const activeCancelRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  const handleZoomChangeDebounced = useCallback((zoom) => {
    if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
    zoomDebounceRef.current = setTimeout(() => {
      console.log("[LiveTracking] Zoom changed to:", zoom);
      setMapZoom(zoom);
    }, 300); // Shorter debounce for better feel
  }, []);

  const getGridSize = (zoomLevel) => {
    if (zoomLevel <= 5) return 1000000;
    if (zoomLevel <= 7) return 40000;
    if (zoomLevel <= 9) return 2500;
    if (zoomLevel <= 11) return 100;
    if (zoomLevel <= 13) return 25;
    return 1;
  };

  // Instant refresh when zoom crosses the threshold
  useEffect(() => {
    // Determine if we should be in individual or cluster mode
    const isDeepZoom = mapZoom >= 12;
    console.log("[LiveTracking] Mode Switch Check:", { zoom: mapZoom, isDeepZoom });

    // Force a full refresh when crossing the zoom boundary
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: poi,
      roads: roads,
      polygon: polygon,
      category: category,
      make: make,
      district: district,
      speed_limit: speedLimit,
      in_range: inRange,
      poi_as_polygon: poiAsPolygon,
      poi_t: poi,
      page: 0,
      page_length: pageLength
    };
    retriveMapData(params);
  }, [mapZoom >= 12]); // Only trigger when the threshold boolean actually FLIPS

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

    // Normalize for lite API
    const registration = processedItem.vehicle_registration_number || processedItem.vehicle_reg_no || '';
    const id = processedItem.id || processedItem.device_tag_id;
    const entryTime = processedItem.entry_time || processedItem.last_seen;
    // Precompute status/icon
    const entryTimeMs = resolveEntryTimestampMs(processedItem);
    const nowMs = Date.now();
    const diffMin = Number.isFinite(entryTimeMs) ? calculateTimeDifference(entryTimeMs, nowMs) : Number.POSITIVE_INFINITY;
    const isStale = diffMin > 15;
    const ignitionOn = resolveIgnitionOn(processedItem);
    const speedValue = resolveSpeedValue(processedItem);

    let alartType;
    const isEmergency = String(processedItem.emergency_status || "") === "1" ||
                        String(processedItem.emergency_status || "") === "0001" ||
                        String(processedItem.emergency_status || "") === "1111" ||
                        processedItem.packet_type === 'EA';

    if (isStale) alartType = 'grey';
    else if (isEmergency) alartType = 'red';
    else if (processedItem.packet_type && processedItem.packet_type !== 'NR') alartType = 'orange';
    else if (speedValue > 2) alartType = 'green';
    else if (ignitionOn && speedValue <= 2) alartType = 'blue';
    else alartType = 'default';

    const vehicleType = processedItem?.device_tag_info?.category_info?.category;
    const colorMap = { grey: 'grey', red: 'red', orange: 'orange', blue: 'blue', green: 'green', default: 'default' };
    const color = colorMap[alartType] || 'default';
    const preIcon = createIconPath(color, vehicleType);

    return {
      ...processedItem,
      id,
      vehicle_registration_number: registration,
      entry_time: entryTime,
      block_name: blockName,
      route_name: routeName,
      __alartType: alartType,
      __iconSrc: preIcon,
    };
  };

  const handleListScroll = useCallback(() => {
    const el = listContainerRef.current;
    if (!el || load) return; // Prevent multiple simultaneous loads
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    if (!nearBottom) return;

    if (pagination.page + 1 < pagination.total_pages) {
      const nextPage = pagination.page + 1;
      const params = {
        imei: imeiNo,
        regno: vehicleNo,
        owner: owner,
        poi: poi,
        roads: roads,
        polygon: polygon,
        category: category,
        make: make,
        district: district,
        speed_limit: speedLimit,
        in_range: inRange,
        poi_as_polygon: poiAsPolygon,
        poi_t: poi,
        page: nextPage,
        page_length: pageLength
      };
      retriveMapData(params, true); // true means append
    }
  }, [pagination, load, imeiNo, vehicleNo, owner, poi, roads, polygon, category, make, district, speedLimit, inRange, poiAsPolygon, pageLength]);

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

  const retriveMapData = async (data, append = false) => {
    if (isRequestingRef.current && !append) {
       // Avoid overlapping full refreshes
       return;
    }
    try {
      isRequestingRef.current = true;
      if (activeCancelRef.current) {
        activeCancelRef.current.cancel('replaced by a newer request');
      }
      activeCancelRef.current = axios.CancelToken.source();

      let sidebarResponse;
      let mapResponse;

      // Logic: 
      // 1. Sidebar always follows clusterLevel
      // 2. Map follows clusterLevel if zoomed out (<12), but switches to Vehicles if zoomed in (>=12)
      
      if (clusterLevel === "none") {
        sidebarResponse = await HomePageService.getLiveTracking_lite(
          { ...data, page: data.page ?? 0, page_length: data.page_length ?? 100 },
          { cancelToken: activeCancelRef.current.token }
        );
        mapResponse = sidebarResponse;
      } else if (clusterLevel === "grid") {
        sidebarResponse = await HomePageService.getLiveTracking_grid(
          { ...data, grid: getGridSize(mapZoom) },
          { cancelToken: activeCancelRef.current.token }
        );
        if (mapZoom >= 12) {
           mapResponse = await HomePageService.getLiveTracking_lite(
             { ...data, page: data.page ?? 0, page_length: data.page_length ?? 100 },
             { cancelToken: activeCancelRef.current.token }
           );
        } else {
           mapResponse = sidebarResponse;
        }
      } else {
        // clusterLevel is district, state, city, or road
        sidebarResponse = await HomePageService.getLiveTracking_cluster(
          { ...data, level: clusterLevel },
          { cancelToken: activeCancelRef.current.token }
        );
        if (mapZoom >= 12) {
           mapResponse = await HomePageService.getLiveTracking_lite(
             { ...data, page: data.page ?? 0, page_length: data.page_length ?? 100 },
             { cancelToken: activeCancelRef.current.token }
           );
        } else {
           mapResponse = sidebarResponse;
        }
      }

      // Process Sidebar Data (Always based on sidebarResponse)
      const rawSidebarData = sidebarResponse.data.data || [];
      let processedSidebar;
      if (clusterLevel === "none") {
          processedSidebar = rawSidebarData.map(computeRow);
      } else if (clusterLevel === "grid") {
          processedSidebar = rawSidebarData.map((g, idx) => ({
              ...g,
              id: `grid-${idx}-${g.grid_lat}-${g.grid_lon}`,
              vehicle_registration_number: `Grid Cell`,
              latitude: g.grid_lat,
              longitude: g.grid_lon,
              isGrid: true,
              markerLabel: `Total: ${g.total}`
          }));
      } else {
          processedSidebar = rawSidebarData.map(c => ({
              ...c,
              id: `cluster-${c.cluster_name}`,
              vehicle_registration_number: c.cluster_name,
              latitude: c.avg_lat,
              longitude: c.avg_lon,
              isCluster: true,
              markerLabel: `${c.cluster_name}: ${c.total}`
          }));
      }
      setTableDataTop(processedSidebar);
      setPagination(sidebarResponse.data.pagination || { total: processedSidebar.length, page: 0, page_length: processedSidebar.length, total_pages: 1 });

      // Process Map Data (Based on mapResponse)
      const rawMapData = mapResponse.data.data || [];
      let processedMap;
      
      if (mapZoom >= 12 || clusterLevel === "none") {
          processedMap = rawMapData.map(computeRow);
      } else if (clusterLevel === "grid") {
          processedMap = rawMapData.map((g, idx) => ({
              ...g,
              id: `grid-${idx}-${g.grid_lat}-${g.grid_lon}`,
              vehicle_registration_number: `Grid Cell`,
              latitude: g.grid_lat,
              longitude: g.grid_lon,
              isGrid: true,
              markerLabel: `Total: ${g.total}`
          }));
      } else {
          processedMap = rawMapData.map(c => ({
              ...c,
              id: `cluster-${c.cluster_name}`,
              vehicle_registration_number: c.cluster_name,
              latitude: c.avg_lat,
              longitude: c.avg_lon,
              isCluster: true,
              markerLabel: `${c.cluster_name}: ${c.total}`
          }));
      }

      // Update Map markers
      if (!selectedId) {
          setFilteredData(processedMap);
      } else {
          const updated = processedMap.find(p => p.id === selectedId);
          if (updated) {
              setFocusedEntry(updated);
              setFilteredData([updated]);
          } else {
              setFilteredData(processedMap);
          }
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error retrieving map data:", error);
      }
    } finally {
      isRequestingRef.current = false;
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
    if (!id) {
      setSelectedId(null);
      setFilteredData(tableDataTop);
      setFocusedEntry(null);
      setUseNmrLocation(false);
      return;
    }

    // Find the item in our current view
    const selectedRow = tableDataTop.find((row) => row.id === id) || 
                        (fullDataRef.current || []).find((row) => row.id === id);

    if (selectedRow) {
      setSelectedId(id);
      
      // If it's an individual vehicle, fetch detailed info (POIs, Routes, etc.)
      if (!selectedRow.isCluster && !selectedRow.isGrid && selectedRow.imei) {
        const detailed = await fetchDetailedInfo(selectedRow.imei);
        const toFocus = detailed ? computeRow(detailed) : selectedRow;

        setFilteredData([toFocus]);
        setFocusedEntry(toFocus);
        setUseNmrLocation(false);
        setNmrArea(null);
        if (isBadGnss(toFocus)) {
          const updated = await applyNmrLocation(toFocus);
          setFilteredData([updated]);
          setFocusedEntry(updated);
        }
      } else {
        // For Cluster/Grid, just focus and show in table
        setFilteredData([selectedRow]);
        setFocusedEntry(selectedRow);
        setUseNmrLocation(false);
      }
    } else {
      setSelectedId(null);
      setFilteredData(tableDataTop);
      setFocusedEntry(null);
    }
  };

  // Triggered on form submit to fetch new data
  const handleSubmit = (event) => {
    event.preventDefault();
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: poi,
      roads: roads,
      route_id: '',
      polygon: polygon,
      category: category,
      make: make,
      district: district,
      district_id: '',
      manufacturer_id: '',
      speed_limit: speedLimit,
      in_range: inRange,
      poi_as_polygon: poiAsPolygon,
      poi_t: poi,
    };

    setSelectedId(null); // Reset selection when submitting new search
    setFocusedEntry(null);
    setUseNmrLocation(false);
    setNmrArea(null);

    retriveMapData({ ...params, page: 0, page_length: pageLength });
  };

  useEffect(() => {
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: poi,
      roads: roads,
      route_id: '',
      polygon: polygon,
      category: category,
      make: make,
      district: district,
      district_id: '',
      manufacturer_id: '',
      speed_limit: speedLimit,
      in_range: inRange,
      poi_as_polygon: poiAsPolygon,
      poi_t: poi,
    };

    // Single fetch when filters/inputs change, no repeating interval
    // Single fetch when filters/inputs change, no repeating interval
    retriveMapData({ ...params, page: 0, page_length: pageLength });
  }, [imeiNo, vehicleNo, owner, poi, roads, polygon, category, make, district, inRange, poiAsPolygon, pageLength, clusterLevel, mapZoom]);

  const refreshSelectedVehicle = async () => {
    if (!selectedId) return;

    const selectedRow = tableDataTop.find((row) => `vehicle-${row.imei}` === selectedId);
    if (!selectedRow) return;

    const params = {
      imei: selectedRow.imei,
      regno: '',
      owner: '',
      poi: poi,
      roads: '',
      route_id: '',
      polygon: '',
      category: '',
      make: '',
      district: '',
      district_id: '',
      manufacturer_id: '',
      speed_limit: speedLimit,
      in_range: inRange,
      poi_as_polygon: poiAsPolygon,
      poi_t: poi,
    };

    try {
      // Use the Data API for the selected vehicle to get POI proximity and detailed status
      const response = await HomePageService.getLiveTracking_data({
        imei: selectedRow.imei,
        page: 0,
        page_length: 1
      });
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

  const fetchDetailedInfo = async (imei) => {
    try {
      const response = await HomePageService.getLiveTracking_data({ imei, page: 0, page_length: 1 });
      if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
        return response.data.data[0];
      }
    } catch (error) {
      console.error("Error fetching detailed info:", error);
    }
    return null;
  };

  useEffect(() => {
    // Background polling for the map markers using recursive setTimeout
    // This ensures we only schedule the next fetch AFTER the current one finishes.
    const poll = async () => {
      const params = {
        imei: imeiNo,
        regno: vehicleNo,
        district_id: '',
        district: district,
        state: '',
        page: 0,
        page_length: visibleCount || 100,
        count: false
      };
      
      await retriveMapData(params, false);
      
      pollingTimeoutRef.current = setTimeout(poll, 10000);
    };

    poll();

    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, [imeiNo, vehicleNo, district, clusterLevel]); // Added clusterLevel to dependencies

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

    const raw = data.entry_time ?? data.timestamp ?? data.last_seen ?? null;

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

    const isEmergency = String(data.emergency_status || "") === "1" ||
                        String(data.emergency_status || "") === "0001" ||
                        String(data.emergency_status || "") === "1111" ||
                        data.packet_type === "EA";

    let color;
    if (timeDifference > 10) {
      color = 'grey'; // Offline device (10+ minutes) - Grey Icon
    } else if (isEmergency) {
      color = 'red'; // Emergency active - Red Icon
    } else if (data.packet_type && data.packet_type !== "NR") {
      color = 'orange'; // Any Alert Packet except EA - Orange Icon
    } else if (speedValue > 0) {
      color = 'green'; // Moving - Green Icon
    } else if (ignitionOn && speedValue === 0) {
      color = 'blue'; // Ignition ON but stationary - Blue Icon
    } else {
      color = 'default'; // Default icon
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

    const isEmergency = String(data.emergency_status || "") === "1" ||
                        String(data.emergency_status || "") === "0001" ||
                        String(data.emergency_status || "") === "1111" ||
                        data.packet_type === "EA";

    if (timeDifference > 10) {
      return "grey"; // Offline
    } else if (isEmergency) {
      return "red"; // Emergency
    } else if (data.packet_type && data.packet_type !== "NR") {
      return "orange"; // Alert
    } else if (speedValue > 0) {
      return "green"; // Moving
    } else if (ignitionOn && speedValue === 0) {
      return "blue"; // Engine ON
    } else {
      return "default";
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
        setSelectedId(filteredRows[0].id);
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
        setSelectedId(filteredRows[0].id);
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

    // Special handling for Cluster/Grid modes
    if (row.isCluster || row.isGrid) {
        return row[key] ?? "";
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

  const getEffectiveKeyMapping = () => {
    // Show individual columns at zoom 12+
    if (mapZoom >= 12) return keyMapping;

    if (clusterLevel !== 'none') {
        return {
            vehicle_registration_number: clusterLevel === 'grid' ? "Grid Cell" : "Cluster Name",
            total: "Total Vehicles",
            online: "Online",
            offline: "Offline",
            emergency: "Emergency",
            moving: "Moving",
            stationary: "Stationary"
        };
    }
    return keyMapping;
  };

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
                           <Box display="flex" gap={1}>
                            <TextField
                              fullWidth
                              label="POI"
                              type="text"
                              value={poi}
                              name="poi"
                              onChange={handleInput}
                              variant="outlined"
                              size="small"
                              InputProps={{ sx: { bgcolor: 'white' } }}
                            />
                          </Box>
                          <Box display="flex" flexWrap="wrap" gap={2}>
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
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
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
                      </Grid>
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
                            onClick={() => handleButtonClick(row.id)}
                            className={`table-cell ${selectedId === row.id ? "table-cell-selected" : ""
                              }`}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <img
                                src={
                                  clusterLevel !== "none"
                                    ? createIconPath("default", "bus")
                                    : (typeFilter === "default"
                                        ? createIconPath("default", row?.device_tag_info?.category_info?.category)
                                        : getIconStyle(row))
                                }
                                alt="status icon"
                                style={{ width: '24px', height: '24px' }}
                              />
                              <Typography>{row.vehicle_registration_number}</Typography>
                              {clusterLevel !== "none" && <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 'bold' }}>{row.total}</Typography>}
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
            {pagination && pagination.total > 0 && (
              <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid #eee', bgcolor: '#fafafa' }}>
                <Typography variant="caption" color="textSecondary">
                  Page {pagination.page + 1} of {pagination.total_pages} (Total: {pagination.total})
                </Typography>
              </Box>
            )}
          </TableContainer>
        </div>

        {/* HTML Content (iframe) */}
        <div className="live-tracking-map-panel" style={{ width: "80%" }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="cluster-level-label">View Mode</InputLabel>
              <Select
                labelId="cluster-level-label"
                value={clusterLevel}
                label="View Mode"
                onChange={(event) => setClusterLevel(event.target.value)}
              >
                <MenuItem value="none">Individual Vehicles</MenuItem>
                <MenuItem value="district">By District</MenuItem>
                <MenuItem value="state">By State</MenuItem>
                <MenuItem value="city">By City</MenuItem>
                <MenuItem value="road">By Road</MenuItem>
                <MenuItem value="grid">Grid View (Auto Cluster)</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
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

          <MapComponent
            gpsData={filteredData}
            policeData={policeLocations}
            incidentData={incidentData}
            onVehicleClick={handleVehicleMarkerClick}
            width="100%"
            height={selectedId ? "400px" : "600px"}
            onPolygonComplete={(coords) => setPolygon(JSON.stringify(coords))}
            focusEntry={focusedEntry}
            markerLabelMode={markerLabelMode}
            onZoomChange={handleZoomChangeDebounced}
            nmrArea={nmrArea}
            allMode={typeFilter === "default"}
            autoFit={clusterLevel !== "none"}
          />
        </div>
      </div>

      {selectedId && (
        <TableContainer component={Paper} className="skytron-table-container" sx={{ mt: 2, maxHeight: '400px' }}>
          <Table stickyHeader className="skytron-table">
            <TableHead>
              <TableRow>
                {Object.keys(getEffectiveKeyMapping()).map((key) => (
                  <TableCell
                    key={key}
                    className="skytron-table-header-cell"
                    sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                  >
                    {getEffectiveKeyMapping()[key]}
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
                    {Object.keys(getEffectiveKeyMapping()).map((key, cellIndex) => (
                      <TableCell
                        key={`cell-${key}-${cellIndex}`}
                        className="skytron-table-cell"
                      >
                        {getDisplayCellValue(row, key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow key="no-filtered-data">
                  <TableCell
                    colSpan={Object.keys(keyMapping).length}
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
    </MainCard>
  );
};

export default LiveTracking;
