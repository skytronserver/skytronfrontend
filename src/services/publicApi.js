import axios from 'axios';
import { BASE_URL } from '../store/constant';

// Create a public axios instance without authentication
const publicAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
});

// Add response interceptor for error handling
publicAxiosInstance.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    return Promise.reject(new Error(`Unexpected status code: ${response.status}`));
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        console.error("404 Error: Page not found");
      } else if (error.response.status === 500) {
        console.error("500 Error: Internal server error");
      } else {
        console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else {
      console.error("Error: No response received");
    }
    return Promise.reject(error);
  }
);

// Public API functions
const getDeviceHealthStatusPublic = (params) => {
  return publicAxiosInstance.get('/api/Statistics/manufacturer_model_stock_statistics/', { params });
};

const getDeviceOnboardingDashboard = () => {
  return axios.get('https://api.gromed.in/api/public/device_onboarding_dashboard/');
};

export default {
  getDeviceHealthStatusPublic,
  getDeviceOnboardingDashboard
};
