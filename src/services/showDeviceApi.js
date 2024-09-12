import { getAxiosInstance } from './axiosInstance'; 
import { BASE_URL } from '../store/constant';
const getDevice=()=>{
    const http = getAxiosInstance();
    return http.get(`${BASE_URL}api/devicestock/deviceStockFilter/`)
}

export default getDevice;

