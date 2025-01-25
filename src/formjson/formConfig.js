import * as Yup from "yup"; 
export const userInitialValues = {
  name: "",
  mobile: "",
  email: "",
  companyName: "",
  gstNo: "",
  idProofNo: "",
  idProof: null,
  department:"",
  gender:"",
};
export const fieldConfig = {
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
  gstNo: {
    name:"gstNo",
    type: "text",
    label: "GTS No",
    validation: Yup.string().required("GTS No is required"),
  },
  idProofNo: {
    name:"idProofNo",
    type: "text",
    label: "ID Proof Number",
    validation: Yup.string().required("ID Proof Number is required"),
  },
  idProof: {
    name:"idProof",
    type: "file",
    label: "ID Proof",
    validation: Yup.mixed().required("ID Proof is required"),
  },
  department: {
    name:"department",
    type: "select",
    label: "Department",
    validation: Yup.string().required("Department is required"),
    options: [
      { value: "hr", label: "HR Department" },
      { value: "finance", label: "Finance Department" },
      { value: "it", label: "IT Department" },
    ],
  },
  gender: {
    name:"gender",
    type: "radio",
    label: "Gender",
    validation: Yup.string().required("Gender is required"),
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
  },
};
