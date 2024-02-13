import * as Yup from "yup";
export const deviceModelInitials = {
    model_name:"",
    test_agency:"",
    tac_no:"",
    tac_validity:"",
    hardware_version:"",
    tacFile:null,
};
export const deviceModelFormField = {
  model_name: {
    name: "model_name",
    type: "text",
    label: "Model",
    validation: Yup.string().required("Model is required"),
  },
  tac_no: {
    name: "tac_no",
    type: "text",
    label: "Tac No",
    validation: Yup.string().required("TAC No. is required"),
  },
  test_agency: {
    name: "test_agency",
    type: "text",
    label: "Test Agency Name",
    validation: Yup.string().required("Test Agency is required"),
  },
  tac_validity: {
    name:"tac_validity",
    type: "date",
    label: "TAC Validity",
    validation: Yup.date().required("TAC Validity is required"),
  },
  hardware_version: {
    name: "hardware_version",
    type: "text",
    label: "Hardware Version",
    validation: Yup.string().required("Hardware Version is required"),
  },
  tacFile: {
    name:"tacFile",
    type: "file",
    label: "Upload TAC",
    validation: Yup.mixed().required("TAC is required"),
  },
};
