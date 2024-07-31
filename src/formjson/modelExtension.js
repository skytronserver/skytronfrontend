import * as Yup from "yup";
let modelList = [{label:'Waiting for Model',value:''}];
export const modelExtensionInitials = {
  device_model: "",
  testAgency: "",
  tacNo: "",
  tacValidity: "",
  cop_no: "",
  cop_validity: "",
  cop_file: null,
};
export const modelExtensionFormField = {
  device_model: {
    name: "device_model",
    type: "select",
    label: "Model",
    validation: Yup.string().required("Model is required"),
    options: modelList,
  },
  testAgency: {
    name: "testAgency",
    type: "text",
    disabled: true,
    label: "Test Agency Name",
    validation: Yup.string().required("Test Agency is required"),
  },
  tacNo: {
    name: "tacNo",
    type: "text",
    disabled: true,
    label: "Tac No",
    validation: Yup.string().required("TAC No. is required"),
  },
  tacValidity: {
    name: "tacValidity",
    type: "date",
    disabled: true,
    label: "TAC Validity",
    validation: Yup.date().required("TAC Validity is required"),
  },
  cop_no: {
    name: "cop_no",
    type: "text",
    label: "COP No",
    validation: Yup.string().required("COP No. is required"),
  },
  cop_validity: {
    name: "cop_validity",
    type: "date",
    label: "COP Validity",
    validation: Yup.date().required("COP Validity is required"),
  },
  cop_file: {
    name: "cop_file",
    type: "file",
    label: "Upload COP",
    validation: Yup.mixed().required("TAC is required"),
  },
};
