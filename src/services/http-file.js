import axios from "axios";
export default axios.create({
  baseURL: "https://skytrack.tech:2000/",
  headers: {
    "Content-type": "multipart/form-data",
    "Authorization":"Token 31353e8296e9b40f88cdda7a080b5e286fa88c2f"
  }
});
