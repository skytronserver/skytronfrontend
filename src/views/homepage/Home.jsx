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
import MapWalalogo from "../../assets/images/logo.png";
import { Navigate } from "react-router-dom";
import CaptchaServices from "../../services/CaptchaServices";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockIcon from "@mui/icons-material/Lock";
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
    <Container maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
      }}>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "100%" }}
      >
        <Grid item
          xs={12}
          sm={8}
          md={5}
          lg={4}
          xl={3} justifyContent="center" alignItems="center">
          <Paper
            elevation={12}
            sx={{
              zIndex: 2,
              maxWidth: { xs: "100%", sm: 420, md: 420 },
              p: { xs: 2.5, sm: 3, md: 4 },
              borderRadius: { xs: 3, md: 4 },
              // backdropFilter: "blur(18px)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
              },
            }}>
            {/* Title Section */}
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "#0b0b0bda", letterSpacing: 0.5 }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#0b0b0bda", mt: 1 }}
              >
                Login to continue to your dashboard
              </Typography>
            </Box>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIphoneIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    label: { color: "#0b0b0bda" },
                  }}

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
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    label: { color: "#0b0b0bda" },
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
                  type="submit"
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #2563eb, #38bdf8)", transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      background: "linear-gradient(135deg, #1e40af, #0ea5e9)",
                    },
                  }}

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
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/forgot-password" sx={{
                color: "#90caf9",
                fontSize: "0.9rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}>
                {t('login.forgotPassword')}
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>

    </Container>
  );
}

export default Home;
