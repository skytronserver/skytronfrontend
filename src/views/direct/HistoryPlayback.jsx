import React, { useEffect, useState, useCallback, useMemo } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage";
import GPSHistoryMap from "./HistoryPlaybackMap";
import BhuvanMapComponent from "../../components/Map/BhuvanMapComponent";
import { dateTimeUpdate } from "../../helper";
import { FormControl, Autocomplete, TextField, Button, Grid, Typography, Box, CircularProgress, Collapse, IconButton, Tooltip } from '@mui/material';
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";

const MAX_HISTORY_RANGE_MS = 1000 * 60 * 60 * 24 * 365 * 2; // two years

const HistoryPlayback = () => {
  const { t } = useTranslation();

  // Memoize initial dates to prevent recalculation on every render
  const { currentDateTime, initialFromDate } = useMemo(() => {
    const now = new Date();
    return {
      currentDateTime: dateTimeUpdate(now),
      initialFromDate: dateTimeUpdate(new Date(now.getTime() - 86400000))
    };
  }, []);

  // State management
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(currentDateTime);
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicleGpsData, setVehicleGpsData] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [showHistoryMap, setShowHistoryMap] = useState(false);
  const [showVehicleMap, setShowVehicleMap] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingGpsData, setIsLoadingGpsData] = useState(false);

  // Filter states
  const [owner, setOwner] = useState("");
  const [poi, setPoi] = useState("");
  const [roads, setRoads] = useState("");
  const [polygon, setPolygon] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [poiOptions, setPoiOptions] = useState([]);
