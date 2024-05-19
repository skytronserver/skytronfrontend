import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import SettingService from "../../services/SettingService";
import DialogComponent from "../../ui-component/DialogComponent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertErrorObjectToArray } from "../../helper";
import {stateAdminInitialValues,stateAdminField} from "../../formjson/stateAdmin"
const StateAdmin = () => {
  const [updatedFormFields,setUpdatedFormField]=useState(stateAdminField);
  const [isFormLoaded,setIsFormLoaded]=useState(false)
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  //Changes from here
  const retriveStateList = async () => {
    try {
      const response = await SettingService.filter_settings_State();
      const list=response.data.map(device => ({
        value: device.id,
        label: device.state,
      })); 
      return list;
    } catch (error) {
      if (error.response && error.response.status === 404) {
       console.log('No Data Found')
      } else {
        console.log('No Data Found')
      }
    }
  };
  useEffect(()=>{
    (async()=>{
    const stateList=await retriveStateList();
    setUpdatedFormField(prevConfig =>({
      ...prevConfig,
      state: {
        ...prevConfig.state,
        options: stateList,
      },
    }))
    setIsFormLoaded(true)
    }
  )()
  },[])
//Changes till here
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };
  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };
//Validation Scheme needs formmik need
  const validationSchema = Yup.object(
    Object.keys(setUpdatedFormField).reduce((acc, field) => {
      acc[field] = setUpdatedFormField[field].validation;
      return acc;
    }, {})
  );
  const handleCreateUser = async (userData) => {
    try {
      const response = await UserServices.createStateAdmin(userData);
      console.log("User created successfully:", response.data);
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error creating user:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    let valuesWithRole = {};
    valuesWithRole = {
        ...values,
        role: "stateadmin",
        createdby: 37,
      };

    const response = await handleCreateUser(valuesWithRole);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      setLoading(false);
      resetForm(stateAdminInitialValues);
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
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="Create State Admin">
            {isFormLoaded && <Formik
              initialValues={stateAdminInitialValues}
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
            }
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default StateAdmin;
