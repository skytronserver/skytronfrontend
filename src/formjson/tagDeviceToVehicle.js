import * as Yup from "yup";
import { goldMobileValidation } from "./validationHelpers";

export const taggingInitials = {
  manufacturer_id: "",
  model_id: "",
  esim_id: "",
  iccid: "",
  imei: "",
  owner_no: "",
};

export const taggingFields = {
  manufacturer: {
    name: "manufacturer",
    type: "text",
    label: "MANUFACTURER",
    required: true,
    validation: Yup.string().required("Manufacturer is required"),
  },
  model: {
    name: "model",
    type: "text",
    label: "MODEL",
    required: true,
    validation: Yup.string().required("Model is required"),
  },
  m2m: {
    name: "m2m",
    type: "text",
    label: "M2M",
    required: true,
    validation: Yup.string().required("M2M is required"),
  },
  iccid: {
    name: "iccid",
    type: "text",
    label: "ICCID",
    required: true,
    validation: Yup.string().required("ICCID is required"),
  },
  imei: {
    name: "imei",
    type: "text",
    label: "IMEI",
    required: true,
    validation: Yup.string().required("IMEI is required"),
  },
  owner_no: {
    name: "owner_no",
    type: "tel",
    label: "OWNER NO",
    required: true,
    validation: goldMobileValidation("Owner No"),
  },
};
