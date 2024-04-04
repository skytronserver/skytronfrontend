import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const VehicleStatistics = () => {
  <Grid container spacing={gridSpacing}>
    {/* <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
      <Widget
        cardColor="#5e35b1"
        label="Total Device Maker,Total Vehicle,Active Devices,Idle Devices"
      />
    </Grid> */}
  </Grid>;
};

export default VehicleStatistics;
