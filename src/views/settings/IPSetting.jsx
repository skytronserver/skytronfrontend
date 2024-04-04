import { Button, CircularProgress, Grid } from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "ui-component/cards/MainCard";
import DialogComponent from "ui-component/DialogComponent";
import { convertErrorObjectToArray } from "helper";
import {
  ipSettingInitials,
  ipSettingFormFields,
} from "../../formjson/ipSetting";
import {useSelector,useDispatch} from 'react-redux'
import { fetchIPSettingList } from '../../actions/settingAction';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {ipSettingColumns} from '../../datatables/settingColumns';

function IPSetting() {
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);

  const dispatch=useDispatch();
  const ipSettingList=useSelector((state)=>state.setting.ipSettingList);

  useEffect(()=>{
    const retriveIpSetting = async () => {
      const response=await SettingService.filter_settings_ip();
      dispatch(fetchIPSettingList(response.data)) ;
      setLoad(true)
    };
    retriveIpSetting();
  },[dispatch])
  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const validationIPSettingSchema = Yup.object(
    Object.keys(ipSettingFormFields).reduce((acc, field) => {
      acc[field] = ipSettingFormFields[field].validation;
      return acc;
    }, {})
  );
  const createIPSetting = async (formData) => {
    try {
      const response = await SettingService.create_settings_ip(formData);
      console.log("Created successfully", response.data);
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
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      setLoading(false);
      resetForm(ipSettingInitials);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(resp.errors),
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
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="IP Setting">
            <Formik
              initialValues={ipSettingInitials}
              validationSchema={validationIPSettingSchema}
              onSubmit={handleIPSettingSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(ipSettingFormFields).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={ipSettingFormFields[field]}
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
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </MainCard>
        </Grid>
      </Grid>
      <br/>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}>
          <MainCard title="IP Setting Report List">
        {load && <DynamicDatatables tableTitle="" rows={ipSettingList} columns={ipSettingColumns}/>}
        </MainCard>
        </Grid>
    </Grid>
    </>
  );
}
export default IPSetting;
