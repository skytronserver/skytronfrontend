import { getAxiosInstance } from './axiosInstance';

const GEO_TOGGLE_STORAGE_KEY = 'use_new_geocoding_api';

const resolveUseNewGeocoding = () => {
  try {
    if (typeof window !== 'undefined' && window?.localStorage) {
      const stored = window.localStorage.getItem(GEO_TOGGLE_STORAGE_KEY);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    }
  } catch (e) {
    // ignore
  }

  return String(process.env.REACT_APP_USE_NEW_GEOCODING_API || '').toLowerCase() === 'true';
};

export const setUseNewGeocodingApi = (enabled) => {
  try {
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.setItem(GEO_TOGGLE_STORAGE_KEY, enabled ? 'true' : 'false');
    }
  } catch (e) {
    // ignore
  }
};

export const getUseNewGeocodingApi = () => resolveUseNewGeocoding();

const getGeocode = (query, limit = 5) => {
  const http = getAxiosInstance();
  const q = String(query || '').trim();
  if (!q) {
    return Promise.resolve({ data: { results: [] } });
  }

  if (resolveUseNewGeocoding()) {
    return http.get('https://map-geocoding.gromed.in/search', {
      params: {
        format: 'jsonv2',
        q,
        limit,
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
      },
    });
  }

  return http.get('https://api.gromed.in/api/geocode/', {
    params: {
      q,
    },
  });
};
const getLiveTracking = (data) => {
  const http = getAxiosInstance();
  return http.get("/api/gps-data-map/", {
    params: {
      imei: data.imei,
      regno: data.regno
    }
  });
};
const getLiveTracking_data = (data, config = {}) => {
  const http = getAxiosInstance();
  return http.get("/api/gps_track_data_api", {
    params: {
      imei: data.imei,
      regno: data.regno,
      owner: data.owner,
      poi: data.poi,
      roads: data.roads,
      polygon: data.polygon,
      category: data.category,
      make: data.make,
      dto_code: data.dto_code,

      // Optional POI-based filtering parameters to match
      // https://api.gromed.in/api/gps_track_data_api/?poi_id=1631&in_range=False&poi_as_polygon=True
      poi_id: data.poi_id,
      in_range: data.in_range,
      poi_as_polygon: data.poi_as_polygon,
    },
    ...config,
  });
};



const getSOSDataAdmin = () => {
  const http = getAxiosInstance();
  return http.get("/api/emergency-call-listener-admin/");
};
const getSOSDataTeamLead = () => {
  const http = getAxiosInstance();
  return http.get("/api/emergency-call-listener-team-lead/");
}
const getSOSDataExe = () => {
  const http = getAxiosInstance();
  return http.get("/api/emergency-call-listener-deskexecutive/");
}

const getHistoryPlayback = (data) => {
  const http = getAxiosInstance();
  return http.get("/api/gps_history_map/", {
    params: {
      start_datetime: data.fromDate,
      end_datetime: data.toDate,
      vehicle_registration_number: data.vehicleNo,
    }
  });
}
const getVehicleList = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/get_live_vehicle_no/", data);
}
const getRouteFixing = (device_id) => {
  const http = getAxiosInstance();
  const data = { "device_id": device_id }
  return http.post("/api/getRoute/", data);

}

const getEmergencyUserLocations = (params = {}) => {
  const http = getAxiosInstance();
  return http.get("/api/emuser-locations/", {
    params,
  });
};

// status 
const getStatus = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/DEx/getLiveCallList/", data);
}




// 

const broadCast = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/DEx/broadcast/", data);
}

const closeCase = (data) => {
  const http = getAxiosInstance();
  return http.post("api/EM/DEx/closeCase/", data);
}

const getEMmessage = (data) => {
  const http = getAxiosInstance();
  return http.post("api/EM/DEx/rcvMsg/", data);
}
const sendEMmessage = (data) => {
  const http = getAxiosInstance();
  return http.post("api/EM/DEx/sendMsg/", data);
}
const getEMCallloc = (data) => {
  const http = getAxiosInstance();
  return http.post("api/EM/DEx/getCallAllLoc/", data);
}
const getEmMedia = (data) => {
  const http = getAxiosInstance();
  return http.post("api/EM/DEx/get-media/", data);
}


