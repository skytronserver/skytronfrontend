import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import StockServices from 'services/StockServices';
import { useEffect,useState } from 'react';
//Datatables
import {useSelector,useDispatch} from 'react-redux'
import { getDeviceListAvailable } from '../../actions/stockActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {availableForSalesColumn} from '../../datatables/deviceColumns';

const AvailableForSale = () => {
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

  const handleMarkDefective=async (e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to Mark as Defective?');
    if (confirmed) {
     console.log(id)
    }
  }
  const handleReturnManufacturer=(e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to return to manufacturer?');
    if (confirmed) {
      console.log(id)
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
                          onClick={(event) => handleMarkDefective(event, tableMeta.rowData[1].id)}
                        >
                          Mark Defective
                        </Button>
             </div>
             <div><Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={(event) => handleReturnManufacturer(event, tableMeta.rowData[1].id)}
                        >
                          Return to Manufacturer
                        </Button></div>
            </div>
          );
        },
      },
    },
  ];
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Available for Sales" rows={availableDeviceList} columns={availableForSalesColumn.concat(actionColumn)}/>}
        </Grid>
    </Grid>
);
}

export default AvailableForSale;

