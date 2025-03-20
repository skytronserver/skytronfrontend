import * as Yup from "yup";
let deviceList = [];
let ownerList = [];
let categoryList = [];

// Add these constants at the top of the file
const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

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
    validation: Yup.string()
      .matches(/^\d{10}$/, 'Mobile Number must be a valid 10-digit number')
      .required('Mobile Number is required'),
  },
  vehicle_reg_no: {
    name: "vehicle_reg_no",
    type: "text",
    label: "Vehicle Registration No.",
    validation: Yup.string()
      .matches(
        /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
        'Enter valid vehicle registration number (e.g., MH12AB1234)'
      )
      .required("Vehicle Registration No. is required"),
  },
  engine_no: {
    name: "engine_no",
    type: "text",
    label: "Engine No",
    validation: Yup.string()
      .matches(
        /^[A-Z0-9]{6,17}$/,
        'Engine number must be 6-17 characters long and contain only uppercase letters and numbers'
      )
      .required("Engine No. is required"),
  },
  chassis_no: {
    name: "chassis_no",
    type: "text",
    label: "Chassis No.",
    validation: Yup.string()
      .matches(
        /^[A-HJ-NPR-Z0-9]{17}$/,
        'Chassis number must be exactly 17 characters (VIN format)'
      )
      .required("Chassis No. is required"),
  },
  vehicle_make: {
    name: "vehicle_make",
    type: "text",
    label: "Vehicle Make",
    validation: Yup.string()
      .min(2, 'Vehicle make must be at least 2 characters')
      .max(50, 'Vehicle make must not exceed 50 characters')
      .matches(/^[A-Za-z0-9\s-]+$/, 'Vehicle make can only contain letters, numbers, spaces and hyphens')
      .required("Vehicle Make is required"),
  },
  vehicle_model: {
    name: "vehicle_model",
    type: "text",
    label: "Vehicle Model",
    validation: Yup.string()
      .min(2, 'Vehicle model must be at least 2 characters')
      .max(50, 'Vehicle model must not exceed 50 characters')
      .matches(/^[A-Za-z0-9\s-]+$/, 'Vehicle model can only contain letters, numbers, spaces and hyphens')
      .required("Vehicle Model is required"),
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
    message: "Only JPG, PDF, PNG files are allowed and must be below 512KB.",
    validation: Yup.mixed()
      .required("Registration Certificate is required")
      .test(
        "fileSize",
        "Max size is 520KB and supported files are pdf/png/jpg",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "Max size is 520KB and supported files are pdf/png/jpg",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
};
