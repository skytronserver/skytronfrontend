// axiosInstance.js
import axios from 'axios';

let axiosInstance = null;

export const createAxiosInstance = (token) => {
  axiosInstance = axios.create({
    baseURL: "https://skytrack.tech:2000/",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Token ${token}`,
    },
  });

  // Add an interceptor to handle FormData for file uploads
  axiosInstance.interceptors.request.use((config) => {
    if (config.headers['Content-type'] === 'multipart/form-data') {
      const formData = new FormData();
      for (const key in config.data) {
        if (config.data.hasOwnProperty(key)) {
          formData.append(key, config.data[key]);
        }
      }
      config.data = formData;
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  });

  // Add an interceptor to handle errors globally
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 404) {
        console.error("404 Error: Page not found");
      }
      if (error.response && error.response.status === 500) {
        console.error("500 Error");
      }
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
