import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import ReportServices from '../../services/ReportServices';
import { useEffect,useState } from 'react';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {alertListColumn} from '../../datatables/rowsColumn';
const AlertList = () => {
  const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  useEffect(()=>{
    const fetchAlertList = async () => {
      const retriveData=await ReportServices.alertList();
    //   dispatch(getAllSOSCall(retriveData.data.Call_list)) ;
    console.log(retriveData)
      setLoad(true)
    };
    fetchAlertList();
  },[dispatch])
 
// const alertList=useSelector((state)=>state.reports.alertList);
  return (
    <Grid container spacing={gridSpacing}>
        {/* <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Alert List" rows={alertList} columns={alertListColumn}/>}
        </Grid> */}
    </Grid>
);
}

export default AlertList