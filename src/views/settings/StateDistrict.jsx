import { Button, CircularProgress, Grid } from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "ui-component/cards/MainCard";
import DialogComponent from "ui-component/DialogComponent";
import { convertErrorObjectToArray, retriveStateList, } from "helper";

//Datatables
import { useSelector, useDispatch } from "react-redux";
import { fetchStateList, fetchDistrictList } from "../../actions/settingAction";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { stateColumns, districtColumns } from "../../datatables/settingColumns";
function StateDistrict({
  fieldConfig,
  initialData,
  districtConfig,
  districtInitials,
}) {
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [loadAgain,setLoadAgain]=useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(districtConfig);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
          options: stateList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);
  //Datatables data using redux
  const dispatch = useDispatch();
  const stateList = useSelector((state) => state.setting.stateList);
  const districtList = useSelector((state) => state.setting.districtList);
  useEffect(() => {
    const retriveStateList = async () => {
      const response = await SettingService.filter_settings_State();
      dispatch(fetchStateList(response.data));
    };
    const retriveDistrictList = async () => {
      const res = await SettingService.filter_settings_District();
      dispatch(fetchDistrictList(res.data));
      setLoad(true);
    };
    retriveStateList();
    retriveDistrictList();
  }, [dispatch,loadAgain]);

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
  const districtValidationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );
  const createStateName = async (formData) => {
    try {
      const response = await SettingService.create_settings_State(formData);
      console.log("State Added Successfully");
      setLoadAgain(!loadAgain);
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
  const createDistrictName = async (formData) => {
    try {
      const resp = await SettingService.create_settings_District(formData);
      console.log("District Added Successfully");
      setLoadAgain(!loadAgain);
      return { code: "200", message: resp.data };
    } catch (error) {
      console.error("Error in API Service:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error?.response?.data || error?.resp?.data,
      };
    }
  };
  const handleDistrictSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const resp = await createDistrictName(values);
    if (resp.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      setLoading(false);
      resetForm(districtInitials);
    } else {
      console.log('District')
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(resp.errors),
      }));
      handleAlert("Form Not Submitted");
      setLoading(false);
    }
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const response = await createStateName(values);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      setLoading(false);
      resetForm(initialData);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(response.errors),
      }));
      handleAlert("Form Not Submitted");
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
          xs={6}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="Add State Name">
            <Formik
              initialValues={initialData}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(fieldConfig).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={fieldConfig[field]}
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
                        Add State
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </MainCard>
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="Add District Name">
            {isFormLoaded && <Formik
              initialValues={districtInitials}
              validationSchema={districtValidationSchema}
              onSubmit={handleDistrictSubmit}
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
                        Add District
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
        <Grid
          item
          xs={6}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="State List">
            {load && (
              <DynamicDatatables
                tableTitle=""
                rows={stateList}
                columns={stateColumns}
              />
            )}
          </MainCard>
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="District List">
            {load && (
              <DynamicDatatables
                tableTitle=""
                rows={districtList}
                columns={districtColumns}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}

export default StateDistrict;
