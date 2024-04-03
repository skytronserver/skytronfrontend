import http from "./http-common";
//HP Frequency
const create_settings_hp_freq = (data) => {
  return http.post("/api/Settings/create_settings_hp_freq/", data);
};
const filter_settings_hp_freq = (data) => {
  return http.post("/api/Settings/filter_settings_hp_freq/", data);
};

//Vehicle Category
const create_settings_VehicleCategory = (data) => {
  return http.post("/api/Settings/create_settings_VehicleCategory/", data);
};
const filter_settings_VehicleCategory = (data) => {
  return http.post("/api/Settings/filter_settings_VehicleCategory/", data);
};

//State
const create_settings_State = (data) => {
  return http.post("/api/Settings/create_settings_State/", data);
};
const filter_settings_State = (data) => {
  return http.post("/api/Settings/filter_settings_State/", data);
};

//District
const create_settings_District = (data) => {
  return http.post("/api/Settings/create_settings_District/", data);
};
const filter_settings_District = (data) => {
  return http.post("/api/Settings/filter_settings_District/", data);
};

//Firmware
const create_settings_firmware = (data) => {
  return http.post("/api/Settings/create_settings_firmware/", data);
};
const filter_settings_firmware = (data) => {
  return http.post("/api/Settings/filter_settings_firmware/", data);
};

//Ip Setting
const create_settings_ip = (data) => {
  return http.post("/api/Settings/create_settings_ip/", data);
};
const filter_settings_ip = (data) => {
  return http.post("/api/Settings/filter_settings_ip/", data);
};

const SettingService = {
    create_settings_hp_freq,
    filter_settings_hp_freq,
    create_settings_VehicleCategory,
    filter_settings_VehicleCategory,
    create_settings_State,
    filter_settings_State,
    create_settings_District,
    filter_settings_District,
    create_settings_firmware,
    filter_settings_firmware,
    create_settings_ip,
    filter_settings_ip
};

export default SettingService;
