import * as Yup from "yup";
export const vehicleCategoryCodeInitialsFields = {
    category_code: "",
    details: "",
    is_active: true
};

export const vehicleCategoryCodeFormFields = {
    category_code: {
        name: "category_code",
        type: "text",
        label: "Category Code",
        validation: Yup.string().required("Category Code is required").max(50, "Max 50 characters allowed"),
    },
    details: {
        name: "details",
        type: "text",
        label: "Details",
        validation: Yup.string().nullable(),
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
