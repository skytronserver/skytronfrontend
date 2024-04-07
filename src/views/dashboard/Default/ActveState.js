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
import UserServices from "services/UserServices";

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

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#F7418F"
          label="Total States,Active States,Inactive State"
          device={activeStateData}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#FC819E"
          label="Total Alerts,Alerts This Month,Alert Today"
          device={totalStateData}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#FEC7B4"
          label="Total Device, Active Device, Idle Device"
          device={totalDeviceStateData}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#5356FF"
          label="Tagged Device, Online Device, Offline Device"
          device={deviceStateData}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#378CE7"
          label="Total Users,State Admin,Total Manufacturers"
          device={activeStateData}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#67C6E3"
          label="Total Dealers,Device Makers,Vehicle Owners"
          device={activeStateData}
        />
      </Grid>
    </Grid>
  );
};

export default ActiveState;
