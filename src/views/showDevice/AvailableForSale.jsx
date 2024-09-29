import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import StockServices from '../../services/StockServices';
import { useEffect,useState } from 'react';
//Datatables
import {useSelector,useDispatch} from 'react-redux'
import { getDeviceListAvailable } from '../../actions/stockActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {availableForSalesColumn} from '../../datatables/deviceColumns';
import { getRole } from '../../helper';
const AvailableForSale = () => {
  const [load,setLoad]=useState(false)
  //Datatables data using redux
  const role=getRole();
  const dispatch=useDispatch();
  const availableDeviceList=useSelector((state)=>state.stock.availableList);
  useEffect(()=>{
    const retrievePosts = async () => {
      try{
        const retriveData = await StockServices.getAvailableDeviceList(); 
        dispatch(getDeviceListAvailable(retriveData.data.data)) ;   
        setLoad(true)
      }catch(error){
        console.log(error?.status)
      }
      
    }; 
    retrievePosts();
  },[dispatch])

  const handleMarkDefective=async (e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to Mark as Defective?');
    if (confirmed) {
     console.log('true')
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
                          onClick={(event) => handleMarkDefective(event, tableMeta.rowData[1].id)}
                        >
                          Defective
                        </Button>
             </div>
             <div><Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={(event) => handleReturnManufacturer(event, tableMeta.rowData[1].id)}
                        >
                          Return
                        </Button></div>
            </div>
          );
        },
      },
    },
  ];

  const columns = role !== 'devicemanufacture' ? availableForSalesColumn.concat(actionColumn) : availableForSalesColumn;
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Device Report" />
      </Grid>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="" rows={availableDeviceList} columns={columns}/>}
        </Grid>
    </Grid>
);
}

export default AvailableForSale;

