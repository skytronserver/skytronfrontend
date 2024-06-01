import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const stateList=[{'value':'','label':''}];
export const eSIMInitialValues = {
    name: "",
    mobile: "",
    email: "",
    company_name: "",
    dob: "",
    expiryDate:formattedDate,
    gstnnumber: "",
    idProofno:"",
    stateId:'',
    file_authLetter: null,
    file_companRegCertificate: null,
    file_GSTCertificate: null,
    file_idProof:null,
};

export const eSIMFormField = {
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
    type: "text",
    label: "Mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
  },
  expiryDate: {
    name:"expiryDate",
    type: "date",
    label: "Expiry Date",
    disabled:true,
    validation: Yup.date().required("Expiry Date is required"),
  },
  company_name: {
    name:"company_name",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("Company Name is required"),
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
    label: "User ID Proof No.",
    validation: Yup.string().required("Name is required"),
  },
  stateId: {
    name:"stateId",
    type: "select",
    label: "State",
    validation: Yup.string().required("State is required"),
    options:stateList,
  },
  file_authLetter:{
    name:"file_authLetter",
    type: "file",
    label: "Authorization Letter",
    validation: Yup.mixed().required("Authorization Letter is required"),
  },
  file_companRegCertificate:{
    name:"file_companRegCertificate",
    type: "file",
    label: "Company Registration Certificate",
    validation: Yup.mixed().required("Company Registration Certificate is required"),
  },
  file_GSTCertificate:{
    name:"file_GSTCertificate",
    type: "file",
    label: "GST Certificate",
    validation: Yup.mixed().required("GST Certificate is required"),
  },
  file_idProof:{
    name:"file_idProof",
    type: "file",
    label: "ID Proof Certificate",
    validation: Yup.mixed().required("GST Certificate is required"),
  },
};
