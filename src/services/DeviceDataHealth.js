import { getAxiosInstance } from './axiosInstance';

const getFormats = async () => {
  const axiosInstance = getAxiosInstance();
  return await axiosInstance.get('https://api.gromed.in/api/device-data-health/formats/');
};

const getHealthData = async (imei, protocolFormat, lookbackDays) => {
  const axiosInstance = getAxiosInstance();
  return await axiosInstance.get('https://api.gromed.in/api/device-data-health/lookup/', {
    params: {
      imei: imei,
      protocol_format: protocolFormat,
      lookback_days: lookbackDays,
    },
  });
};

const DeviceDataHealthService = {
  getFormats,
  getHealthData,
};

export default DeviceDataHealthService;
