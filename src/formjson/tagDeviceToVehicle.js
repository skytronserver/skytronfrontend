import * as Yup from "yup";
let deviceList = [];
let ownerList = [];
let categoryList = [];
export const taggingInitials = {
  device: "",
  vehicle_owner: "",
  vehicle_reg_no: "",
  engine_no: "",
  chassis_no: "",
  vehicle_make: "",
  vehicle_model: "",
  category: "",
  rcFile: null,
};
export const taggingFields = {
  device: {
    name: "device",
    type: "select",
    label: "Device IMEI No",
    validation: Yup.string().required("Device is required"),
    options: deviceList,
  },
  vehicle_owner: {
    name: "vehicle_owner",
    type: "tel",
    label: "Vehicle Owner Mobile Number",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),

  },
  vehicle_reg_no: {
    name: "vehicle_reg_no",
    type: "text",
    label: "Vehicle Registration No.",
    validation: Yup.string().required("Vehicle Registration No. is required"),
  },
  engine_no: {
    name: "engine_no",
    type: "text",
    label: "Engine No",
    validation: Yup.string().required("Engine No. is required"),
  },
  chassis_no: {
    name: "chassis_no",
    type: "text",
    label: "Chassis No.",
    validation: Yup.string().required("Chassis No. is required"),
  },
  vehicle_make: {
    name: "vehicle_make",
    type: "text",
    label: "Vehicle Make",
    validation: Yup.string().required("Vehicle Make is required"),
  },
  vehicle_model: {
    name: "vehicle_model",
    type: "text",
    label: "Vehicle Model",
    validation: Yup.string().required("Vehicle Model is required"),
  },
  category: {
    name: "category",
    type: "select",
    label: "Vehicle Category",
    validation: Yup.string().required("Vehicle Category is required"),
    options: categoryList,
  },
  rcFile: {
    name: "rcFile",
    type: "file",
    label: "Registration Certificate",
    validation: Yup.mixed().required("Registration Certificate is required"),
  },
};
