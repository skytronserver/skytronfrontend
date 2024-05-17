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
      token:"Token "+response.data.token,
      email:username,
      otpToken:null
    }
    sessionStorage.setItem('sessionID', Date.now());
    localStorage.setItem('oAuthToken', "Token "+response.data.token);
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
