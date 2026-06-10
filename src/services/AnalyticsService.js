import { getAxiosInstance } from './axiosInstance';

// Fetch trip analytics data
const getTripAnalytics = async (params) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.get('/school/api/analytics/trips/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trip analytics:', error);
    throw error;
  }
};

// Fetch driving pattern alerts
const getDrivingAlerts = async (params) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.get('/school/api/analytics/driving-pattern-alerts/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching driving alerts:', error);
    throw error;
  }
};

// Fetch vehicle alert summary
const getVehicleAlertSummary = async (params) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.get('/school/api/analytics/vehicle-alert-summary/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle alert summary:', error);
    throw error;
  }
};

const AnalyticsService = {
  getTripAnalytics,
  getDrivingAlerts,
  getVehicleAlertSummary,
};

export default AnalyticsService;
