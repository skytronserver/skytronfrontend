import * as Yup from "yup";

export const initialValues = {
  holidayName: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "Active",
  holidayType: "",
};

export const formFields = {
  holidayName: {
    name: "holidayName",
    type: "text",
    label: "Holiday Name",
    validation: Yup.string().required("Holiday name is required"),
  },
  startDate: {
    name: "startDate",
    type: "date",
    label: "Start Date",
    validation: Yup.date().required("Start date is required"),
  },
  endDate: {
    name: "endDate",
    type: "date",
    label: "End Date",
    validation: Yup.date()
      .required("End date is required")
      .min(Yup.ref("startDate"), "End date must be after start date"),
  },
  description: {
    name: "description",
    type: "text",
    label: "Description",
    validation: Yup.string().required("Description is required"),
  },
  holidayType: {
    name: "holidayType",
    type: "select",
    label: "Holiday Type",
    validation: Yup.string().required("Holiday type is required"),
    options: [
      { label: "Public Holiday", value: "public" },
      { label: "School Holiday", value: "school" },
      { label: "Exam Holiday", value: "exam" },
      { label: "Other", value: "other" },
    ],
  },
  status: {
    name: "status",
    type: "select",
    label: "Status",
    validation: Yup.string().required("Status is required"),
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
}; 