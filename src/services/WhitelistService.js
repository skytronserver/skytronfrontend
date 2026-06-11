import { getAxiosInstance } from './axiosInstance';

const getHttp = () => {
  return getAxiosInstance();
};

const WhitelistService = {
  // 1. Create Whitelist Request
  // POST /api/whitelist/request/create/
  createRequest: (data) => {
    return getHttp().post('/api/whitelist/request/create/', data);
  },

  // 2. List Own Whitelist Requests
  // GET /api/whitelist/request/list/
  listOwnRequests: (params) => {
    return getHttp().get('/api/whitelist/request/list/', { params });
  },

  // 3. List Requests - eSIM View
  // GET /api/whitelist/request/esim/all/
  listEsimRequests: (params) => {
    return getHttp().get('/api/whitelist/request/esim/all/', { params });
  },

  // 4. Approve Whitelist Request
  // POST /api/whitelist/request/{id}/approve/
  approveRequest: (id, data) => {
    return getHttp().post(`/api/whitelist/request/${id}/approve/`, data);
  },

  // 5. Deny Whitelist Request
  // POST /api/whitelist/request/{id}/deny/
  denyRequest: (id, data) => {
    return getHttp().post(`/api/whitelist/request/${id}/deny/`, data);
  },

  // 6. List Active Whitelist
  // GET /api/whitelist/active/list/
  listActiveWhitelist: (params) => {
    return getHttp().get('/api/whitelist/active/list/', { params });
  },

  // 7. Update Device KYC Status
  // POST /api/whitelist/device/{id}/kyc/update/
  updateDeviceKyc: (id, data) => {
    return getHttp().post(`/api/whitelist/device/${id}/kyc/update/`, data);
  },

  // 8. Device Dashboard
  // GET /api/whitelist/device/dashboard/
  deviceDashboard: (params) => {
    return getHttp().get('/api/whitelist/device/dashboard/', { params });
  },

  // 9. Device Detail
  // GET /api/whitelist/device/{id}/detail/
  deviceDetail: (id) => {
    return getHttp().get(`/api/whitelist/device/${id}/detail/`);
  }
};

export default WhitelistService;
