import React from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { gridSpacing } from "../../../store/constant";
import StockServices from '../../../services/StockServices';
import { useEffect,useState } from 'react';
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import {requestList} from '../../../datatables/deviceColumns';
import { useParams } from "react-router-dom";
const ListSimActivation = () => {
  const [load,setLoad]=useState(false)
  const { deviceStatus } = useParams();
  const [reload,setReload]=useState(false);
  const [pageTitle,setPageTitle]=useState("")
  const title={
    valid:'Activated eSIM Device',
    invalid:'Rejected eSIM Device',
    pending:'Activation Request'
  }
  const [list,setList]=useState([]);
  useEffect(()=>{
    const retrieveList = async () => {
      const status={
        filters:{
          status:deviceStatus
        }
      }
      const retriveData = await StockServices.getListActivationRequest(status); 
      setList(retriveData.data);
      setPageTitle(title?.[deviceStatus])
      setLoad(true);
    }; 
    retrieveList();
  },[deviceStatus,reload])
  const handleRequest=async (e,data,status)=>{
    e.preventDefault();
    const confirmed = window.confirm(
      "Please confirm your request"
    );
    if (confirmed) {
      const formData = {
        eSim_activation_req_id: data[1],
        status: status,
      };
      try {
        const status = await StockServices.updateRequest(formData);
        console.log(status);
        setReload(prev=>!prev)
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
            <div className="cellAction" style={{ display: "flex" }}>
              <div style={{ marginRight: "5px" }}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={(event) =>
                    handleRequest(event, tableMeta.rowData, "accept")
                  }
                >
                  Accept
                </Button>
              </div>
              <div style={{ marginRight: "5px" }}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={(event) =>
                    handleRequest(event, tableMeta.rowData, "reject")
                  }
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
        {load && <DynamicDatatables tableTitle={pageTitle} rows={list} columns={ deviceStatus==='pending' ? actionColumn.concat(requestList):requestList}/>}
        </Grid>
    </Grid>
);
}

export default ListSimActivation;

