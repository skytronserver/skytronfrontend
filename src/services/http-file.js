import axios from "axios";
export default axios.create({
  baseURL: "https://skytrack.tech:2000/",
  headers: {
    "Content-type": "multipart/form-data",
    "Authorization":"Token 5ede4fbff56d0f118498a23d1ea199ab804dc31b"
  }
});
