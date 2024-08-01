import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../../store/constant";
import StockServices from 'services/StockServices';
import { useEffect,useState } from 'react';
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import {requestList} from '../../../datatables/deviceColumns';

const ListSimActivation = () => {
  const [load,setLoad]=useState(false)
  //Datatables data using redux
  const [list,setList]=useState([]);
  useEffect(()=>{
    const retrieveList = async () => {
      const status={
        status:"invalid"
      }
      const retriveData = await StockServices.getListActivationRequest(status); 
      setList(retriveData.data)
      setLoad(true)
    }; 
    retrieveList();
  },[])
  const handleRequest=async (e,data,status)=>{
    e.preventDefault();
    const confirmed = window.confirm(
      "Please confirm your request"
    );
    if (confirmed) {
      const formData = {
        eSim_activation_req_id: data[0],
        status: status,
      };
      try {
        const status = await StockServices.updateRequest(formData);
        console.log(status);
      } catch (error) {
        console.error(error);
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
                          color="success"
                          size="small"
                          onClick={(event) => handleRequest(event, tableMeta.rowData,"accept")}
                        >
                          Accept
                        </Button>
             </div>
             <div style={{"marginRight":"5px"}}>
             <Button
                          type="submit"
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(event) => handleRequest(event, tableMeta.rowData,"reject")}
                        >
                          Reject
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
        {load && <DynamicDatatables tableTitle="Activation Request" rows={list} columns={requestList.concat(actionColumn)}/>}
        </Grid>
    </Grid>
);
}

export default ListSimActivation;

