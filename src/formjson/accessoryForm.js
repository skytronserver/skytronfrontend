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
        label: "Serial No.",
        validation: Yup.string().required("Serial No. is required"),
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
        disabled: true,
    },
    tac_no: {
        name: "tac_no",
        type: "text",
        disabled: true,
        label: "Tac No",
    },
    tac_validity: {
        name: "tac_validity",
        type: "date",
        disabled: true,
        label: "TAC Validity",
    },
    cop_no: {
        name: "cop_no",
        type: "text",
        label: "COP No",
        disabled: true,
    },
    cop_validity: {
        name: "cop_validity",
        type: "date",
        label: "COP Validity",
        disabled: true,
    },
    quantity: {
        name: "quantity",
        type: "text",
        label: "Quantity",
        validation: Yup.number()
            .typeError("Quantity must be a number")
            .positive("Quantity must be positive")
            .integer("Quantity must be an integer")
            .required("Quantity is required"),
    },
    remarks: {
        name: "remarks",
        type: "text",
        label: "Remarks",
        validation: "",
    },
}; 