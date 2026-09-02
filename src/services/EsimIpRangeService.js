import { getAxiosInstance } from './axiosInstance';

const addIpRange = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/esim-provider/ip-range/add/', data, {
    headers: {
      'Content-type': 'multipart/form-data',
    }
  });
};

const listIpRanges = () => {
  const http = getAxiosInstance();
  return http.get('/api/esim-provider/ip-range/list/');
};

const updateIpRange = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/esim-provider/ip-range/update/', data, {
    headers: {
      'Content-type': 'multipart/form-data',
    }
  });
};

const deleteIpRange = (id) => {
  const http = getAxiosInstance();
  return http.post('/api/esim-provider/ip-range/delete/', { id });
};

const EsimIpRangeService = {
  addIpRange,
  listIpRanges,
  updateIpRange,
  deleteIpRange,
};

export default EsimIpRangeService;
