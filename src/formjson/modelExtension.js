import * as Yup from "yup";
let modelList = [{label:'Waiting for Model',value:''}];
export const modelExtensionInitials = {
  device_model: "",
  testAgency: "",
  tacNo: "",
  tacValidity: "",
  cop_no: "",
  cop_validity: "",
  cop_file: null,
};
export const modelExtensionFormField = {
  device_model: {
    name: "device_model",
    type: "select",
    label: "modelExtensionForm.fields.model",
    validation: Yup.string().required("modelExtensionForm.validation.modelRequired"),
    options: modelList,
  },
  testAgency: {
    name: "testAgency",
    type: "text",
    disabled: true,
    label: "modelExtensionForm.fields.testAgency",
    validation: Yup.string().required("modelExtensionForm.validation.testAgencyRequired"),
  },
  tacNo: {
    name: "tacNo",
    type: "text",
    disabled: true,
    label: "modelExtensionForm.fields.tacNo",
    validation: Yup.string().required("modelExtensionForm.validation.tacNoRequired"),
  },
  tacValidity: {
    name: "tacValidity",
    type: "date",
    disabled: true,
    label: "modelExtensionForm.fields.tacValidity",
    validation: Yup.date().required("modelExtensionForm.validation.tacValidityRequired"),
  },
  cop_no: {
    name: "cop_no",
    type: "text",
    label: "modelExtensionForm.fields.copNo",
    validation: Yup.string().required("modelExtensionForm.validation.copNoRequired"),
  },
  cop_validity: {
    name: "cop_validity",
    type: "date",
    label: "modelExtensionForm.fields.copValidity",
    validation: Yup.date().required("modelExtensionForm.validation.copValidityRequired"),
  },
  cop_file: {
    name: "cop_file",
    type: "file",
    label: "modelExtensionForm.fields.uploadCop",
    validation: Yup.mixed().required("modelExtensionForm.validation.copRequired"),
  },
};
