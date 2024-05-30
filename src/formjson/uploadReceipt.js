import * as Yup from "yup";
let taggedList=[];
export const uploadReceiptInitials = {
    tag_id:"",
    receiptFile:null,

};
export const uploadReceiptFormFields = {
    tag_id: {
    name: "tag_id",
    type: "select",
    label: "Select IMEI No",
    validation: Yup.string().required("IMEI is required"),
    options: taggedList,
  },
  receiptFile:{
    name:"receiptFile",
    type: "file",
    label: "Select the Tagging Receipt File",
    validation: Yup.mixed().required("Tagging Receipt is required"),
  }
}