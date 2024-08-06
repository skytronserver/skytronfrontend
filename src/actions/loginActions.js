// userActions.js
import { SET_USER, SET_LOADING, SET_ERROR, VERIFY_OTP } from '../store/constant';
import { cipherEncryption } from '../helper';
import axios from 'axios';

import forge from 'node-forge';
import { Base64 } from 'js-base64';

const encryptPassword = (password) => {
  // Hard-coded public key in PEM format
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6hUN7F1LHsJu7fCYMd2S
  BOot3n++YPA4I19PJxVvPmNbv2Smm8orCnlp5daNAKy8HtuLHXclSmVSVL6M9J8f
  2E2mUl0zlfs34KycxNs6JBV8+6MZSlsW6SltwKTuhWCcAVA5sK9nL358MclDwKZv
  3Ya4TcNVwDyZlnT/SMJvRwBi/eHtYep4giKB7mnrMeCSL3QdRMoSPX/ohcQBIRsD
  Q/rPeb4epepHB6yy3iQ7d9+jBlxCSv5Kkigu07kcCKzDNKtuO9WbNkg/46cStGLD
  mlnScYUaN7TJLBpzqBHkliMoexKcYlPRG/+ApqiGoB9hztb1gfwBdTlOUhJtnN0y
  UwIDAQAB
  -----END PUBLIC KEY-----`;

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  // Encrypt the password
  const encryptedBytes = publicKey.encrypt(forge.util.encodeUtf8(password), 'RSA-OAEP', {
    md: forge.md.sha1.create()
  });

  // Encode the encrypted password in base64
  const encryptedPasswordBase64 = forge.util.encode64(encryptedBytes);

  return encryptedPasswordBase64;
};

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});
export const setLoginInfo = (data) => ({
  type: 'SET_LOGIN_INFO',
  payload: data,
})
export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});
export const setOtp = (user) => ({
  type: VERIFY_OTP,
  payload: user,
})
export const logoutUser = (user) => ({
  type: "LOGOUT_USER",
  payload: user,
})

export const loginUser = (username, password, captcha_key, captcha_reply) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    password = encryptPassword(password);
    const response = await axios.post('https://skytrack.tech:2000/api/user_login/', {
      username,
      password,
      captcha_key,
      captcha_reply
    });
    const myCipher = cipherEncryption('skytrack');
    const responseData = {
      isAuthenticated: false,
      token: "Token " + response.data.token,
      email: username,
      otpToken: response.data.token,
    }
    const cookiesData = `${myCipher(response.data?.user?.name)}-${myCipher(response.data?.user?.role)}-${myCipher(response.data?.user?.mobile)}`
    const skytrack_cookiesData = `${myCipher(response.data?.user?.email)}-${myCipher(response.data?.user?.role)}-${myCipher(response.data?.user?.date_joined)}-${myCipher(response.data?.user?.mobile)}`
    const error = {
      message: null,
      status: null,
    }
    sessionStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
    localStorage.setItem('skytrackCookiesData', skytrack_cookiesData);
    dispatch(setLoginInfo(cookiesData));
    dispatch(setUser(responseData));
    dispatch(setError(error));
  } catch (error) {
    let message = "";
    if (error?.code === "ERR_BAD_REQUEST") {
      if (error?.response?.data) {
        message = error?.response?.data?.error
      } else {
        message = "Internal Server Error"
      }

    } else {
      message = error.message
    }
    if (message === "text is undefined") {
      message = "Whoops! Looks like the math wasn't quite right. Add the numbers in the CAPTCHA and try again."
    }
    const errorData = {
      message: message,
      status: null,
    }
    dispatch(setError(errorData));
  } finally {
    dispatch(setLoading(false));
  }
};
export const verifyOtp = (token, otp, username) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post('https://skytrack.tech:2000/api/validate_otp/', {
      token,
      otp
    });
    const responseData = {
      isAuthenticated: true,
      token: response.data.token,
      email: username,
      otpToken: null,
    }
    sessionStorage.setItem('isAuthenticated', true);
    sessionStorage.setItem('sessionID', Date.now());
    sessionStorage.setItem('oAuthToken', response.data.token);
    const errorData = {
      message: null,
      status: null,
    }
    dispatch(setUser(responseData));
    dispatch(setError(errorData));
  } catch (error) {
    const errorData = {
      message: "Verification failed. Please check the code and try again.",
      status: null,
    }
    dispatch(setError(errorData));
  } finally {
    dispatch(setLoading(false));
  }
}
export const resendOtp = (mobile, token) => async (dispatch) => {
  const header = {
    "Content-type": "application/json",
    "Authorization": "Token " + token,
  };
  try {
    dispatch(setLoading(true));
    await axios.post('https://skytrack.tech:2000/api/send_sms_otp/', {
      mobile,
      token
    }, {
      headers: header
    });
    const error = {
      message: null,
      status: null,
    }
    dispatch(setError(error));
  } catch (error) {
    const errorData = {
      message: "We're unable to send the OTP code right now.Please try again later.",
      status: null,
    }
    dispatch(setError(errorData));
  } finally {
    dispatch(setLoading(false));
  }
};
export const logout = () => async (dispatch) => {

  const header = {
    "Content-type": "application/json",
    "Authorization": "Token " + sessionStorage.getItem('oAuthToken'),
  };
  try {
    await axios.post('https://skytrack.tech:2000/api/user_logout/', {
      "token": sessionStorage.getItem('oAuthToken')
    }, {
      headers: header
    });
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
    localStorage.removeItem('skytrackCookiesData');

  } catch (error) {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
    localStorage.removeItem('skytrackCookiesData');
  } finally {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
    localStorage.removeItem('skytrackCookiesData');
    localStorage.clear();
    sessionStorage.clear();
    const cacheKeys = Object.keys(localStorage);
    cacheKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

  }
}
