import React, { useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Alert, Typography, Paper, Divider, Stack } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../ui-component/CustomTextField';
import SchoolBusService from '../../services/SchoolBusService';
import skytronlogo from '../../assets/images/skytron-logo2.png';

function CreateSchool() {
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const validationSchema = useMemo(
    () =>
    Yup.object().shape({
  school_name: Yup.string().required(),
  school_address: Yup.string().required(),
  school_pin: Yup.string().required(),
  school_email: Yup.string().email().required(),
  school_phone: Yup.string().required(),
  school_lat: Yup.string().required(),
  school_lon: Yup.string().required(),
  state: Yup.string().required(),
  district_code: Yup.string().required(),

  name: Yup.string().required(),
  email: Yup.string().email().required(),
  mobile: Yup.string().required(),
  dob: Yup.string().required(),
  address: Yup.string().required(),
  pin: Yup.string().required(),

  file_idProof: Yup.mixed().required(),
  file_authorisation_letter: Yup.mixed().required()
}),
    []
  );

  const handleUseMyLocation = (setFieldValue) => {
    setInfo('');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser or requires a secure connection (HTTPS)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
       setFieldValue('school_lat', String(pos.coords.latitude.toFixed(6)));
setFieldValue('school_lon', String(pos.coords.longitude.toFixed(6)));
        setInfo('Location captured');
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError('Unable to capture location. Please allow location permission or check your secure connection (HTTPS).');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // const handleSendOtp = async (values) => {
  //   setError('');
  //   setInfo('');
  //   setLoading(true);
  //   try {
  //     await SchoolBusService.sendSchoolOnboardingOtp({ mobile: values.mobile, email: values.email });
  //     setOtpSent(true);
  //     setInfo('OTP sent');
  //   } catch (e) {
  //     setError(e?.message || 'Failed to send OTP');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
  school_name: '',
  school_address: '',
  school_pin: '',
  school_email: '',
  school_phone: '',
  school_lat: '',
  school_lon: '',
  state: '',
  district_code: '',
  name: '',
  email: '',
  mobile: '',
  dob: '',
  address: '',
  pin: '',
  file_idProof: null,
  file_authorisation_letter: null
}}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              setError('');
              setInfo('');
              setLoading(true);
debugger
             const formData = new FormData();

// format DOB
const formatDOB = (date) => {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};

// school
formData.append("school_name", values.school_name);

formData.append("school_address", values.school_address);
formData.append("school_pin", values.school_pin);
formData.append("school_email", values.school_email);
formData.append("school_phone", values.school_phone);
formData.append("school_lat", values.school_lat);
formData.append("school_lon", values.school_lon);

// personal
formData.append("state", values.state);
formData.append("district_code", values.district_code);
formData.append("name", values.name);
formData.append("email", values.email);
formData.append("mobile", values.mobile);
formData.append("dob", formatDOB(values.dob)); // ✅ fixed
formData.append("address", values.address);
formData.append("pin", values.pin);

// files
formData.append("file_idProof", values.file_idProof);
formData.append("file_authorisation_letter", values.file_authorisation_letter);
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}
              SchoolBusService.submitSchoolApplication(formData)
              
                .then((response) => {
                  debugger
                   console.log("SUCCESS RESPONSE:", response);
    console.log("DATA:", response.data);

    setInfo(response?.data || 'Application submitted');
                  setInfo('Application submitted');
                  resetForm();
                 
                })
                .catch((e) => {
                  const err = e?.response?.data;

const message =
  err && typeof err === "object"
    ? Object.entries(err)
        .map(([k, v]) => `${k}: ${v.join(", ")}`)
        .join("\n")
    : "Failed to submit application";

setError(message);
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
                       <FormField fieldConfig={{ name: 'school_name', type: 'text', label: 'School Name' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'school_address', type: 'text', label: 'School Address' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'school_pin', type: 'text', label: 'School PIN' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'school_email', type: 'text', label: 'School Email' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12}>
                        <FormField fieldConfig={{ name: 'school_phone', type: 'tel', label: 'School Phone' }} formik={formik} />
                      </Grid>
                       <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'state', type: 'number', label: 'State' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'district_code', type: 'text', label: 'District Code' }} formik={formik} />
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
                        <FormField fieldConfig={{ name: 'school_lat', type: 'text', label: 'School Latitude' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'school_lon', type: 'text', label: 'School Longitude' }} formik={formik} />
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

                  {/* <Box>
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
                  </Box> */}

                  {/* <Box>
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
                  </Box> */}
                   <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      Applicant Info
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'name', type: 'text', label: 'Name' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'email', type: 'text', label: 'Email' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'mobile', type: 'tel', label: 'Mobile' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'dob', type: 'date', label: 'DOB' }} formik={formik} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormField fieldConfig={{ name: 'address', type: 'text', label: 'Address' }} formik={formik} />
                      </Grid>
                       <Grid item xs={12} md={6}>
                       <FormField fieldConfig={{ name: 'pin', type: 'text', label: 'PIN' }} formik={formik} />
                      </Grid>
                       <Grid item xs={12} md={6}>
                       <FormField
                          fieldConfig={{
                            name: 'file_idProof',
                            type: 'file',
                            label: 'ID Proof'
                          }}
                          formik={formik}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                       <FormField
                          fieldConfig={{
                            name: 'file_authorisation_letter',
                            type: 'file',
                            label: 'Authorization Letter'
                          }}
                          formik={formik}
                        />
                      </Grid>
                     
                    </Grid>
                  </Box>

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading || formik.isSubmitting}
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

export default CreateSchool;
