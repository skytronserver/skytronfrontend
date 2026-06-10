import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const http = axios.create({
  baseURL: BASE_URL,
});

const handleAxiosError = (error) => {
  if (error.response) {
    return {
      success: false,
      message:
        error.response.data?.error ||
        error.response.data?.message ||
        "Something went wrong",
    };
  }

  if (error.request) {
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }

  return {
    success: false,
    message: error.message,
  };
};

const createComplaint = async (formData) => {
  try {
    const response = await http.post(
      "/api/complaint/create/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};
const getComplaints = async (params) => {
  return await http.get("/api/complaint/list/", { params });
};

const getComplaintById = async (id) => {
  return await http.get(`/api/complaint/${id}/`);
};

const updateStatus = async (id, data) => {
  return await http.patch(
    `/api/complaint/${id}/update-status/`,
    data
  );
};

const submitFinalReport = async (id, formData) => {
  return await http.post(
    `/api/complaint/${id}/final-report/`,
    formData
  );
};

const addComment = async (id, data) => {
  return await http.post(
    `/api/complaint/${id}/comment/`,
    data
  );
};

const HelpDeskService = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  submitFinalReport,
  addComment,
};

export default HelpDeskService;