import * as Yup from "yup";
export const modelExtensionInitials = {
    model:"",
    testAgency:"",
    tacNo:"",
    tacValidity:"",
    copNo:"",
    copValidity:"",
    copFile:null,
};
export const modelExtensionFormField = {
  model: {
    name: "model",
    type: "select",
    label: "Model",
    validation: Yup.string().required("Model is required"),
    options: [
        { value: "xyz", label: "XYZ" },
        { value: "abc", label: "ABC" }
      ],
  },
  testAgency: {
    name: "testAgency",
    type: "text",
    label: "Test Agency Name",
    validation: Yup.string().required("Test Agency is required"),
  },
  tacNo: {
    name: "tacNo",
    type: "text",
    label: "Tac No",
    validation: Yup.string().required("TAC No. is required"),
  },
  tacValidity: {
    name:"tacValidity",
    type: "date",
    label: "TAC Validity",
    validation: Yup.date().required("TAC Validity is required"),
  },
  copNo: {
    name: "copNo",
    type: "text",
    label: "COP No",
    validation: Yup.string().required("COP No. is required"),
  },
  copValidity: {
    name:"copValidity",
    type: "date",
    label: "COP Validity",
    validation: Yup.date().required("COP Validity is required"),
  },
  copFile: {
    name:"copFile",
    type: "text",
    label: "Upload COP",
    validation: Yup.mixed().required("TAC is required"),
  },
};
