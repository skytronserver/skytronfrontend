import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ReplayIcon from "@mui/icons-material/Replay";
import * as Yup from "yup";
import { Formik, useFormik, Form } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../actions/loginActions";
import skytronlogo from "../../assets/images/skytron-logo.png";
import { Navigate } from "react-router-dom";
import CaptchaServices from "../../services/CaptchaServices";
import {
  iconStyle,
  paperStyle,
  logoStyle,
  captchaStyle,
  replyStyle,
} from "./homeStyle";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Home() {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [captcha, setCaptcha] = useState({
    isLoaded: false,
    src: "",
    captcha_key: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const initialValues = {
    mobile: "",
    password: "",
    captcha_reply: "",
  };

  useEffect(() => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("sessionID");
    sessionStorage.removeItem("oAuthToken");
    sessionStorage.removeItem("cookiesData");
  }, []);

  const validationSchema = Yup.object({
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Mobile Number must be a 10-digit number")
      .required("Mobile number is required"),
    password: Yup.string().required("Password is required"),
    captcha_reply: Yup.string().required("Required Field"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(
      loginUser(
        values.mobile,
        values.password,
        captcha.captcha_key,
        values.captcha_reply
      )
    );
    setSubmitting(false);
    setError(false);
  };
  const getCaptcha = async () => {
    setCaptcha((prev) => ({ ...prev, isLoaded: false }));
    const data = await CaptchaServices.generateCaptcha();
    if (data?.error) {
      setCaptcha((prev) => ({ ...prev, isLoaded: true }));
    } else {
      setCaptcha((prev) => ({
        ...prev,
        captcha_key: data.key,
        src: "data:image/png;base64," + data.captcha,
        isLoaded: true,
      }));
    }
  };
  useEffect(() => {
    getCaptcha();
    localStorage.removeItem("skytrackCookiesData");
  }, []);
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
  const errorMessage = useSelector((state) => state.login.error.message);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  if (otpId !== null) {
    return <Navigate to="/otp-login" replace />;
  }
  if (errorMessage !== null && error === false) {
    setTimeout(() => {
      getCaptcha();
    }, 3000);
    setError(true);
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
        <Grid item xs={12} md={4} justifyContent="center" alignItems="center">
          <Paper sx={paperStyle}>
            <Typography variant="h6" gutterBottom align="center">
              <img
                src={skytronlogo}
                alt="logo"
                style={{ height: "auto", width: "36px" }}
              />
              <br />
              <span style={logoStyle}>SKYTRON</span>
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
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 10,
                  }}
                  onKeyPress={(e) => {
                    if (
                      !/[0-9]/.test(e.key) || 
                      (formik.values.mobile.length >= 10 && e.key !== 'Backspace')
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 10);
                    formik.setFieldValue('mobile', value);
                  }}
                  {...formik.getFieldProps("mobile")}
                  error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  helperText={formik.touched.mobile && formik.errors.mobile}
                />
                <TextField
                  id="password"
                  label="Password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  name="password"
                  margin="normal"
                  {...formik.getFieldProps("password")}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <section style={captchaStyle}>
                  {captcha.isLoaded ? (
                    <section>
                      <img
                        id="captcha-image"
                        src={captcha.src}
                        alt="Captcha Image"
                        style={{ maxHeight: "60px" }}
                      />
                      <input
                        type="hidden"
                        id="captcha-key"
                        value={captcha.captcha_key}
                      />
                    </section>
                  ) : (
                    <CircularProgress />
                  )}
                  <span
                    style={replyStyle}
                    disabled={!captcha.isLoaded}
                    onClick={() => getCaptcha()}
                  >
                    <ReplayIcon style={iconStyle} />
                  </span>
                </section>
                <TextField
                  id="captcha_reply"
                  label="Enter the result"
                  variant="outlined"
                  type="text"
                  fullWidth
                  disabled={!captcha.isLoaded}
                  name="captcha_reply"
                  margin="normal"
                  {...formik.getFieldProps("captcha_reply")}
                  error={
                    formik.touched.captcha_reply &&
                    Boolean(formik.errors.captcha_reply)
                  }
                  helperText={
                    formik.touched.captcha_reply && formik.errors.captcha_reply
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  disabled={submitting || !captcha.isLoaded}
                >
                  {submitting === false ? `Login` : `Waiting`}
                </Button>

                <Box sx={{ mt: 2 }}>
                  {errorMessage && (
                    <Alert variant="filled" severity="error">
                      {errorMessage}
                    </Alert>
                  )}
                </Box>
              </Form>
            </Formik>
            <Box sx={{ mt: 1, textAlign: "right" }}>
              <Link href="/forgot-password" variant="body2">
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
