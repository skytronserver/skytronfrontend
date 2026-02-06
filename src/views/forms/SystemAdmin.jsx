import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../../ui-component/CustomTextField";
import { useTranslation } from "react-i18next";

const SystemAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ========================= Fields ========================= */
  const systemAdminFormFields = {
    name: {
      name: "name",
      type: "text",
      label: "systemAdmin.fields.name",
      validation: Yup.string().required("systemAdmin.validation.nameRequired"),
    },
    email: {
      name: "email",
      type: "text",
      label: "systemAdmin.fields.email",
      validation: Yup.string()
        .email("systemAdmin.validation.invalidEmail")
        .required("systemAdmin.validation.emailRequired"),
    },
    mobile: {
      name: "mobile",
      type: "tel",
      label: "systemAdmin.fields.mobile",
      validation: Yup.string()
        .matches(/^\d{10}$/, "systemAdmin.validation.mobileFormat")
        .required("systemAdmin.validation.mobileRequired"),
    },
    dob: {
      name: "dob",
      type: "date",
      label: "systemAdmin.fields.dob",
      validation: Yup.string().required("systemAdmin.validation.dobRequired"),
    },
    lat: {
      name: "lat",
      type: "number",
      label: "systemAdmin.fields.lat",
      validation: Yup.number().nullable(),
    },
    lon: {
      name: "lon",
      type: "number",
      label: "systemAdmin.fields.lon",
      validation: Yup.number().nullable(),
    },
  };

  const initialValues = {
    name: "",
    email: "",
    mobile: "",
    dob: "",
    lat: "",
    lon: "",
  };

  const validationSchema = Yup.object(
    Object.keys(systemAdminFormFields).reduce((acc, key) => {
      acc[key] = systemAdminFormFields[key].validation;
      return acc;
    }, {})
  );

  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ error: false, message: "", errorList: [] });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!alert.error) navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);

    try {
      await UserServices.createSystemAdmin(values);

      setAlert({
        error: false,
        message: t("form.success"),
        errorList: [],
      });

      setOpen(true);
      resetForm();
    } catch (error) {
      setAlert({
        error: true,
        message: t("form.error"),
        errorList: error.response?.data || [],
      });

      setOpen(true);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  /* ========================= UI ========================= */
  return (
    <>
      <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div className="spinner-div">
            <CircularProgress size={50} />
          </div>
        )}

        <Grid item xs={12}>
          <MainCard title={t("systemAdmin.createTitle")}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2}>
                    {Object.keys(systemAdminFormFields).map((key) => (
                      <Grid key={key} item md={6} xs={12}>
                        <FormField
                          fieldConfig={systemAdminFormFields[key]}
                          formik={formik}
                          t={t}
                        />
                      </Grid>
                    ))}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                      >
                        {t("form.submit")}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default SystemAdmin;