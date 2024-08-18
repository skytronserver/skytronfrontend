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
    label: "IMEI No.",
    validation: Yup.string().matches(/^[0-9]+$/, "IMEI No. must be a number").required("IMEI No. is required"),
  },
  model: {
    name: "model",
    type: "select",
    label: "Model",
    validation: Yup.string().required("Model is required"),
    options: modelList,
  },
  test_agency: {
    name: "test_agency",
    type: "text",
    label: "Test Agency Name",
    disabled:true,
  },
  device_esn: {
    name: "device_esn",
    type: "text",
    label: "Device ESN",
    validation: Yup.string().required("Device ESN cannot be blank"),
  },
  esim_validity: {
    name:"esim_validity",
    type: "date",
    label: "eSIM Validity",
    validation: Yup.date().required("eSIM Validity is required"),
  },
  esim_provider: {
    name:"esim_provider",
    type: "multiselect",
    label: "eSIM Provider",
    validation: Yup.array().required("eSIM Provider is required"),
    options: providerList
  },
  tac_no: {
    name: "tac_no",
    type: "text",
    disabled:true,
    label: "Tac No",
  },
  tac_validity: {
    name:"tac_validity",
    type: "date",
    disabled:true,
    label: "TAC Validity",
  },
  cop_no: {
    name: "cop_no",
    type: "text",
    label: "COP No",
    disabled:true,
  },
  cop_validity: {
    name:"cop_validity",
    type: "date",
    label: "COP Validity",
    disabled:true,
  },
  
  iccid: {
    name: "iccid",
    type: "text",
    label: "eSIM No (ICCID)",
    validation: Yup.string().required("eSIM No (ICCID) is required field"),
  },
  telecom_provider1: {
    name: "telecom_provider1",
    type: "text",
    label: "eSIM Telecom Service Provider 1",
    validation: Yup.string().required("eSIM Telecom Service Provider 1 is required field"),
  },
  telecom_provider2: {
    name: "telecom_provider2",
    type: "text",
    label: "eSIM Telecom Service Provider 2",
    validation:"",
  },
  msisdn1: {
    name: "msisdn1",
    type: "text",
    label: "eSIM Mobile No. MSISDN 1",
    validation: Yup.string().matches(/^[0-9]+$/, "eSIM Mobile No. MSISDN 1 must be a number").required("eSIM Mobile No. MSISDN 1 is required field"),
  },
  msisdn2: {
    name: "msisdn2",
    type: "text",
    label: "eSIM Mobile No. MSISDN 2",
    validation:Yup.string().matches(/^[0-9]+$/, "eSIM Mobile No. MSISDN 2 must be a number"),
  },  
  remarks: {
    name:"remarks",
    type: "text",
    label: "Remarks",
    validation: "",
  },
};
