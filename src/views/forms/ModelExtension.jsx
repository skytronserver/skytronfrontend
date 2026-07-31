import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import OTPComponent from "../../ui-component/OTPComponent";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";
import CustomLoader from "../../ui-component/CustomLoader";
import { modelExtensionInitials, modelExtensionFormField } from "../../formjson/modelExtension";
import { retriveTechnicalOnboardedModelList } from "../../helper";

import { useTranslation } from 'react-i18next';

const ModelExtension = ({ formTitle }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [updatedFormFields, setUpdatedFormField] = useState(modelExtensionFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const modelList = await retriveTechnicalOnboardedModelList();
      if (modelList.length > 0) {
        setUpdatedFormField(prevConfig => ({
          ...prevConfig,
          device_model: {
            ...prevConfig.device_model,
            options: modelList,
          },
        }));
      }

      setIsFormLoaded(true);
    })();
  }, [t]);

  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_model_id: deviceId,
    };
    const response = await handleOTPValidation(OTPData);

    if (response.code === "200") {
      setShowOTP(false);
      setAlert({
        error: false,
        message: t('deviceModelForm.otpVerified') || "Model has been successfully verified",
        errorList: [],
      });
      setOpen(true);
    } else {
      setAlert({
        error: true,
        message: (response.code === 400 || response.code === "400" || response.code === 401 || response.code === "401" || response.code === 403 || response.code === "403") 
          ? (t('deviceModelForm.wrongOtp') || "WRONG OTP") 
          : (t('deviceModelForm.internalServerError') || "Internal Server Error"),
        errorList: [],
      });
      setOpen(true);
    }
  };

  const handleOTPValidation = async (modelOtpData) => {
    try {
      const response = await OtpServices.sendCopOTP(modelOtpData);
      console.log(t('modelExtensionForm.otpVerified'));
      return { code: "200", message: response.data };
    } catch (error) {
      console.error(t('modelExtensionForm.submitError'), error.message);
      return {
        code: error.response?.status || "400",
        message: error.message,
        errors: error.response?.data,
      };
    }
  };

  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const handleModelChange = (event, formik) => {
    const fieldName = event.target.name;
    // eslint-disable-next-line eqeqeq
    // eslint-disable-next-line eqeqeq
    if (fieldName == "device_model") {
      (async () => {
        const getDetailsOf = {
          device_model_id: event.target.value,
        };
        try {
          const retrieveData = await DeviceModelServices.getModel(getDetailsOf);
          formik.setFieldValue("testAgency", retrieveData.data.test_agency);
          formik.setFieldValue("tacNo", retrieveData.data.tac_no);
          formik.setFieldValue("tacValidity", retrieveData.data.tac_validity);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(t('modelExtensionForm.dataNotFound'));
          } else {
            console.log(t('modelExtensionForm.fetchError'));
          }
        }
      })();
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
    const updatedValues = {
      ...values,
      approval: "0",
      approved_by: "",
      vendor_id: "32",
      created_by: "31",
      new_model_create: "0",
    };
    try {
      const response = await DeviceModelServices.copUpload(updatedValues);
      setDeviceId(response.data.id);
      setLoading(false);
      setShowOTP(true);
    } catch (error) {
      console.error(t('modelExtensionForm.submitError'), error.message);
    }
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
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title={t('modelExtensionForm.title')}>
            {!showOTP ? (
              isFormLoaded && <Formik
                initialValues={modelExtensionInitials}
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
                            handleOptionChange={handleModelChange}
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
                          {t('modelExtensionForm.submitForApproval')}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            ) : (
              <OTPComponent
                otp={otp}
                handleChange={handleChange}
                handleOTPSubmit={handleOTPSubmit}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ModelExtension;
