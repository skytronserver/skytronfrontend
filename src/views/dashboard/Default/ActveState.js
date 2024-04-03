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
import React from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const ActiveState = () => {
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#F7418F"
          label="Active States,Total States,Total Inactive"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#FC819E"
          // label="Total Device Maker,Total Device Model,Total Device Count,Total Device Tagged,Online Devices,Offline Devices"
          label="Total Device Model,Total Device Count,Total Device Tagged,Online Devices,Offline Devices"

        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#FEC7B4"
          // label="Total Alerts, Alerts This Month,Alerts Today,Average Call Time"
          label="Total Alerts, Alerts This Month,Alerts Today"

        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#5356FF"
          // label="Total Alerts,Alerts This Month,Alerts Today,Max Speed"
          label="Alerts This Month,Alerts Today,Max Speed"

        />

      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#378CE7"
          label="Total Users,Total State Admins,Alerts Today,Total Manufacturers,Total Dealers,Total Vehicle Owners"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Widget
          cardColor="#67C6E3"
          label="Total Device Maker,Total Vehicle,Active Devices,Idle Devices"
        />
      </Grid>
    </Grid>
  );
};

export default ActiveState;
//new 1/3


