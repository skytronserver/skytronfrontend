// import { Grid } from "@mui/material";
// import Widget from "./Widget";
// import { gridSpacing } from "../../../store/constant";

// const ActiveState = () => {
//   return (
//     <Grid container spacing={gridSpacing}>
//       <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
//       {/* <Grid item lg={16} md={3} sm={6} xs={12} style={{ marginTop: "20px" }}> */}
//         <Widget
//           cardColor="#1e88e5"
//           label="Active States,Total States,Total Inactive"
//         />
//       </Grid>
//     </Grid>
//   );
// };

// export default ActiveState;

//new 1/3
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
import Aeroplane from "../../../assets/images/Aeroplane.svg";
import Bell from "../../../assets/images/Bell.svg";

const ActiveState = () => {
  const [activeStateData, setActiveStateData] = useState({});
  const [totalStateData, setTotalStateData] = useState({});
  const [totalDeviceStateData, setTotalDeviceData] = useState({});
  const [deviceStateData, setDeviceStateData] = useState({});
  // const [activeStateData, setData] = useState({});
  // const [activeStateData, setData] = useState({});

  useEffect(() => {
    const retrievePosts = async () => {
      const activeState = await UserServices.getActiveState();
      const totalState = await UserServices.getTotalState();
      const totalDeviceState = await UserServices.getTotalDeviceState();
      const deviceState = await UserServices.getDeviceState();
      //  const activeState = await UserServices.getActiveState();
      //  const activeState = await UserServices.getActiveState();

      setActiveStateData(activeState.data);
      setTotalStateData(totalState.data);
      setTotalDeviceData(totalDeviceState.data);
      setDeviceStateData(deviceState.data);
      // setActiveStateData(activeState.data);
      // setActiveStateData(activeState.data);
    };
    retrievePosts();
  }, []);

  //console.log(typeof (data));
  // const colors = ["#F7418F", "#3DA5E0", "#FF9800"];
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
          label="State,Active,Inactive"
          device={activeStateData}
          address={Location}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
          label="Total Makers,Device Model,Device Count"
          device={totalStateData}
          address={Mobile}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
          label=" Tagged Total, Online Device, Device Offline"
          device={totalDeviceStateData}
          address={Wifi}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
          label="Total Vehicle,Active,Idle"
          device={deviceStateData}
          address={Car}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
          label="Total Alert,This Month,Today"
          device={activeStateData}
          address={Aeroplane}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
          label="Total Alert,This Month,Today"
          device={activeStateData}
          address={Bell}
        />
      </Grid>
    </Grid>
  );
};

export default ActiveState;
