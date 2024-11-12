import React from 'react';
// project imports
import Grid from "@mui/material/Grid";
import  Button from "@mui/material/Button"
import { gridSpacing } from "../../store/constant";
import StockServices from '../../services/StockServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {taggedColumn} from '../../datatables/deviceColumns';
import { getRole } from '../../helper';
import TaggingService from '../../services/TaggingService';
const TaggedList = () => {
  const [load,setLoad]=useState(false)
  const [reload,setReload]=useState(false);
  const role=getRole();
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
  },[reload])
  //For actions refer AvailableForSale Component
  const handleUntag=async (e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to untag this device?');
    if (confirmed) {
     console.log(id);
     try {
      await TaggingService.cancelTagDevice({device_id:id});
      setReload(prev=>!prev)
     } catch (error) {
      console.log(error)
     }
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
                          onClick={(event) => handleUntag(event, tableMeta.rowData[0])}
                        >
                          Untag
                        </Button>
             </div>
            </div>
          );
        },
      },
    },
  ];
  const columns = role !== 'devicemanufacture' ? taggedColumn.concat(actionColumn) : taggedColumn;

  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Tagged Devices" rows={tagged} columns={columns}/>}
        </Grid>
    </Grid>
);
}

export default TaggedList;

