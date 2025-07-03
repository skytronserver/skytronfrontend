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
    label: "notice.title.label",
    validation: Yup.string().required("notice.title.required"),
  },
  detail: {
    name: "detail",
    type: "text",
    label: "notice.detail.label",
    validation: Yup.string().required("notice.detail.required"),
  },
  status: {
    name: "status",
    type: "select",
    label: "status.label",
    validation: Yup.string().required("status.required"),
    options: [
      { label: "status.live", value: "live" },
      { label: "status.deleted", value: "deleted" },
    ],
  },
  file: {
    name: "file",
    type: "file",
    label: "notice.file.label",
    message: "notice.file.message",
    validation: Yup.mixed()
      .required("notice.file.required")
      .test(
        "fileSize",
        "notice.file.sizeError",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "notice.file.formatError",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
};
