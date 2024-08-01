import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../../store/constant";
import StockServices from 'services/StockServices';
import { useEffect,useState } from 'react';
//Datatables
import {useSelector,useDispatch} from 'react-redux'
import { getDeviceListAvailable } from '../../../actions/stockActions';
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import {availableForSalesColumnForFitment} from '../../../datatables/deviceColumns';

const SimActivation = () => {
  const [load,setLoad]=useState(false)
  //Datatables data using redux
  const dispatch=useDispatch();
  const availableDeviceList=useSelector((state)=>state.stock.availableList);
  useEffect(()=>{
    const retrievePosts = async () => {
      const retriveData = await StockServices.getAvailableDeviceList(); 
      dispatch(getDeviceListAvailable(retriveData.data.data)) ;   
      setLoad(true)
    }; 
    retrievePosts();
  },[dispatch])

  const handleMarkDefective=async (e,data)=>{
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to send for activation?"
    );
    if (confirmed) {
      const formData = {
        eSim_provider: data[1][0],
        valid_from: data[5],
        valid_upto: data[6],
        device: data[0],
      };
      try {
        const status = await StockServices.simActivationReq(formData);
        console.log(status);
      } catch (error) {
        console.error(error);
      }
      console.log(formData);
    }
  }
  const handleReturnManufacturer=(e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to return to manufacturer?');
    if (confirmed) {
      console.log('true')
      
    }
  }
  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{display:'flex'}}>
             <div style={{"marginRight":"5px"}}>
             <Button
                          type="submit"
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(event) => handleMarkDefective(event, tableMeta.rowData)}
                        >
                          Request for Activation
                        </Button>
             </div>
            </div>
          );
        },
      },
    },
  ];
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Available for Sales" rows={availableDeviceList} columns={availableForSalesColumnForFitment.concat(actionColumn)}/>}
        </Grid>
    </Grid>
);
}

export default SimActivation;

