import axios from "axios";
const token="Token "+sessionStorage.getItem('oAuthToken'); 
export default axios.create({
  baseURL: "https://skytrack.tech:2000/",
  headers: {
    "Content-type": "multipart/form-data",
    "Authorization":token
  }
});
