import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  FormHelperText,
  Link
} from "@mui/material";
import * as Yup from "yup";
import { Formik, useFormik, Form } from "formik";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from "../../actions/loginActions";
import skytronlogo from '../../assets/images/skytron-logo.png';
import { Navigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";

function Home() {
  const dispatch = useDispatch();
  const [hcaptchaToken, setHcaptchaToken] = useState("");

  const initialValues = {
    mobile: "",
    password: "",
  };

  useEffect(() => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('oAuthToken');
    sessionStorage.removeItem('cookiesData');
  }, []);

  const validationSchema = Yup.object({
    mobile: Yup.string()
      .matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number')
      .required("Mobile number is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    if (!hcaptchaToken) {
      formik.setFieldError("hcaptcha", "Please complete the hCaptcha.");
      setSubmitting(false);
      return;
    }
    dispatch(loginUser(values.mobile, values.password, hcaptchaToken));
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const isAuthenticated = useSelector(
    (state) => state.login.user.isAuthenticated
  );
  const otpId = useSelector((state) => state.login.user.otpToken);
  const submitting = useSelector((state) => state.login.loading);
  const errorMessage=useSelector((state)=>state.login.error.message);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  if (otpId != null) {
    return <Navigate to="/otp-login" replace />;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ height: "70vh" }}
      >
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: { xs: "none", md: "block" } }}
        ></Grid>
        <Grid
          item
          xs={12}
          md={4}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Paper
            sx={{
              p: 2,
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
              <img
                src={skytronlogo}
                alt="logo"
                style={{ height: 'auto', width: '36px' }}
              /><br />
              <span style={{ color: "#430A5D", fontfamily: "Quantico", fontWeight: "900px", fontSize: "15px", textshadow: "2px 2px 4px" }}>SKYTRON</span>

            </Typography>
            <Formik
              initialValues={formik.initialValues}
              validationSchema={formik.validationSchema}
              onSubmit={formik.handleSubmit}
            >
              <Form>
                <TextField
                  id="mobile"
                  label="Mobile"
                  name="mobile"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  sx={{ backgroundColor: "none" }}
                  {...formik.getFieldProps("mobile")}
                  error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  helperText={formik.touched.mobile && formik.errors.mobile}
                />
                <TextField
                  id="password"
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  name="password"
                  margin="normal"
                  {...formik.getFieldProps("password")}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
                <HCaptcha
                  sitekey="156ecd3a-9f4e-4549-a7d2-b8274bb9ed59"
                  onVerify={setHcaptchaToken}
                />
                {formik.errors.hcaptcha && (
                  <FormHelperText error>{formik.errors.hcaptcha}</FormHelperText>
                )}
                {formik.errors.submit && (
                  <Box sx={{ mt: 3 }}>
                    <FormHelperText error>{formik.errors.submit}</FormHelperText>
                  </Box>
                )}

                <Button variant="contained" color="primary" type="submit" fullWidth disabled={submitting}>
                  {submitting === false ? `Login` : `Waiting`}
                </Button>
                <Box sx={{ mt: 3 }} style={{textAlign:'center'}}>
                {(errorMessage !=''|| errorMessage!=null) && <span style={{color:'red'}}> {errorMessage}</span>}
                </Box>
              
              </Form>
            </Formik>
            <Box sx={{ mt: 1, textAlign: 'right' }}>
                  <Link href="/mis/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;
