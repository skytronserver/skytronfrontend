import * as Yup from "yup";
const providerList=[]
const today = new Date().toISOString().split('T')[0];
export const deviceModelInitials = {
    eSimProviders: [],
    model_name:"",
    test_agency:"",
    tac_no:"",
    tac_validity:"",
    vendor_id:"",
    hardware_version:"",
    tac_doc_path:null,
    
};
export const deviceModelFormField = {
  eSimProviders: {
    name: "eSimProviders",
    type: "multiselect",
    label: "M2M Service Provider",
    validation: Yup.array().min(1, "At least one M2M Service Provider is required"),
    options: [{'label':'Select','value':''}]
  },
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
    minDate:today
  },
  vendor_id: {
    name: "vendor_id",
    type: "text",
    label: "Vendor ID",
    validation: Yup.string().required("Vendor ID is required"),
  },
  hardware_version: {
    name: "hardware_version",
    type: "text",
    label: "Hardware Version",
    validation: Yup.string().required("Hardware Version is required"),
  },
  tac_doc_path: {
    name:"tac_doc_path",
    type: "file",
    label: "Upload TAC",
    validation: Yup.mixed().required("TAC is required"),
  },
};
