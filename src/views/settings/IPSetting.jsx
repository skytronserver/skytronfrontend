import { Button, CircularProgress, Grid } from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import {
  ipSettingInitials,
  ipSettingFormFields,
} from "../../formjson/ipSetting";
import { useSelector, useDispatch } from "react-redux";
import { fetchIPSettingList } from "../../actions/settingAction";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { ipSettingColumns } from "../../datatables/settingColumns";
import { retriveModelList, retriveStateList,convertErrorObjectToArray } from "../../helper";
import { useTranslation } from 'react-i18next';

function IPSetting() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const ipSettingList = useSelector((state) => state.setting.ipSettingList);
  const [updatedFormFields, setUpdatedFormField] =
    useState(ipSettingFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const modelList = await retriveModelList();
      const stateList = await retriveStateList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
          options: stateList,
        },
        devicemodel: {
          ...prevConfig.devicemodel,
          options: modelList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);
  useEffect(() => {
    const retriveIpSetting = async () => {
      try {
        const response = await SettingService.filter_settings_ip();
        const data = Array.isArray(response?.data?.results)
          ? response.data.results
          : Array.isArray(response?.data)
          ? response.data
          : [];
        dispatch(fetchIPSettingList(data));
      } catch (error) {
        console.error("Error fetching IP settings list:", error);
      } finally {
        setLoad(true);
      }
    };
    retriveIpSetting();
  }, [dispatch]);
  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const validationIPSettingSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );
  const createIPSetting = async (formData) => {
    try {
      const response = await SettingService.create_settings_ip(formData);
      console.log("Created successfully");
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
  const handleIPSettingSubmit = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setSubmitting(true);
    setLoading(true);
    const resp = await createIPSetting(values);
    if (resp.code === "200") {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: false,
        errorList: [],
      }));
      handleAlert(t('common.formSubmitSuccess'));
      setSubmitting(false);
      setLoading(false);
      resetForm(ipSettingInitials);
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
          <MainCard title={t('menu.ipSetting')}>
            {isFormLoaded && (
              <Formik
                initialValues={ipSettingInitials}
                validationSchema={validationIPSettingSchema}
                onSubmit={handleIPSettingSubmit}
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
      <br />
      <Grid container spacing={gridSpacing}>
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title={t('ipSetting.listTitle')}>
            {load && (
              <DynamicDatatables
                tableTitle={t('ipSetting.listTitle')}
                rows={ipSettingList}
                columns={ipSettingColumns}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
export default IPSetting;
