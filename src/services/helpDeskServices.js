import { getAxiosInstance } from "./axiosInstance";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Unauthenticated client for public endpoints only
const publicHttp = axios.create({ baseURL: BASE_URL });

const handleError = (error) => {
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
    return { success: false, message: "Network error. Please try again later." };
  }
  return { success: false, message: error.message };
};

// ---------- Public (no auth) ----------

const createComplaintPublic = async (formData) => {
  try {
    const response = await publicHttp.post("/api/complaint/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const trackTicket = async (ticketRef) => {
  try {
    const response = await publicHttp.get(
      `/api/complaint/track/${ticketRef}/`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

// ---------- Authenticated (staff) ----------

const createComplaintStaff = async (formData) => {
  try {
    const http = getAxiosInstance();
    const response = await http.post("/api/complaint/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const getComplaints = async (params) => {
  try {
    const http = getAxiosInstance();
    const response = await http.get("/api/complaint/list/", { params });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const getComplaintById = async (id) => {
  try {
    const http = getAxiosInstance();
    const response = await http.get(`/api/complaint/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const getActivityLog = async (id) => {
  try {
    const http = getAxiosInstance();
    const response = await http.get(`/api/complaint/${id}/activity/`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const updateStatus = async (id, data) => {
  try {
    const http = getAxiosInstance();
    const response = await http.post(
      `/api/complaint/${id}/update-status/`,
      data
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const escalateTicket = async (id, data) => {
  try {
    const http = getAxiosInstance();
    const response = await http.post(`/api/complaint/${id}/escalate/`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const submitFinalReport = async (id, formData) => {
  try {
    const http = getAxiosInstance();
    const response = await http.post(
      `/api/complaint/${id}/final-report/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const addComment = async (id, data) => {
  try {
    const http = getAxiosInstance();
    const response = await http.post(`/api/complaint/${id}/comment/`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const searchDeviceImei = async (q) => {
  try {
    const http = getAxiosInstance();
    const response = await http.get("/api/complaint/device-imei/", {
      params: { q },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const HelpDeskService = {
  createComplaintPublic,
  createComplaintStaff,
  trackTicket,
  getComplaints,
  getComplaintById,
  getActivityLog,
  updateStatus,
  escalateTicket,
  submitFinalReport,
  addComment,
  searchDeviceImei,
};

export default HelpDeskService;
