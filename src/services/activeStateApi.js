import { getAxiosInstance } from './axiosInstance';
import { BASE_URL } from '../store/constant';
const homePage = (homePage) => {
  const http = getAxiosInstance(); 
    return http.post(
      `${BASE_URL}api/homepageandstat/homepage/`,
      homePage
    );
  };

  const homeDisplay = {
  homePage,
  };
  
  export default homeDisplay;