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
import { useTranslation } from "react-i18next";
import { loginUser } from "../../actions/loginActions";
import skytronlogo from "../../assets/images/skytron-logo2.png";
import stqclogo from "../../assets/images/icons/stqc_logo.png";
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
  const { t } = useTranslation();
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
      .matches(/^\d{10}$/, t('validation.mobileNumberFormat'))
      .required(t('validation.mobileRequired')),
    password: Yup.string().required(t('validation.passwordRequired')),
    captcha_reply: Yup.string().required(t('validation.required')),
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
                alt={t('common.logo')}
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
                  label={t('login.mobile')}
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
                  label={t('login.password')}
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
                          aria-label={t('login.togglePasswordVisibility')}
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
                        alt={t('login.captchaImage')}
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
                  label={t('login.enterCaptcha')}
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
                  {submitting === false ? t('login.loginButton') : t('login.waiting')}
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
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/user-registration-request" variant="body2">
                Don't have a account? Click Here
              </Link>
              <Link href="/forgot-password" variant="body2">
                {t('login.forgotPassword')}
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* STQC Certification Badge - Bottom Left, Responsive */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: '8px', sm: '12px', md: '16px' },
          left: { xs: '8px', sm: '12px', md: '16px' },
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            padding: { xs: '4px 8px', sm: '6px 10px', md: '8px 12px' },
            maxWidth: { xs: '80vw', sm: '60vw', md: '380px' },
            backgroundColor: 'rgba(227, 242, 253, 0.95)',
            borderRadius: { xs: '6px', sm: '8px' },
            border: '1px solid rgba(13,71,161,0.25)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '12px', sm: '14px', md: '15px' },
                fontWeight: 800,
                letterSpacing: { xs: '2px', sm: '3px' },
                fontFamily: '"Arial Black", "Segoe UI", Arial, sans-serif',
                color: '#0056a8',
                lineHeight: 1,
              }}
            >
              STQC
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: { xs: 0.3, sm: 0.4 },
                fontSize: { xs: '7px', sm: '8px', md: '9px' },
                letterSpacing: { xs: '3px', sm: '4px' },
                fontFamily: '"Arial", "Segoe UI", sans-serif',
                color: '#00a1ff',
                textTransform: 'uppercase',
              }}
            >
              Certified
            </Typography>
          </Box>
          <Box
            component="img"
            src={stqclogo}
            alt="STQC Logo"
            sx={{
              height: { xs: '26px', sm: '30px', md: '34px' },
              width: 'auto',
            }}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
