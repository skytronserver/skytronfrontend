import { getAxiosInstance } from './axiosInstance';
const getLiveTracking = (data) => {
  const http = getAxiosInstance();
  return http.get("/api/gps-data-map/", {
    params: {
      imei: data.imei,
      regno: data.regno
    }
  });
};
const getLiveTracking_data = (data) => {
  const http = getAxiosInstance();
  return http.get("/api/gps_track_data_api", {
    params: {
      imei: data.imei,
      regno: data.regno
    }
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
    params: { search }
  });
};
const getEmergencyDataLogs = (search = '') => {
  const http = getAxiosInstance();
  return http.get("/api/gps-em-data-log-table/", {
    params: { search }
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
};

export default HomePageService;
