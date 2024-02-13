import * as Yup from "yup";
import {retriveModelList} from "../helper"
const modelList=await retriveModelList();
export const bulkInitials = {
    model_id:"",
    excel_file:null,

};
export const bulkFormField = {
  model_id: {
    name: "model_id",
    type: "select",
    label: "Model Name",
    validation: Yup.string().required("Model is required"),
    options: modelList,
  },
  excel_file:{
    name:"excel_file",
    type: "file",
    label: "Select the Excel File",
    validation: Yup.mixed().required("Excel File is required"),
  }
}