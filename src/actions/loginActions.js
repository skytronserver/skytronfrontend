// userActions.js
import { SET_USER, SET_LOADING, SET_ERROR, VERIFY_OTP, BASE_URL, SYSTEM_ENV } from '../store/constant';
import { cipherEncryption } from '../helper';
import axios from 'axios';
// Import node-forge for RSA encryption
import forge from 'node-forge';

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
export const setPermissions = (permissions) => ({
  type: 'SET_PERMISSIONS',
  payload: permissions,
})
export const logoutUser = (user) => ({
  type: "LOGOUT_USER",
  payload: user,
})

// Function to encrypt data using RSA encryption with node-forge
export const encryptWithPublicKey = (data) => {
  // RSA public key for encryption
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6hUN7F1LHsJu7fCYMd2S
BOot3n++YPA4I19PJxVvPmNbv2Smm8orCnlp5daNAKy8HtuLHXclSmVSVL6M9J8f
2E2mUl0zlfs34KycxNs6JBV8+6MZSlsW6SltwKTuhWCcAVA5sK9nL358MclDwKZv
3Ya4TcNVwDyZlnT/SMJvRwBi/eHtYep4giKB7mnrMeCSL3QdRMoSPX/ohcQBIRsD
Q/rPeb4epepHB6yy3iQ7d9+jBlxCSv5Kkigu07kcCKzDNKtuO9WbNkg/46cStGLD
mlnScYUaN7TJLBpzqBHkliMoexKcYlPRG/+ApqiGoB9hztb1gfwBdTlOUhJtnN0y
UwIDAQAB
-----END PUBLIC KEY-----`;

  try {
    // Convert the public key PEM to a forge public key object
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Encrypt the data using RSA-OAEP with SHA-1
    const encryptedData = publicKey.encrypt(data, "RSA-OAEP", {
      md: forge.md.sha1.create(),                // Use SHA-1 for hashing
      mgf1: forge.mgf.mgf1.create(forge.md.sha1.create()), // MGF1 with SHA-1
    });

    // Encode the encrypted data in base64 for transmission
    const encryptedBase64 = forge.util.encode64(encryptedData);

    return encryptedBase64;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption failed');
  }
};

export const loginUser = (username, password, captcha_key, captcha_reply) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Encrypt the password before sending to API
    const encryptedPassword = encryptWithPublicKey(password);

    const response = await axios.post(`${BASE_URL}api/user_login/`, {
      username,
      password: encryptedPassword, // Send encrypted password instead of plain text
      captcha_key,
      captcha_reply
    });
    if (response?.data?.token) {
      const userRole = (response.data?.user?.role || '').toLowerCase().trim();
      const userType = (response.data?.info?.user_type || '').toLowerCase().trim();

      const restrictedTypes = ['teamlead', 'team_lead', 'team lead', 'sos_teamlead', 'desk_ex', 'desk_executive', 'desk executive', 'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive'];
      const isRestricted = userRole === 'sosexecutive' || restrictedTypes.includes(userRole) || restrictedTypes.includes(userType);

      console.log(`[ACL] Login - Env: ${SYSTEM_ENV} | Role: ${userRole} | Type: ${userType} | Restricted: ${isRestricted}`);

      if (SYSTEM_ENV === 'prod') {
        if (isRestricted) {
          const err = new Error("Access Denied: SOS roles (Team Leads/Desk Executives) are not allowed in Production.");
          err.role = userRole;
          throw err;
        }
      } else if (SYSTEM_ENV === 'sos') {
        if (!isRestricted) {
          const err = new Error("Access Denied: This environment is restricted to SOS Team Leads and Desk Executives.");
          err.role = userRole;
          throw err;
        }
      }
      const myCipher = cipherEncryption('skytrack');
      const responseData = {
        isAuthenticated: false,
        token: "Token " + response.data.token,
        email: username,
        otpToken: response.data.token,
      }
      const effectiveRole = (userRole === 'sosexecutive' && userType) ? userType : userRole;
      const cookiesData = `${myCipher(response.data?.user?.name)}-${myCipher(effectiveRole)}-${myCipher(response.data?.user?.mobile)}`
      const skytrack_cookiesData = `${myCipher(response.data?.user?.email)}-${myCipher(effectiveRole)}-${myCipher(response.data?.user?.date_joined)}-${myCipher(response.data?.user?.mobile)}`
      const error = {
        message: null,
        status: null,
      }
      sessionStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
      localStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
      localStorage.setItem('skytrackCookiesData', skytrack_cookiesData);

      // Store dealer districts if available
      if (response.data?.info?.districts && Array.isArray(response.data.info.districts)) {
        localStorage.setItem('dealerDistricts', JSON.stringify(response.data.info.districts));
      }

      dispatch(setLoginInfo(cookiesData));
      dispatch(setUser(responseData));
      dispatch(setError(error));
    } else {
      throw new Error(response?.data?.error)
    }
  } catch (error) {
    console.log(error, 'error')
    let message = "";
    if (error?.code === "ERR_BAD_REQUEST") {
      if (error?.response?.data) {
        message = error?.response?.data?.error
      } else {
        message = "Internal Server Error"
      }

    } else {
      console.error(`[ACL] Access Denied. Role: ${error.role || 'Unknown'}, Env: ${SYSTEM_ENV}`);
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

export const loginUserSos = (username, password, captcha_key, captcha_reply) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Encrypt the password before sending to API
    const encryptedPassword = encryptWithPublicKey(password);

    const response = await axios.post(`${BASE_URL}api/user_login_sosexecutive_direct/`, {
      username,
      password: encryptedPassword,
      captcha_key,
      captcha_reply,
    });

    if (response?.data?.token) {
      const userRole = (response.data?.user?.role || '').toLowerCase().trim();
      const userType = (response.data?.info?.user_type || '').toLowerCase().trim();

      const restrictedTypes = ['teamlead', 'team_lead', 'team lead', 'sos_teamlead', 'desk_ex', 'desk_executive', 'desk executive', 'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive'];
      const isRestricted = userRole === 'sosexecutive' || restrictedTypes.includes(userRole) || restrictedTypes.includes(userType);

      console.log(`[ACL] SOS Login - Env: ${SYSTEM_ENV} | Role: ${userRole} | Type: ${userType} | Restricted: ${isRestricted}`);

      if (!isRestricted) {
        const err = new Error('Access Denied: This environment is restricted to SOS Team Leads and Desk Executives.');
        err.role = userRole;
        throw err;
      }

      const myCipher = cipherEncryption('skytrack');
      const effectiveRole = (userRole === 'sosexecutive' && userType) ? userType : userRole;
      const cookiesData = `${myCipher(response.data?.user?.name)}-${myCipher(effectiveRole)}-${myCipher(response.data?.user?.mobile)}`;
      const skytrack_cookiesData = `${myCipher(response.data?.user?.email)}-${myCipher(effectiveRole)}-${myCipher(response.data?.user?.date_joined)}-${myCipher(response.data?.user?.mobile)}`;

      sessionStorage.setItem('isAuthenticated', true);
      sessionStorage.setItem('sessionID', Date.now());
      sessionStorage.setItem('oAuthToken', response.data.token);
      sessionStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
      localStorage.setItem('isAuthenticated', true);
      localStorage.setItem('sessionID', Date.now());
      localStorage.setItem('oAuthToken', response.data.token);
      localStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
      localStorage.setItem('skytrackCookiesData', skytrack_cookiesData);

      if (response.data?.info?.districts && Array.isArray(response.data.info.districts)) {
        localStorage.setItem('dealerDistricts', JSON.stringify(response.data.info.districts));
      }

      if (response.data?.permissions) {
        sessionStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
        localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
        dispatch(setPermissions(response.data.permissions));
      }

      const responseData = {
        isAuthenticated: true,
        token: response.data.token,
        email: username,
        otpToken: null,
      };

      dispatch(setLoginInfo(cookiesData));
      dispatch(setUser(responseData));
      dispatch(setError({ message: null, status: null }));
    } else {
      throw new Error(response?.data?.error);
    }
  } catch (error) {
    console.log(error, 'error');
    let message = '';
    if (error?.code === 'ERR_BAD_REQUEST') {
      message = error?.response?.data?.error || 'Internal Server Error';
    } else {
      console.error(`[ACL] SOS Access Denied. Role: ${error.role || 'Unknown'}`);
      message = error.message;
    }
    if (message === 'text is undefined') {
      message = "Whoops! Looks like the math wasn't quite right. Add the numbers in the CAPTCHA and try again.";
    }
    if (/sosexecutive\s+and\s+teamleader/i.test(message)) {
      message = 'This login is allowed only for DeskExecutive and Teamleader accounts.';
    }
    dispatch(setError({ message, status: null }));
  } finally {
    dispatch(setLoading(false));
  }
};
export const verifyOtp = (token, otp, username) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const myCipher = cipherEncryption('skytrack');
    // Encrypt the OTP before sending to API
    const encryptedOtp = encryptWithPublicKey(otp);
    const response = await axios.post(`${BASE_URL}api/validate_otp/`, {
      token,
      otp: encryptedOtp
    });
    const userRole = (response.data?.user?.role || '').toLowerCase().trim();
    const userType = (response.data?.info?.user_type || '').toLowerCase().trim();

    const restrictedTypes = ['teamlead', 'team_lead', 'team lead', 'sos_teamlead', 'desk_ex', 'desk_executive', 'desk executive', 'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive'];
    const isRestricted = userRole === 'sosexecutive' || restrictedTypes.includes(userRole) || restrictedTypes.includes(userType);

    console.log(`[ACL] OTP - Env: ${SYSTEM_ENV} | Role: ${userRole} | Type: ${userType} | Restricted: ${isRestricted}`);

    if (SYSTEM_ENV === 'prod') {
      if (isRestricted) {
        const err = new Error("Access Denied: SOS roles (Team Leads/Desk Executives) are not allowed in Production.");
        err.role = userRole;
        throw err;
      }
    } else if (SYSTEM_ENV === 'sos') {
      if (!isRestricted) {
        const err = new Error("Access Denied: This environment is restricted to SOS Team Leads and Desk Executives.");
        err.role = userRole;
        throw err;
      }
    }
    const responseData = {
      isAuthenticated: true,
      token: response.data.token,
      email: username,
      otpToken: null,
    }
    const effectiveRole = (userRole === 'sosexecutive' && userType) ? userType : userRole;
    if (response?.data?.user?.role === 'sosexecutive' || response?.data?.info?.user_type) {
      const cookiesData = `${myCipher(response.data?.user?.name)}-${myCipher(effectiveRole)}-${myCipher(response.data?.user?.mobile)}`
      const skytrack_cookiesData = `${myCipher(response.data?.user?.email)}-${myCipher(effectiveRole)}-${myCipher(response.data?.user?.date_joined)}-${myCipher(response.data?.user?.mobile)}`
      sessionStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
      localStorage.setItem('cookiesData', cookiesData + '-' + response.data?.user?.id);
      localStorage.setItem('skytrackCookiesData', skytrack_cookiesData);
      dispatch(setLoginInfo(cookiesData));
    }
    sessionStorage.setItem('isAuthenticated', true);
    sessionStorage.setItem('sessionID', Date.now());
    sessionStorage.setItem('oAuthToken', response.data.token);
    // Also persist to localStorage so new windows (opened via window.open) can read them
    localStorage.setItem('isAuthenticated', true);
    localStorage.setItem('sessionID', Date.now());
    localStorage.setItem('oAuthToken', response.data.token);

    // Store dealer districts if available
    if (response.data?.info?.districts && Array.isArray(response.data.info.districts)) {
      localStorage.setItem('dealerDistricts', JSON.stringify(response.data.info.districts));
    }

    if (response.data?.permissions) {
      sessionStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
      localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
      dispatch(setPermissions(response.data.permissions));
    }

    const errorData = {
      message: null,
      status: null,
    }
    dispatch(setUser(responseData));
    dispatch(setError(errorData));
  } catch (error) {
    console.error(`[ACL] Access Denied. Role: ${error.role || 'Unknown'}, Env: ${SYSTEM_ENV}`);
    const status = error.response?.status;
    let message = error.message || "Verification failed. Please check the code and try again.";
    if (status === 400 || status === 401 || status === 403) {
      message = "WRONG OTP";
    }
    const errorData = {
      message: message,
      status: null,
    };
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
    await axios.post(`${BASE_URL}api/send_sms_otp/`, {
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
    await axios.post(`${BASE_URL}api/user_logout/`, {
      "token": sessionStorage.getItem('oAuthToken')
    }, {
      headers: header
    });
    localStorage.clear();
    sessionStorage.clear();
    dispatch(setLoginInfo(""));
    dispatch(setPermissions(null));
  } catch (error) {
    localStorage.clear();
    sessionStorage.clear();
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    const cacheKeys = Object.keys(localStorage);
    cacheKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

  }
}
