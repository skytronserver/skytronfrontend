import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
export const deviceMakeInitialValues = {
    name: "",
    mobile: "",
    email: "",
    dob:"",
    expirydate:formattedDate,
    companyName: "",
    gstNo: "",
    userIdProofNo:"",
    authorizationLetter: null,
    companyRegistrationCertificate: null,
    gstCertificate: null,
    typeApprovalCertificate: null,
    userIdProof: null,
};

export const deviceMakeFormField = {
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
  companyName: {
    name:"companyName",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("Company Name is required"),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
  },
  gstNo: {
    name:"gstNo",
    type: "text",
    label: "GST No",
    validation: Yup.string().required("GTS No is required"),
  },
  userIdProofNo: {
    name:"userIdProofNo",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().required("User ID Proof Number is required"),
  },
  authorizationLetter:{
    name:"authorizationLetter",
    type: "file",
    label: "Authorization Letter",
    validation: Yup.mixed().required("Authorization Letter is required"),
  },
  companyRegistrationCertificate:{
    name:"companyRegistrationCertificate",
    type: "file",
    label: "Company Registration Certificate",
    validation: Yup.mixed().required("Company Registration Certificate is required"),
  },
  gstCertificate:{
    name:"gstCertificate",
    type: "file",
    label: "GST Certificate",
    validation: Yup.mixed().required("GST Certificate is required"),
  },
  typeApprovalCertificate:{
    name:"typeApprovalCertificate",
    type: "file",
    label: "Type Approval Certificate",
    validation: Yup.mixed().required("Type Approval Certificate is required"),
  },
  userIdProof:{
    name:"userIdProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Proof is required"),
  }
};
