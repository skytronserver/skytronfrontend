// material-ui
import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage"
import { useEffect,useState } from 'react';
// ==============================|| SAMPLE PAGE ||============================== //

const RouteFixing = () => { 
    const [load,setLoad]=useState(false)
    const [routeContent, setRouteContent] = useState('');
  useEffect(()=>{
    const retriveRouteData = async () => {
      try{
     const retriveData = await HomePageService.getRouteFixing("1");
     setRouteContent(retriveData.data)  
     setLoad(true);
    }catch(error) {
      console.log(error)
    }
    }; 
    retriveRouteData();
  },[])
  return (
  <MainCard>
    <p>Route Fixing</p>
    <iframe
        title="Route Content"
        srcDoc={routeContent} // Set the HTML content as srcDoc
        style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
      />
    
  </MainCard>
);
  }
export default RouteFixing;
