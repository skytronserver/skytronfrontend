import React from "react";
import * as Yup from "yup";
import { Grid, Button } from "@mui/material";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import {uploadReceiptInitials,uploadReceiptFormFields} from "../../formjson/uploadReceipt";
import { useState, useEffect } from "react";
import TaggingService from "../../services/TaggingService";
import {fetchTaggedList} from "../../helper";
const UploadReceipt = () => {
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(uploadReceiptFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  useEffect(() => {
   
    (async () => {
      const filter={
        is_tagged: "True",
      }
        const tagged_list = await fetchTaggedList(filter);
        setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            device_id: {
              ...prevConfig.device_id,
              options: tagged_list,
            },
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
      const response = await TaggingService.downloadTagReceipt(values);
      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      console.log(blob)
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "receipt.pdf"; // Specify the filename you want
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the Blob URL
      window.URL.revokeObjectURL(url);
      setLoading(false);
      resetForm(uploadReceiptInitials);
    } catch (error) {
      console.error("Error :", error.message);
    }
  };

  return (
    <MainCard title="Upload Tagging Receipt">
      {isFormLoaded && (
        <Formik
          initialValues={uploadReceiptInitials}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} className="form-controller">
                {Object.keys(updatedFormFields).map((field) => (
                  <Grid key={field} item md={4} sm={12} xs={12}>
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
      )}
    </MainCard>
  );
};
export default UploadReceipt;
