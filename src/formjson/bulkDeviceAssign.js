import * as Yup from "yup";

let dealerList = [{value:'', label:'bulkDeviceAssign.options.waitingForDealers'}];

export const bulkDeviceAssignInitials = {
    dealer_id: "",
    excel_file: null,
};

export const bulkDeviceAssignField = {
  dealer_id: {
    name: "dealer_id",
    type: "select",
    label: "bulkDeviceAssign.fields.dealer",
    validation: Yup.string().required("bulkDeviceAssign.validation.dealerRequired"),
    options: dealerList,
  },
  excel_file: {
    name: "excel_file",
    type: "file",
    label: "bulkDeviceAssign.fields.excelFile",
    validation: Yup.mixed().required("bulkDeviceAssign.validation.excelFileRequired"),
  }
} 