/* eslint-disable no-unused-vars */
import { Grid, Button } from "@mui/material";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import DealerServices from "../../services/DealerServices";
import CustomLoader from "../../ui-component/CustomLoader";
import { useTranslation } from 'react-i18next';
import {
  assignDeviceFormFields,
  assignDeviceInitials,
} from "../../formjson/assignDevice";
import {
  retriveDeviceModelList,
  retriveDealerList,
  convertErrorObjectToArray,
} from "../../helper";
import MainCard from "../../ui-component/cards/MainCard";
import "./form.css";

const AssignDevice = () => {
  const { t } = useTranslation();
  const [updatedFormFields, setUpdatedFormField] = useState(
    assignDeviceFormFields
  );
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });

  const [loading, setLoading] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const fetchInitialData = async () => {
    const filter = { stock_status: "NotAssigned" };
    const deviceList = await retriveDeviceModelList(filter);
    const dealerList = await retriveDealerList();
    setUpdatedFormField((prevConfig) => ({
      ...prevConfig,
      dealer: {
        ...prevConfig.dealer,
        options: dealerList,
      },
      device: {
        ...prevConfig.device,
        options: deviceList,
      },
    }));
    setIsFormLoaded(true);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);

    const manualImeis = values.device_text
      ? values.device_text.split(/[,\s\n]+/).map((i) => i.trim()).filter((i) => i !== "")
      : [];

    const availableOptions = updatedFormFields.device.options || [];
    const matchedIds = [];
    let matchCount = 0;

    manualImeis.forEach((imei) => {
      const match = availableOptions.find((opt) => opt.label === imei);
      if (match) {
        matchedIds.push(match.value);
        matchCount++;
      }
    });

    const combinedDeviceIds = Array.from(new Set([...values.device, ...matchedIds]));

    const submissionData = {
      ...values,
      device: combinedDeviceIds,
    };

    try {
      const response = await DealerServices.assignDeviceToDealer(submissionData);
      setDeviceId(response.data.id);

      let successMessage = t("common.formSubmittedSuccessfully");
      if (manualImeis.length > 0) {
        if (matchCount < manualImeis.length) {
          successMessage = `${matchCount} out of ${manualImeis.length} manual IMEI assigned. Some IMEIs were not found or have expired TAC/COP validity. Total ${combinedDeviceIds.length} devices assigned.`;
        } else {
          successMessage = `${matchCount} manual IMEI assigned. Total ${combinedDeviceIds.length} devices assigned.`;
        }
      }

      setAlert({
        error: false,
        message: successMessage,
        errorList: [],
      });
      setOpen(true);
      resetForm(assignDeviceInitials);
      await fetchInitialData();
    } catch (error) {
      if (error.message === "Network Error") {
        setApiError(true);
      } else {
        const errorData = error.response?.data || error.message;
        setAlert((prevAlert) => ({
          ...prevAlert,
          error: true,
          message: t("common.formNotSubmitted"),
          errorList: convertErrorObjectToArray(errorData),
        }));
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (event, formik) => {
    const selectedIds = event.target.value;
    const availableOptions = updatedFormFields.device.options || [];
    const selectedLabels = availableOptions
      .filter((opt) => selectedIds.includes(opt.value))
      .map((opt) => opt.label);
    formik.setFieldValue("device_text", selectedLabels.join(","));
  };

  const handleDeviceTextChange = (event) => {
    const text = event.target.value;
    const inputImeis = text.split(",").map((i) => i.trim()).filter((i) => i !== "");
    const availableOptions = updatedFormFields.device.options || [];
    const matchedIds = availableOptions
      .filter((opt) => inputImeis.includes(opt.label))
      .map((opt) => opt.value);
    // Note: We use setTimeout or setFieldValue directly. 
    // But since this is called from FormField's internal onChange which already sets device_text,
    // we only need to sync the device select field.
    return matchedIds;
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
        {loading && <CustomLoader />}
        {apiError && (
          <Alert severity="error" style={{ marginBottom: "16px" }}>
            <AlertTitle>{t('common.internalServerError')}</AlertTitle>
            {t('common.serverErrorContactAdmin')}
          </Alert>
        )}
        <Grid item xs={12} className={loading ? "loading" : "not-loading"}>
          <MainCard title={t('assignDeviceForm.title')}>
            {isFormLoaded && (
              <Formik
                initialValues={assignDeviceInitials}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(updatedFormFields).map((field) => (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={updatedFormFields[field]}
                            formik={formik}
                            handleFileChange={handleFileChange}
                            handleOptionChange={field === "device" ? (e) => handleDeviceChange(e, formik) : undefined}
                            onChange={field === "device_text" ? (e) => {
                              const matched = handleDeviceTextChange(e);
                              formik.setFieldValue("device", matched);
                            } : undefined}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} style={{ marginTop: "20px" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          {t('common.submit')}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default AssignDevice;
