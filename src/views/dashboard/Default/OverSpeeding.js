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
  const [activeStatesCollapse, setActiveStatesCollapse] = useState(false);
  const [totalStatesCollapse, setTotalStatesCollapse] = useState(true); 
  const [totalInactiveCollapse, setTotalInactiveCollapse] = useState(true); 
  const [totalActiveCollapse, setTotalActiveCollapse] = useState(true); 

 
  const handleWidgetClick = (widgetType) => {
    if (widgetType === "Active States") {
      setActiveStatesCollapse(!activeStatesCollapse);
      setTotalStatesCollapse(true);
      setTotalInactiveCollapse(true);
      setTotalActiveCollapse(true);
    } else if (widgetType === "Total States") {
      setActiveStatesCollapse(true);
      setTotalStatesCollapse(!totalStatesCollapse);
      setTotalInactiveCollapse(true);
      setTotalActiveCollapse(true);
    } else if (widgetType === "Total Inactive") {
      setActiveStatesCollapse(true);
      setTotalStatesCollapse(true);
      setTotalInactiveCollapse(!totalInactiveCollapse);
      setTotalActiveCollapse(true);
    } else if (widgetType === "Total Active") {
      setActiveStatesCollapse(true);
      setTotalStatesCollapse(true);
      setTotalInactiveCollapse(true);
      setTotalActiveCollapse(!totalActiveCollapse);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={10} style={{ marginTop: "20px" }}>
       
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Alerts"
          onClick={() => handleWidgetClick("Total Alerts")}
          isCollapsed={activeStatesCollapse}
        />

       
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Alerts This Month"
          onClick={() => handleWidgetClick("Alerts This Month")}
          isCollapsed={totalStatesCollapse}
        />

        
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Alerts Today"
          onClick={() => handleWidgetClick("Alerts Today")}
          isCollapsed={totalInactiveCollapse}
        />

        
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Max Speed"
          onClick={() => handleWidgetClick("Max Speed")}
          isCollapsed={totalActiveCollapse}
        />
        
      </Grid>
    </Grid>
  );
};

export default OverSpeeding;
