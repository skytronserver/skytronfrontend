import * as Yup from "yup";
export const permitMasterInitialsFields = {
    name: "",
    is_active: true
};

export const permitMasterFormFields = {
    name: {
        name: "name",
        type: "text",
        label: "Name",
        validation: Yup.string().required("Name is required").max(100, "Max 100 characters allowed"),
    },
    is_active: {
        name: "is_active",
        type: "select",
        label: "Status",
        options: [
            { value: true, label: "Active" },
            { value: false, label: "Inactive" },
        ],
        validation: Yup.boolean(),
    }
};
