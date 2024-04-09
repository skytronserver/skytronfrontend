import http from "./http-common";

const getLiveTracking = () => {
  return http.get("/api/gps-data-map/");
};
const getSOSData = () => {
  return http.get(`/api/emergency-call-listener/`);
};

const HomePageService = {
    getLiveTracking,
    getSOSData,
};

export default HomePageService;
