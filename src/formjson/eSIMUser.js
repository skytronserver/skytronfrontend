import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const stateList=[{'value':'','label':''}];
const telecomProviderOptions = [
  { value: "airtel", label: "Airtel" },
  { value: "bsnl", label: "BSNL" },
  { value: "vodafone", label: "Vodafone" },
  { value: "jio", label: "Jio" },
];
const FILE_SIZE = 1024 * 1024 ; // 1 MB
const SUPPORTED_FORMATS = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
const today = new Date().toISOString().split('T')[0];
export const eSIMInitialValues = {
    name: "",
    mobile: "",
    email: "",
    company_name: "",
    dob: "",
    expirydate:formattedDate,
    gstnnumber: "",
    idProofno:"",
    stateId:'',
    telecomProviders: [],
    file_authLetter: null,
    file_GSTCertificate: null,
    file_idProof:null,
    file_companRegCertificate:null,
    lat: "",
    lon: "",
};

export const eSIMFormField = {
  name: {
    name:"name",
    type: "text",
    label: "esimUser.form.fields.name",
    validation: Yup.string().required("esimUser.form.validation.name_required"),
  },
  email: {
    name:"email",
    type: "text",
    label: "esimUser.form.fields.email",
    validation: Yup.string().email("esimUser.form.validation.invalid_email").required("esimUser.form.validation.email_required"),
  },
  mobile: {
    name:"mobile",
    type: "tel",
    label: "esimUser.form.fields.mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'esimUser.form.validation.invalid_mobile').required('esimUser.form.validation.mobile_required'),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "esimUser.form.fields.dob",
    validation: Yup.date().required("esimUser.form.validation.dob_required"),
    maxDate:today
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "esimUser.form.fields.expiry_date",
    validation: Yup.date().required("esimUser.form.validation.expiry_date_required"),
    minDate:today
  },
  company_name: {
    name:"company_name",
    type: "text",
    label: "esimUser.form.fields.company_name",
    validation: Yup.string().required("esimUser.form.validation.company_name_required"),
  },
  gstnnumber: {
    name:"gstnnumber",
    type: "text",
    label: "esimUser.form.fields.gst_no",
    validation: Yup.string()
    .matches(
      /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
      "Please enter a valid GST number"
    )
    .required("esimUser.form.validation.gst_no_required"),
  },
  idProofno: {
    name:"idProofno",
    type: "text",
    label: "esimUser.form.fields.id_proof_number",
    validation: Yup.string().min(5, "esimUser.form.validation.id_proof_min_length").required("esimUser.form.validation.id_proof_required"),
  },
  stateId: {
    name:"stateId",
    type: "select",
    label: "esimUser.form.fields.state",
    validation: Yup.string().required("esimUser.form.validation.state_required"),
    options:stateList,
  },
  telecomProviders: {
    name: "telecomProviders",
    type: "multiselect",
    label: "Linked Telecom Providers",
    validation: Yup.array()
      .min(1, "Please select at least one telecom provider")
      .required("Please select at least one telecom provider"),
    options: telecomProviderOptions,
  },
  file_authLetter:{
    name:"file_authLetter",
    type: "file",
    label: "esimUser.form.fields.auth_letter",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("esimUser.form.validation.auth_letter_required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "esimUser.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_GSTCertificate:{
    name:"file_GSTCertificate",
    type: "file",
    label: "esimUser.form.fields.gst_certificate",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("esimUser.form.validation.gst_certificate_required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "esimUser.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_idProof:{
    name:"file_idProof",
    type: "file",
    label: "esimUser.form.fields.id_proof",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("esimUser.form.validation.id_proof_required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "esimUser.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_companRegCertificate:{
    name:"file_companRegCertificate",
    type: "file",
    label: "esimUser.form.fields.company_reg_certificate",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("esimUser.form.validation.company_reg_required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "esimUser.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
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
