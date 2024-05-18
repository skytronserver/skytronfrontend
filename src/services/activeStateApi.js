import { getAxiosInstance } from './axiosInstance';

const homePage = (homePage) => {
  const http = getAxiosInstance(); 
    return http.post(
      "https://skytrack.tech:2000/api/homepageandstat/homepage/",
      homePage
    );
  };

  const homeDisplay = {
  homePage,
  };
  
  export default homeDisplay;