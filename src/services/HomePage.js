import http from "./http-common";

const getLiveTracking = () => {
  return http.get("/api/gps-data-map/");
};
const getSOSDataAdmin = () => {
  return http.get("/api/emergency-call-listener-admin/");
};
const getSOSDataTeamLead=()=>{
  return http.get("/api/emergency-call-listener-team-lead/");
}
const getSOSDataExe=()=>{
  return http.get("/api/emergency-call-listener-deskexecutive/");
}
const getHistoryPlayback=(data)=>{
  return http.get("/api/gps_history_map/",{
    params:{
      start_datetime: data.fromDate,
      end_datetime: data.toDate,
      vehicle_registration_number: data.vehicleNo,
    }
  });
}
const getVehicleList=(data)=>{
  return http.post("/api/get_live_vehicle_no/",data);
}
const HomePageService = {
    getLiveTracking,
    getSOSDataAdmin,
    getHistoryPlayback,
    getSOSDataTeamLead,
getSOSDataExe,
getVehicleList

};

export default HomePageService;
