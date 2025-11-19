import React, { useEffect, useState } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage";
import GPSHistoryMap from "./HistoryPlaybackMap";
import {dateTimeUpdate} from "../../helper"
import { FormControl, Autocomplete,TextField, Button, Grid } from '@mui/material';
import { useTranslation } from "react-i18next";

const MAX_HISTORY_RANGE_MS = 1000 * 60 * 60 * 24 * 365 * 2; // two years

const HistoryPlayback = () => {
  const now = new Date();
  const currentDateTime = dateTimeUpdate(now);
  const yesterdayDateTime = dateTimeUpdate(new Date(now.getTime() - 86400000));
  const maxLookBackDate = dateTimeUpdate(new Date(now.getTime() - MAX_HISTORY_RANGE_MS));
  const [load, setLoad] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromDate, setFromDate] = useState(dateTimeUpdate(new Date(now.getTime() - 86400000)));
  const [toDate, setToDate] = useState(currentDateTime);
  const [vehicleList, setVehicleList] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [showMap, setShowMap] = useState(false); // To control visibility of the map
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVehicleList = async () => {
      const retriveData = await HomePageService.getVehicleList();
      setVehicleList(retriveData.data);
      setLoad(true);
    };
    fetchVehicleList();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowMap(true);
    console.log("Submitted data:", { vehicleNo, fromDate, toDate });
    console.log({load})
  };

  const handleVehicleNoChange = (event, newValue) => {
    setVehicleNo(newValue);
  };

  const handleFromDateChange = (e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;
    const today = new Date();
    if (selected > today) return;

    let updatedToDate = new Date(toDate);
    if (updatedToDate < selected) {
      updatedToDate = selected;
    }

    if (updatedToDate.getTime() - selected.getTime() > MAX_HISTORY_RANGE_MS) {
      const maxAllowedEnd = new Date(Math.min(selected.getTime() + MAX_HISTORY_RANGE_MS, today.getTime()));
      updatedToDate = maxAllowedEnd;
    }

    setFromDate(dateTimeUpdate(selected));
    setToDate(dateTimeUpdate(updatedToDate));
  };

  const handleToDateChange = (e) => {
    const selected = new Date(e.target.value);
    if (Number.isNaN(selected.getTime())) return;
    const today = new Date();
    if (selected > today) return;

    let updatedFromDate = new Date(fromDate);
    if (selected < updatedFromDate) {
      updatedFromDate = selected;
    }

    if (selected.getTime() - updatedFromDate.getTime() > MAX_HISTORY_RANGE_MS) {
      const minAllowedStart = new Date(selected.getTime() - MAX_HISTORY_RANGE_MS);
      updatedFromDate = minAllowedStart;
    }

    setFromDate(dateTimeUpdate(updatedFromDate));
    setToDate(dateTimeUpdate(selected)); 
  };

  return (
    <MainCard>
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
                  <TextField {...params} label={t('historyPlayback.selectVehicle')} variant="outlined" />
                )}
                noOptionsText={t('historyPlayback.noVehicleOptions')}
                disableClearable
              />
            </FormControl>
          </Grid>

          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label={t('historyPlayback.fromDate')}
              type="datetime-local"
              value={fromDate}
              onChange={handleFromDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: yesterdayDateTime, min: maxLookBackDate }}
            />
          </Grid>

          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label={t('historyPlayback.toDate')}
              type="datetime-local"
              value={toDate}
              onChange={handleToDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: currentDateTime, min: fromDate }}
            />
          </Grid>

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ height: "48px" }}
            >
              {t('historyPlayback.submit')}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Show the map only after the form is submitted */}
      <div style={{ paddingTop: "20px" }}>
        {showMap && (
          <GPSHistoryMap
            startDateTime={fromDate}
            endDateTime={toDate}
            vehicleRegistrationNumber={vehicleNo}
            downloadStatus={downloadStatus}
            setDownloadStatus={setDownloadStatus}
          />
        )}
      </div>
    </MainCard>
  );
};

export default HistoryPlayback;