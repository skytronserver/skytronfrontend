import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const DeviceStatistics = () => {
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          cardColor="#5e35b1"
          label="Total Device Maker,Total Device Model,Total Device Count,Total Device Tagged,Online Devices,Offline Devices"
        />
      </Grid>
    </Grid>
  );
};

export default DeviceStatistics;
