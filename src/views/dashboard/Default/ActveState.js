import { useEffect, useState } from "react";
import React from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";
import UserServices from "../../../services/UserServices";

import Car from "../../../assets/images/Car.svg";
import Location from "../../../assets/images/Location.svg";
import Wifi from "../../../assets/images/Wifi.svg";
import Mobile from "../../../assets/images/Mobile.svg";
import Bell from "../../../assets/images/Bell.svg";
import Overspeed from "../../../assets/images/Overspeed.svg";
const ActiveState = () => {
  const [stateData, setStateData] = useState({});
  const [alertData, setAlertData] = useState({});
  const [deviceData, setDeviceData] = useState({});
  const [taggedData, setTaggedData] = useState({});
  const [vehicleData,setVehicleData]=useState({
    total_vehicle:0,
    tagged_vehicle:0,
    untagged_vehicle:0
  });
  const [emergencyAlertData, setEmergencyAlertData] = useState({
    total_alart: 0,
    alart_month: 0,
    alart_today: 0
  });
  useEffect(() => {
    const retrievePosts = async () => {
      const stateDetails = await UserServices.getStateStats();
      const alertDetails = await UserServices.getAlertDetails();
      const deviceData = await UserServices.getDeviceStats();
      const taggedData = await UserServices.getTaggedDevices();
      setStateData(stateDetails.data);
      setAlertData(alertDetails.data);
      setDeviceData(deviceData.data);
      setTaggedData(taggedData.data);
    };
    retrievePosts();
  }, []);
  console.log(stateData);
  const mar = "100px";
 
  return (
    <Grid container spacing={gridSpacing} marginBottom={mar}>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
          label="State,Active,Inactive"
          device={stateData}
          address={Location}
          heading="Active States"
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
          label="Total Makers,Device Model,Device Count"
          device={deviceData}
          address={Mobile}
          heading="Device Statistics"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
          label=" Tagged Total, Online Device, Device Offline"
          device={taggedData}
          address={Wifi}
          heading="Tagging Statistics"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
          label="Total Vehicle,Active,Idle"
          device={vehicleData}
          address={Car}
          heading="Vehicle Statistics"
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
          label="Total Alert,This Month,Today"
          device={alertData}
          address={Overspeed}
          heading="Over Speeding"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
          label="Total Alert,This Month,Today"
          device={emergencyAlertData}
          address={Bell}
          heading="Emeregency Alert"
        />
      </Grid>
    
      
      
    </Grid>
  );
};

export default ActiveState;
