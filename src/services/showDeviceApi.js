import http from './http-common';

const getDevice=()=>{
    return http.get("https://skytrack.tech:2000/api/devicestock/deviceStockFilter/")
}

export default getDevice;

