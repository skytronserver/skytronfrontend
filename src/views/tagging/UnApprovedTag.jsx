import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import TaggingService from 'services/TaggingService';
import { useEffect,useState } from 'react';
import { fetchTaggedAwaitingOwner } from '../../actions/commonDataActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {awaitingOwnerApproval} from '../../datatables/rowsColumn';

const UnApprovedTag = () => {
  const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  useEffect(()=>{
    const fetchUnapprovedTag = async () => {
      const retriveData=await TaggingService.tagAwaitingOwnerApproval();
      dispatch(fetchTaggedAwaitingOwner(retriveData.data)) ;
      setLoad(true)
    };
    fetchUnapprovedTag();
  },[dispatch])
 
  const unApprovedList=useSelector((state)=>state.userData.awaitApprovalOwnerList);
 
  
  const handleDelete = (id) => {
    console.log(id)
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
            <p>View</p>
          );
        },
      },
    },
  ];
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle="Awaiting For Approval" rows={unApprovedList} columns={actionColumn.concat(awaitingOwnerApproval)}/>}
        </Grid>
    </Grid>
);
}

export default UnApprovedTag