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
    label: "deviceModelForm.fields.m2mServiceProvider",
    validation: Yup.array().min(1, "deviceModelForm.validation.m2mServiceProviderRequired"),
    options: [{'label':'deviceModelForm.fields.select','value':''}]
  },
  model_name: {
    name: "model_name",
    type: "text",
    label: "deviceModelForm.fields.model",
    validation: Yup.string().required("deviceModelForm.validation.modelRequired"),
  },
  tac_no: {
    name: "tac_no",
    type: "text",
    label: "deviceModelForm.fields.tacNo",
    validation: Yup.string().required("deviceModelForm.validation.tacNoRequired"),
  },
  test_agency: {
    name: "test_agency",
    type: "text",
    label: "deviceModelForm.fields.testAgency",
    validation: Yup.string().required("deviceModelForm.validation.testAgencyRequired"),
  },
  tac_validity: {
    name:"tac_validity",
    type: "date",
    label: "deviceModelForm.fields.tacValidity",
    validation: Yup.date().required("deviceModelForm.validation.tacValidityRequired"),
    minDate:today
  },
  vendor_id: {
    name: "vendor_id",
    type: "text",
    label: "deviceModelForm.fields.vendorId",
    validation: Yup.string().required("deviceModelForm.validation.vendorIdRequired"),
  },
  hardware_version: {
    name: "hardware_version",
    type: "text",
    label: "deviceModelForm.fields.hardwareVersion",
    validation: Yup.string().required("deviceModelForm.validation.hardwareVersionRequired"),
  },
  tac_doc_path: {
    name:"tac_doc_path",
    type: "file",
    label: "deviceModelForm.fields.uploadTac",
    validation: Yup.mixed().required("deviceModelForm.validation.tacRequired"),
  },
};
