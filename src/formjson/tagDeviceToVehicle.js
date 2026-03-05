import * as Yup from "yup";
let deviceList = [];
let ownerList = [];
let categoryList = [];

export const taggingInitials = {
  vehicle_type: "old",
  device: "",
  vehicle_owner: "",
  state_code: "",
  district_code: "",
  district: "",
  vehicle_number: "",
  owner_id: "",
  engine_no: "",
  chassis_no: "",
  vehicle_make: "",
  vehicle_model: "",
  category: "",
  rcFile: null,
};

export const taggingFields = {
  vehicle_type: {
    name: "vehicle_type",
    type: "select",
    label: "Vehicle Type",
    validation: Yup.string().oneOf(["old", "new"]).required("Vehicle Type is required"),
    options: [
      { label: "Old Vehicle", value: "old" },
      { label: "New Vehicle", value: "new" },
    ],
  },
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
  state_code: {
    name: "state_code",
    type: "text",
    label: "State Code",
    validation: Yup.string(),
    disabled: true,
  },
  district_code: {
    name: "district_code",
    type: "select",
    label: "tagDeviceForm.fields.districtCode",
    validation: Yup.string().required("tagDeviceForm.validation.districtCodeRequired"),
    options: [],
  },
  district: {
    name: "district",
    type: "select",
    label: "tagDeviceForm.fields.district",
    validation: Yup.string().required("tagDeviceForm.validation.districtRequired"),
    options: [],
  },
  vehicle_number: {
    name: "vehicle_number",
    type: "text",
    label: "tagDeviceForm.fields.vehicleNumber",
    validation: Yup.string().when("vehicle_type", {
      is: "old",
      then: (schema) =>
        schema
          .matches(/^[A-Z0-9]+$/, "tagDeviceForm.validation.vehicleNumberFormat")
          .required("tagDeviceForm.validation.vehicleNumberRequired"),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  owner_id: {
    name: "owner_id",
    type: "text",
    label: "Owner ID",
    disabled: true,
    validation: Yup.string().when("vehicle_type", {
      is: "new",
      then: (schema) => schema.required("Owner ID is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
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
 