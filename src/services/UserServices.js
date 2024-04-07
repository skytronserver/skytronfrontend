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
    updateUser
  };
  
  export default UserServices;