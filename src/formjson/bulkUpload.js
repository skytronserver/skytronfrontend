import * as Yup from "yup";
const FILE_SIZE = 1024 * 1024; // 1MB
const SUPPORTED_FORMATS = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv"
];
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
    validation: Yup.mixed()
      .required("bulkUploadForm.validation.excelFileRequired")
      .test("fileSize", "File size is too large (max 1MB)", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "Unsupported format (must be Excel or CSV)", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type) || value.name.endsWith('.csv') || value.name.endsWith('.xls') || value.name.endsWith('.xlsx');
      }),
  }
}