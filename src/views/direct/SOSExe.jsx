// material-ui
import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage"
import { useEffect,useState } from 'react';
// ==============================|| SAMPLE PAGE ||============================== //

const SOSExe = () => { 
    const [load,setLoad]=useState(false)
    const [htmlContent, setHtmlContent] = useState('');
    useEffect(()=>{
        const retriveSOSData = async () => {
          try{
         const retriveData = await HomePageService.getSOSDataExe();
         setHtmlContent(retriveData.data)  
         setLoad(true)
        }catch(error) {
          console.log(error)
        }
        }; 
        retriveSOSData();
      })
  return (
  <MainCard>
   <iframe
        title="HTML Content"
        srcDoc={htmlContent} // Set the HTML content as srcDoc
        style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
      />
  </MainCard>
);
  }
export default SOSExe;
