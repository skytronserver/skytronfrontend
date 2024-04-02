import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const ActiveState = () => {
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          cardColor="#1e88e5"
          label="Active States,Total States,Total Inactive"
        />
      </Grid>
    </Grid>
  );
};

export default ActiveState;
