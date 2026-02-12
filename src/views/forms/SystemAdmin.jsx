import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../../ui-component/CustomTextField";
import { useTranslation } from "react-i18next";

const SystemAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ================= Fields (dynamic translation safe) ================= */

  const systemAdminFormFields = useMemo(() => ({
    name: {
      name: "name",
      type: "text",
      label: t("systemAdmin.fields.name"),
      validation: Yup.string().required(t("systemAdmin.validation.nameRequired"))
    },
    email: {
      name: "email",
      type: "text",
      label: t("systemAdmin.fields.email"),
      validation: Yup.string()
        .email(t("systemAdmin.validation.invalidEmail"))
        .required(t("systemAdmin.validation.emailRequired"))
    },
    mobile: {
      name: "mobile",
      type: "tel",
      label: t("systemAdmin.fields.mobile"),
      validation: Yup.string()
        .matches(/^\d{10}$/, t("systemAdmin.validation.mobileFormat"))
        .required(t("systemAdmin.validation.mobileRequired"))
    },
    dob: {
      name: "dob",
      type: "date",
      label: t("systemAdmin.fields.dob"),
      validation: Yup.string().required(t("systemAdmin.validation.dobRequired"))
    },
    lat: {
      name: "lat",
      type: "number",
      label: t("systemAdmin.fields.lat"),
      validation: Yup.number().nullable()
    },
    lon: {
      name: "lon",
      type: "number",
      label: t("systemAdmin.fields.lon"),
      validation: Yup.number().nullable()
    }
  }), [t]); // ✅ re-translate when language changes

  /* ================= Form Config ================= */

  const initialValues = {
    name: "",
    email: "",
    mobile: "",
    dob: "",
    lat: "",
    lon: ""
  };

  const validationSchema = Yup.object(
    Object.fromEntries(
      Object.keys(systemAdminFormFields).map((k) => [
        k,
        systemAdminFormFields[k].validation
      ])
    )
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
        errorList: []
      });

      resetForm();
      setOpen(true);
    } catch (error) {
      setAlert({
        error: true,
        message: t("form.error"),
        errorList: error.response?.data || []
      });

      setOpen(true);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  /* ================= UI ================= */

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
                        />
                      </Grid>
                    ))}

                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" disabled={loading}>
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