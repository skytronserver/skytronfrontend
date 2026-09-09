/* eslint-disable no-unused-vars */
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  decipherEncryption,
  retriveTechnicalOnboardedModelList,
} from "../../helper";
import "./form.css";
import {
  dealerAccountFormField,
  dealerAccountInitialValues,
} from "../../formjson/dealerAccount";

function DealerAccount() {
  const { t } = useTranslation();
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
  const [showResend, setShowResend] = useState(false);
  const [hasOnboardedModel, setHasOnboardedModel] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const modelOptions = await retriveTechnicalOnboardedModelList();
        if (modelOptions.length === 0) {
          setHasOnboardedModel(false);
          setIsFormLoaded(true);
          return;
        }

        const myDecipher = decipherEncryption("skytrack");
        const userData = sessionStorage.getItem("cookiesData");
        const data = userData && userData.split("-");
        const userName = data && data[0] ? myDecipher(data[0]) : "";

        dealerAccountInitialValues.manufacturer = userName;

        const stateList = await retriveStateList();

        setUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          address_State: {
            ...prevConfig.address_State,
            value: stateList?.[0]?.label || '',
            id: stateList?.[0]?.value || '',
          },
          districts: {
            ...prevConfig.districts,
            options: [],
          },
        }));

        if (stateList?.[0]?.value) {
          dealerAccountInitialValues.address_State = stateList[0].label;
          const districtList = await retriveDistrictList({ state: stateList[0].value });
          console.log(districtList, 'districtList')
          setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            districts: {
              ...prevConfig.districts,
              options: districtList
            },
          }));
        }

      } catch (error) {
        console.error("Failed to retrieve state or district list:", error);
      } finally {
        setIsFormLoaded(true);
      }
    })();
  }, []);

  const handleClose = () => {
    !alert.error && navigate("/user/newDealerAccount");
    setOpen(false);
  };

  // const handleStateChange = (event, formik) => {
  //   const fieldName = event.target.name;
  //   if (fieldName === "address_State") {
  //     (async () => {
  //       const getDetailsOf = {
  //         state: event.target.value,
  //       };
  //       try {
  //         const districtList = await retriveDistrictList(getDetailsOf);
  //         setUpdatedFormField((prevConfig) => ({
  //           ...prevConfig,
  //           district: {
  //             ...prevConfig.district,
  //             options: districtList,
  //           },
  //         }));
  //       } catch (error) {
  //         console.log(error)
  //       }
  //     })();
  //   }
  // };


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
        errors[fieldName] = t("dealerAccountForm.validation.fileSize");
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = t("dealerAccountForm.validation.fileFormat");
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

  // const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  //   const userData = sessionStorage.getItem("cookiesData");
  //   const data = userData && userData.split("-");
  //   const userId = userData && data.length > 2 && data[3];

  //   setSubmitting(true);
  //   setLoading(true);

  //   // Format districts as an array if it exists
  //   const formattedDistricts = values.districts ?
  //     (Array.isArray(values.districts) ? values.districts : [values.districts]) : [];

  //   const valuesWithRole = {
  //     ...values,
  //     districts: formattedDistricts,
  //     role: "devicemanufacturer",
  //     createdby: userId,
  //     manufacturer: userId,
  //     address_State: updatedFormFields.address_State?.id
  //   };

  //   try {
  //     await DealerServices.dealerUser(valuesWithRole);
  //     setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
  //     handleAlert(t("common.formSubmittedSuccessfully"));
  //     resetForm();
  //     setSubmitting(false);
  //     setShowResend(true);
  //   } catch (error) {
  //     if (error.message === "Network Error") {
  //       handleAlert(t("common.internalServerError"));
  //       return true;
  //     }
  //     setAlert((prevAlert) => ({
  //       ...prevAlert,
  //       error: true,
  //       errorList: convertErrorObjectToArray(error.response.data),
  //     }));
  //     handleAlert(t("common.formNotSubmitted"));
  //     setShowResend(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData ? userData.split("-") : [];
  const userId = data.length > 2 ? data[3] : "";

  setSubmitting(true);
  setLoading(true);

  try {
    const formData = new FormData();

    // Normal fields
    formData.append("manufacturer", userId);
    formData.append("name", values.name || "");
    formData.append("mobile", values.mobile || "");
    formData.append("email", values.email || "");
    formData.append("dob", values.dob || "");
    formData.append("company_name", values.company_name || "");
    formData.append("gstnnumber", values.gstnnumber || "");

    // State ID
    formData.append(
      "address_State",
      updatedFormFields.address_State?.id || ""
    );

    // IMPORTANT:
    // API expects districts[] instead of a comma-separated value
    if (Array.isArray(values.districts)) {
      values.districts.forEach((district) => {
        const districtValue =
          typeof district === "object"
            ? district.value
            : district;

        if (districtValue !== undefined && districtValue !== null) {
          formData.append("districts[]", districtValue);
        }
      });
    }

    // Send districts as comma-separated value for testing
// const formattedDistricts = Array.isArray(values.districts)
//   ? values.districts
//       .map((district) =>
//         typeof district === "object"
//           ? district.value
//           : district
//       )
//       .filter(
//         (district) =>
//           district !== undefined &&
//           district !== null &&
//           district !== ""
//       )
//       .join(",")
//   : values.districts || "";

// formData.append("districts", formattedDistricts);

    formData.append("idProofno", values.idProofno || "");
    formData.append("expirydate", values.expirydate || "");

    // Files
    if (values.file_authLetter) {
      formData.append(
        "file_authLetter",
        values.file_authLetter
      );
    }

    if (values.file_companRegCertificate) {
      formData.append(
        "file_companRegCertificate",
        values.file_companRegCertificate
      );
    }

    if (values.file_GSTCertificate) {
      formData.append(
        "file_GSTCertificate",
        values.file_GSTCertificate
      );
    }

    if (values.file_idProof) {
      formData.append(
        "file_idProof",
        values.file_idProof
      );
    }

    // Location
    formData.append("lat", values.lat || "");
    formData.append("lon", values.lon || "");

    // Role / creator
    formData.append("role", "devicemanufacturer");
    formData.append("createdby", userId);

    // Debug - VERY useful
    for (const [key, value] of formData.entries()) {
      console.log(
        key,
        value instanceof File
          ? {
              name: value.name,
              type: value.type,
              size: value.size,
            }
          : value
      );
    }

    await DealerServices.dealerUser(formData);

    setAlert({
      error: false,
      message: t("common.formSubmittedSuccessfully"),
      errorList: [],
    });

    setOpen(true);

    resetForm();
    setShowResend(true);
  } catch (error) {
    console.error("Create dealer error:", error);
    console.error("Response:", error?.response?.data);

    if (error?.message === "Network Error") {
      setAlert({
        error: true,
        message: t("common.internalServerError"),
        errorList: [],
      });

      setOpen(true);
      return;
    }

    setAlert({
      error: true,
      message: t("common.formNotSubmitted"),
      errorList: error?.response?.data
        ? convertErrorObjectToArray(error.response.data)
        : [],
    });

    setOpen(true);
    setShowResend(false);
  } finally {
    setSubmitting(false);
    setLoading(false);
  }
};

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(dealerAccountInitialValues);
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
          <MainCard title={t("dealerAccountForm.title")}>
            {!hasOnboardedModel ? (
               <div style={{ textAlign: 'center', padding: '40px' }}>
                 <h3>You must complete Technical Onboarding for at least one device model before you can create a dealer.</h3>
               </div>
            ) : isFormLoaded && (
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
                          // handleOptionChange={handleStateChange}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} className="grid-item-button-div" style={{ display: "flex", gap: "10px" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          {t("common.submit")}
                        </Button>
                        {showResend && (
                          <Button
                            type="button"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleResend(formik.resetForm)}
                            disabled={loading}
                          >
                            {t("auth.resend")}
                          </Button>
                        )}
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