const getPendingSOSCall = () => {
  const http = getAxiosInstance();
  return http.post("/api/EM/DEx/getPendingCallList/");
}
const getAllSOSCall = () => {
  const http = getAxiosInstance();
  return http.post("/api/EM/DEx/getLiveCallList/");
}
const getCallDetails = (id) => {
  const http = getAxiosInstance();
  return http.get(`/api/emergency-call-details/${id}/`)
}
const broadCastHelp = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/broadcast-help/", data);
}
const updateSOSCall = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/submit_status/", data);
}

const addRoute = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/saveRoute/", data);
}
const getRoute = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/get_routePath/", data);
}
const delRoute = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/delRoute/", data);
}
const acceptEMCall = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/DEx/replyCall/", data);
}

const getGpsDataLog = (search = '') => {
  const http = getAxiosInstance();
  return http.get("/api/gps-data-log-table/", {
    params: search
  });
};
const getEmergencyDataLogs = (search = '') => {
  const http = getAxiosInstance();
  return http.get("/api/gps-em-data-log-table/", {
    params: search
  });
};

const getApiDataLog = (params = {}, config = {}) => {
  const http = getAxiosInstance();

  // Build query string to match the exact format
  let queryString = '?';

  // Add 'q' parameter if provided (search term)
  if (params.q) {
    queryString += `q=${encodeURIComponent(params.q)}&`;
  }

  // Add required pagination parameters
  queryString += `page=${params.page || 1}&per_page=${params.per_page || 10}`;

  // Make POST request with the exact URL format
  console.log(`Sending request to: /api/apiLog/${queryString}`);
  return http.post(`/api/apiLog/${queryString}`, {}, { ...config });
};

const getIncidentData = (data) => {
  const http = getAxiosInstance();
  // Using absolute URL as it's an external system, but assuming the token from axiosInstance is valid or headers are handled.
  // If the base URL is different and requires a different token/auth, this might need adjustment.
  // For now, using the provided URL in the user request.
  return http.post("https://api.gromed.in/api/incident/filter/", data);
};

const getCellLocation = (data) => {
  const http = getAxiosInstance();
  return http.post("https://api.gromed.in/api/cell_location/", data);
};

const getReverseGeocode = (lat, lon) => {
  const http = getAxiosInstance();
  const safeLat = Number(lat);
  const safeLon = Number(lon);

  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLon)) {
    return Promise.resolve({ data: {} });
  }

  if (resolveUseNewGeocoding()) {
    return http.get('https://map-geocoding.gromed.in/reverse', {
      params: {
        format: 'jsonv2',
        lat: safeLat,
        lon: safeLon,
        zoom: 18,
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
      },
    }).then((resp) => {
      const payload = resp?.data;
      const addressDetails = payload?.address && typeof payload.address === 'object' ? payload.address : {};

      const city =
        addressDetails.city ||
        addressDetails.town ||
        addressDetails.village ||
        addressDetails.municipality ||
        addressDetails.county ||
        addressDetails.state_district ||
        '';

      const area =
        addressDetails.suburb ||
        addressDetails.neighbourhood ||
        addressDetails.quarter ||
        addressDetails.hamlet ||
        '';

      const normalized = {
        address: payload?.display_name || '',
        city,
        area,
        pincode: addressDetails.postcode || '',
        state: addressDetails.state || '',
        country: addressDetails.country || '',
        lat: payload?.lat ?? safeLat,
        lon: payload?.lon ?? safeLon,
      };

      return { ...resp, data: normalized };
    });
  }

  return http.get('https://api.gromed.in/api/reverse_geocode/', {
    params: {
      lat: safeLat,
      lon: safeLon,
    },
  });
};

const HomePageService = {
  getLiveTracking,
  getLiveTracking_data,
  getSOSDataAdmin,
  getHistoryPlayback,
  getSOSDataTeamLead,
  getSOSDataExe,
  getVehicleList,
  getRouteFixing,
  getAllSOSCall,
  getCallDetails,
  broadCastHelp,
  updateSOSCall,
  addRoute,
  getRoute,
  delRoute,
  broadCast,
  closeCase,
  getEMmessage,
  sendEMmessage,
  getEMCallloc,
  acceptEMCall,
  getPendingSOSCall,
  getGpsDataLog,
  getEmergencyDataLogs,
  getApiDataLog,
  getEmMedia,
  getStatus,
  getEmergencyUserLocations,
  getIncidentData,
  getCellLocation,
  getGeocode,
  getReverseGeocode,
};

export default HomePageService;