const [selectedPoi, setSelectedPoi] = useState(null);
const [poiLoading, setPoiLoading] = useState(false);

  // Fetch vehicle list on mount
  useEffect(() => {
    let isMounted = true;

    const fetchVehicleList = async () => {
      try {
        const response = await HomePageService.getVehicleList();
        if (isMounted && response?.data) {
          setVehicleList(response.data);
        }
      } catch (error) {
        console.error("Error fetching vehicle list:", error);
      } finally {
        if (isMounted) {
          setIsLoadingVehicles(false);
        }
      }
    };

    fetchVehicleList();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchPois = async (searchText) => {
  try {
    setPoiLoading(true);

    const response = await HomePageService.getPoiList({
      name: searchText,
    });


    setPoiOptions(response?.data?.data || []);
  } catch (error) {
    setPoiOptions([]);
  } finally {
    setPoiLoading(false);
  }
};

  // Fetch GPS data only when vehicle map is shown
  useEffect(() => {
    if (!showVehicleMap || vehicleGpsData.length > 0) return;

    let isMounted = true;
    setIsLoadingGpsData(true);

    const fetchVehicleGpsData = async () => {
      try {
        const response = await HomePageService.getLiveTracking_data({});
        if (isMounted && Array.isArray(response?.data?.data)) {
          setVehicleGpsData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vehicle GPS data:", error);
        if (isMounted) {
          setVehicleGpsData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingGpsData(false);
        }
      }
    };

    fetchVehicleGpsData();

    return () => {
      isMounted = false;
    };
  }, [showVehicleMap, vehicleGpsData.length]);

  // Validate date range
  const validateDateRange = useCallback((from, to) => {
    const fromDateObj = new Date(from);
    const toDateObj = new Date(to);

    if (toDateObj.getTime() - fromDateObj.getTime() > MAX_HISTORY_RANGE_MS) {
      return "Date range cannot exceed 2 years. Please select a shorter range.";
    }
    return null;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    const error = validateDateRange(fromDate, toDate);
    if (error) {
      alert(error);
      return;
    }

    if (vehicleNo) {
      setShowHistoryMap(true);
      setShowVehicleMap(false);
    } else {
      setShowHistoryMap(false);
      setShowVehicleMap(true);
    }
  }, [fromDate, toDate, vehicleNo, validateDateRange]);

  // Handle vehicle selection from map
  const handleVehicleSelect = useCallback((selectedVehicleNo) => {
    setVehicleNo(selectedVehicleNo);
    setShowVehicleMap(false);
    setShowHistoryMap(true);
  }, []);

  // Handle vehicle dropdown change
  const handleVehicleNoChange = useCallback((event, newValue) => {
    setVehicleNo(newValue || '');
  }, []);

  // Handle from date change
  const handleFromDateChange = useCallback((e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;

    const today = new Date();
    if (selected > today) {
      alert("From Date cannot be in the future");
      return;
    }

    setFromDate(dateTimeUpdate(selected));
  }, []);

  // Handle to date change
  const handleToDateChange = useCallback((e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;

    const today = new Date();
    if (selected > today) {
      alert("To Date cannot be in the future");
      return;
    }

    setToDate(dateTimeUpdate(selected));
  }, []);

  // Handle back to vehicle selection
  const handleBackToVehicleSelection = useCallback(() => {
    setShowHistoryMap(false);
    setShowVehicleMap(true);
    setVehicleNo('');
  }, []);

  return (
    <MainCard>
      <Typography variant="h4" gutterBottom>
        {t('historyPlayback.title') || 'History Playback'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={3} sm={12} xs={12} sx={{ mt: 2.5 }}>
            <FormControl fullWidth>
              <Autocomplete
                value={vehicleNo}
                onChange={handleVehicleNoChange}
                options={vehicleList}
                getOptionLabel={(option) => option || ''}
                loading={isLoadingVehicles}
                disabled={isLoadingVehicles}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('historyPlayback.selectVehicle') || 'Select Vehicle (Optional)'}
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingVehicles ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText={t('historyPlayback.noVehicleOptions') || 'No vehicles available'}
              />
            </FormControl>
          </Grid>

          <Grid item md={3} sm={12} xs={12} sx={{ mt: 2.5 }}>
            <TextField
              fullWidth
              required
              label={t('historyPlayback.fromDate') || 'From Date'}
              type="datetime-local"
              value={fromDate}
              onChange={handleFromDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: currentDateTime }}
            />
          </Grid>

          <Grid item md={3} sm={12} xs={12} sx={{ mt: 2.5 }}>
            <TextField
              fullWidth
              required
              label={t('historyPlayback.toDate') || 'To Date'}
              type="datetime-local"
              value={toDate}
              onChange={handleToDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: currentDateTime }}
            />
          </Grid>

          <Grid item md={3} sm={12} xs={12} sx={{ mt: 2.5 }}>
            <Box display="flex" gap={1}>
              <Tooltip title="Toggle Advanced Filters">
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  color={showFilters ? "primary" : "default"}
                  sx={{ border: '1px solid #ccc', borderRadius: 1, height: 48, width: 48 }}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: 48 }}
              >
                {t('historyPlayback.submit') || 'Submit'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={showFilters}>
              <Grid container spacing={2} sx={{ mt: 0.5, p: 1, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #eee' }}>
                <Grid item md={3} sm={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Vehicle Owner"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{ sx: { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  {/* <TextField
                    fullWidth
                    label="POI"
                    value={poi}
                    onChange={(e) => setPoi(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{ sx: { bgcolor: 'white' } }}
                  /> */}
    <Autocomplete
  options={poiOptions}
  loading={poiLoading}
  value={selectedPoi}
  isOptionEqualToValue={(option, value) =>
    option?.id === value?.id
  }
  filterOptions={(x) => x}
  getOptionLabel={(option) =>
    option?.name || ""
  }
  onInputChange={(event, value, reason) => {
  if (reason === "input") {
    setPoi(value);

    if (value.length >= 2) {
      fetchPois(value);
    }
  }
}}
  onChange={(event, value) => {

    setSelectedPoi(value);

    if (value) {
      setPoi(value.name);
    }
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="POI"
      size="small"
      fullWidth
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {poiLoading ? (
              <CircularProgress size={20} />
            ) : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  )}
/>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Roads"
                    value={roads}
                    onChange={(e) => setRoads(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{ sx: { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Polygon"
                    value={polygon}
                    onChange={(e) => setPolygon(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{ sx: { bgcolor: 'white' } }}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </form>

      {/* Vehicle selection map */}
      {showVehicleMap && (
        <Box sx={{ pt: 2.5 }}>
          <Typography variant="h6" gutterBottom>
            Select a Vehicle from the Map
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Click on a vehicle marker to view details, then click "Select Vehicle" to load history playback.
            Use the map type toggle to switch between Normal (Bhuvan) and Satellite views.
          </Typography>

          {isLoadingGpsData ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="600px">
              <CircularProgress />
            </Box>
          ) : (
            <BhuvanMapComponent
              gpsData={vehicleGpsData}
              width="100%"
              height="600px"
              autoFit={true}
              showMapTypeToggle={true}
              showDrawControls={false}
              showLogos={true}
              defaultMapType="normal"
              markerLabelMode="vehicle"
              onMarkerClick={(entryData) => {
                // Extract vehicle registration number and trigger selection
                const vehicleRegNo = entryData.vehicle_registration_number ||
                  entryData.vehicle_reg_no ||
                  entryData.device_tag_info?.device?.vehicle_reg_no ||
                  entryData.device_tag_info?.vehicle?.vehicle_reg_no;
                if (vehicleRegNo) {
                  handleVehicleSelect(vehicleRegNo);
                }
              }}
            />
          )}
        </Box>
      )}

      {/* History playback map */}
      {showHistoryMap && vehicleNo && (
        <Box sx={{ pt: 2.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              History Playback for: <strong>{vehicleNo}</strong>
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleBackToVehicleSelection}
            >
              Select Different Vehicle
            </Button>
          </Box>
          <GPSHistoryMap
            startDateTime={fromDate}
            endDateTime={toDate}
            vehicleRegistrationNumber={vehicleNo}
            downloadStatus={downloadStatus}
            setDownloadStatus={setDownloadStatus}
            poi={poi}
            selectedPoi={selectedPoi}
            owner={owner}
            roads={roads}
            polygon={polygon}
          />
        </Box>
      )}
    </MainCard>
  );
};

export default React.memo(HistoryPlayback);