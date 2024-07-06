import * as Yup from "yup";
let modelList=[];
let providerList=[{value:'',label:'Select'}];
export const bulkInitials = {
    model_id:"",
    excel_file:null,
    esim_provider:"",
};
export const bulkFormField = {
  model_id: {
    name: "model_id",
    type: "select",
    label: "Model Name",
    validation: Yup.string().required("Model is required"),
    options: modelList,
  },
  esim_provider: {
    name:"esim_provider",
    type: "multiselect",
    label: "eSIM Provider",
    validation: Yup.string().required("eSIM Provider is required"),
    options: providerList
  },
  excel_file:{
    name:"excel_file",
    type: "file",
    label: "Select the Excel File",
    validation: Yup.mixed().required("Excel File is required"),
  }
}