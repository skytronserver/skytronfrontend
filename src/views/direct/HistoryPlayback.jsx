// material-ui
import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage"
import { useEffect, useState } from 'react';

import GPSHistoryMap from "./HistoryPlaybackMap";
// ==============================|| SAMPLE PAGE ||============================== //
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid } from '@mui/material';


const HistoryPlayback = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const [load, setLoad] = useState(false)
  const [htmlContent, setHtmlContent] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromDate, setFromDate] = useState(yesterday);
  const [toDate, setToDate] = useState(currentDate);
  const [vehicleList, setVehicleList] = useState([]);

  useEffect(() => {
    const fetchVehicleList = async () => {
      const retriveData = await HomePageService.getVehicleList();
      setVehicleList(retriveData.data)
      setLoad(true)
    };
    fetchVehicleList();
  }, [])



  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {
      vehicleNo: vehicleNo,
      fromDate: fromDate,
      toDate: toDate
    }
    retriveMapData(params)
  };

  const handleVehicleNoChange = (e) => {
    setVehicleNo(e.target.value);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const retriveMapData = async (data) => {
    try {
      const retriveData = await HomePageService.getHistoryPlayback(data);
      setHtmlContent(retriveData.data)
      setLoad(true)
    } catch (error) {
      console.log(error)
    }
  };

  const [startDateTime] = useState("2024-09-10T00:00:00");
  const [endDateTime] = useState("2024-09-12T23:59:59");
  const [vehicleRegistrationNumber] = useState("ABC00000012");


  return (
    <MainCard>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <FormControl fullWidth>

              <InputLabel>Vehicle No</InputLabel>
              <Select
                value={vehicleNo}
                onChange={handleVehicleNoChange}
              >
                <MenuItem value="">Select</MenuItem>
                {vehicleList.length > 0 ? (
                  vehicleList.map((item) => {
                    return <MenuItem value={item} key={item}>{item}</MenuItem>
                  })
                ) : <MenuItem value="">Wait Fetching Vehicle List</MenuItem>}
              </Select>
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
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: currentDate }}
            />
          </Grid>
          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Button type="submit" variant="contained" color="primary" style={{ height: '48px' }}>Submit</Button>
          </Grid>
        </Grid>
      </form>
      <div style={{ paddingTop: "20px" }}>
        <GPSHistoryMap
          startDateTime={startDateTime}
          endDateTime={endDateTime}
          vehicleRegistrationNumber={vehicleRegistrationNumber}
        />
        {//load && <iframe
          //  title="HTML Content"
          //  srcDoc={htmlContent} // Set the HTML content as srcDoc
          // style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
          // />
        }
      </div>
    </MainCard>
  );
}
export default HistoryPlayback;
