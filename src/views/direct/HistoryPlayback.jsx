import React, { useEffect, useState } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage";
import GPSHistoryMap from "./HistoryPlaybackMap";
import {dateTimeUpdate} from "../../helper"
import { FormControl, Autocomplete,TextField, Button, Grid } from '@mui/material';

const HistoryPlayback = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const [load, setLoad] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromDate, setFromDate] = useState(dateTimeUpdate(new Date(Date.now() - 86400000)));
  const [toDate, setToDate] = useState(dateTimeUpdate(new Date()));
  const [vehicleList, setVehicleList] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [showMap, setShowMap] = useState(false); // To control visibility of the map

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
    const today = new Date();
    selected<=today && setFromDate(e.target.value);    
  };

  const handleToDateChange = (e) => {
    const selected = new Date(e.target.value);
    const today = new Date();
    selected<=today && setToDate(e.target.value); 
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
                  <TextField {...params} label="Select Vehicle" variant="outlined" />
                )}
                noOptionsText="Wait Fetching Vehicle List"
                disableClearable
              />
            </FormControl>
          </Grid>

          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label="From Date"
              type="datetime-local"
              value={fromDate}
              onChange={handleFromDateChange}
              inputProps={{ max: yesterday }}
            />
          </Grid>

          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label="To Date"
              type="datetime-local"
              value={toDate}
              onChange={handleToDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: currentDate }}
            />
          </Grid>

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ height: "48px" }}
            >
              Submit
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
