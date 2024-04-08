import axios from "axios";


//old

// const instance = axios.create({
//   baseURL: "https://skytrack.tech:2000/",
//   headers: {
//     "Content-type": "application/json",
//     "Authorization": "Token 31353e8296e9b40f88cdda7a080b5e286fa88c2f",
//   },
// });

//old

//new 
const instance = axios.create({
  baseURL: "https://skytrack.tech:2000/",
  headers: {
    "Content-type": "application/json",
    "Authorization": "Token 5ede4fbff56d0f118498a23d1ea199ab804dc31b",
  },
});

//new 





// Add an interceptor to handle FormData for file uploads
instance.interceptors.request.use((config) => {
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

export default instance;
