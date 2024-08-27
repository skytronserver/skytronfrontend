// material-ui
import React from "react";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import { useEffect, useState } from "react";
import TaggingService from "../../services/TaggingService";
// ==============================|| SAMPLE PAGE ||============================== //
import {  MenuItem, Button,Grid,TextField } from '@mui/material';
const RouteFixing = () => {
  const [load, setLoad] = useState(false);
  const [routeContent, setRouteContent] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  useEffect(() => {
    const fetchVehicleList = async () => {
      const retriveData = await TaggingService.getOwnerList();
      setDeviceList(retriveData.data);
    };
    fetchVehicleList();
  }, []);
  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    retriveRouteData(deviceId);
  };
  const retriveRouteData = async (id) => {
    try {
      const retriveData = await HomePageService.getRouteFixing(id);
      setRouteContent(retriveData.data);
      setLoad(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainCard>
      <p>Route Fixing</p>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            {/* <FormControl fullWidth> */}
            <TextField
          select
          label="Select Device ESN"
          variant="outlined"
          fullWidth
          margin="normal"
value={deviceId}
          onChange={handleDeviceChange}
        >
          <MenuItem value="">Select</MenuItem>
                {deviceList.length > 0 && (
                  deviceList.map((item) => {
                    return (
                      <MenuItem value={item.device.id} key={item.device.id}>
                        {item.device.device_esn}
                      </MenuItem>
                    );
                  })
                )}
        </TextField>
          </Grid>

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "38px" }}>
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
      {load && (
        <iframe
          title="Route Content"
          srcDoc={routeContent} // Set the HTML content as srcDoc
          style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
        />
      )}
    </MainCard>
  );
};
export default RouteFixing;
