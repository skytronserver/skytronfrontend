import { getAxiosInstance } from './axiosInstance'; 
const getLiveTracking = () => {
  const http = getAxiosInstance(); 
  return http.get("/api/gps-data-map/");
};
const getSOSDataAdmin = () => {
  const http = getAxiosInstance(); 
  return http.get("/api/emergency-call-listener-admin/");
};
const getSOSDataTeamLead=()=>{
  const http = getAxiosInstance(); 
  return http.get("/api/emergency-call-listener-team-lead/");
}
const getSOSDataExe=()=>{
  const http = getAxiosInstance(); 
  return http.get("/api/emergency-call-listener-deskexecutive/");
}

const getHistoryPlayback=(data)=>{
  const http = getAxiosInstance(); 
  return http.get("/api/gps_history_map/",{
    params:{
      start_datetime: data.fromDate,
      end_datetime: data.toDate,
      vehicle_registration_number: data.vehicleNo,
    }
  });
}
const getVehicleList=(data)=>{
  const http = getAxiosInstance(); 
  return http.post("/api/get_live_vehicle_no/",data);
}
const getRouteFixing=(device_id)=>{
  const http = getAxiosInstance(); 
  return http.get("/api/setRout/",{
    params:{
      device:device_id
    }
  })
}
const getAllSOSCall=()=>{
  const http = getAxiosInstance(); 
  return http.get("/api/get-all-call/");
}
const getCallDetails=(id)=>{
  const http = getAxiosInstance(); 
  return http.get(`/api/emergency-call-details/${id}/`)
}
const broadCastHelp=(data)=>{
  const http = getAxiosInstance(); 
  return http.post("/api/broadcast-help/",data);
}
const updateSOSCall=(data)=>{
  const http = getAxiosInstance(); 
  return http.post("/api/submit_status/",data);
}
const HomePageService = {
    getLiveTracking,
    getSOSDataAdmin,
    getHistoryPlayback,
    getSOSDataTeamLead,
getSOSDataExe,
getVehicleList,
getRouteFixing,
getAllSOSCall,
getCallDetails,
broadCastHelp,
updateSOSCall

};

export default HomePageService;
