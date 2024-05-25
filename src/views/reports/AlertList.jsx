import { useDispatch } from "react-redux";
import React from "react";
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import ReportServices from "../../services/ReportServices";
import { useEffect} from "react";
const AlertList = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAlertList = async () => {
      // const retriveData = await ReportServices.alertList();
    };
    fetchAlertList();
  }, [dispatch]);

  // const alertList=useSelector((state)=>state.reports.alertList);
  return (
    <Grid container spacing={gridSpacing}>
    </Grid>
  );
};

export default AlertList;
