import * as Yup from "yup";
import DeviceModelServices from "../services/DeviceModelServices";
import SettingService from "../services/SettingService";
const retriveStateList = async () => {
  try {
    const response = await SettingService.filter_settings_State();
    const list=response.data.map(device => ({
      value: device.id,
      label: device.state,
    })); 
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
     console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
const retriveModelList = async () => {
  try {
    const response = await DeviceModelServices.getAllModels();
    const list = response.data.map((device) => ({
      value: device.id,
      label: device.model_name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};

const modelList = await retriveModelList();
const stateList=await retriveStateList();
export const ipSettingInitials = {
    state:"",
    devicemodel:"",
    ip_tracking:"",
    ip_tracking2:"",
    ip_sos:"",
    port_tracking:"",
    port_tracking2:"",
    port_sos:"",
    sms_tracking:"",
    sms_tracking2:"",
    sms_sos:"",
};
export const ipSettingFormFields = {
    state: {
        name: "state",
        type: "select",
        label: "State",
        validation: Yup.string().required("State is required"),
        options: stateList,
      },
  devicemodel: {
    name: "devicemodel",
    type: "select",
    label: "Device Model",
    validation: Yup.string().required("Device model is required"),
    options: modelList,
  },
  ip_tracking: {
    name: "ip_tracking",
    type: "text",
    label: "Tracking IP 1",
    validation: Yup.string().required("Tracking IP 1 is required"),
  },
  ip_tracking2: {
    name: "ip_tracking2",
    type: "text",
    label: "Tracking IP 2",
  },
  ip_sos: {
    name: "ip_sos",
    type: "text",
    label: "SOS IP ",
    validation: Yup.string().required("SOS IP  is required"),
  },
  port_tracking: {
    name: "port_tracking",
    type: "text",
    label: "Tracking Port 1st",
    validation: Yup.string().required("Tracking Port 1st  is required"),
  },
  port_tracking2: {
    name: "port_tracking2",
    type: "text",
    label: "Tracking Port 2nd",
  },
  port_sos: {
    name: "port_sos",
    type: "text",
    label: "SOS Port",
    validation: Yup.string().required("SOS Port is required"),
  },
  sms_tracking: {
    name: "sms_tracking",
    type: "text",
    label: "SMS Tracking Port",
    validation: Yup.string().required("SMS Tracking Port is required"),
  },
  sms_tracking2: {
    name: "sms_tracking2",
    type: "text",
    label: "SMS Tracking Port 2",
  },
  sms_sos: {
    name: "sms_sos",
    type: "text",
    label: "SOS SMS Port ",
    validation: Yup.string().required("SMS Port  is required"),
  },
};
