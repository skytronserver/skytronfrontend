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

//Vehicle Category
const create_settings_VehicleCategory = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/create_settings_VehicleCategory/", data);
};
const filter_settings_VehicleCategory = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/Settings/filter_settings_VehicleCategory/", data);
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
  return http.post("https://api.gromed.in/api/mqtt/send_command/", data);
};

const SettingService = {
  create_settings_hp_freq,
  filter_settings_hp_freq,
  create_settings_ota,
  filter_settings_ota,
  create_settings_VehicleCategory,
  filter_settings_VehicleCategory,
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
  send_command
};

export default SettingService;
