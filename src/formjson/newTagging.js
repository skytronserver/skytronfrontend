import * as Yup from "yup";

// Mobile number validation matching the project's standard
const mobileValidation = (fieldName) =>
  Yup.string()
    .required(`${fieldName} is required`)
    .matches(/^[0-9]{10}$/, `${fieldName} must be exactly 10 digits`);

export const newTaggingInitials = {
  manufacturer_id: "",
  model_id: "",
  esim_provider_id: "",
  imei: "",
  iccid: "",
  owner_no: "",
};

export const newTaggingFields = {
  manufacturer_id: {
    name: "manufacturer_id",
    type: "select",
    label: "Manufacturer",
    required: true,
    options: [],
    validation: Yup.string().required("Manufacturer is required"),
  },
  model_id: {
    name: "model_id",
    type: "select",
    label: "Model",
    required: true,
    options: [],
    validation: Yup.string().required("Model is required"),
  },
  esim_provider_id: {
    name: "esim_provider_id",
    type: "select",
    label: "eSIM Provider",
    required: true,
    options: [],
    validation: Yup.string().required("eSIM Provider is required"),
  },
  imei: {
    name: "imei",
    type: "text",
    label: "IMEI",
    required: true,
    validation: Yup.string().required("IMEI is required"),
  },
  iccid: {
    name: "iccid",
    type: "text",
    label: "ICCID",
    required: true,
    validation: Yup.string().required("ICCID is required"),
  },
  owner_no: {
    name: "owner_no",
    type: "text",
    label: "Owner Mobile Number",
    required: true,
    validation: mobileValidation("Owner Mobile Number"),
  },
};
