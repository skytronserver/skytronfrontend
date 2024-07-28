import React from 'react';
// project imports
import Grid from "@mui/material/Grid";
import { gridSpacing } from "../../store/constant";
import UserServices from 'services/UserServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {vehicleOwnerCols} from '../../datatables/rowsColumn';

const VehicleOwnerList = () => {
  const [load,setLoad]=useState(false)
  const [ownerList,setOwnerList]=useState([]);
  useEffect(()=>{
    const fetchOwner = async () => {
      try {
        const response = await UserServices.fetchVehicleOwner();
        setOwnerList(response.data) 
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No Data Found");
        } else {
          console.log("No Data Found");
        }
      }
    };
    fetchOwner();
  },[])
  //For actions refer AvailableForSale Component
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Manufacturer" rows={ownerList} columns={vehicleOwnerCols}/>}
        </Grid>
    </Grid>
);
}

export default VehicleOwnerList;

