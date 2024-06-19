import * as Yup from "yup";
  let stateList=[];
export const sosUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  dtoCode: "",
  state:'',
  idProofno: "",
  file_idProof: null,
};
export const sosUserFormField = {
  name: {
    name: "name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  mobile: {
    name: "mobile",
    type: "text",
    label: "Mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "Mobile Number must be a 10-digit number")
      .required("Mobile Number is required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Email",
    validation: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
  },
  state: {
    name:"state",
    type: "select",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
    options:stateList,
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Number",
    validation: Yup.string().required("User ID No is required field"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Document is required"),
  }
};
