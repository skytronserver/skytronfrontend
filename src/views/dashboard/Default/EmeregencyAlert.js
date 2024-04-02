import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const EmeregencyAlert = () => {
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          cardColor="#e53935"
          label="Total Alerts, AlertsThis Month,Alerts Today,Average Call Time "
        />
      </Grid>
    </Grid>
  );
};

export default EmeregencyAlert;
