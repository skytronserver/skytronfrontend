// userActions.js
import { SET_USER, SET_LOADING, SET_ERROR,VERIFY_OTP } from '../store/constant';
import axios from 'axios';
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});
export const setOtp=(user)=>({
  type:VERIFY_OTP,
  payload:user,
})
export const logoutUser=(user)=>({
  type:"LOGOUT_USER",
  payload:user,
})
export const loginUser = (username, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post('https://skytrack.tech:2000/api/user_login/', {
      username,
      password,
    });
    const responseData={
      isAuthenticated:false,
      token:"Token "+response.data.token,
      email:username,
      otpToken:response.data.token
    }
    const error={
      message:null,
      status:null,
    }
    dispatch(setUser(responseData));
    dispatch(setError(error));
  } catch (error) {
    const errorData={
      message:error.message,
      status:null,
    }
    dispatch(setError(errorData));
  } finally {
    dispatch(setLoading(false));
  }
};
export const verifyOtp=(token,otp,username)=>async(dispatch)=>{
  try{
    dispatch(setLoading(true));
    const response=await axios.post('https://skytrack.tech:2000/api/validate_otp/',{
      token,
      otp
    });
    const responseData={
      isAuthenticated:true,
      token:response.data.token,
      email:username,
      otpToken:null
    }
    sessionStorage.setItem('isAuthenticated',true);
    sessionStorage.setItem('sessionID', Date.now());
    localStorage.setItem('oAuthToken', response.data.token);
    const errorData={
      message:null,
      status:null,
    }
    dispatch(setUser(responseData));
    dispatch(setError(errorData));
  }catch(error){
    const errorData={
      message:error.message,
      status:null,
    }
    dispatch(setError(errorData));
  }finally{
    dispatch(setLoading(false));
  }
}
export const logout=()=>async(dispatch)=>{
  const setData={
    isAuthenticated:false,
    token:null,
    email:null,
    otpToken:null
  }
  const header = {
    "Content-type": "application/json",
    "Authorization": "Token "+localStorage.getItem('oAuthToken'),
  };
  try{
    await axios.post('https://skytrack.tech:2000/api/user_logout/',{
      "token":localStorage.getItem('oAuthToken')
    },{
      headers:header
    });
    dispatch(setUser(setData));
  }catch(error){
    dispatch(setUser(setData));
  }finally{
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    localStorage.removeItem('oAuthToken');
    dispatch(setUser(setData));
  }
}
