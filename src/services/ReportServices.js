import http from './http-common';

const alertList = (data) => {
  return http.post("/api/list-alerts/",data);
};
;
const ReportServices = {
  alertList
};
  
export default ReportServices;
