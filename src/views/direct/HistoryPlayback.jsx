// material-ui
import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage"
import { useEffect,useState } from 'react';
// ==============================|| SAMPLE PAGE ||============================== //

const HistoryPlayback = () => { 
    const [load,setLoad]=useState(false)
    const [htmlContent, setHtmlContent] = useState('');
  useEffect(()=>{
    const retriveMapData = async () => {
      try{
     const retriveData = await HomePageService.getHistoryPlayback();
     setHtmlContent(retriveData.data)  
     setLoad(true)
    }catch(error) {
      console.log(error)
    }
    }; 
    retriveMapData();
  })
  return (
  <MainCard>
    <p>History Playback</p>
    <iframe
        title="HTML Content"
        srcDoc={htmlContent} // Set the HTML content as srcDoc
        style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
      />
    
  </MainCard>
);
  }
export default HistoryPlayback;
