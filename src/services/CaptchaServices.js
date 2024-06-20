import axios from 'axios';
const handleAxiosError = (error) => {
  if (error.response) {
    console.error("Response error:", error.response.data);
  } else if (error.request) {
    console.error("Request error:", error.request);
  } else {
    console.error("Error:", error.message);
  }
  alert("A network error occurred. Please try again later.");
}
const http=axios.create({
    baseURL: "https://skytrack.tech:2000/",
    headers: {
      "Content-type": "application/json",
    },
  });
const generateCaptcha = async () => {
    try {
      const response = await http.get("api/generate-captcha/");
      return response.data;
    } catch (error) {
      handleAxiosError(error);
      return {error:true}
    }
  }
const verifyCaptcha = async (formData) => {
    try {
      const response = await http.post("/api/generate-captcha/", formData);
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

const CaptchaServices = {
    generateCaptcha,verifyCaptcha
};

export default CaptchaServices;