import { getAxiosInstance } from './axiosInstance';

const getEligibleDevices = (params = {}) => {
  const http = getAxiosInstance();
  return http.get('/api/device-renewal/eligible/', { params });
};

const submitRenewal = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/device-renewal/submit/', data);
};

const getRenewalHistory = (params = {}) => {
  const http = getAxiosInstance();
  return http.get('/api/device-renewal/history/', { params });
};

const DeviceRenewalService = {
  getEligibleDevices,
  submitRenewal,
  getRenewalHistory,
};

export default DeviceRenewalService;
