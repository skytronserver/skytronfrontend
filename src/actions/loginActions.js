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
export const loginUser = (username, password,captcha_key,captcha_reply) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post('https://skytrack.tech:2000/api/user_login/', {
      username,
      password,
      captcha_key,
      captcha_reply
    });
    const myCipher = cipherEncryption('skytrack');
    const responseData={
      isAuthenticated:false,
      token:"Token "+response.data.token,
      email:username,
      otpToken:response.data.token,
    }
    const cookiesData=`${myCipher(response.data?.user?.name)}-${myCipher(response.data?.user?.role)}-${myCipher(response.data?.user?.mobile)}`
    const skytrack_cookiesData=`${myCipher(response.data?.user?.email)}-${myCipher(response.data?.user?.role)}-${myCipher(response.data?.user?.date_joined )}-${myCipher(response.data?.user?.mobile)}`
    const error={
      message:null,
      status:null,
    }
    sessionStorage.setItem('cookiesData',cookiesData+'-'+response.data?.user?.id);
    localStorage.setItem('skytrackCookiesData',skytrack_cookiesData);
    dispatch(setLoginInfo(cookiesData));
    dispatch(setUser(responseData));
    dispatch(setError(error));
  } catch (error) {
    let message="";
    if(error?.code=="ERR_BAD_REQUEST"){
      if(error?.response?.data){
        message=error?.response?.data?.error
      }else{
        message="Internal Server Error"
      }
    
    }else{
      message=error.message
    }
    if(message=="text is undefined"){
      message="Whoops! Looks like the math wasn't quite right. Add the numbers in the CAPTCHA and try again."
    }
    const errorData={
      message:message,
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
      message:"Verification failed. Please check the code and try again.",
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
      message:"We're unable to send the OTP code right now.Please try again later.",
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
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
    localStorage.removeItem('skytrackCookiesData');
    dispatch(setUser(setData));
  }catch(error){
    dispatch(setUser(setData));
  }finally{
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
    localStorage.removeItem('skytrackCookiesData');
    dispatch(setUser(setData));
  }
}
