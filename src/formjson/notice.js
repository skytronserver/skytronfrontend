import * as Yup from "yup";
const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
];
export const initialValues = {
  title: "",
  detail: "",
  file: null,
  status: "",
};

export const formFields = {
  title: {
    name: "title",
    type: "text",
    label: "Title",
    validation: Yup.string().required("Title is required"),
  },
  detail: {
    name: "detail",
    type: "text",
    label: "Details",
    validation: Yup.string().required("Detail is required"),
  },
  status: {
    name: "status",
    type: "select",
    label: "Status",
    validation: Yup.string().required("Status is required"),
    options: [
      { label: "Live", value: "live" },
      { label: "Delete", value: "delete" },
    ],
  },
  file: {
    name: "file",
    type: "file",
    label: "Select Notice",
    message: "Only JPG, PDF, PNG files are allowed and must be below 512KB.",
    validation: Yup.mixed()
      .required("User ID Document is required")
      .test(
        "fileSize",
        "Max size is 520KB and supported files are pdf/png/jpg",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "Max size is 520KB and supported files are pdf/png/jpg",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
};
