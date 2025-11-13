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
      
      {/* STQC Certification Badge - Responsive */}
      <Box sx={{
        position: 'fixed',
        top: { xs: '75px', sm: '80px', md: '94px' },
        left: { xs: '10px', sm: '15px', md: '20px' },
        zIndex: 10,
        animation: 'certificationPulse 3s ease-in-out infinite',
        '@keyframes certificationPulse': {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.4)',
          },
          '50%': {
            transform: 'scale(1.03)',
            boxShadow: '0 0 0 8px rgba(255, 107, 53, 0.1)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)',
          },
        },
      }}>
        <Box sx={{
          background: 'linear-gradient(145deg, #ff6b35 0%, #f7931e 25%, #ffd700 50%, #f7931e 75%, #ff6b35 100%)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          width: { xs: '70px', sm: '75px', md: '90px' },
          height: { xs: '70px', sm: '75px', md: '90px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: {
            xs: '0 4px 15px rgba(255, 107, 53, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
            sm: '0 6px 20px rgba(255, 107, 53, 0.35), 0 3px 10px rgba(0, 0, 0, 0.25)',
            md: '0 8px 25px rgba(255, 107, 53, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
          },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: { xs: '2px', sm: '2.5px', md: '3px' },
            left: { xs: '2px', sm: '2.5px', md: '3px' },
            right: { xs: '2px', sm: '2.5px', md: '3px' },
            bottom: { xs: '2px', sm: '2.5px', md: '3px' },
            background: 'linear-gradient(145deg, #0d47a1 0%, #1565c0 50%, #0d47a1 100%)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            zIndex: -1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: { xs: '4px', sm: '5px', md: '6px' },
            left: { xs: '4px', sm: '5px', md: '6px' },
            right: { xs: '4px', sm: '5px', md: '6px' },
            bottom: { xs: '4px', sm: '5px', md: '6px' },
            background: '#f8f9fa',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            zIndex: -2,
          }
        }}>
          <Box
            component="img"
            src={stqclogo}
            alt="STQC Logo"
            sx={{ 
              height: { xs: '18px', sm: '24px', md: '30px' },
              width: 'auto',
              marginBottom: { xs: '2px', sm: '2.5px', md: '3px' },
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) contrast(1.2) saturate(1.3)'
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'white', 
              fontWeight: '900',
              fontSize: { xs: '7px', sm: '8.5px', md: '10px' },
              letterSpacing: { xs: '0.8px', sm: '1px', md: '1.2px' },
              textAlign: 'center',
              fontFamily: 'Arial Black, Impact, sans-serif',
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(13,71,161,0.5)',
              lineHeight: 1,
              WebkitTextStroke: { xs: '0.3px rgba(0,0,0,0.3)', sm: '0.4px rgba(0,0,0,0.3)', md: '0.5px rgba(0,0,0,0.3)' }
            }}
          >
            CERTIFIED
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
