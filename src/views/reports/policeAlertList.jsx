/* eslint-disable no-unused-vars */
import { useDispatch } from "react-redux";
import React from "react";
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import { useEffect} from "react";
import { useTranslation } from 'react-i18next';

const AlertList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const on_debug=false
  
  useEffect(() => {
    const fetchAlertList = async () => {
      // const retriveData = await ReportServices.alertList();
    };
    fetchAlertList();
  }, [dispatch]);
if(on_debug){
console.log("AlertList")  
}
  // const alertList=useSelector((state)=>state.reports.alertList);
  return (
    <Grid container spacing={gridSpacing}>
    </Grid>
  );
};

export default AlertList;
