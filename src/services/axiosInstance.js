// axiosInstance.js
import axios from 'axios';
import { BASE_URL } from '../store/constant';
let axiosInstance = null;

export const createAxiosInstance = (token) => {
  axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  // Add an interceptor to handle FormData for file uploads
  axiosInstance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      // If data is already FormData, remove Content-Type to allow browser to set boundary
      delete config.headers['Content-type'];
      delete config.headers['Content-Type'];
    } else if (config.headers['Content-type'] === 'multipart/form-data' || config.headers['Content-Type'] === 'multipart/form-data') {
      const formData = new FormData();
      for (const key in config.data) {
        if (config.data.hasOwnProperty(key)) {
          formData.append(key, config.data[key]);
        }
      }
      config.data = formData;
      // Remove Content-Type to allow browser to set boundary
      delete config.headers['Content-type'];
      delete config.headers['Content-Type'];
    }
    return config;
  });

  // Add an interceptor to handle responses and errors globally
  axiosInstance.interceptors.response.use(
    (response) => {
      // If the status code is in the 200 range, resolve the promise
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      // If for some reason the status is in the 200 range but an error needs to be thrown, 
      // you can handle it here (though typically this wouldn't be the case).
      return Promise.reject(new Error(`Unexpected status code: ${response.status}`));
    },
    (error) => {
      // Handle specific error statuses
      if (error.response) {
        if (error.response.status === 404) {
          console.error("404 Error: Page not found");
        } else if (error.response.status === 500) {
          console.error("500 Error");
        } else {
          console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
        }
      } else {
        // Handle network errors or errors without a response
        console.error("Error: No response received");
      }
      console.log("❌ DATA:", error.response?.data); // 🔥 REAL BACKEND ERROR
      return Promise.reject(error);
    }
  );
};

export const getAxiosInstance = () => {
  if (!axiosInstance) {
    throw new Error("Axios instance is not created yet. Call createAxiosInstance(token) first.");
  }
  return axiosInstance;
};
