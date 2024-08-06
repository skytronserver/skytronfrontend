import {useDispatch} from 'react-redux'
import React from 'react';
// project imports
import Grid  from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect,useState } from 'react';
import Datatable from '../../datatables/Datatable';
import {registeredUserColumns} from '../../datatables/rowsColumn';

const UsersList = () => {
  const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  const [users,setUsers]=useState([]);
  useEffect(()=>{
    const retrievePosts = async () => {
      const retriveData=await UserServices.getRegisteredUsers();
      setUsers(retriveData.data);
      setLoad(true)
    };
    retrievePosts();
  },[dispatch])
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title="All Users List" />
        </Grid>
        <Grid item xs={12}>
        {load && <Datatable tableTitle="All User List test" userRows={users} userColumns={registeredUserColumns}/>}
        </Grid>
    </Grid>
);
}

export default UsersList