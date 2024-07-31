import React from 'react';
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from 'services/DeviceModelServices';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useEffect,useState } from 'react';
//Datatables
import {useSelector,useDispatch} from 'react-redux'
import { stockFilterAction } from '../../actions/stockActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {showDeviceColumns} from '../../datatables/rowsColumn';

const ShowDevice = () => {
  const [load,setLoad]=useState(false);
  const [error,setError]=useState(false);
  //Datatables data using redux
  const dispatch=useDispatch();
  const deviceList=useSelector((state)=>state.stock.stockList);
  useEffect(()=>{
    const retrievePosts = async () => {
      try {
      const retriveData = await DeviceModelServices.getDeviceList(); 
      dispatch(stockFilterAction(retriveData.data.data)) ;   
      setLoad(true)
      }catch{
        console.error('Internal Server Error');
        setError(true);
      }
    }; 
    retrievePosts();
  },[dispatch])
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {error && (
          <Alert severity="error">
            <AlertTitle>Internal Server Error</AlertTitle>
            Unable to fetch data. An error occurred while retrieving data from the server. Please contact the server administrator.
          </Alert>
        )}
        {load && (
          <DynamicDatatables
            tableTitle="All Device List"
            rows={deviceList}
            columns={showDeviceColumns}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default ShowDevice;

