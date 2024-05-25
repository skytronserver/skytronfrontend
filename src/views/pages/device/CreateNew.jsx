import React from "react";
import PageHeader from "../../../ui-component/cards/PageHeader";
import { Grid, TextField } from "@mui/material";
import { gridSpacing } from "../../../store/constant";
import MainCard from "../../../ui-component/cards/MainCard";
import * as Yup from "yup";
import { Formik, Form, useFormik } from "formik";
const CreateNew = () => {
  const initialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName:"",
    gstNo:"",
    deviceModel: "",
    tacNumber: "",
    tacValidity: "",
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Mobile Number must be a 10-digit number")
      .required("Mobile Number is required"),
    deviceModel: Yup.string().required("Device Model is required"),
    companyName: Yup.string().required("Company Name is required"),
    gstNo: Yup.string().required("GST No is required"),
    tacNumber: Yup.string().required("TAC Number is required"),
    tacValidity: Yup.string().required("TAC Validity is required"),
  });
  const handleSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      alert("Form submitted successfully!");
      setSubmitting(false);
    }, 1000);
  };
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="State" />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <MainCard title="New User">
              <Formik
                initialValues={formik.initialValues}
                onSubmit={formik.handleSubmit}
              >
                <Form>
                  <Grid container spacing={2} className="form-controller">
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("name")}
                        error={
                          formik.touched.name && Boolean(formik.errors.name)
                        }
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="Mobile Number"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("mobile")}
                        error={
                          formik.touched.mobile && Boolean(formik.errors.mobile)
                        }
                        helperText={
                          formik.touched.mobile && formik.errors.mobile
                        }
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("email")}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="Company Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("companyName")}
                        error={
                          formik.touched.companyName &&
                          Boolean(formik.errors.companyName)
                        }
                        helperText={
                          formik.touched.companyName &&
                          formik.errors.companyName
                        }
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="GST No."
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("gstNo")}
                        error={
                          formik.touched.gstNo && Boolean(formik.errors.gstNo)
                        }
                        helperText={formik.touched.gstNo && formik.errors.gstNo}
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="Device Model"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("deviceModel")}
                        error={
                          formik.touched.deviceModel && Boolean(formik.errors.deviceModel)
                        }
                        helperText={formik.touched.deviceModel && formik.errors.deviceModel}
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="TAC Number"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("tacNumber")}
                        error={
                          formik.touched.tacNumber && Boolean(formik.errors.tacNumber)
                        }
                        helperText={formik.touched.tacNumber && formik.errors.tacNumber}
                      />
                    </Grid>
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label="TAC Validity"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps("tacValidity")}
                        error={
                          formik.touched.tacValidity && Boolean(formik.errors.tacValidity)
                        }
                        helperText={formik.touched.tacValidity && formik.errors.tacValidity}
                        
                      />
                      
                    </Grid>
                  </Grid>
                </Form>
              </Formik>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CreateNew;
