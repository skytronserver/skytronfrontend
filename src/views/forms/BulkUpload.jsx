import React from "react";
import * as Yup from "yup";
import { Grid, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import { retriveCreatedSimProvider, retriveTechnicalOnboardedModelList} from "../../helper";

import { bulkInitials, bulkFormField } from "../../formjson/bulkUpload";
import StockServices from "../../services/StockServices";
import { useState, useEffect } from "react";
import DialogComponent from "../../ui-component/DialogComponent";

const BulkUpload = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
   const [updatedFormFields, setUpdatedFormField] = useState(bulkFormField);
   const [isFormLoaded, setIsFormLoaded] = useState(false);
   const [open, setOpen] = useState(false);
   const [alert, setAlert] = useState({
     message: "",
     errorList: [],
   });

   const handleClose = () => {
     setOpen(false);
   };
  useEffect(() => {
    (async () => {
      let modelOptions = await retriveTechnicalOnboardedModelList();
      const eSimProvider = await retriveCreatedSimProvider();
      if (modelOptions.length === 0) {
        modelOptions = [{ value: "", label: "No Technically Onboarded Models" }];
      }

      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        model_id: {
          ...prevConfig.model_id,
          options: modelOptions,
        },
      }));

      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
      esim_provider:{
        ...prevConfig.esim_provider,
        options:eSimProvider
      }
      })); 
      setIsFormLoaded(true);
    })();
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
    try {
      const response = await StockServices.createBulkStock(values);
      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        let displayMessage = response.data.message || "Stocks uploaded successfully";
        const successRows = response.data.success_rows || [];
        
        let finalAlertContent = `<strong>Message:</strong> ${displayMessage}`;
        finalAlertContent += `<br/><strong>success_rows:</strong> [${successRows.join(", ")}]`;

        setAlert({
          message: finalAlertContent,
          errorList: [],
        });
        setOpen(true);
        resetForm(bulkInitials);
      }
    } catch (error) {
      console.error("Error :", error.message);
      setLoading(false);
      setAlert({
        message: error.response?.data?.message || "Failed to upload stocks",
        errorList: [],
      });
      setOpen(true);
    }
  };

  const downloadSample = async () => {
    setLoading(true);
    try {
      const response = await StockServices.getBulkStocks();
      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "StockUpload.xlsx"; // Specify the filename you want
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the Blob URL
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error("Error :", error.message);
    }
  };
  return (
    <MainCard title={t('bulkUploadForm.title')}>
      <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />
      {isFormLoaded && (
        <Formik
          initialValues={bulkInitials}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} className="form-controller">
                {Object.keys(updatedFormFields).map((field) => (
                  <Grid key={field} item md={3} sm={12} xs={12}>
                    <FormField
                      fieldConfig={updatedFormFields[field]}
                      formik={formik}
                      handleFileChange={handleFileChange}
                    />
                  </Grid>
                ))}
                <Grid item md={3} sm={12} xs={12} style={{ marginTop: "16px" }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{ padding: "10px" }}
                    size="medium"
                    onClick={downloadSample}
                  >
                    {t('bulkUploadForm.buttons.downloadSample')}
                  </Button>
                </Grid>
                <Grid item xs={12} style={{ marginTop: "20px" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {t('bulkUploadForm.buttons.submit')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}
    </MainCard>
  );
};
export default BulkUpload;
