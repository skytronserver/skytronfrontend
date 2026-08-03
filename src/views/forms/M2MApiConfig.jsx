import React, { useState } from 'react';
import { Grid, Button, CircularProgress } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import { Formik } from 'formik';
import FormField from '../../ui-component/CustomTextField';
import * as Yup from 'yup';
import DialogComponent from '../../ui-component/DialogComponent';
import { m2mApiConfigInitials, m2mApiConfigField } from '../../formjson/M2MApiConfig';

const M2MApiConfig = () => {

  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: '',
    errorList: []
  });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message, isError = false) => {
    setAlert({ error: isError, message, errorList: [] });
    setOpen(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);

    try {
      // Simulate API call
      console.log('Submitting API config:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      handleAlert('Form Submitted Successfully');
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      handleAlert('Failed to submit form', true);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
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
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999,
              background: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <CircularProgress
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              size={50}
            />
          </div>
        )}
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.3s ease-in-out',
            position: 'relative'
          }}
        >
          <MainCard title="M2M API Configuration">
            <Formik
              initialValues={m2mApiConfigInitials}
              validationSchema={Yup.object(
                Object.keys(m2mApiConfigField).reduce((acc, field) => {
                  acc[field] = m2mApiConfigField[field].validation;
                  return acc;
                }, {})
              )}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(m2mApiConfigField).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={m2mApiConfigField[field]}
                          formik={formik}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
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
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default M2MApiConfig;
