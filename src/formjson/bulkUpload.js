import * as Yup from "yup";
let modelList=[{value:'',label:'bulkUploadForm.options.waitingForModels'}];
let providerList=[{value:'',label:'bulkUploadForm.options.waitingForProvider'}];
export const bulkInitials = {
    model_id:"",
    esim_provider:"",
    excel_file:null,
    
};
export const bulkFormField = {
  model_id: {
    name: "model_id",
    type: "select",
    label: "bulkUploadForm.fields.model",
    validation: Yup.string().required("bulkUploadForm.validation.modelRequired"),
    options: modelList,
  },
  esim_provider: {
    name:"esim_provider",
    type: "select",
    label: "bulkUploadForm.fields.esimProvider",
    validation: Yup.string().required("bulkUploadForm.validation.esimProviderRequired"),
    options: providerList
  },
  excel_file:{
    name:"excel_file",
    type: "file",
    label: "bulkUploadForm.fields.excelFile",
    validation: Yup.mixed().required("bulkUploadForm.validation.excelFileRequired"),
  }
}