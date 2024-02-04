import * as Yup from "yup";
export const deviceModelInitials = {
    model:"",
    testAgency:"",
    tacNo:"",
    tacValidity:"",
    tacFile:null,
};
export const deviceModelFormField = {
  model: {
    name: "model",
    type: "text",
    label: "Model",
    validation: Yup.string().required("Model is required"),
  },
  tacNo: {
    name: "tacNo",
    type: "text",
    label: "Tac No",
    validation: Yup.string().required("TAC No. is required"),
  },
  testAgency: {
    name: "testAgency",
    type: "text",
    label: "Test Agency Name",
    validation: Yup.string().required("Test Agency is required"),
  },
  tacValidity: {
    name:"tacValidity",
    type: "date",
    label: "TAC Validity",
    validation: Yup.date().required("TAC Validity is required"),
  },
  
  tacFile: {
    name:"tacFile",
    type: "file",
    label: "Upload TAC",
    validation: Yup.mixed().required("TAC is required"),
  },
};
