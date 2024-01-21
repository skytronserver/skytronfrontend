import * as Yup from "yup"; 
export const deviceMakeInitialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstNo: "",
    deviceModel: "",
    userIdProofNo:"",
    tacNo: "",
    tacValidity: "",
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
    type: "text",
    label: "Mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
  },
  companyName: {
    name:"companyName",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("Company Name is required"),
  },
  gstNo: {
    name:"gstNo",
    type: "text",
    label: "GTS No",
    validation: Yup.string().required("GTS No is required"),
  },
  userIdProofNo: {
    name:"userIdProofNo",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().required("User ID Proof Number is required"),
  },
  deviceModel: {
    name:"deviceModel",
    type: "text",
    label: "Device Model",
    validation: Yup.string().required("Device Model is required"),
  },
  tacNo:{
    name:"tacNo",
    type: "text",
    label: "TAC No",
    validation: Yup.string().required("TAC No is required"),
  },
  tacValidity:{
    name:"tacValidity",
    type: "text",
    label: "TAC Validity",
    validation: Yup.string().required("Tac Validity is required"),
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
