import * as Yup from "yup";
import { goldNameValidation, goldMobileValidation, goldEmailValidation, goldDobValidation, goldIdProofValidation, goldLatValidation, goldLonValidation } from "./validationHelpers";
export const otherUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  dtoCode: "",
  idProofno: "",
  file_idProof: null,
  lat: "",
  lon: "",
};
export const otherUserFormField = {
  name: {
    name: "name",
    type: "text",
    label: "Name",
    validation: goldNameValidation("Name"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "Mobile",
    validation: goldMobileValidation("Mobile"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Email",
    validation: goldEmailValidation("Email"),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: goldDobValidation("Date of Birth"),
  },
  dtoCode: {
    name: "dtoCode",
    type: "text",
    label: "DTO/RTO Code",
    validation: Yup.string().required("DTO/RTO Code cannot be blank"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Number",
    validation: goldIdProofValidation("User ID Number"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Document is required"),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    validation: goldLatValidation("Latitude").nullable(),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    validation: goldLonValidation("Longitude").nullable(),
  },
};
