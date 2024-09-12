import axios from "axios";
import { BASE_URL } from "../store/constant";
const token="Token "+sessionStorage.getItem('oAuthToken'); 
export default axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "multipart/form-data",
    "Authorization":token
  }
});
