// material-ui
import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import DummyServices from 'services/DummyServices';
import { useEffect,useState } from 'react';
import { fetchDataSuccess } from '../../actions/dataActions';
import Datatable from '../../datatables/Datatable';
import {columns} from '../../datatables/rowsColumn';
// ==============================|| SAMPLE PAGE ||============================== //
const ListPage = () => { 
const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  useEffect(()=>{
    const retrievePosts = async () => {
      const retriveData=await DummyServices.getAll();
      dispatch(fetchDataSuccess(retriveData.data)) ;
      setLoad(true)
    };
    retrievePosts();
  },[dispatch])
 
  const userData=useSelector((state)=>state.userData.data);
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title="State Users" />
        </Grid>
        <Grid item xs={12}>
        {load && <Datatable userRows={userData} userColumns={columns}/>}
        </Grid>
    </Grid>
);
  }
export default ListPage;
