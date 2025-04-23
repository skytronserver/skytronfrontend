import * as Yup from "yup";

let modelList = [];

export const accessoryInitials = {
    serial_no: "",
    model: "",
    test_agency: "",
    tac_no: "",
    tac_validity: "",
    cop_no: "",
    cop_validity: "",
    quantity: "",
    remarks: "",
};

export const accessoryFormField = {
    serial_no: {
        name: "serial_no",
        type: "text",
        label: "form.accessory.serialNo", // Use translation key
        validation: Yup.string().required("form.validation.serialNoRequired"), // Use translation key
    },
    model: {
        name: "model",
        type: "select",
        label: "form.accessory.model", // Use translation key
        validation: Yup.string().required("form.validation.modelRequired"), // Use translation key
        options: modelList,
    },
    test_agency: {
        name: "test_agency",
        type: "text",
        label: "form.accessory.testAgency", // Use translation key
        disabled: true,
    },
    tac_no: {
        name: "tac_no",
        type: "text",
        disabled: true,
        label: "form.accessory.tacNo", // Use translation key
    },
    tac_validity: {
        name: "tac_validity",
        type: "date",
        disabled: true,
        label: "form.accessory.tacValidity", // Use translation key
    },
    cop_no: {
        name: "cop_no",
        type: "text",
        label: "form.accessory.copNo", // Use translation key
        disabled: true,
    },
    cop_validity: {
        name: "cop_validity",
        type: "date",
        label: "form.accessory.copValidity", // Use translation key
        disabled: true,
    },
    quantity: {
        name: "quantity",
        type: "text",
        label: "form.accessory.quantity", // Use translation key
        validation: Yup.number()
            .typeError("form.validation.quantityNumber") // Use translation key
            .positive("form.validation.quantityPositive") // Use translation key
            .integer("form.validation.quantityInteger") // Use translation key
            .required("form.validation.quantityRequired"), // Use translation key
    },
    remarks: {
        name: "remarks",
        type: "text",
        label: "form.accessory.remarks", // Use translation key
        validation: "",
    },
};