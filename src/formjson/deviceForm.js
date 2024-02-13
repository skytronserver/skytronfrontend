import * as Yup from "yup";
import {retriveModelList} from "../helper"
const modelList=await retriveModelList();
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
    imsi1:"",
    imsi2:"",
    esim_validity:"",
    esim_provider:"",
    remarks:"",
};
export const deviceFormField = {
  imei: {
    name: "imei",
    type: "text",
    label: "ID/IMEI No.",
    validation: Yup.string().required("ID/IMEI No. is required"),
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
    type: "text",
    label: "eSIM Provider",
    validation: Yup.string().required("eSIM Provider is required"),
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
    validation: Yup.string().required("eSIM Mobile No. MSISDN 1 is required field"),
  },
  msisdn2: {
    name: "msisdn2",
    type: "text",
    label: "eSIM Mobile No. MSISDN 2",
    validation:"",
  },
  imsi1: {
    name: "imsi1",
    type: "text",
    label: "eSIM IMSI 1",
    validation: Yup.string().required("eSIM IMSI 1 is required field"),
  },
  imsi2: {
    name: "imsi2",
    type: "text",
    label: "eSIM IMSI 2",
    validation:"",
  },
  
  remarks: {
    name:"remarks",
    type: "text",
    label: "Remarks",
    validation: "",
  },
};
