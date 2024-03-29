import http from './http-common';

const getRegisteredData=()=>{          // show device
    return http.post("/api/devicestock/deviceStockFilter/")            
}

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
const createVehicleOwner=(ownerData)=>{
    return http.post(`/api/VehicleOwner/create_VehicleOwner/`,ownerData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const UserServices = {
    getRegisteredData,
    getRegisteredUsers,
    getAll,
    getUsers,
    getSingleUser,
    registerUser,
    updateUser,
    createVehicleOwner
  };
  
  export default UserServices;