import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const UserStatistics = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // State for collapse
  const [totalUsersCollapse, setTotalUsersCollapse] = useState(true); 
  const [totalStateAdminsCollapse, setTotalStateAdminsCollapse] = useState(true); 
  const [alertsTodayCollapse, setAlertsTodayCollapse] = useState(true); 
  const [totalManufacturersCollapse, setTotalManufacturersCollapse] = useState(true); 
  const [totalDealersCollapse, setTotalDealersCollapse] = useState(true); 
  const [totalVehicleOwnersCollapse, setTotalVehicleOwnersCollapse] = useState(true); 

  const handleWidgetClick = (widgetType) => {
    switch (widgetType) {
      case "Total Users":
        setTotalUsersCollapse(!totalUsersCollapse);
        break;
      case "Total State Admins":
        setTotalStateAdminsCollapse(!totalStateAdminsCollapse);
        break;
      case "Alerts Today":
        setAlertsTodayCollapse(!alertsTodayCollapse);
        break;
      case "Total Manufacturers":
        setTotalManufacturersCollapse(!totalManufacturersCollapse);
        break;
      case "Total Dealers":
        setTotalDealersCollapse(!totalDealersCollapse);
        break;
      case "Total Vehicle Owners":
        setTotalVehicleOwnersCollapse(!totalVehicleOwnersCollapse);
        break;
      default:
        break;
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Users"
          onClick={() => handleWidgetClick("Total Users")}
          isCollapsed={totalUsersCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Total State Admins"
          onClick={() => handleWidgetClick("Total State Admins")}
          isCollapsed={totalStateAdminsCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Alerts Today"
          onClick={() => handleWidgetClick("Alerts Today")}
          isCollapsed={alertsTodayCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Manufacturers"
          onClick={() => handleWidgetClick("Total Manufacturers")}
          isCollapsed={totalManufacturersCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Dealers"
          onClick={() => handleWidgetClick("Total Dealers")}
          isCollapsed={totalDealersCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Vehicle Owners"
          onClick={() => handleWidgetClick("Total Vehicle Owners")}
          isCollapsed={totalVehicleOwnersCollapse}
        />
      </Grid>
    </Grid>
  );
};

export default UserStatistics;
