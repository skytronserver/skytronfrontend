import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MainCard from "../../ui-component/cards/MainCard";
import {
  gridSpacing,
  FILE_SIZE,
  SUPPORTED_FORMATS,
} from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  convertErrorObjectToArray,
  retriveStateList,
  retriveDTOList,
} from "../../helper";
import { dtoInitialsValues, dtoFormFields } from "../../formjson/dtoUserform";
import "./form.css";
const DtoRto = () => {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(dtoFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
          options: stateList,
        }
      }));
      setIsFormLoaded(true);
    })();
  }, []);
  const handleStateChange = (event, formik) => {
    const fieldName = event.target.name;
    if (fieldName === "state") {
      (async () => {
        const getDetailsOf = {
          state: event.target.value,
        };
        try {
          const districtList = await retriveDTOList(getDetailsOf);
          setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            district_code: {
              ...prevConfig.district_code,
              options: districtList,
            },
          }));
        } catch (error) {
          console.log(error)
        }
      })();
    }
  };
  const handleClose = () => {
    !alert.error && navigate("/user/newDto");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.currentTarget.files[0];
    const fieldName = event.target.name;
    const errors = {};
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE) {
        errors[fieldName] = "File too large. Max size is 512KB";
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = "Unsupported Format";
      } else {
        formik.setFieldValue(fieldName, selectedFile);
        return;
      }
    }
    formik.setFieldError(fieldName, errors[fieldName]);
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userData = sessionStorage.getItem("cookiesData");
    const data = userData && userData.split("-");
    const userId = userData && data.length > 2 && data[3];
    setSubmitting(true);
    setLoading(true);
    let valuesWithRole = {};
    valuesWithRole = {
      ...values,
      role: "dto",
      createdby: userId,
    };

    try {
      await UserServices.createDTO(valuesWithRole);
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      resetForm(dtoInitialsValues);
    } catch (error) {
      if (error.message === "Network Error") {
        handleAlert("Internal Server Error");
        return true;
      }
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(error.response.data),
      }));
      handleAlert("Form Not Submitted");
    } finally {
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
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}
        <Grid item xs={12} className={loading ? "loading" : "not-loading"}>
          <MainCard title="Create DTO/RTO">
            {isFormLoaded && (
              <Formik
                initialValues={dtoInitialsValues}
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
                            handleOptionChange={handleStateChange}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} className="grid-item-button-div">
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
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default DtoRto;
