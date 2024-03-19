import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from 'services/UserServices';
import { useEffect,useState } from 'react';
import { fetchUserDataSuccess } from '../../actions/userDataActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {showDeviceColumns} from '../../datatables/rowsColumn';

const ShowDevice = () => {
  const [load,setLoad]=useState(true)


  const [deviceData,setDeviceData]=useState("")   // here

  const dispatch=useDispatch();
 
  useEffect(()=>{
    const retrievePosts = async () => {
      const retriveData = await UserServices.getRegisteredData();
      setDeviceData(retriveData.data.data);     
      setLoad(true)
    }; 
    retrievePosts();
  },[dispatch])

  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title="Show Device" />
        </Grid>
        <Grid item xs={12}>
        {load && deviceData.length>1 && <DynamicDatatables tableTitle="All Device List" rows={deviceData} columns={showDeviceColumns}/>}
        </Grid>
    </Grid>
);
}

export default ShowDevice;

