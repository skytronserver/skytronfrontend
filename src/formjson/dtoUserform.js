import * as Yup from "yup"; 
import { goldNameValidation, goldMobileValidation, goldEmailValidation, goldDobValidation, goldIdProofValidation, goldLatValidation, goldLonValidation } from "./validationHelpers";

let stateList=[];
let districtList=[];
const FILE_SIZE = 512 * 1024 ; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

export const dtoInitialsValues = {
    name: "",
    mobile: "",
    email: "",
    state:"",
    district_code:"",
    idProofno:"",
    dob:"",
    expirydate:formattedDate,
    dto_rto:"",
    file_idProof: null,
    file_authorisation_letter:null,
    lat: "",
    lon: "",
};

export const dtoFormFields = {
  name: {
    name:"name",
    type: "text",
    label: "dtoForm.fields.name",
    validation: goldNameValidation("Name"),
  },
  email: {
    name:"email",
    type: "text",
    label: "dtoForm.fields.email",
    validation: goldEmailValidation("Email"),
  },
  mobile: {
    name:"mobile",
    type: "tel",
    label: "dtoForm.fields.mobile",
    validation: goldMobileValidation("Mobile"),
  },
  state: {
    name:"state",
    type: "text",
    label: "dtoForm.fields.state",
    validation: Yup.string().required("dtoForm.validation.stateRequired"),
    disabled:true,
  },
  district_code: {
    name:"district_code",
    type: "select",
    label: "dtoForm.fields.districtCode",
    validation: Yup.string().required("dtoForm.validation.districtCodeRequired"),
    options:districtList,
  },
  idProofno: {
    name:"idProofno",
    type: "text",
    label: "dtoForm.fields.idProofNo",
    validation: goldIdProofValidation("ID Proof No"),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "dtoForm.fields.dob",
    validation: goldDobValidation("Date of Birth"),
    maxDate:today
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "dtoForm.fields.expiryDate",
    disabled: true,
    validation: Yup.date().required("dtoForm.validation.expiryDateRequired"),
    minDate:today
  },
  dto_rto: {
    name:"dto_rto",
    type: "select",
    label: "dtoForm.fields.dtoRto",
    validation: Yup.string().required("dtoForm.validation.dtoRtoRequired"),
    options: [
        { value: "DTO", label: "dtoForm.options.dto" },
        { value: "RTO", label: "dtoForm.options.rto" }
      ],
  },
  file_idProof:{
    name:"file_idProof",
    type: "file",
    label: "dtoForm.fields.idProof",
    message: "dtoForm.messages.fileRestrictions",
    validation: Yup.mixed().required("dtoForm.validation.fileRequired").test("fileSize", "dtoForm.validation.fileSize", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "dtoForm.validation.fileFormat", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_authorisation_letter: {
    name:"file_authorisation_letter",
    type: "file",
    label: "dtoForm.fields.authorisationLetter",
    message: "dtoForm.messages.fileRestrictions",
    validation: Yup.mixed()
    .required("dtoForm.validation.fileRequired")
    .test("fileSize", "dtoForm.validation.fileSize", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "dtoForm.validation.fileFormat", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    })
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    validation: goldLatValidation("Latitude"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    validation: goldLonValidation("Longitude"),
  }
};
