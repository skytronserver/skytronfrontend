import * as Yup from "yup";
let taggedList=[];
export const uploadReceiptInitials = {
  device_id:"",
};
export const vahanVerificationInitials = {
  device_id:"",
};
export const vahanVerificationFields = {
  device_id: {
    name: "device_id",
    type: "autocomplete",
    label: "Enter Registration No.",
    validation: Yup.string().required("Registration No. is required"),
    options:[{label:'',value:'Select Registration No.'}]
  },
};
export const uploadReceiptFormFields = {
  device_id: {
    name: "device_id",
    type: "select",
    label: "Select IMEI No",
    validation: Yup.string().required("IMEI is required"),
    options: taggedList,
  }
};
