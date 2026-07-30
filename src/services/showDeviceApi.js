import { getAxiosInstance } from './axiosInstance'; 
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
const getAlertLogFilter=(data)=>{
    const http = getAxiosInstance();
    return http.post(`/api/alertlog/filter/`,data)
}
const getStatesList=(data)=>{
    const http = getAxiosInstance();
    return http.post(`/api/Settings/filter_settings_State/`,data)
}
const getDeviceHealthStatus=(params)=>{
    const http = getAxiosInstance();
    return http.get(`/api/device-health-status/`, { params })
}
const getUserStatistics=()=>{
    const http = getAxiosInstance();
    return http.get(`/api/Statistics/user_statistics/`)
}
const showDeviceApi = {getDevice,getDeviceAlert,getDeviceAlertSearch,getActivatedDeviceList,getDeviceTagsSearch,getAlertLogFilter,getStatesList,getDeviceHealthStatus,getUserStatistics};

export default showDeviceApi;

