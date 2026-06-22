import { Button, CircularProgress, Grid } from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { convertErrorObjectToArray, retriveModelList, retriveTechnicalOnboardedModelList, decipherEncryption } from "../../helper";
import {
  hpFrequencyFields,
  otaFields,
  firmwareFields,
  hpFrequencyInitials,
  otaInitials,
  firmwareInitials,
} from "../../formjson/hpFrequencyFirmware";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchFirmwareList,
  fetchFrequencyList,
  fetchOtaList,
} from "../../actions/settingAction";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import {
  frequencyColumns,
  otaColumns,
  firmwareColumns,
} from "../../datatables/settingColumns";
import { useTranslation } from 'react-i18next';

function FrequencyFirmware() {
  const { t } = useTranslation();
  const myDecipher = decipherEncryption('skytrack');
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const data = userData && userData.split("-").map(item => myDecipher(item));
  const userRole = data && data.length > 2 && data[1];
  const isManufacturer = userRole === 'devicemanufacture';
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [firmwareFormFields,setFirmwareFormFields]=useState(firmwareFields);
  const [frequencyForm,setFrequencyForm]=useState(hpFrequencyFields);
  const [otaForm,setOtaForm]=useState(otaFields);
  const [isFormLoaded,setIsFormLoaded]=useState(false);
  const [eligibleModels, setEligibleModels] = useState([]);
  useEffect(()=>{
    (async()=>{
    const modelList = isManufacturer ? await retriveTechnicalOnboardedModelList() : await retriveModelList();
    setEligibleModels(modelList);
    setFirmwareFormFields(prevConfig =>({
      ...prevConfig,
      devicemodel: {
        ...prevConfig.devicemodel,
        options: modelList,
      },
    }))
    setFrequencyForm(prevConfig =>({
      ...prevConfig,
      devicemodel: {
        ...prevConfig.devicemodel,
        options: modelList,
      },
    }))
    setOtaForm(prevConfig =>({
      ...prevConfig,
      devicemodel: {
        ...prevConfig.devicemodel,
        options: modelList,
      },
    }))
    setIsFormLoaded(true)
    }
  )()
  },[])
  //Fetching Data from store
  const dispatch = useDispatch();
  const frequencyList = useSelector((state) => state.setting.frequencyList);
  const otaList = useSelector((state) => state.setting.otaList);
  const firmwareList = useSelector((state) => state.setting.firmwareList);
  useEffect(() => {
    const retriveFrequency = async () => {
      const response = await SettingService.filter_settings_hp_freq();
      dispatch(fetchFrequencyList(response.data));
    };
    const retriveOta = async () => {
      try {
        const response = await SettingService.filter_settings_ota({
          page: 1,
          page_size: 100,
        });

        const otaData = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data?.results)
          ? response.data.results
          : Array.isArray(response?.data)
          ? response.data
          : [];

        dispatch(fetchOtaList(otaData));
      } catch (error) {
        console.error("Failed to fetch OTA settings", error);
        dispatch(fetchOtaList([]));
      }
    };
    const retriveFirmware = async () => {
      const res = await SettingService.filter_settings_firmware();
      dispatch(fetchFirmwareList(res.data));
      setLoad(true);
    };
    retriveFrequency();
    retriveOta();
    retriveFirmware();
  }, [dispatch]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const validationFrequencySchema = Yup.object(
    Object.keys(frequencyForm).reduce((acc, field) => {
      acc[field] = frequencyForm[field].validation;
      return acc;
    }, {})
  );
  const validationOtaSchema = Yup.object(
    Object.keys(otaForm).reduce((acc, field) => {
      acc[field] = otaForm[field].validation;
      return acc;
    }, {})
  );
  const validationFirmwareSchema = Yup.object(
    Object.keys(firmwareFormFields).reduce((acc, field) => {
      acc[field] = firmwareFormFields[field].validation;
      return acc;
    }, {})
  );
  const createFrequency = async (formData) => {
    try {
      const response = await SettingService.create_settings_hp_freq(formData);
      console.log("HP Frequency added successfully");
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error in API Service:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };
  const createOta = async (formData) => {
    try {
      const response = await SettingService.create_settings_ota(formData);
      console.log("OTA Settings added successfully");
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error in API Service:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };
  const createFirmware = async (formData) => {
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, formData[key]);
      });
      const resp = await SettingService.create_settings_firmware(dataToSend);
      console.log("Firmware added successfully");
      return { code: "200", message: resp.data };
    } catch (error) {
      console.error("Error in API Service:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.resp.data,
      };
    }
  };
  const handleFrequencySubmit = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setSubmitting(true);
    setLoading(true);
    const resp = await createFrequency(values);
    if (resp.code === "200") {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: false,
        errorList: [],
      }));
      handleAlert(t('common.formSubmitSuccess'));
      setSubmitting(false);
      setLoading(false);
      resetForm(hpFrequencyInitials);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(resp.errors),
      }));
      handleAlert(t('common.formSubmitError'));
      setLoading(false);
    }
  };
  const handleOtaSubmit = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setSubmitting(true);
    setLoading(true);
    // Add active: true by default to the form data
    const otaData = {
      ...values,
      active: true
    };
    const resp = await createOta(otaData);
    if (resp.code === "200") {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: false,
        errorList: [],
      }));
      handleAlert(t('common.formSubmitSuccess'));
      setSubmitting(false);
      setLoading(false);
      resetForm(otaInitials);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(resp.errors),
      }));
      handleAlert(t('common.formSubmitError'));
      setLoading(false);
    }
  };
  const handleFirmwareSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const response = await createFirmware(values);
    if (response.code === "200") {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: false,
        errorList: [],
      }));
      handleAlert(t('common.formSubmitSuccess'));
      setSubmitting(false);
      setLoading(false);
      resetForm(firmwareInitials);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(response.errors),
      }));
      handleAlert(t('common.formSubmitError'));
      setLoading(false);
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
        {!isManufacturer && (
          <Grid
            item
            xs={6}
            style={{
              opacity: loading ? 0.5 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <MainCard title={t('ota.title')}>
              {isFormLoaded && <Formik
                initialValues={otaInitials}
                validationSchema={validationOtaSchema}
                onSubmit={handleOtaSubmit}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(otaForm).map((field) => (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={otaForm[field]}
                            formik={formik}
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
              </Formik>}
            </MainCard>
          </Grid>
        )}
        <Grid
          item
          xs={isManufacturer ? 12 : 6}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title={t('firmware.title')}>
           {isFormLoaded &&  <Formik
              initialValues={firmwareInitials}
              validationSchema={validationFirmwareSchema}
              onSubmit={handleFirmwareSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(firmwareFormFields).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={firmwareFormFields[field]}
                          formik={formik}
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
}
          </MainCard>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={gridSpacing}>
        {!isManufacturer && (
          <Grid
            item
            xs={6}
            style={{
              opacity: loading ? 0.5 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <MainCard title={t('ota.listTitle')}>
              {load && (
                <DynamicDatatables
                   tableTitle={t('ota.listTitle')}
                  rows={isManufacturer 
                    ? otaList.filter(item => {
                        const modelId = item.devicemodel || item.devicemodel_info?.id;
                        return modelId && eligibleModels.some(m => String(m.value) === String(modelId));
                      })
                    : otaList
                  }
                  columns={otaColumns}
                />
              )}
            </MainCard>
          </Grid>
        )}
        <Grid
          item
          xs={isManufacturer ? 12 : 6}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title={t('firmware.listTitle')}>
            {load && (
              <DynamicDatatables
                tableTitle={t('firmware.listTitle')}
                rows={isManufacturer 
                  ? firmwareList.filter(item => {
                      const modelId = item.devicemodel || item.devicemodel_info?.id;
                      return modelId && eligibleModels.some(m => String(m.value) === String(modelId));
                    })
                  : firmwareList
                }
                columns={firmwareColumns}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
export default FrequencyFirmware;
