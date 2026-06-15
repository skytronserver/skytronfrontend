import * as Yup from "yup";
export const vehicleCategoryCodeInitialsFields = {
    category_code: "",
    details: "",
    speed_limit: "",
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
    speed_limit: {
        name: "speed_limit",
        type: "text",
        label: "Speed Limit",
        validation: Yup.string().nullable().max(5, "Max 5 characters allowed"),
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
