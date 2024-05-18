import { getAxiosInstance } from './axiosInstance'; 
const alertList = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/list-alerts/",data);
};
;
const ReportServices = {
  alertList
};
  
export default ReportServices;
