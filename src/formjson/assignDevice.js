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
    label: "assignDeviceForm.fields.dealer",
    validation: Yup.string().required("assignDeviceForm.validation.dealerRequired"),
    options: dealerList,
  },
  device: {
    name: "device",
    type: "multiselect",
    label: "assignDeviceForm.fields.device",
    options: modelList,
  },
  shipping_remark: {
    name: "shipping_remark",
    type: "text",
    label: "assignDeviceForm.fields.shippingRemark",
  },
};
