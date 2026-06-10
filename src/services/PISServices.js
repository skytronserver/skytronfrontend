import { getAxiosInstance } from './axiosInstance';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Mock data store using sessionStorage (used for routes & schedules only)
const mockDataStore = {
  get: (key) => JSON.parse(sessionStorage.getItem(key) || '[]'),
  set: (key, data) => sessionStorage.setItem(key, JSON.stringify(data)),
};

// Initialize mock data if empty (routes & schedules only)
if (!sessionStorage.getItem('mockBusRoutes')) {
  mockDataStore.set('mockBusRoutes', []);
}
if (!sessionStorage.getItem('mockBusSchedules')) {
  mockDataStore.set('mockBusSchedules', []);
}

const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const PISService = {
  // ================= BUS STOPS (Real API) =================
  createBusStop: async (stopData) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/bus-stops/`, stopData);
    return { success: true, data: response.data, message: "Bus stop created successfully" };
  },

  // GET single bus stop
  getBusStop: async (id) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/bus-stops/${id}/`);
    return { success: true, data: response.data };
  },

  updateBusStop: async (id, stopData) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/bus-stops/${id}/update/`, stopData);
    return { success: true, data: response.data, message: "Bus stop updated successfully" };
  },

  toggleBusStop: async (id) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/bus-stops/${id}/toggle/`);
    return { success: true, data: response.data, message: "Bus stop status toggled" };
  },

  getBusStops: async (filters = {}) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/bus-stops/`, { params: filters });
    const raw = response.data;
    console.log('[getBusStops] raw response:', raw); // 🔍 debug — check in Network > Response or Console
    const data = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.bus_stops)
            ? raw.bus_stops
            : [];
    return { success: true, data };
  },

  getActiveBusStops: async () => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/bus-stops/`, { params: { status: 'active' } });
    const raw = response.data;
    const data = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.bus_stops)
            ? raw.bus_stops
            : [];
    return { success: true, data };
  },

  // ================= BUS ROUTES (Real API) =================
  createBusRoute: async (routeData) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/routes/`, routeData);
    return { success: true, data: response.data, message: "Bus route created successfully" };
  },

  updateBusRoute: async (id, routeData) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/routes/${id}/update/`, routeData);
    return { success: true, data: response.data, message: "Bus route updated successfully" };
  },

  toggleBusRoute: async (id) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/routes/${id}/toggle/`);
    return { success: true, data: response.data, message: "Bus route status toggled" };
  },

  // GET single bus route
  getBusRoute: async (id) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/routes/${id}/`);
    return { success: true, data: response.data };
  },

  getBusRoutes: async (filters = {}) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/routes/`, { params: filters });
    const raw = response.data;
    const data = Array.isArray(raw) ? raw
      : Array.isArray(raw?.results) ? raw.results
        : Array.isArray(raw?.data) ? raw.data : [];
    return { success: true, data };
  },

  getActiveBusRoutes: async () => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/routes/`, { params: { status: 'active' } });
    const raw = response.data;
    const data = Array.isArray(raw) ? raw
      : Array.isArray(raw?.results) ? raw.results
        : Array.isArray(raw?.data) ? raw.data : [];
    return { success: true, data };
  },


  // ================= BUS SCHEDULES =================
  createBusSchedule: async (scheduleData) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/schedules/`, scheduleData);
    return { success: true, data: response.data, message: "Bus schedule created successfully" };
  },

  // GET single bus schedule
  getBusSchedule: async (id) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/schedules/${id}/`);
    return { success: true, data: response.data };
  },

  getBusSchedules: async (filters = {}) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/schedules/`, { params: filters });
    const raw = response.data;
    const data = Array.isArray(raw) ? raw
      : Array.isArray(raw?.results) ? raw.results
        : Array.isArray(raw?.data) ? raw.data : [];
    return { success: true, data };
  },

  // ================= OTHER / UTILITIES =================
  getAvailableBuses: async () => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/pis/available-buses/`);
    const raw = response.data;
    const data = Array.isArray(raw) ? raw
      : Array.isArray(raw?.results) ? raw.results
        : Array.isArray(raw?.data) ? raw.data : [];
    return { success: true, data };
  },

  updateTripStatus: async (scheduleId, status) => {
    const http = getAxiosInstance();
    const response = await http.post(`${BASE_URL}school/api/pis/schedules/${scheduleId}/update-status/`, { status });
    return { success: true, data: response.data, message: `Trip status updated to ${status}` };
  },

  getLiveTripStatus: async (scheduleId) => {
    await simulateDelay();
    const schedules = mockDataStore.get('mockBusSchedules');
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return { success: false, message: "Schedule not found" };

    // Mock live data
    return {
      success: true,
      data: {
        schedule,
        liveLocation: { lat: 18.5204, lon: 73.8567 }, // Mock coordinates
        timeToNextStop: 15, // mins
        etaDestination: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hr from now
      }
    };
  },

  // ================= ANALYTICS =================
  getPISSummary: async (params) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/analytics/pis-summary/`, { params });
    return response.data;
  },

  getResourcePerformance: async (params) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/analytics/resource-performance/`, { params });
    return response.data;
  },

  getOperationalAnalytics: async (params) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/analytics/operational/`, { params });
    return response.data;
  },

  getComparativeAnalysis: async (params) => {
    const http = getAxiosInstance();
    const response = await http.get(`${BASE_URL}school/api/analytics/comparative-analysis/`, { params });
    return response.data;
  }
};

export default PISService;
