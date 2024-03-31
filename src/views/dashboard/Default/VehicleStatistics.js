import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const VehicleStatistics = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // State for collapse
  const [totalDeviceMakerCollapse, setTotalDeviceMakerCollapse] = useState(true); 
  const [totalVehicleCollapse, setTotalVehicleCollapse] = useState(true); 
  const [activeDevicesCollapse, setActiveDevicesCollapse] = useState(true); 
  const [idleDevicesCollapse, setIdleDevicesCollapse] = useState(true); 

  const handleWidgetClick = (widgetType) => {
    switch (widgetType) {
      case "Total Device Maker":
        setTotalDeviceMakerCollapse(!totalDeviceMakerCollapse);
        setTotalVehicleCollapse(true);
        setActiveDevicesCollapse(true);
        setIdleDevicesCollapse(true);
        break;
      case "Total Vehicle":
        setTotalVehicleCollapse(!totalVehicleCollapse);
        setTotalDeviceMakerCollapse(true);
        setActiveDevicesCollapse(true);
        setIdleDevicesCollapse(true);
        break;
      case "Active Devices":
        setActiveDevicesCollapse(!activeDevicesCollapse);
        setTotalDeviceMakerCollapse(true);
        setTotalVehicleCollapse(true);
        setIdleDevicesCollapse(true);
        break;
      case "Idle Devices":
        setIdleDevicesCollapse(!idleDevicesCollapse);
        setTotalDeviceMakerCollapse(true);
        setTotalVehicleCollapse(true);
        setActiveDevicesCollapse(true);
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
          label="Total Device Maker"
          onClick={() => handleWidgetClick("Total Device Maker")}
          isCollapsed={totalDeviceMakerCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Total Vehicle"
          onClick={() => handleWidgetClick("Total Vehicle")}
          isCollapsed={totalVehicleCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Active Devices"
          onClick={() => handleWidgetClick("Active Devices")}
          isCollapsed={activeDevicesCollapse}
        />
      </Grid>
      <Grid item lg={3} md={6} sm={6} xs={12} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Idle Devices"
          onClick={() => handleWidgetClick("Idle Devices")}
          isCollapsed={idleDevicesCollapse}
        />
      </Grid>
    </Grid>
  );
};

export default VehicleStatistics;
