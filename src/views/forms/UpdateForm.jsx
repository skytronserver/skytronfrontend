import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect,useState } from 'react';
import { fetchSingleUser, fetchUserDataSuccess } from '../../actions/userDataActions';
import Datatable from '../../datatables/Datatable';
import {registeredUserColumns} from '../../datatables/rowsColumn';
import { useParams } from 'react-router-dom';
const UpdateForm = () => {
    const { userId } = useParams();
console.log(userId);
  const [loading,setLoading]=useState(false)
  const [error, setError] = useState(null);
  const dispatch=useDispatch();
  useEffect(()=>{
    const retrieveSingleItem = async () => {
        try {
          const retrieveData = await UserServices.getSingleUser(userId);
          dispatch(fetchSingleUser(retrieveData.data));
          setLoading(true);
        } catch (error) {
          // Check if the error is a 404 (Not Found) error
          if (error.response && error.response.status === 404) {
            setError('User not found'); // Set a specific error message for 404
          } else {
            setError('An error occurred while fetching user data');
          }
          setLoading(true);
        }
      };
    retrieveSingleItem();
  },[dispatch,userId])
 
  const users=useSelector((state)=>state.users.singleUser);
  loading && console.log(users)
  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title="State Users" />
        </Grid>
        <Grid item xs={12}>
        {userId}
        </Grid>
    </Grid>
);
}

export default UpdateForm