import { getAxiosInstance } from "./axiosInstance";

const handleError = (error) => ({
  success: false,
  message: error.response?.data?.message || error.message || "An error occurred",
  errors: error.response?.data?.errors || {},
});

const CustomAlertService = {
  getParameters: async () => {
    try {
      const res = await getAxiosInstance().get("school/api/custom-alerts/parameters/");
      return { success: true, data: res.data.data };
    } catch (e) { return handleError(e); }
  },

  getRules: async (params = {}) => {
    try {
      const res = await getAxiosInstance().get("school/api/custom-alerts/rules/", { params });
      return { success: true, data: res.data };
    } catch (e) { return handleError(e); }
  },

  createRule: async (payload) => {
    try {
      const res = await getAxiosInstance().post("school/api/custom-alerts/rules/", payload);
      return { success: true, data: res.data.data };
    } catch (e) { return handleError(e); }
  },

  updateRule: async (id, payload) => {
    try {
      const res = await getAxiosInstance().post(`school/api/custom-alerts/rules/${id}/update/`, payload);
      return { success: true, data: res.data.data };
    } catch (e) { return handleError(e); }
  },

  deactivateRule: async (id) => {
    try {
      const res = await getAxiosInstance().post(`school/api/custom-alerts/rules/${id}/delete/`);
      return { success: true, data: res.data.data };
    } catch (e) { return handleError(e); }
  },
};

export default CustomAlertService;
