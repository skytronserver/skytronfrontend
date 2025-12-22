import * as Yup from "yup"; 
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
      validation: Yup.string().required("stateAdmin.validation.nameRequired"),
    },
    email: {
      name:"email",
      type: "text",
      label: "Email",
      validation: Yup.string()
        .email("stateAdmin.validation.invalidEmail")
        .required("stateAdmin.validation.emailRequired"),
    },
    mobile: {
      name:"mobile",
      type: "tel",
      label: "Mobile",
      validation: Yup.string()
        .matches(/^\d{10}$/, 'stateAdmin.validation.mobileFormat')
        .required('stateAdmin.validation.mobileRequired'),
    },
    dob: {
      name:"dob",
      type: "date",
      label: "Date of Birth",
      validation: Yup.date().required("stateAdmin.validation.dobRequired"),
      maxDate:today
    },
    expirydate: {
      name:"expirydate",
      type: "date",
      label: "Expiry Date",
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
      validation: Yup.string()
        .min(5, "stateAdmin.validation.idProofMinLength")
        .required("stateAdmin.validation.idProofRequired"),
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
      validation: Yup.number()
        .typeError("Latitude must be a number")
        .nullable(),
    },
    lon: {
      name: "lon",
      type: "number",
      label: "Longitude",
      validation: Yup.number()
        .typeError("Longitude must be a number")
        .nullable(),
    },
  };