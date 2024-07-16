import { getAxiosInstance } from './axiosInstance';
const getRegisteredData=()=>{  
    const http = getAxiosInstance();        // show device
    return http.post("/api/devicestock/deviceStockFilter/")            
}

//new
const getStateStats=()=>{  
    const http = getAxiosInstance();        // dashboard- active state 1st card
    return http.post("/api/homepageandstat/homepage_state/")    
}


const getAlertDetails=()=>{  
    const http = getAxiosInstance();        // dashboard- total state 2nd card
    return http.post("/api/homepageandstat/homepage_alart/")    
}

const getDeviceStats=()=>{  
    const http = getAxiosInstance();        // dashboard- total device 3rd card
    return http.post("/api/homepageandstat/homepage_device1/")    
}



const getTaggedDevices=()=>{ 
    const http = getAxiosInstance();  
    return http.post("/api/homepageandstat/homepage_device2/")    
}

      
//new

const getRegisteredUsers=()=>{
    const http = getAxiosInstance(); 
     return http.get("/api/get_list/")  // userList APi
}
const getAll = () => {
    const http = getAxiosInstance();
    return http.get("/posts");
  };
const getUsers=()=>{
    const http = getAxiosInstance();
    return http.get("/users")
}
const getSingleUser=(userId)=>{
    const http = getAxiosInstance();
    return http.get(`/api/get_details/${userId}`)
}
const registerUser=(userData)=>{
    const http = getAxiosInstance();
    return http.post(`/api/create_user/`,userData)
}
const updateUser=(id,userData)=>{
    const http = getAxiosInstance();
    return http.put(`/api/update_user/${id}/`,userData)
}

//UserManagement API Collection
const createStateAdmin=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/StateAdmin/create_StateAdmin/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const fetchStateAdmin=(formData)=>{
    const http=getAxiosInstance();
    return http.post("/api/StateAdmin/filter_StateAdmin/",formData)
}
const createDTO=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/DTO_RTO/create_DTO_RTO/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createManufacturer=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/manufacturer/create_manufacturer/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createEsimUser=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/eSimProvider/create_eSimProvider/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createVehicleOwner=(ownerData)=>{
    const http = getAxiosInstance();
    return http.post(`/api/VehicleOwner/create_VehicleOwner/`,ownerData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const createSOSAdmin=(formData)=>{
    const http = getAxiosInstance();
    return http.post(`/api/SOSAdmin/create_SOSAdmin/`,formData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const createSOSUser=(formData)=>{
    const http = getAxiosInstance();
    return http.post(`/api/SOSuser/create_SOSuser/`,formData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const fetchVehicleOwner=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/VehicleOwner/filter_VehicleOwner/",formData);
}
const fetchSimProvider=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/eSimProvider/filter_eSimProvider/",formData);
}
const fetchSOSAdmin=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/SOSAdmin/filter_SOSAdmin/",formData);
}
const fetchDTOList=(formData)=>{
    const http = getAxiosInstance();
    return http.post("/api/DTO_RTO/filter_DTO_RTO/",formData);
}
const getStateAdminDashboard=()=>{
    const http=getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_stateAdmin/')
}
const getDealerDashboard=()=>{
    const http=getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_Dealer/');
}
const getManufacturerDashboard=()=>{
    const http=getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_Manufacturer/');
}
const getOwnerDashboard=()=>{
    const http=getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_VehicleOwner/');
}
const getDashboardUserData=()=>{
    const http=getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_user1/')
}
const getDashboardData=()=>{
    const http=getAxiosInstance();
    return http.post('/api/homepageandstat/homepage/')
}
const UserServices = {
    getStateStats,
    getAlertDetails,
    getDeviceStats,
    getTaggedDevices,
    getRegisteredData,
    getRegisteredUsers,
    getAll,
    getUsers,
    getSingleUser,
    registerUser,
    updateUser,
    createVehicleOwner,
    createStateAdmin,
    createDTO,
    createManufacturer,
    createEsimUser,
    createSOSAdmin,
    createSOSUser,
    fetchVehicleOwner,
    fetchSimProvider,
    fetchSOSAdmin,
    fetchStateAdmin,
    fetchDTOList,
    getStateAdminDashboard,
    getDashboardUserData,
    getDashboardData,
    getDealerDashboard,
    getManufacturerDashboard,
    getOwnerDashboard
  };
  
  export default UserServices;