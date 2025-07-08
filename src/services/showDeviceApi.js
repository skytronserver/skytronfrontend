import { getAxiosInstance } from './axiosInstance'; 
import { BASE_URL } from '../store/constant';
const getDevice=()=>{
    const http = getAxiosInstance();
    return http.get(`${BASE_URL}api/devicestock/deviceStockFilter/`)
}
const getDeviceAlert=(data)=>{
    const http = getAxiosInstance();
    return http.post(`${BASE_URL}api/device_tag_alerts/`,data)
}
const getDeviceAlertSearch=(data)=>{
    const http = getAxiosInstance();
    return http.post(`${BASE_URL}api/device_tags_search/`,data)
}
export default {getDevice,getDeviceAlert,getDeviceAlertSearch};

