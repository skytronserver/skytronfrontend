import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import HomePageService from '../../services/HomePage';
import { useEffect,useState } from 'react';
import { getAllSOSCall } from '../../actions/commonDataActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {callListColumn} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
const GetAllCall = () => {
  const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  useEffect(()=>{
    const fetchCallList = async () => {
      const retriveData=await HomePageService.getAllSOSCall();
      dispatch(getAllSOSCall(retriveData.data.Call_list)) ;
      setLoad(true)
    };
    fetchCallList();
  },[dispatch])
 
const callList=useSelector((state)=>state.userData.callList);
  const handleDelete = (id) => {
    // setData(data.filter((item) => item.id !== id));
  };
  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Link
                to={`/sos-call-details/${tableMeta.rowData[1]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton">
                  Details
                </div>
              </Link>
            </div>
          );
        },
      },
    },
  ];
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="SOS Call List" rows={callList} columns={actionColumn.concat(callListColumn)}/>}
        </Grid>
    </Grid>
);
}

export default GetAllCall