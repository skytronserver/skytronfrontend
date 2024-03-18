import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from 'services/UserServices';
import { useEffect,useState } from 'react';
import { fetchUserDataSuccess } from '../../actions/userDataActions';
import Datatable from '../../datatables/Datatable';
import {showDeviceColumns} from '../../datatables/rowsColumn';

const ShowDevice = () => {
  const [load,setLoad]=useState(true)


  const [deviceData,setDeviceData]=useState(true)   // here

  const dispatch=useDispatch();
 
  useEffect(()=>{
    const retrievePosts = async () => {
      const retriveData = await UserServices.getRegisteredData();

     
      console.log(retriveData.data.data);
      setDeviceData(retriveData.data.data);

     
      dispatch(fetchUserDataSuccess(retriveData.data)) ;
     
      setLoad(true)
    }; 
    retrievePosts();
  },[dispatch])

  const users = useSelector((state)=>state.users.registeredUser);

  //console.log(users)



  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title="Show Device" />
        </Grid>
        <Grid item xs={12}>
        {load && <Datatable tableTitle="All Device List" userRows={deviceData} userColumns={showDeviceColumns}/>}
        </Grid>
    </Grid>
);
}

export default ShowDevice;

