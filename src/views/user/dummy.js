import React, { useState } from "react";
import { Grid, TextField, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import * as Yup from "yup";
import { Formik } from "formik";
const NewUser = () => {

  const [selectedFileName, setSelectedFileName] = useState("");

  const initialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstNo: "",
    idProofNo: "",
    idProof: null,
    department:""
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setSelectedFileName(selectedFile.name);
      formik.setFieldValue("idProof", selectedFile);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    mobile: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
    companyName: Yup.string().required("Company Name is required"),
    gstNo: Yup.string().required("GTS No is required"),
    idProofNo: Yup.string().required("ID Proof Number is required"),
    idProof: Yup.mixed().required("ID Proof is required"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
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
        <Grid container spacing={gridSpacing}>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <MainCard title="New User">
              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                      {Object.keys(initialValues).map((field) => (
                        <Grid item xs={12} key={field}>
                          <TextField
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            {...formik.getFieldProps(field)}
                            error={formik.touched[field] && Boolean(formik.errors[field])}
                            helperText={formik.touched[field] && formik.errors[field]}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <input
                          id="idProof"
                          name="idProof"
                          type="file"
                          onChange={(event) => handleFileChange(event, formik)}
                          onBlur={() => formik.setFieldTouched("idProof", true)}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="idProof">
                          <Button variant="outlined" component="span">
                            Select ID Proof
                          </Button>{" "}
                          <span style={{ color: "#2196f3", fontStyle: "italic" }}>{selectedFileName}</span>
                        </label>
                        {formik.touched.idProof && formik.errors.idProof && (
                          <div style={{ color: "red", marginTop: "8px" }}>{formik.errors.idProof}</div>
                        )}
                      </Grid>
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
      </Grid>
    </Grid>
  );
};

export default NewUser;
