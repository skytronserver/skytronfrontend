import React, { useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Alert, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../ui-component/CustomTextField';
import SchoolBusService from '../../services/SchoolBusService';

function SchoolRegistration() {
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        schoolName: Yup.string().required('School name is required'),
        contactPerson: Yup.string().required('Contact person is required'),
        mobile: Yup.string().required('Mobile is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        address: Yup.string().required('Address is required'),
        latitude: Yup.string().required('Latitude is required'),
        longitude: Yup.string().required('Longitude is required'),
        otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
        principalRequestLetter: Yup.mixed().required('Request letter is required'),
        representativeKycDocument: Yup.mixed().required('KYC document is required')
      }),
    []
  );

  const handleUseMyLocation = (setFieldValue) => {
    setInfo('');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFieldValue('latitude', String(pos.coords.latitude));
        setFieldValue('longitude', String(pos.coords.longitude));
        setInfo('Location captured');
      },
      () => {
        setError('Unable to capture location. Please allow location permission.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSendOtp = async (values) => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await SchoolBusService.sendSchoolOnboardingOtp({ mobile: values.mobile, email: values.email });
      setOtpSent(true);
      setInfo('OTP sent');
    } catch (e) {
      setError(e?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h3" fontWeight={700}>
          School Registration / Application
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Apply for onboarding with OTP validation, geo-location capture and mandatory documents.
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {info && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">{info}</Alert>
        </Box>
      )}

      <Formik
        initialValues={{
          schoolName: '',
          contactPerson: '',
          mobile: '',
          email: '',
          address: '',
          latitude: '',
          longitude: '',
          otp: '',
          principalRequestLetter: null,
          representativeKycDocument: null
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setError('');
          setInfo('');
          setLoading(true);

          const formData = new FormData();
          formData.append('schoolName', values.schoolName);
          formData.append('contactPerson', values.contactPerson);
          formData.append('mobile', values.mobile);
          formData.append('email', values.email);
          formData.append('address', values.address);
          formData.append('latitude', values.latitude);
          formData.append('longitude', values.longitude);
          formData.append('otp', values.otp);
          formData.append('principalRequestLetter', values.principalRequestLetter);
          formData.append('representativeKycDocument', values.representativeKycDocument);

          SchoolBusService.submitSchoolApplication(formData)
            .then(() => {
              setInfo('Application submitted');
              resetForm();
              setOtpSent(false);
            })
            .catch((e) => {
              setError(e?.message || 'Failed to submit application');
            })
            .finally(() => {
              setLoading(false);
              setSubmitting(false);
            });
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'schoolName', type: 'text', label: 'Name of School' }} formik={formik} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'contactPerson', type: 'text', label: 'Name of Contact Person' }} formik={formik} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'mobile', type: 'tel', label: 'Mobile Number' }} formik={formik} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'email', type: 'email', label: 'Email ID' }} formik={formik} />
              </Grid>
              <Grid item xs={12}>
                <FormField fieldConfig={{ name: 'address', type: 'text', label: 'School Address' }} formik={formik} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'latitude', type: 'text', label: 'School Latitude' }} formik={formik} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'longitude', type: 'text', label: 'School Longitude' }} formik={formik} />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                  onClick={() => handleUseMyLocation(formik.setFieldValue)}
                >
                  Use my location
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={loading || !formik.values.mobile}
                  onClick={() => handleSendOtp(formik.values)}
                >
                  Send OTP
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'otp', type: 'tel', label: 'OTP' }} formik={formik} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'principalRequestLetter', type: 'file', label: 'Request letter from Principal' }} formik={formik} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField fieldConfig={{ name: 'representativeKycDocument', type: 'file', label: 'KYC document of representative' }} formik={formik} />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading || formik.isSubmitting || !otpSent}>
                  Submit Application
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Container>
  );
}

export default SchoolRegistration;
