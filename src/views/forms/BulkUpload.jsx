import React from "react";
import * as Yup from "yup";
import { Grid, Button } from "@mui/material";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import { filterModelList ,retriveCreatedSimProvider} from "../../helper";
import { bulkInitials, bulkFormField } from "../../formjson/bulkUpload";
import StockServices from "../../services/StockServices";
import { useState, useEffect } from "react";

const BulkUpload = () => {
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(bulkFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const modelList = await filterModelList({status:'StateAdminApproved'});
      const eSimProvider = await retriveCreatedSimProvider();
      if(!modelList?.status){
        setUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          model_id: {
            ...prevConfig.model_id,
            options: modelList,
          },
        }));
      }
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
      resetForm(bulkInitials);
    } catch (error) {
      console.error("Error :", error.message);
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
    <MainCard title="Bulk Upload Stocks">
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
                    Download Sample
                  </Button>
                </Grid>
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
      )}
    </MainCard>
  );
};
export default BulkUpload;
