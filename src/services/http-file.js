import axios from "axios";
import { BASE_URL } from "../store/constant";

const fileInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "multipart/form-data",
  },
});

// Read token dynamically per-request, falling back to localStorage for new windows
fileInstance.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('oAuthToken') ||
    localStorage.getItem('oAuthToken');
  if (token) {
    config.headers['Authorization'] = 'Token ' + token;
  }
  return config;
});

export default fileInstance;
