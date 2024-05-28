// userActions.js
import { SET_USER, SET_LOADING, SET_ERROR,VERIFY_OTP } from '../store/constant';
import { cipherEncryption } from '../helper';
import axios from 'axios';
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});
export const setLoginInfo=(data)=>({
  type: 'SET_LOGIN_INFO',
  payload: data,
})
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
    const myCipher = cipherEncryption('skytrack');
    const responseData={
      isAuthenticated:false,
      token:"Token "+response.data.token,
      email:username,
      otpToken:response.data.token,
    }
    const cookiesData=`${myCipher(response.data?.user?.name)}-${myCipher(response.data?.user?.role)}-${myCipher(response.data?.user?.mobile)}`
    const error={
      message:null,
      status:null,
    }
    sessionStorage.setItem('cookiesData',cookiesData+'-'+response.data?.user?.id);
    dispatch(setLoginInfo(cookiesData));
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
      otpToken:null,
    }
    sessionStorage.setItem('isAuthenticated',true);
    sessionStorage.setItem('sessionID', Date.now());
    sessionStorage.setItem('oAuthToken', response.data.token);
    const errorData={
      message:null,
      status:null,
    }
    dispatch(setUser(responseData));
    dispatch(setError(errorData));
  }catch(error){
    const errorData={
      message:"Invalid/OTP Verification Failed",
      status:null,
    }
    dispatch(setError(errorData));
  }finally{
    dispatch(setLoading(false));
  }
}
export const resendOtp = (mobile,token) => async (dispatch) => {
  const header = {
    "Content-type": "application/json",
    "Authorization": "Token "+token,
  };
  try {
    dispatch(setLoading(true));
    const response = await axios.post('https://skytrack.tech:2000/api/send_sms_otp/', {
      mobile,
      token
    },{
      headers:header
    });
    const error={
      message:null,
      status:null,
    }
    dispatch(setError(error));
  } catch (error) {
    const errorData={
      message:'OTP sending fails',
      status:null,
    }
    dispatch(setError(errorData));
  } finally {
    dispatch(setLoading(false));
  }
};
export const logout=()=>async(dispatch)=>{
  const setData={
    isAuthenticated:false,
    token:null,
    email:null,
    otpToken:null
  }
  const header = {
    "Content-type": "application/json",
    "Authorization": "Token "+sessionStorage.getItem('oAuthToken'),
  };
  try{
    await axios.post('https://skytrack.tech:2000/api/user_logout/',{
      "token":sessionStorage.getItem('oAuthToken')
    },{
      headers:header
    });
    dispatch(setUser(setData));
  }catch(error){
    dispatch(setUser(setData));
  }finally{
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
    dispatch(setUser(setData));
  }
}
