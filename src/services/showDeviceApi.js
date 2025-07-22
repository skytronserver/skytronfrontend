import { getAxiosInstance } from './axiosInstance'; 
import { BASE_URL } from '../store/constant';
const getDevice=()=>{
    const http = getAxiosInstance();
    return http.get(`/api/devicestock/deviceStockFilter/`)
}
const getDeviceAlert=(data)=>{
    const http = getAxiosInstance();
    return http.post(`/api/device_tag_alerts/`,data)
}
const getDeviceAlertSearch=(data)=>{
    const http = getAxiosInstance();
    return http.post(`/api/device_tags_search/`,data)
}
const getActivatedDeviceList=(data)=>{
    const http = getAxiosInstance();
    return http.post(`/api/device/activated_device_list/`,data)
}
const getDeviceTagsSearch=(data)=>{
    const http = getAxiosInstance();
    return http.post(`/api/device_tags_search/`,data)
}
export default {getDevice,getDeviceAlert,getDeviceAlertSearch,getActivatedDeviceList,getDeviceTagsSearch};

