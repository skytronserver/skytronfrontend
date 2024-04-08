import http from './http-common';

const getRegisteredData=()=>{          // show device
    return http.post("/api/devicestock/deviceStockFilter/")            
}

//new
const getActiveState=()=>{          // dashboard- active state 1st card
    return http.post("/api/homepageandstat/homepage_state/")    
}


const getTotalState=()=>{          // dashboard- total state 2nd card
    return http.post("/api/homepageandstat/homepage_alart/")    
}

const getTotalDeviceState=()=>{          // dashboard- total device 3rd card
    return http.post("/api/homepageandstat/homepage_device1/")    
}



const getDeviceState=()=>{          // dashboard- device state 4th card
    return http.post("/api/homepageandstat/homepage_device2/")    
}

      
//new

const getRegisteredUsers=()=>{
     return http.get("/api/get_list/")  // userList APi
}
const getAll = () => {
    return http.get("/posts");
  };
const getUsers=()=>{
    return http.get("/users")
}
const getSingleUser=(userId)=>{
    return http.get(`/api/get_details/${userId}`)
}
const registerUser=(userData)=>{
    return http.post(`/api/create_user/`,userData)
}
const updateUser=(id,userData)=>{
    return http.put(`/api/update_user/${id}/`,userData)
}

//UserManagement API Collection
const createStateAdmin=(formData)=>{
    return http.post("/api/StateAdmin/create_StateAdmin/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createDTO=(formData)=>{
    return http.post("/api/DTO_RTO/create_DTO_RTO/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createManufacturer=(formData)=>{
    return http.post("/api/manufacturer/create_manufacturer/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createEsimUser=(formData)=>{
    return http.post("/api/eSimProvider/create_eSimProvider/",formData,{
        headers: {
            'Content-type': 'multipart/form-data',
          }
    })
}
const createVehicleOwner=(ownerData)=>{
    return http.post(`/api/VehicleOwner/create_VehicleOwner/`,ownerData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const createSOSAdmin=(formData)=>{
    return http.post(`/api/SOSAdmin/create_SOSAdmin/`,formData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const createSOSUser=(formData)=>{
    return http.post(`/api/SOSuser/create_SOSuser/`,formData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const fetchVehicleOwner=(formData)=>{
    return http.post("/api/VehicleOwner/filter_VehicleOwner/",formData);
}
const UserServices = {
    getActiveState,
    getTotalState,
    getTotalDeviceState,
    getDeviceState,
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
    fetchVehicleOwner
  };
  
  export default UserServices;