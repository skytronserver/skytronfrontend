import http from './http-common';

const getAll = () => {
    return http.get("/posts");
  };
const getUsers=()=>{
    return http.get("/users")
}
const getRegisteredUsers=()=>{
    return http.get("/api/get_list/")
}
const getSingleUser=(userId)=>{
    return http.get(`/api/get_details/${userId}`)
}
const registerUser=(userData)=>{
    return http.post(`/api/create_user/`,userData)
}
const UserServices = {
    getAll,
    getUsers,
    getRegisteredUsers,
    getSingleUser,
    registerUser
  };
  
  export default UserServices;