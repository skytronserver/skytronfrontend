import * as Yup from "yup";

let modelList = [];
let dealerList = [];

export const assignDeviceInitials = {
  dealer: "",
  device: [],
  shipping_remark: "",
};
export const assignDeviceFormFields = {
  dealer: {
    name: "dealer",
    type: "select",
    label: "Dealer",
    validation: Yup.string().required("Dealer is required"),
    options: dealerList,
  },
  device: {
    name: "device",
    type: "multiselect",
    label: "Device",
    options: modelList,
  },
  shipping_remark: {
    name: "shipping_remark",
    type: "text",
    label: "Remarks",
  },
};
