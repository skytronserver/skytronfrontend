import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Grid, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import { bulkDeviceAssignInitials, bulkDeviceAssignField } from "../../formjson/bulkDeviceAssign";
import DealerServices from "../../services/DealerServices";
import StockServices from "../../services/StockServices";

const BulkDeviceAssign = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(bulkDeviceAssignField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await DealerServices.dealerList({});
        console.log(response,"response-----");
        if (response?.data) {
          const dealers = response?.data?.map(dealer => ({
            value: dealer.id,
            label: dealer.company_name
          }));
          
          setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            dealer_id: {
              ...prevConfig.dealer_id,
              options: dealers,
            },
          }));
        }
        setIsFormLoaded(true);
      } catch (error) {
        console.error("Error fetching dealers:", error);
        setIsFormLoaded(true);
      }
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
      const formData = new FormData();
      formData.append('dealer_id', values.dealer_id);
      formData.append('excel_file', values.excel_file);
      
      const response = await DealerServices.assignDeviceToDealer(formData);
      setLoading(false);
      resetForm(bulkDeviceAssignInitials);
    } catch (error) {
      console.error("Error:", error.message);
      setLoading(false);
    }
    setSubmitting(false);
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
      a.download = "BulkDeviceAssign.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error.message);
      setLoading(false);
    }
  };

  return (
    <MainCard title={t('bulkDeviceAssign.title')}>
      {isFormLoaded && (
        <Formik
          initialValues={bulkDeviceAssignInitials}
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
                    {t('bulkDeviceAssign.buttons.downloadSample')}
                  </Button>
                </Grid>
                <Grid item xs={12} style={{ marginTop: "20px" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {t('bulkDeviceAssign.buttons.submit')}
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

export default BulkDeviceAssign; 