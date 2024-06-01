import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import ManufacturerServices from 'services/ManufacturerServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {manufacturerColumns} from '../../datatables/rowsColumn';

const ManufacturerList = () => {
  const [load,setLoad]=useState(false)
  const [manufacturer,setManufacturer]=useState([]);
  useEffect(()=>{
    const fetchManufacturerList = async () => {
      try {
        const response = await ManufacturerServices.findManufacturer();
        setManufacturer(response.data) 
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No Data Found");
        } else {
          console.log("No Data Found");
        }
      }
    };
    fetchManufacturerList();
  },[])
  //For actions refer AvailableForSale Component
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Manufacturer" rows={manufacturer} columns={manufacturerColumns}/>}
        </Grid>
    </Grid>
);
}

export default ManufacturerList;

