// material-ui
import {useSelector} from 'react-redux'
import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

const SamplePage = () => { 
  const userData=useSelector((state)=>state.userData);
  console.log(userData)
  return (
  <MainCard title="Sample Card">

  </MainCard>
);
  }
export default SamplePage;
