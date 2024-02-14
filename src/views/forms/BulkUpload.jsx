// material-ui
import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
import * as Yup from "yup";
import { Grid, Button,CircularProgress  } from "@mui/material";
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import {bulkInitials,bulkFormField} from "../../formjson/bulkUpload";
import StockServices from "../../services/StockServices";
import DeviceModelServices from "../../services/DeviceModelServices";
import DummyServices from 'services/DummyServices';
import { useEffect,useState } from 'react';
import { fetchDataSuccess } from '../../actions/dataActions';
// ==============================|| SAMPLE PAGE ||============================== //

const BulkUpload = () => { 
    const [loading,setLoading]=useState(false);
    const handleFileChange = (event, formik) => {
        const selectedFile = event.target.files[0];
        const fieldName = event.target.name;
        if (selectedFile) {
          formik.setFieldValue(fieldName, selectedFile);
        }
      };
    
      const validationSchema = Yup.object(
        Object.keys(bulkFormField).reduce((acc, field) => {
          acc[field] = bulkFormField[field].validation;
          return acc;
        }, {})
      );
      const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setSubmitting(true);
        setLoading(true);
        try {
          const response = await StockServices.createBulkStock(values);
          console.log(response)
          setLoading(false);
          resetForm(bulkInitials);
        } catch (error) {
          console.error("Error :", error.message);
        }
      };

    const downloadSample=async()=>{
        setLoading(true);
        try {
            const response = await StockServices.getBulkStocks();
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'StockUpload.xlsx'; // Specify the filename you want
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release the Blob URL
    window.URL.revokeObjectURL(url);
            setLoading(false);
          } catch (error) {
            console.error("Error :", error.message);
          }
    }
  return (
  <MainCard title="Bulk Upload Stocks">
    <Formik
            initialValues={bulkInitials}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit} >
                <Grid container spacing={2} className="form-controller">
                  {Object.keys(bulkFormField).map((field) => (
                    <Grid key={field} item md={4} sm={12} xs={12}>
                      <FormField
                        fieldConfig={bulkFormField[field]}
                        formik={formik}
                        handleFileChange={handleFileChange}
                      />
                    </Grid>
                  ))}
                  <Grid item md={4} sm={12} xs={12} style={{ marginTop: "16px" }}>
                  <Button  variant="outlined" color="secondary" style={{ padding: "10px" }} size="medium" 
                  onClick={downloadSample}>
                      Download Sample
                    </Button>
                  </Grid>
                  <Grid item xs={12} style={{ marginTop: "20px" }}>
                    <Button type="submit" variant="contained" color="primary"  disabled={loading}>
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
  </MainCard>
);
  }
export default BulkUpload;
