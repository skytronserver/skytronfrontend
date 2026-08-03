import * as Yup from "yup";

export const m2mApiConfigInitials = {
  apiUrl: "",
  token: "",
  sampleImei: "",
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
  sampleImei: {
    name: "sampleImei",
    type: "text",
    label: "Sample IMEI",
    validation: Yup.string().required("Sample IMEI is required"),
  }
};
