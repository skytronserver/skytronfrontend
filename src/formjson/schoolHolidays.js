import * as Yup from "yup";

export const initialValues = {
  holidayName: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "Active",
  holidayType: "",
};

export const getFormFields = (t) => ({
  holidayName: {
    name: "holidayName",
    type: "text",
    label: t('holiday.name'),
    validation: Yup.string().required(t('holiday.form.validation.nameRequired')),
  },
  startDate: {
    name: "startDate",
    type: "date",
    label: t('holiday.startDate'),
    validation: Yup.date().required(t('holiday.form.validation.startDateRequired')),
  },
  endDate: {
    name: "endDate",
    type: "date",
    label: t('holiday.endDate'),
    validation: Yup.date()
      .required(t('holiday.form.validation.endDateRequired'))
      .min(Yup.ref("startDate"), t('holiday.form.validation.endDateAfterStart')),
  },
  description: {
    name: "description",
    type: "text",
    label: t('holiday.form.description'),
    validation: Yup.string().required(t('holiday.form.validation.descriptionRequired')),
  },
  holidayType: {
    name: "holidayType",
    type: "select",
    label: t('holiday.type'),
    validation: Yup.string().required(t('holiday.form.validation.typeRequired')),
    options: [
      { label: t('holiday.form.types.public'), value: "public" },
      { label: t('holiday.form.types.school'), value: "school" },
      { label: t('holiday.form.types.exam'), value: "exam" },
      { label: t('holiday.form.types.other'), value: "other" },
    ],
  },
  status: {
    name: "status",
    type: "select",
    label: t('common.status'),
    validation: Yup.string().required(t('holiday.form.validation.statusRequired')),
    options: [
      { label: t('holiday.form.status.active'), value: "Active" },
      { label: t('holiday.form.status.inactive'), value: "Inactive" },
    ],
  },
}); 