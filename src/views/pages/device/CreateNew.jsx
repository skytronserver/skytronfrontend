import React from "react";
import PageHeader from "../../../ui-component/cards/PageHeader";
import { Grid, TextField } from "@mui/material";
import { gridSpacing } from "../../../store/constant";
import MainCard from "../../../ui-component/cards/MainCard";
import * as Yup from "yup";
import { Formik, Form, useFormik } from "formik";
import { useTranslation } from 'react-i18next';

const CreateNew = () => {
  const { t } = useTranslation('forms');
  
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
    name: Yup.string().required(t('device.validation.nameRequired')),
    email: Yup.string()
      .email(t('device.validation.emailInvalid'))
      .required(t('device.validation.emailRequired')),
    mobile: Yup.string()
      .matches(/^\d{10}$/, t('device.validation.mobileInvalid'))
      .required(t('device.validation.mobileRequired')),
    deviceModel: Yup.string().required(t('device.validation.deviceModelRequired')),
    companyName: Yup.string().required(t('device.validation.companyNameRequired')),
    gstNo: Yup.string().required(t('device.validation.gstRequired')),
    tacNumber: Yup.string().required(t('device.validation.tacNumberRequired')),
    tacValidity: Yup.string().required(t('device.validation.tacValidityRequired')),
  });
  const handleSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      alert(t('device.successMessage'));
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
        <PageHeader title={t('device.state')} />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <MainCard title={t('device.newUser')}>
              <Formik
                initialValues={formik.initialValues}
                onSubmit={formik.handleSubmit}
              >
                <Form>
                  <Grid container spacing={2} className="form-controller">
                    <Grid item md={6} sm={12} xs={12} sx={{ pt: 0 }}>
                      <TextField
                        label={t('device.name')}
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
                        label={t('device.mobileNumber')}
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
                        label={t('device.email')}
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
                        label={t('device.companyName')}
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
                        label={t('device.gstNo')}
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
                        label={t('device.deviceModel')}
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
                        label={t('device.tacNumber')}
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
                        label={t('device.tacValidity')}
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
