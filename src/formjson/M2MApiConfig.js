import * as Yup from "yup";

export const m2mApiConfigInitials = {
  apiUrl: "",
  token: "",
  sampleIccid: "",
  deviceIpRange: "",
};

export const m2mApiConfigField = {
  apiUrl: {
    name: "apiUrl",
    type: "text",
    label: "API URL",
    validation: Yup.string().url("Must be a valid URL").required("API URL is required"),
  },
  token: {
    name: "token",
    type: "text",
    label: "Token",
    validation: Yup.string().required("Token is required"),
  },
  sampleIccid: {
    name: "sampleIccid",
    type: "text",
    label: "Sample ICCID",
    validation: Yup.string()
      .required("Sample ICCID is required"),
  },
  deviceIpRange: {
    name: "deviceIpRange",
    type: "text",
    label: "Device IP Range",
    validation: Yup.string().required("Device IP Range is required"),
  },
};
