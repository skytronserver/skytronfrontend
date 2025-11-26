import { Button, CircularProgress, Grid, FormControlLabel, Checkbox } from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import * as Yup from "yup";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { convertErrorObjectToArray } from "../../helper";
import { useTranslation } from 'react-i18next';

function NotificationPreferences({ fieldConfig, initialData }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(initialData);

  useEffect(() => {
    const loadCurrentPreferences = async () => {
      try {
        const resp = await SettingService.fetchNotificationPreferences();
        if (resp.data?.data) {
          setCurrentSettings(resp.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notification preferences:", error);
      }
    };
    loadCurrentPreferences();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const validationSchema = Yup.object(
    Object.keys(fieldConfig).reduce((acc, field) => {
      acc[field] = fieldConfig[field].validation;
      return acc;
    }, {})
  );

  const updatePreferences = async (formData) => {
    try {
      const response = await SettingService.updateNotificationPreferences(formData);
      console.log("Notification Preferences Updated Successfully");
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error in API Service:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response?.data,
      };
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const response = await updatePreferences(values);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert(t('common.formSubmitSuccess'));
      setSubmitting(false);
      setLoading(false);
      setCurrentSettings(values);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(response.errors),
      }));
      handleAlert(t('common.formSubmitError'));
      setLoading(false);
    }
    setSubmitting(false);
  };

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
          <div
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              background: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <CircularProgress
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              size={50}
            />
          </div>
        )}
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title={t('notificationPreferences.title')}>
            <Formik
              initialValues={currentSettings}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(fieldConfig).map((field) => (
                      <Grid key={field} item md={12} sm={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formik.values[field]}
                              onChange={(e) => {
                                formik.setFieldValue(field, e.target.checked);
                              }}
                              name={field}
                              color="primary"
                            />
                          }
                          label={t(fieldConfig[field].label)}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} style={{ marginTop: "20px" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || formik.isSubmitting}
                      >
                        {t('notificationPreferences.saveButton')}
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
}

export default NotificationPreferences;
