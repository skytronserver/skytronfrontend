import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const OverSpeeding = () => {
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          cardColor="#1e88e5"
          label="Total Alerts,Alerts This Month,Alerts Today,Max Speed"
        />
      </Grid>
    </Grid>
  );
};

export default OverSpeeding;
