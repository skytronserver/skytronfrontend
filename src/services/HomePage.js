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
const getHistoryPlayback=()=>{
  return http.get("/api/gps_history_map/");
}
const HomePageService = {
    getLiveTracking,
    getSOSDataAdmin,
    getHistoryPlayback,
    getSOSDataTeamLead,
getSOSDataExe

};

export default HomePageService;
