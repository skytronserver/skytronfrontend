import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
let providerList=[{value:'',label:'Select'}];
const FILE_SIZE = 512 * 1024 ; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
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
};

export const manufacturerFormField = {
  state: {
    name:"state",
    type: "select",
    label: "Select State",
    validation: Yup.string().required("State is required"),
    options:[{'label':'Select','value':''}]
  },
  esimProvider: {
    name:"esimProvider",
    type: "multiselect",
    label: "M2M Provider",
    validation: Yup.array().required("eSim Provider is required"),
    options: providerList
  },
  name: {
    name:"name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  email: {
    name:"email",
    type: "text",
    label: "Email",
    validation: Yup.string().email("Invalid email address").required("Email is required"),
  },
  mobile: {
    name:"mobile",
    type: "tel",
    label: "Mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
  },
  company_name: {
    name:"company_name",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("Company Name is required"),
  },
  dob: {
    name:"dob",
    type: "date", 
    label: "Date of Birth",
    validation: Yup.date()
      .required("Date of Birth is required")
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "Must be at least 18 years old")
      .max(today, "Date of birth cannot be in the future")
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
    minDate:today
  },
  gstnnumber: {
    name:"gstnnumber",
    type: "text",
    label: "GST No",
    validation: Yup.string().required("GTS No is required"),
  },
  idProofno: {
    name:"idProofno",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().min(5, "ID Proof Number must be at least 5 characters long").required("User ID Proof Number is required"),
  },
  file_authLetter:{
    name:"file_authLetter",
    type: "file",
    label: "Authorization Letter",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("Authorization Letter is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_companRegCertificate:{
    name:"file_companRegCertificate",
    type: "file",
    label: "Company Registration Certificate",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("Company Registration Certificate is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_GSTCertificate:{
    name:"file_GSTCertificate",
    type: "file",
    label: "GST Certificate",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("GST Certificate is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_idProof:{
    name:"file_idProof",
    type: "file",
    label: "User ID Proof",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("User ID Proof is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  }
};
