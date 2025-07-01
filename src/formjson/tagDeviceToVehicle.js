import * as Yup from "yup";
let deviceList = [];
let ownerList = [];
let categoryList = [];
export const taggingInitials = {
  device: "",
  vehicle_owner: "",
  district_code: "",
  vehicle_number: "",
  engine_no: "",
  chassis_no: "",
  vehicle_make: "",
  vehicle_model: "",
  category: "",
  rcFile: null,
};

const demoDistrictCodes = [
  { value: "AS01", label: "AS01" },
  { value: "AS02", label: "AS02" },
  { value: "AS03", label: "AS03" },
  { value: "AS04", label: "AS04" },
];

export const taggingFields = {
  device: {
    name: "device",
    type: "select",
    label: "tagDeviceForm.fields.deviceImei",
    validation: Yup.string().required("tagDeviceForm.validation.deviceRequired"),
    options: deviceList,
  },
  vehicle_owner: {
    name: "vehicle_owner",
    type: "tel",
    label: "tagDeviceForm.fields.ownerMobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, 'tagDeviceForm.validation.mobileFormat')
      .required('tagDeviceForm.validation.mobileRequired'),
  },
  district_code: {
    name: "district_code",
    type: "select",
    label: "District Code",
    validation: Yup.string().required("District code is required"),
    options: demoDistrictCodes,
  },
  vehicle_number: {
    name: "vehicle_number",
    type: "text",
    label: "Vehicle Number",
    validation: Yup.string()
      .matches(/^[A-Z0-9]+$/, "Only alphanumeric characters allowed, no spaces or special characters.")
      .required("Vehicle number is required"),
  },
  engine_no: {
    name: "engine_no",
    type: "text",
    label: "tagDeviceForm.fields.engineNo",
    validation: Yup.string().required("tagDeviceForm.validation.engineNoRequired"),
  },
  chassis_no: {
    name: "chassis_no",
    type: "text",
    label: "tagDeviceForm.fields.chassisNo",
    validation: Yup.string().required("tagDeviceForm.validation.chassisNoRequired"),
  },
  vehicle_make: {
    name: "vehicle_make",
    type: "text",
    label: "tagDeviceForm.fields.vehicleMake",
    validation: Yup.string().required("tagDeviceForm.validation.vehicleMakeRequired"),
  },
  vehicle_model: {
    name: "vehicle_model",
    type: "text",
    label: "tagDeviceForm.fields.vehicleModel",
    validation: Yup.string().required("tagDeviceForm.validation.vehicleModelRequired"),
  },
  category: {
    name: "category",
    type: "select",
    label: "tagDeviceForm.fields.vehicleCategory",
    validation: Yup.string().required("tagDeviceForm.validation.vehicleCategoryRequired"),
    options: categoryList,
  },
  rcFile: {
    name: "rcFile",
    type: "file",
    label: "tagDeviceForm.fields.registrationCertificate",
    validation: Yup.mixed().required("tagDeviceForm.validation.registrationCertificateRequired"),
  },
};
