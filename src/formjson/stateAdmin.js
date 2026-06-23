import * as Yup from "yup"; 
import { goldNameValidation, goldMobileValidation, goldEmailValidation, goldDobValidation, goldIdProofValidation, goldLatValidation, goldLonValidation } from "./validationHelpers";
const FILE_SIZE = 512 * 1024 ; // 512 MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
let stateList=[];
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];
export const stateAdminInitialValues = {
    name: "",
    mobile: "",
    email: "",
    dob:"",
    expirydate: formattedDate,
    state:"",
    idProofno: "",
    file_idProof: null,
    file_authorisation_letter:null,
    lat: "",
    lon: "",
  };
  export const stateAdminField = {
    name: {
      name:"name",
      type: "text",
      label: "Name",
      validation: goldNameValidation("Name"),
    },
    email: {
      name:"email",
      type: "text",
      label: "Email",
      validation: goldEmailValidation("Email"),
    },
    mobile: {
      name:"mobile",
      type: "tel",
      label: "Mobile",
      validation: goldMobileValidation("Mobile"),
    },
    dob: {
      name:"dob",
      type: "date",
      label: "Date of Birth",
      validation: goldDobValidation("Date of Birth"),
      maxDate:today
    },
    expirydate: {
      name:"expirydate",
      type: "date",
      label: "Expiry Date",
      disabled: true,
      validation: Yup.date().required("stateAdmin.validation.expiryDateRequired"),
      minDate:today
    },
    state: {
        name:"state",
        type: "select",
        label: "State Name",
        validation: Yup.string().required("stateAdmin.validation.stateRequired"),
        options: stateList,
      },
    idProofno: {
      name:"idProofno",
      type: "text",
      label: "ID Proof Number",
      validation: goldIdProofValidation("ID Proof Number"),
    },
    file_idProof: {
      name:"file_idProof",
      type: "file",
      label: "ID Proof",
      message: "stateAdmin.messages.file_idProof",
      validation: Yup.mixed()
    .required("stateAdmin.validation.fileRequired")
    .test("fileSize", "stateAdmin.validation.fileSize", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "stateAdmin.validation.fileFormat", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    })
    },
    file_authorisation_letter: {
      name:"file_authorisation_letter",
      type: "file",
      label: "Authorization Letter",
      message: "stateAdmin.messages.file_authorisation_letter",
      validation: Yup.mixed()
    .required("stateAdmin.validation.fileRequired")
    .test("fileSize", "stateAdmin.validation.fileSize", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "stateAdmin.validation.fileFormat", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    })
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