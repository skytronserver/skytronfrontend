import { getAxiosInstance } from './axiosInstance';
const create_settings_hp_freq = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_hp_freq/", data);
};
const filter_settings_hp_freq = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_hp_freq/", data);
};

//OTA Settings
const create_settings_ota = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/ota/create/", data);
};
const filter_settings_ota = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/ota/filter/", data);
};

//Vehicle Type
const create_settings_VehicleCategory = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_VehicleCategory/", data);
};
const filter_settings_VehicleCategory = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_VehicleCategory/", data);
};

//Vehicle Category Code
const create_settings_VehicleCategoryCode = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/vehicle_category_code/create/", data);
};
const edit_settings_VehicleCategoryCode = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/vehicle_category_code/edit/", data);
};
const list_settings_VehicleCategoryCode = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/vehicle_category_code/list/", data);
};
const pub_list_VehicleCategoryCode = () => {
  const http = getAxiosInstance();
  return http.get("/api/pub/Settings/vehicle_category_code/");
};

//State
const create_settings_State = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_State/", data);
};
const filter_settings_State = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_State/", data);
};

//District
const create_settings_District = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_District/", data);
};
const filter_settings_District = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_District/", data);
};

//Firmware
const create_settings_firmware = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_firmware/", data);
};
const filter_settings_firmware = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_firmware/", data);
};

//Ip Setting
const create_settings_ip = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_ip/", data);
};
const filter_settings_ip = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_ip/", data);
};

//Download Files
const file_Download = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/download/", data, { responseType: 'blob' });
};

// Database Archive & Restore
const archiveDatabase = () => {
  const http = getAxiosInstance();
  return http.get("/api/Settings/archive_database/", {
    responseType: 'blob',
  });
};

const restoreDatabase = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/restore_database/", data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
const archiveGpsData = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/gpsdata/archive/", data);
};
const getGpsArchivesList = () => {
  const http = getAxiosInstance();
  return http.get("/api/gpsdata/archives/list/");
};
const restoreGpsArchive = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/gpsdata/restore/", data);
};

// Notification Preferences (global delivery mode for all users)
const updateNotificationPreferences = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/user/notification-preferences/", data);
};
const fetchNotificationPreferences = () => {
  const http = getAxiosInstance();
  return http.get("/api/user/notification-preferences/");
};

// Send Command
const send_command = (data) => {
  const http = getAxiosInstance();
  return http.post(`${process.env.REACT_APP_BASE_URL}api/mqtt/send_command/`, data);
};

// Permit Conditions
const create_permit_condition = (data) => {
  const http = getAxiosInstance();
  return http.post('/school/api/enforcement/permit-conditions/', data);
};
const filter_permit_conditions = (data) => {
  const http = getAxiosInstance();
  return http.get('/school/api/enforcement/permit-conditions/list/', { params: data });
};
const update_permit_condition_status = (id, data) => {
  const http = getAxiosInstance();
  return http.post(`/school/api/enforcement/permit-conditions/${id}/update/`, data);
};

// Violation Report
const filter_violation_report = (data) => {
  const http = getAxiosInstance();
  return http.get('/school/api/enforcement/violations/', { params: data });
};

const SettingService = {
  create_settings_hp_freq,
  filter_settings_hp_freq,
  create_settings_ota,
  filter_settings_ota,
  create_settings_VehicleCategory,
  filter_settings_VehicleCategory,
  create_settings_VehicleCategoryCode,
  edit_settings_VehicleCategoryCode,
  list_settings_VehicleCategoryCode,
  pub_list_VehicleCategoryCode,
  create_settings_State,
  filter_settings_State,
  create_settings_District,
  filter_settings_District,
  create_settings_firmware,
  filter_settings_firmware,
  create_settings_ip,
  filter_settings_ip,
  file_Download,
  archiveDatabase,
  restoreDatabase,
  archiveGpsData,
  getGpsArchivesList,
  restoreGpsArchive,
  updateNotificationPreferences,
  fetchNotificationPreferences,
  send_command,
  create_permit_condition,
  filter_permit_conditions,
  update_permit_condition_status,
  filter_violation_report,
};

export default SettingService;
