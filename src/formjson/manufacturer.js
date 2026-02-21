import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
let providerList=[{value:'',label:'Select'}];
const FILE_SIZE = 1024 * 1024 ; // 1 MB
const SUPPORTED_FORMATS = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
const today = new Date().toISOString().split('T')[0];
export const manufacturerInitialValues = {
    esimProvider:[],
    name: "",
    mobile: "",
    email: "",
    dob:"",
    expirydate:formattedDate,
    company_name: "",
    gstnnumber: "",
    idProofno:"",
    state:"",
    file_authLetter: null,
    file_companRegCertificate: null,
    file_GSTCertificate: null,
    file_idProof: null,
    file_affidavitNda: null,
    tac: "",
    device_model_details: "",
    lat: "",
    lon: "",
};

export const manufacturerFormField = {
  state: {
    name:"state",
    type: "select",
    label: "manufacturer.form.fields.state",
    validation: Yup.string().required("manufacturer.form.validation.state_required"),
    options:[{'label':'manufacturer.form.select','value':''}]
  },
  esimProvider: {
    name:"esimProvider",
    type: "multiselect",
    label: "manufacturer.form.fields.m2m_provider",
    validation: Yup.array().required("manufacturer.form.validation.esim_provider_required"),
    options: providerList
  },
  name: {
    name:"name",
    type: "text",
    label: "manufacturer.form.fields.name",
    validation: Yup.string().required("manufacturer.form.validation.name_required"),
  },
  email: {
    name:"email",
    type: "text",
    label: "manufacturer.form.fields.email",
    validation: Yup.string().email("manufacturer.form.validation.invalid_email").required("manufacturer.form.validation.email_required"),
  },
  mobile: {
    name:"mobile",
    type: "tel",
    label: "manufacturer.form.fields.mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'manufacturer.form.validation.invalid_mobile').required('manufacturer.form.validation.mobile_required'),
  },
  company_name: {
    name:"company_name",
    type: "text",
    label: "manufacturer.form.fields.company_name",
    validation: Yup.string().required("manufacturer.form.validation.company_name_required"),
  },
  dob: {
    name:"dob",
    type: "date", 
    label: "manufacturer.form.fields.dob",
    validation: Yup.date()
      .required("manufacturer.form.validation.dob_required")
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "manufacturer.form.validation.age_restriction")
      .max(today, "manufacturer.form.validation.future_date"),
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "manufacturer.form.fields.expiry_date",
    validation: Yup.date().required("manufacturer.form.validation.expiry_date_required"),
    minDate:today
  },
  gstnnumber: {
    name:"gstnnumber",
    type: "text",
    label: "manufacturer.form.fields.gst_no",
    validation: Yup.string()
      .matches(
        /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
        "Please enter a valid GST number"
      )
      .required("manufacturer.form.validation.gst_no_required"),
  },
  idProofno: {
    name:"idProofno",
    type: "text",
    label: "manufacturer.form.fields.id_proof_number",
    validation: Yup.string().min(5, "manufacturer.form.validation.id_proof_min_length").required("manufacturer.form.validation.id_proof_required"),
  },
  file_authLetter:{
    name:"file_authLetter",
    type: "file",
    label: "manufacturer.form.fields.auth_letter",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("manufacturer.form.validation.auth_letter_required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_companRegCertificate:{
    name:"file_companRegCertificate",
    type: "file",
    label: "manufacturer.form.fields.company_reg_certificate",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("manufacturer.form.validation.company_reg_required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_GSTCertificate:{
    name:"file_GSTCertificate",
    type: "file",
    label: "manufacturer.form.fields.gst_certificate",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("manufacturer.form.validation.gst_certificate_required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_idProof:{
    name:"file_idProof",
    type: "file",
    label: "manufacturer.form.fields.id_proof",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("manufacturer.form.validation.id_proof_required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_affidavitNda:{
    name:"file_affidavitNda",
    type: "file",
    label: "Affidavit/NDA",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Affidavit / ADA is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  tac: {
    name: "tac",
    type: "text",
    label: "TAC",
    validation: Yup.string().required("TAC is required"),
  },
  device_model_details: {
    name: "device_model_details",
    type: "text",
    label: "Device Model Details",
    validation: Yup.string().required("Device Model Details is required"),
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
