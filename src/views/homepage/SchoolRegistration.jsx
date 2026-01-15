import React, { useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Alert, Typography, Paper, Divider, Stack } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../ui-component/CustomTextField';
import SchoolBusService from '../../services/SchoolBusService';
import skytronlogo from '../../assets/images/skytron-logo2.png';

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
    <Box sx={{ py: { xs: 3, md: 6 }, minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.28)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            textAlign: 'center',
            '& .MuiTextField-root': {
              mt: 0
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              backgroundColor: 'rgba(255,255,255,0.75)'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(106, 27, 154, 0.18)'
            },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(106, 27, 154, 0.55)'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'rgba(106, 27, 154, 0.85)'
            }
          }}
        >
          <Stack spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
            <Box component="img" src={skytronlogo} alt="SKYTRON" sx={{ width: 56, height: 56 }} />
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: 1 }}>
              SKYTRON
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
              School Registration / Application
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.70)' }}>
              Fill out the form below to apply for onboarding
            </Typography>
          </Stack>

          {(error || info) && (
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}
              {info && <Alert severity="info">{info}</Alert>}
            </Stack>
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
                <Stack spacing={2.5} sx={{ textAlign: 'left' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      School details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
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
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      Location
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
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
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      OTP verification
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
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
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      Mandatory documents
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'principalRequestLetter', type: 'file', label: 'Request letter from Principal' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'representativeKycDocument', type: 'file', label: 'KYC document of representative' }} formik={formik} />
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading || formik.isSubmitting || !otpSent}
                    sx={{
                      mt: 0.5,
                      py: 1.35,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      color: '#FFFFFF !important',
                      '&.Mui-disabled': {
                        color: 'rgba(255,255,255,0.95) !important',
                        background: 'linear-gradient(90deg, #6A1B9A 0%, #8E24AA 50%, #6A1B9A 100%)',
                        opacity: 1
                      },
                      background: 'linear-gradient(90deg, #6A1B9A 0%, #8E24AA 50%, #6A1B9A 100%)',
                      boxShadow: '0 10px 22px rgba(106, 27, 154, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #5E178A 0%, #7B1FA2 50%, #5E178A 100%)'
                      }
                    }}
                  >
                    Submit Application
                  </Button>
                </Stack>
              </form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
}

export default SchoolRegistration;
