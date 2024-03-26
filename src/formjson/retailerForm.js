import * as Yup from "yup";
export const retailerFormInitials = {
    name:"",
    address:"",
    address_pin:"",
    gstnnumber:"",
    document_path:null,
};

export const retailerFormField = {
  name: {
    name: "name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  address: {
    name: "address",
    type: "text",
    label: "Address",
    validation: Yup.string().required("Address is required"),
  },
  address_pin: {
    name: "address_pin",
    type: "text",
    label: "Address Pin",
    validation: Yup.string().required("Address PIN is required"),
  },
  gstnnumber: {
    name:"gstnnumber",
    type: "text",
    label: "GST No",
    validation: Yup.string().required("GST No is required"),
  },
  document_path: {
    name:"document_path",
    type: "file",
    label: "UserID Proof",
    validation: Yup.mixed().required("ID Proof is required"),
  },
};
