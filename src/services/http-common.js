import axios from "axios";
import { BASE_URL } from "../store/constant";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
});

// Read token dynamically on every request so new browser windows
// (which have empty sessionStorage) can fall back to localStorage.
instance.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('oAuthToken') ||
    localStorage.getItem('oAuthToken');
  if (token) {
    config.headers['Authorization'] = 'Token ' + token;
  }

  if (config.headers['Content-type'] === 'multipart/form-data') {
    // Create a new FormData object
    const formData = new FormData();

    // Append each field to the FormData object
    for (const key in config.data) {
      if (config.data.hasOwnProperty(key)) {
        formData.append(key, config.data[key]);
      }
    }

    // Update the config to use FormData and set the Content-Type header
    config.data = formData;
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

// Add an interceptor to handle 404 errors globally
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 404) {
      // Handle 404 error here
      console.error("404 Error: Page not found");
    }
    if (error.response && error.response.status === 500) {
      console.error("500 Error");
    }
    return Promise.reject(error);
  }
);


export default instance;
