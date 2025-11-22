import React, { useEffect, useState } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage";
import GPSHistoryMap from "./HistoryPlaybackMap";
import VehicleSelectionMap from "./VehicleSelectionMap";
import { dateTimeUpdate } from "../../helper"
import { FormControl, Autocomplete, TextField, Button, Grid, Typography, Box } from '@mui/material';
import { useTranslation } from "react-i18next";

const MAX_HISTORY_RANGE_MS = 1000 * 60 * 60 * 24 * 365 * 2; // two years

const HistoryPlayback = () => {
  const now = new Date();
  const currentDateTime = dateTimeUpdate(now);
  const [load, setLoad] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromDate, setFromDate] = useState(dateTimeUpdate(new Date(now.getTime() - 86400000)));
  const [toDate, setToDate] = useState(currentDateTime);
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicleGpsData, setVehicleGpsData] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [showHistoryMap, setShowHistoryMap] = useState(false); // To control visibility of the history playback map
  const [showVehicleMap, setShowVehicleMap] = useState(false); // To control visibility of the vehicle selection map
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVehicleList = async () => {
      const retriveData = await HomePageService.getVehicleList();
      setVehicleList(retriveData.data);
      setLoad(true);
    };
    fetchVehicleList();
  }, []);

  // Fetch all vehicles GPS data for the map
  useEffect(() => {
    const fetchVehicleGpsData = async () => {
      try {
        const retriveData = await HomePageService.getLiveTracking_data({});
        if (Array.isArray(retriveData.data.data)) {
          setVehicleGpsData(retriveData.data.data);
        }
      } catch (error) {
        console.error("Error fetching vehicle GPS data:", error);
        setVehicleGpsData([]);
      }
    };
    fetchVehicleGpsData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that dates are selected
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    // Validate date range doesn't exceed 2 years
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    if (toDateObj.getTime() - fromDateObj.getTime() > MAX_HISTORY_RANGE_MS) {
      alert("Date range cannot exceed 2 years. Please select a shorter range.");
      return;
    }

    if (vehicleNo) {
      // If vehicle is selected, show history playback directly
      setShowHistoryMap(true);
      setShowVehicleMap(false);
    } else {
      // If no vehicle selected, show vehicle selection map
      setShowHistoryMap(false);
      setShowVehicleMap(true);
    }

    console.log("Submitted data:", { vehicleNo, fromDate, toDate });
  };

  const handleVehicleSelect = (selectedVehicleNo) => {
    setVehicleNo(selectedVehicleNo);
    setShowVehicleMap(false);
    setShowHistoryMap(true);
  };

  const handleVehicleNoChange = (event, newValue) => {
    setVehicleNo(newValue);
  };

  const handleFromDateChange = (e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;
    const today = new Date();
    if (selected > today) {
      alert("From Date cannot be in the future");
      return;
    }

    setFromDate(dateTimeUpdate(selected));
  };

  const handleToDateChange = (e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;
    const today = new Date();
    if (selected > today) {
      alert("To Date cannot be in the future");
      return;
    }

    setToDate(dateTimeUpdate(selected));
  };

  const handleBackToVehicleSelection = () => {
    setShowHistoryMap(false);
    setShowVehicleMap(true);
    setVehicleNo('');
  };

  return (
    <MainCard>
      <Typography variant="h4" gutterBottom>{t('historyPlayback.title') || 'History Playback'}</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <FormControl fullWidth>
              <Autocomplete
                value={vehicleNo}
                onChange={handleVehicleNoChange}
                options={vehicleList.length > 0 ? vehicleList : []}
                getOptionLabel={(option) => option || ''}
                renderInput={(params) => (
                  <TextField {...params} label={t('historyPlayback.selectVehicle') || 'Select Vehicle (Optional)'} variant="outlined" />
                )}
                noOptionsText={t('historyPlayback.noVehicleOptions') || 'No vehicles available'}
              />
            </FormControl>
          </Grid>

          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
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

          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
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

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ height: "48px" }}
            >
              {t('historyPlayback.submit') || 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Show vehicle selection map */}
      {showVehicleMap && (
        <Box style={{ paddingTop: "20px" }}>
          <Typography variant="h6" gutterBottom>
            Select a Vehicle from the Map
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Click on a cluster to zoom in, or click on a vehicle marker to select it for history playback.
          </Typography>
          <VehicleSelectionMap
            gpsData={vehicleGpsData}
            width="100%"
            height="600px"
            onVehicleSelect={handleVehicleSelect}
          />
        </Box>
      )}

      {/* Show the history playback map */}
      {showHistoryMap && vehicleNo && (
        <Box style={{ paddingTop: "20px" }}>
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
          />
        </Box>
      )}
    </MainCard>
  );
};

export default HistoryPlayback;