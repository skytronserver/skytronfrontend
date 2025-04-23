import * as Yup from "yup";
let modelList=[];
let providerList=[{value:'',label:'Select'}];
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
export const deviceInitials = {
    imei:"",
    model:"",
    test_agency:"",
    tac_no:"",
    tac_validity:"",
    cop_no:"",
    cop_validity:"",
    device_esn:"",
    iccid:"",
    telecom_provider1:"",
    telecom_provider2:"",
    msisdn1:"",
    msisdn2:"",
    esim_validity:formattedDate,
    esim_provider:[],
    remarks:"",
};
export const deviceFormField = {
  imei: {
    name: "imei",
    type: "text",
    label: "deviceForm.fields.imei",
    validation: Yup.string().matches(/^[0-9]+$/, "deviceForm.validation.imeiNumber").required("deviceForm.validation.imeiRequired"),
  },
  model: {
    name: "model",
    type: "select",
    label: "deviceForm.fields.model",
    validation: Yup.string().required("deviceForm.validation.modelRequired"),
    options: modelList,
  },
  test_agency: {
    name: "test_agency",
    type: "text",
    label: "deviceForm.fields.test_agency",
    disabled:true,
  },
  device_esn: {
    name: "device_esn",
    type: "text",
    label: "deviceForm.fields.device_esn",
    validation: Yup.string().required("deviceForm.validation.deviceEsnRequired"),
  },
  esim_validity: {
    name:"esim_validity",
    type: "date",
    label: "deviceForm.fields.esim_validity",
    validation: Yup.date().required("deviceForm.validation.esimValidityRequired"),
  },
  esim_provider: {
    name:"esim_provider",
    type: "multiselect",
    label: "deviceForm.fields.esim_provider",
    validation: Yup.array().required("deviceForm.validation.esimProviderRequired"),
    options: providerList
  },
  tac_no: {
    name: "tac_no",
    type: "text",
    disabled:true,
    label: "deviceForm.fields.tac_no",
  },
  tac_validity: {
    name:"tac_validity",
    type: "date",
    disabled:true,
    label: "deviceForm.fields.tac_validity",
  },
  cop_no: {
    name: "cop_no",
    type: "text",
    label: "deviceForm.fields.cop_no",
    disabled:true,
  },
  cop_validity: {
    name:"cop_validity",
    type: "date",
    label: "deviceForm.fields.cop_validity",
    disabled:true,
  },
  
  iccid: {
    name: "iccid",
    type: "text",
    label: "deviceForm.fields.iccid",
    validation: Yup.string().required("deviceForm.validation.iccidRequired"),
  },
  telecom_provider1: {
    name: "telecom_provider1",
    type: "text",
    label: "deviceForm.fields.telecom_provider1",
    validation: Yup.string().required("deviceForm.validation.telecomProvider1Required"),
  },
  telecom_provider2: {
    name: "telecom_provider2",
    type: "text",
    label: "deviceForm.fields.telecom_provider2",
    validation:"",
  },
  msisdn1: {
    name: "msisdn1",
    type: "text",
    label: "deviceForm.fields.msisdn1",
    validation: Yup.string().matches(/^[0-9]+$/, "deviceForm.validation.msisdn1Number").required("deviceForm.validation.msisdn1Required"),
  },
  msisdn2: {
    name: "msisdn2",
    type: "text",
    label: "deviceForm.fields.msisdn2",
    validation: Yup.string().matches(/^[0-9]+$/, "deviceForm.validation.msisdn2Number"),
  },  
  remarks: {
    name:"remarks",
    type: "text",
    label: "deviceForm.fields.remarks",
    validation: "",
  },
};
