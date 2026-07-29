import * as Yup from "yup";
import { goldMobileValidation } from "./validationHelpers";
let deviceList = [];
export let ownerList = [];
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
  category_code: "",
  with_trailer: "false",
  trailer_id: "",
  rcFile: null,
};



export const taggingFields = {
  vehicle_type: {
    name: "vehicle_type",
    type: "select",
    label: "Vehicle Type",
    required: true,
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
    required: true,
    validation: Yup.string().required("tagDeviceForm.validation.deviceRequired"),
    options: deviceList,
  },
  vehicle_owner: {
    name: "vehicle_owner",
    type: "tel",
    label: "tagDeviceForm.fields.ownerMobile",
    required: true,
    validation: goldMobileValidation("Owner Mobile"),
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
    required: true,
    validation: Yup.string().required("tagDeviceForm.validation.districtCodeRequired"),
    options: [],
  },
  district: {
    name: "district",
    type: "select",
    label: "tagDeviceForm.fields.district",
    required: true,
    validation: Yup.string().required("tagDeviceForm.validation.districtRequired"),
    options: [],
  },
  vehicle_number: {
    name: "vehicle_number",
    type: "text",
    label: "tagDeviceForm.fields.vehicleNumber",
    required: true,
    validation: Yup.string().when("vehicle_type", {
      is: "old",
      then: (schema) =>
        schema
          .matches(/^[A-Z]{0,3}[0-9]{1,4}$/, "Vehicle Number must be 1-3 letters followed by 1-4 numbers (e.g., AB1234, 1234)")
          .min(1, "Vehicle number is required")
          .max(7, "Vehicle number cannot exceed 7 characters")
          .required("tagDeviceForm.validation.vehicleNumberRequired"),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  owner_id: {
    name: "owner_id",
    type: "text",
    label: "Owner ID",
    required: true,
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
    required: true,
    validation: Yup.string()
      .matches(/^[A-Z0-9]+$/, "Engine number must contain only uppercase letters and numbers")
      .matches(/[a-zA-Z]/, "Engine number must contain letters")
      .matches(/[0-9]/, "Engine number must contain numbers")
      .min(5, "Engine number must be at least 5 characters")
      .max(20, "Engine number cannot exceed 20 characters")
      .required("tagDeviceForm.validation.engineNoRequired"),
  },
  chassis_no: {
    name: "chassis_no",
    type: "text",
    label: "tagDeviceForm.fields.chassisNo",
    required: true,
    validation: Yup.string()
      .matches(/^[a-zA-Z0-9]+$/, "Chassis number cannot contain special characters")
      .matches(/[a-zA-Z]/, "Chassis number must contain letters (cannot be purely numeric)")
      .matches(/[0-9]/, "Chassis number must contain numbers (cannot be purely alphabetic)")
      .matches(/^[^IOQioq]*$/, "Chassis number cannot contain the letters 'I', 'O', or 'Q' (Indian standard)")
      .matches(/^[A-HJ-NPR-Z0-9]+$/, "Chassis number must contain only uppercase letters and numbers")
      .length(17, "Chassis number must be exactly 17 characters long")
      .required("tagDeviceForm.validation.chassisNoRequired"),
  },
  vehicle_make: {
    name: "vehicle_make",
    type: "text",
    label: "tagDeviceForm.fields.vehicleMake",
    required: true,
    validation: Yup.string()
      .trim()
      .min(2, "Vehicle Make must be at least 2 characters")
      .max(50, "Vehicle Make cannot exceed 50 characters")
      .matches(/^[A-Z\s]+$/, "Vehicle Make must contain only uppercase alphabets")
      .required("tagDeviceForm.validation.vehicleMakeRequired"),
  },
  vehicle_model: {
    name: "vehicle_model",
    type: "text",
    label: "tagDeviceForm.fields.vehicleModel",
    required: true,
    validation: Yup.string()
      .trim()
      .min(2, "Vehicle Model must be at least 2 characters")
      .max(50, "Vehicle Model cannot exceed 50 characters")
      .matches(/^[a-zA-Z0-9\s.-]+$/, "Vehicle Model contains invalid characters")
      .required("tagDeviceForm.validation.vehicleModelRequired"),
  },
  category: {
    name: "category",
    type: "select",
    label: "tagDeviceForm.fields.vehicleCategory",
    required: true,
    validation: Yup.string().required("tagDeviceForm.validation.vehicleCategoryRequired"),
    options: categoryList,
  },
  category_code: {
    name: "category_code",
    type: "select",
    label: "Vehicle Category Code",
    validation: Yup.string().nullable(),
    options: [],
  },
  with_trailer: {
    name: "with_trailer",
    type: "select",
    label: "Trailer",
    required: true,
    validation: Yup.string().oneOf(["true", "false"]).required("Trailer selection is required"),
    options: [
      { label: "Without Trailer", value: "false" },
      { label: "With Trailer", value: "true" },
    ],
  },
  trailer_id: {
    name: "trailer_id",
    type: "text",
    label: "Trailer ID",
    required: false,
    validation: Yup.string().when("with_trailer", {
      is: "true",
      then: (schema) =>
        schema
          .trim()
          .matches(/^[a-zA-Z0-9]+$/, "trailer_id must be alphanumeric with a maximum length of 30 characters.")
          .max(30, "trailer_id must be alphanumeric with a maximum length of 30 characters.")
          .required("trailer_id is required when with_trailer is true."),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  rcFile: {
    name: "rcFile",
    type: "file",
    label: "tagDeviceForm.fields.registrationCertificate",
    required: true,
    validation: Yup.mixed().required("tagDeviceForm.validation.registrationCertificateRequired"),
  },
};
 