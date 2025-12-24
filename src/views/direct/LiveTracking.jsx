import React, { useCallback, useEffect, useState } from "react";

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
} from "@mui/material";

import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import MapComponent from "./LiveMap";
import { none } from "ol/centerconstraint";
import SearchIcon from "@mui/icons-material/Search"; // Import the search icon
import FilterListIcon from "@mui/icons-material/FilterList";
import { keyMapping, iconData, iconStyles, fullText, isoDatePattern } from "../../store/constant";
import { formatDateTime, getRole } from "../../helper"
import CircularProgress from '@mui/material/CircularProgress';
import "./tabstyle.css";

const LiveTracking = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const [vehicleNo, setVehicleNo] = useState("");
  const [imeiNo, setImeiNo] = useState("");
  const [owner, setOwner] = useState("");
  const [poi, setPoi] = useState("");
  const [roads, setRoads] = useState("");
  const [polygon, setPolygon] = useState("");
  const [category, setCategory] = useState("");
  const [make, setMake] = useState("");
  const [dtoCode, setDtoCode] = useState("");
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
  const [nmrArea, setNmrArea] = useState(null);
  const [reverseGeocodeCache, setReverseGeocodeCache] = useState({});

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
    } else if (name === "dtoCode") {
      setDtoCode(value);
    }
  };

  const handleVehicleMarkerClick = (entry) => {
    if (!entry?.imei) return;

    setSelectedId(`vehicle-${entry.imei}`);
    setFilteredData([entry]);
    setFocusedEntry(entry);
    setUseNmrLocation(false);
    setNmrArea(null);
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
        params.radius_km = 10;
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

  const retriveMapData = async (data) => {
    try {
      const retriveData_table = await HomePageService.getLiveTracking_data(
        data
      );

      if (Array.isArray(retriveData_table.data.data)) {
        const rawData = retriveData_table.data.data;

        const newData = await Promise.all(
          rawData.map(async (item) => {
            let processedItem = item;

            if (isBadGnss(item)) {
              processedItem = await applyNmrLocation(item);
            }

            // Extract block_name and route_name from device_tag_info for all vehicles
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

            return {
              ...processedItem,
              block_name: blockName,
              route_name: routeName,
            };
          })
        );

        setTableDataTop(newData);
        setFilteredData(newData);

        // If there's exactly one vehicle, select it automatically
        if (newData.length === 1) {
          setSelectedId(`vehicle-${newData[0].imei}`);
          setFocusedEntry(newData[0]);
        } else {
          setSelectedId(null);
          setFocusedEntry(null);
        }

        fetchPoliceLocations(newData);
        fetchIncidents(newData);
      } else {
        setTableDataTop([]);
        setFilteredData([]);
        setSelectedId(null);
        setFocusedEntry(null);
        setUseNmrLocation(false);
        setNmrArea(null);
        fetchPoliceLocations();
        fetchIncidents();
      }
      setLoad(true);
    } catch (error) {
      setTableDataTop([]);
      setFilteredData([]);
      setSelectedId(null);
      setFocusedEntry(null);
      setUseNmrLocation(false);
      setNmrArea(null);
      fetchPoliceLocations();
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
      const url = `https://api.gromed.in/api/reverse_geocode/?lat=${lat}&lon=${lon}`;
      const response = await axios.get(url);
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
  const handleButtonClick = (id) => {
    const selectedRow = tableDataTop.find((row) => `vehicle-${row.imei}` === id);

    if (selectedRow) {
      setSelectedId(id);
      setFilteredData([selectedRow]);
      setFocusedEntry(selectedRow);
      setUseNmrLocation(false);
      setNmrArea(null);
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
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: poi,
      roads: roads,
      polygon: polygon,
      category: category,
      make: make,
      dto_code: dtoCode,
    };

    setSelectedId(null); // Reset selection when submitting new search
    setFocusedEntry(null);
    setUseNmrLocation(false);
    setNmrArea(null);

    retriveMapData(params);
  };

  useEffect(() => {
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
      owner: owner,
      poi: poi,
      roads: roads,
      polygon: polygon,
      category: category,
      make: make,
      dto_code: dtoCode,
    };

    // Single fetch when filters/inputs change, no repeating interval
    retriveMapData(params);
  }, [imeiNo, vehicleNo, owner, poi, roads, polygon, category, make, dtoCode]);

  const refreshSelectedVehicle = async () => {
    if (!selectedId) return;

    const selectedRow = tableDataTop.find((row) => `vehicle-${row.imei}` === selectedId);
    if (!selectedRow) return;

    const params = {
      imei: selectedRow.imei,
      regno: '',
      owner: '',
      poi: '',
      roads: '',
      polygon: '',
      category: '',
      make: '',
      dto_code: '',
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

  const createIconPath = (color, vehicleType) => {
    const normalizedVehicleType = vehicleType ? vehicleType.toLowerCase().replace(/\s+/g, '_') : 'bus';
    const availableTypes = ['ambulance', 'bus', 'dumper', 'police', 'school_bus', 'tanker', 'taxi', 'truck'];
    const iconType = availableTypes.includes(normalizedVehicleType) ? normalizedVehicleType : 'bus';

    try {
      return require(`../../assets/images/${color}/${iconType}.png`);
    } catch (error) {
      // Fallback to bus icon if specific type not found
      return require(`../../assets/images/${color}/bus.png`);
    }
  };

  const getIconStyle = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);

    // Get vehicle type from data
    const vehicleType = data?.device_tag_info?.category_info?.category;

    let color;
    if (data.packet_type === "EA") {
      color = 'red'; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      color = 'orange'; // Any Alert Packet except EA - Orange Icon
    } else if (String(data.ignition_status) === "1" && data.speed <= 1) {
      color = 'blue'; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      color = 'green'; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      color = 'grey'; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      color = 'default'; // Default icon for all other conditions
    }

    return createIconPath(color, vehicleType);
  };

  const getAlartType = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);

    if (data.packet_type === "EA") {
      return "red"; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      return "orange"; // Any Alert Packet except EA - Orange Icon
    } else if (String(data.ignition_status) === "1" && data.speed <= 1) {
      return "blue"; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      return "green"; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      return "grey"; // Offline device (no packets from device for 5+ minutes) - Grey Icon
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
    } else {
      const filteredRows = tableDataTop.filter(row => getAlartType(row) === data);
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
    const alartType = getAlartType(data);
    return type === "default" || alartType === type;
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
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Category"
                          type="text"
                          value={category}
                          name="category"
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
                              label="DTO Code"
                              type="text"
                              value={dtoCode}
                              name="dtoCode"
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
          <TableContainer component={Paper} className="table-container" sx={{ maxHeight: '80vh', overflow: 'hidden' }}>
            <Table stickyHeader>
              {iconData && <TableHead>
                <TableRow>
                  {iconData.slice(0, 3).map((item, index) => (
                    <TableCell
                      key={index}
                      onClick={() => filterByType(item.key)}
                      className="tracking-icon"
                      sx={{ backgroundColor: '#f5f5f5' }}
                    >
                      <img src={item.iconUrl} alt={item.text} style={{ width: '24px', height: '24px' }} />

                      <Typography variant="caption" className="icon-text">
                        {item.text}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {iconData.slice(3, 6).map((item, index) => (
                    <TableCell
                      key={index}
                      onClick={() => filterByType(item.key)}
                      className="tracking-icon"
                      sx={{ backgroundColor: '#f5f5f5' }}
                    >
                      <img src={item.iconUrl} alt={item.text} style={{ width: '24px', height: '24px' }} />

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
                              <img src={getIconStyle(row)} alt="status icon" style={{ width: '24px', height: '24px' }} />
                              <Typography>{row.vehicle_registration_number}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                  )
                ) : (
                  <TableRow key="no-data">
                    <TableCell colSpan={6} style={{ textAlign: 'center' }}><CircularProgress size="30px" title={t('liveTracking.noData')} /></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* HTML Content (iframe) */}
        <div style={{ width: "80%", height: "100%" }}>
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
            nmrArea={nmrArea}
          />

        </div>
      </div>

      {selectedId && (
        <TableContainer component={Paper} className="skytron-table-container" sx={{ mt: 2, maxHeight: '400px' }}>
          <Table stickyHeader className="skytron-table">
            <TableHead>
              <TableRow>
                {Object.keys(keyMapping).map((key) => (
                  <TableCell
                    key={key}
                    className="skytron-table-header-cell"
                    sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                  >
                    {keyMapping[key]}
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
                    {Object.keys(keyMapping).map((key, cellIndex) => (
                      <TableCell
                        key={`cell-${key}-${cellIndex}`}
                        className="skytron-table-cell"
                      >
                        {fullText?.[row[key]] || (isoDatePattern.test(row[key]) && formatDateTime(row[key])) || row[key] || ""}
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