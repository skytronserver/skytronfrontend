import * as Yup from "yup";
let stateList=[];
let modelList=[];
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
    validation: Yup.string()
      .required("Tracking IP 1 is required")
      .matches(
        /^(\d{1,3}\.){3}\d{1,3}$/,
        "Please enter a valid IP address (e.g., 192.168.1.1)"
      ),
  },
  ip_tracking2: {
    name: "ip_tracking2",
    type: "text",
    label: "Tracking IP 2",
    validation: Yup.string().matches(
      /^(\d{1,3}\.){3}\d{1,3}$/,
      "Please enter a valid IP address (e.g., 192.168.1.1)"
    ),
  },
  ip_sos: {
    name: "ip_sos",
    type: "text",
    label: "SOS IP",
    validation: Yup.string()
      .required("SOS IP is required")
      .matches(
        /^(\d{1,3}\.){3}\d{1,3}$/,
        "Please enter a valid IP address (e.g., 192.168.1.1)"
      ),
  },
  port_tracking: {
    name: "port_tracking",
    type: "text",
    label: "Tracking Port 1st",
    validation: Yup.number()
      .required("Tracking Port 1st is required")
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535")
      .integer("Port must be a whole number"),
  },
  port_tracking2: {
    name: "port_tracking2",
    type: "text",
    label: "Tracking Port 2nd",
    validation: Yup.number()
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535")
      .integer("Port must be a whole number"),
  },
  port_sos: {
    name: "port_sos",
    type: "text",
    label: "SOS Port",
    validation: Yup.number()
      .required("SOS Port is required")
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535")
      .integer("Port must be a whole number"),
  },
  sms_tracking: {
    name: "sms_tracking",
    type: "text",
    label: "SMS Tracking Port",
    validation: Yup.number()
      .required("SMS Tracking Port is required")
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535")
      .integer("Port must be a whole number"),
  },
  sms_tracking2: {
    name: "sms_tracking2",
    type: "text",
    label: "SMS Tracking Port 2",
    validation: Yup.number()
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535")
      .integer("Port must be a whole number"),
  },
  sms_sos: {
    name: "sms_sos",
    type: "text",
    label: "SOS SMS Port",
    validation: Yup.number()
      .required("SOS SMS Port is required")
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535")
      .integer("Port must be a whole number"),
  },
};
