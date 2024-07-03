import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";
import ActiveState from "./ActveState";
import { useSelector } from "react-redux";

// import { Widgets } from '@mui/icons-material';
import { createAxiosInstance } from "../../../services/axiosInstance";
const Dashboard = () => {
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");
  if (isAuthenticated) {
    createAxiosInstance(sessionStorage.getItem("oAuthToken"));
  }
  return (
    <>
      <Grid container spacing={gridSpacing}>
        {/* Widget 1 */}
        {/* <Grid item lg={3} md={6} sm={6} xs={12}>
        <Widget isLoading={isLoading} cardColor="#5e35b1"/>
      </Grid> */}

        {/* Widget 2 */}
        {/* <Grid item lg={3} md={6} sm={6} xs={12}>
        <Widget isLoading={isLoading} cardColor="#1e88e5"/>
      </Grid> */}

        {/* Add more widgets/components here */}
        {/* <Grid item lg={3} md={6} sm={6} xs={12}> */}
        {/* Your new component/widget */}
        {/* </Grid> */}

        {/* Example: Add a third widget */}
        {/* <Grid item lg={3} md={6} sm={6} xs={12}>
        <Widget isLoading={isLoading} cardColor="#e53935"/>
      </Grid> */}
      </Grid>
      {/* <Widgets/> */}
      <ActiveState />
    </>
  );
};

export default Dashboard;
