// material-ui
import React from "react";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import { useEffect, useState } from "react";
import { TextField, Button, Grid } from "@mui/material";
// ==============================|| SAMPLE PAGE ||============================== //

const LiveTracking = () => {
  const [load, setLoad] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [imeiNo, setImeiNo] = useState("");

  // Handle input changes
  const handleInput = (event) => {
    const { name, value } = event.target;
    if (name === "vehicleNo") {
      setVehicleNo(value);
    } else if (name === "imeiNo") {
      setImeiNo(value);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    // Process form submission logic
    const params={
        imei:imeiNo,
        regno:vehicleNo
      }
    retriveMapData(params);
  };
  const retriveMapData = async (data) => {
    try {
      const retriveData = await HomePageService.getLiveTracking(data);
      setHtmlContent(retriveData.data);
      setLoad(true);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const params={
        imei:imeiNo,
        regno:vehicleNo
      }
    retriveMapData(params);
  }, []);
  return (
    <MainCard>
      <p>Live Tracking</p><br/>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label="Vehicle Registration No"
              type="text"
              value={vehicleNo}
              name="vehicleNo"
              onChange={handleInput}
            />
          </Grid>
          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label="IMEI Number"
              type="text"
              value={imeiNo}
              name="imeiNo"
              onChange={handleInput}
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
      <div style={{ paddingTop: "20px" }}>
        <iframe
          title="HTML Content"
          srcDoc={htmlContent} // Set the HTML content as srcDoc
          style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
        />
      </div>
    </MainCard>
  );
};
export default LiveTracking;
