import { getAxiosInstance } from './axiosInstance'; 
const getDevice=()=>{
    const http = getAxiosInstance();
    return http.get("https://skytrack.tech:2000/api/devicestock/deviceStockFilter/")
}

export default getDevice;

