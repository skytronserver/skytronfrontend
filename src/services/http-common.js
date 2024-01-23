import axios from "axios";

export default axios.create({
  baseURL: "http://216.10.244.243:2000",
  headers: {
    "Content-type": "application/json",
    "Authorization":"Token 31353e8296e9b40f88cdda7a080b5e286fa88c2f"
  }
});