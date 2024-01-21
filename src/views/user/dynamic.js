// NewUser.js
import React, { useState, useEffect } from "react";
import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../../actions/dataActions";
import Datatable from "../../datatables/Datatable";
import { userColumns } from "../../datatables/rowsColumn";
import DummyServices from "services/DummyServices";
import FormField from "../../ui-component/CustomTextField";
import {fieldConfig,userInitialValues} from "../../formjson/formConfig";
import * as Yup from "yup";

const NewUser = () => {
    const handleFileChange = (event, formik) => {
      const selectedFile = event.target.files[0];
      const fieldName=event.target.name;
      if (selectedFile) {
        formik.setFieldValue(fieldName, selectedFile);
      }
    };
  
    const validationSchema = Yup.object(
      Object.keys(fieldConfig).reduce((acc, field) => {
        acc[field] = fieldConfig[field].validation;
        return acc;
      }, {})
    );
  
    const handleSubmit = (values, { setSubmitting }) => {
      // Your form submission logic goes here
      console.log("Form values:", values);
  
      // Simulate an asynchronous operation (e.g., API call)
      setTimeout(() => {
        alert("Form submitted successfully!");
        setSubmitting(false);
      }, 1000);
    };
  
    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title="State" />
        </Grid>
        <Grid item xs={12}>
          <MainCard title="New User">
            <Formik initialValues={userInitialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                  {Object.keys(fieldConfig).map((field) => (             
                    <Grid key={field} item md={6} sm={12} xs={12}>
                      <FormField fieldConfig={fieldConfig[field]} formik={formik} handleFileChange={handleFileChange}/>
                    </Grid>
                  ))}
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary">
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
    );
  };
  
  export default NewUser;