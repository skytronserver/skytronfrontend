// material-ui
import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
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
  <MainCard title="Sample List Data">
    {load && <Datatable userRows={userData} userColumns={columns}/>}
  </MainCard>
);
  }
export default ListPage;
