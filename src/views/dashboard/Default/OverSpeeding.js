import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";

const OverSpeeding = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // State for collapse
  const [totalAlertsCollapse, setTotalAlertsCollapse] = useState(true); 
  const [alertsThisMonthCollapse, setAlertsThisMonthCollapse] = useState(true); 
  const [alertsTodayCollapse, setAlertsTodayCollapse] = useState(true); 
  const [maxSpeedCollapse, setMaxSpeedCollapse] = useState(true); 

  const handleWidgetClick = (widgetType) => {
    switch (widgetType) {
      case "Total Alerts":
        setTotalAlertsCollapse(!totalAlertsCollapse);
        break;
      case "Alerts This Month":
        setAlertsThisMonthCollapse(!alertsThisMonthCollapse);
        break;
      case "Alerts Today":
        setAlertsTodayCollapse(!alertsTodayCollapse);
        break;
      case "Max Speed":
        setMaxSpeedCollapse(!maxSpeedCollapse);
        break;
      default:
        break;
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Alerts"
          onClick={() => handleWidgetClick("Total Alerts")}
          isCollapsed={totalAlertsCollapse}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Alerts This Month"
          onClick={() => handleWidgetClick("Alerts This Month")}
          isCollapsed={alertsThisMonthCollapse}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Alerts Today"
          onClick={() => handleWidgetClick("Alerts Today")}
          isCollapsed={alertsTodayCollapse}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: "20px" }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Max Speed"
          onClick={() => handleWidgetClick("Max Speed")}
          isCollapsed={maxSpeedCollapse}
        />
      </Grid>
    </Grid>
  );
};

export default OverSpeeding;
