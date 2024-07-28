import React from 'react';
// project imports
import Grid from "@mui/material/Grid";
import { gridSpacing } from "../../store/constant";
import StockServices from 'services/StockServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {taggedColumn} from '../../datatables/deviceColumns';

const TaggedList = () => {
  const [load,setLoad]=useState(false)
  const [tagged,setTagged]=useState([]);
  useEffect(()=>{
    const fetchTaggedList = async () => {
      try {
        const filter = {
          is_tagged: "True",
        };
        const response = await StockServices.stockFilter(filter);
        setTagged(response.data.data) 
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No Data Found");
        } else {
          console.log("No Data Found");
        }
      }
    };
    fetchTaggedList();
  },[])
  //For actions refer AvailableForSale Component
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Tagged Devices" rows={tagged} columns={taggedColumn}/>}
        </Grid>
    </Grid>
);
}

export default TaggedList;

