import * as Yup from "yup";
import { goldNameValidation, goldMobileValidation, goldEmailValidation, goldDobValidation, goldIdProofValidation, goldLatValidation, goldLonValidation } from "./validationHelpers";
const currentDate = new Date();
const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

export const ownerInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob: "",
  address: "",
  expirydate: formattedDate,
  idProofno: "",
  file_idProof: null,
  lat: "",
  lon: "",
};

export const vehicleOwnerField = {
  name: {
    name: "name",
    type: "text",
    label: "vehicleOwnerForm.fields.name",
    required: true,
    validation: goldNameValidation("Name"),
  },
  email: {
    name: "email",
    type: "text",
    label: "vehicleOwnerForm.fields.email",
    required: true,
    validation: goldEmailValidation("Email"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "vehicleOwnerForm.fields.mobile",
    required: true,
    validation: goldMobileValidation("Mobile"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "vehicleOwnerForm.fields.dob",
    required: true,
    maxDate: today,
    validation: goldDobValidation("Date of Birth"),
  },
  address: {
    name: "address",
    type: "text",
    label: "vehicleOwnerForm.fields.address",
    required: true,
    validation: Yup.string()
      .trim()
      .min(10, "Address must be at least 10 characters")
      .max(255, "Address cannot exceed 255 characters")
      .required("vehicleOwnerForm.validation.addressRequired"),
  },
  expirydate: {
    name: "expirydate",
    type: "date",
    label: "vehicleOwnerForm.fields.expiryDate",
    disabled: true,
    validation: Yup.date().required("vehicleOwnerForm.validation.expiryDateRequired"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "vehicleOwnerForm.fields.idProofNo",
    required: true,
    validation: goldIdProofValidation("ID Proof No"),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    required: true,
    validation: goldLatValidation("Latitude"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    required: true,
    validation: goldLonValidation("Longitude"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "vehicleOwnerForm.fields.idProof",
    required: true,
    message: "vehicleOwnerForm.fields.fileMessage",
    validation: Yup.mixed()
      .required("vehicleOwnerForm.validation.idProofRequired")
      .test("fileSize", "vehicleOwnerForm.validation.fileSize", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "vehicleOwnerForm.validation.fileFormat", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  }
};
