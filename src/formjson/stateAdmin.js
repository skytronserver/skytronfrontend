import * as Yup from "yup"; 
import { indianStates } from "./indianState";
export const stateAdminInitialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstnnumber: "",
    stateid:"",
    kycdocnumber: "",
    kycfile: null,
    panfile:null,
  };
  export const stateAdminField = {
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
    gstnnumber: {
      name:"gstnnumber",
      type: "text",
      label: "GTS No",
      validation: Yup.string().required("GTS No is required"),
    },
    stateid: {
        name:"stateid",
        type: "select",
        label: "State Name",
        validation: Yup.string().required("State Name is required"),
        options: indianStates,
      },
    kycdocnumber: {
      name:"kycdocnumber",
      type: "text",
      label: "ID Proof Number",
      validation: Yup.string().required("ID Proof Number is required"),
    },
    kycfile: {
      name:"kycfile",
      type: "file",
      label: "ID Proof",
      validation: Yup.mixed().required("ID Proof is required"),
    },
    panfile: {
        name:"panfile",
        type: "file",
        label: "Authorization Letter",
        validation: Yup.mixed().required("Authorization Letter is required"),
      },
  };