import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import {
  gridSpacing,
  FILE_SIZE,
  SUPPORTED_FORMATS,
} from "../../store/constant";
import DealerServices from "../../services/DealerServices";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { useNavigate } from "react-router-dom";
import {
  convertErrorObjectToArray,
  retriveStateList,
  retriveDistrictList,
  retriveManufacturerList,
} from "../../helper";
import "./form.css";
import {
  dealerAccountFormField,
  dealerAccountInitialValues,
} from "../../formjson/dealerAccount";
function DealerAccount() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(
    dealerAccountFormField
  );
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const manufacturerList = await retriveManufacturerList();
      const stateList = await retriveStateList();
      const districtList = await retriveDistrictList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        manufacturer: {
          ...prevConfig.manufacturer,
          options: manufacturerList,
        },
        address_State: {
          ...prevConfig.address_State,
          options: stateList,
        },
        district: {
          ...prevConfig.district,
          options: districtList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);
  const handleClose = () => {
    !alert.error && navigate("/user/newDealerAccount");
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
  (async () => {
    try {
      const res = await DealerServices.dealerList();
    } catch (error) {
      console.log(error);
    }
  })();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userData = sessionStorage.getItem("cookiesData");
    const data = userData && userData.split("-");
    const userId = userData && data.length > 2 && data[3];
    setSubmitting(true);
    setLoading(true);
    let valuesWithRole = {};
    valuesWithRole = {
      ...values,
      role: "devicemanufacturer",
      createdby: userId,
    };
    try {
      await await DealerServices.dealerUser(valuesWithRole);
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      resetForm(dealerAccountInitialValues);
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
          <MainCard title="Create Dealer Account">
            {isFormLoaded && (
              <Formik
                initialValues={dealerAccountInitialValues}
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
}

export default DealerAccount;
