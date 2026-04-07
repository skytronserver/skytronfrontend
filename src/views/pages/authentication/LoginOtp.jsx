import {useState,useEffect} from 'react';
// material-ui
import { useTheme } from "@mui/material/styles";
import { Divider, Grid, Stack, Typography, useMediaQuery,Button } from "@mui/material";
import { useSelector,useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from 'react-i18next';
// project imports
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import { MuiOtpInput } from "mui-one-time-password-input";
import { verifyOtp,resendOtp,setError } from "../../../actions/loginActions";
import { createAxiosInstance } from '../../../services/axiosInstance';
import MinimalFooter from '../../../ui-component/cards/MinimalFooter';
import AlertBox from "../../../ui-component/AlertBox";
const LoginOtp = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [isOpen,setIsOpen]=useState(false);
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("md"));
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated');
  const userEmail=useSelector((state) => state.login.user.email);
  const otpToken=useSelector((state) => state.login.user.otpToken);
  const token=useSelector((state) => state.login.user.token);
  const loading = useSelector((state) => state.login.loading);
  const error = useSelector((state) => state.login.error);
  const [remainingTime, setRemainingTime] = useState(180);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // This line is necessary for some browsers to show the warning message
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      if (remainingTime > 0) {
        setRemainingTime(remainingTime - 1);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup function to stop timer on unmount
  }, [remainingTime]);
  const handleClick = () => {
    if (remainingTime === 0) {
      dispatch(resendOtp(userEmail,otpToken));
      setRemainingTime(180); // Reset timer after resend
    }
  };
  if (isAuthenticated) {
    createAxiosInstance(sessionStorage.getItem('oAuthToken'));
    return <Navigate to="/dashboard" replace />;
  }
  if(otpToken===null){
    window.location.href = "/";
  }
  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleOTPSubmit = async () => {
    dispatch(verifyOtp(otpToken,otp,userEmail));
  };
  return (
    <AuthWrapper1>
      <AlertBox
      severity="error"
      isOpen={error.message !== null}
      handleAlertClick={()=>console.log('information of otp verification')}
      title={t("common.error")}
      message={error.message}
      />
      <Grid
        container
        direction="column"
        justifyContent="flex-end"
        sx={{ minHeight: "90vh" }}
      >
        <Grid item xs={12}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "calc(100vh - 68px)" }}
          >
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              {loading && (
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid
                    item
                    xs={12}
                    container
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CircularProgress color="secondary" />
                  </Grid>
                </Grid>
              )}
              {
                <AuthCardWrapper>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Grid item xs={12}>
                      <Grid
                        container
                        direction={matchDownSM ? "column-reverse" : "row"}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Grid item>
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                          >
                            <Typography
                              color={theme.palette.secondary.main}
                              gutterBottom
                              variant={matchDownSM ? "h3" : "h2"}
                            >
                              MAPWALA
                            </Typography>
                            <Typography
                              variant="caption"
                              fontSize="16px"
                              textAlign={matchDownSM ? "center" : "inherit"}
                            >
                              {t("auth.enterOtpSentToMobile")}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <MuiOtpInput
                        value={otp}
                        onChange={handleChange}
                        length={6}
                      />
                      <br />
                      <Typography align="center">
                        <Button
                          color="primary"
                          size="large"
                          type="submit"
                          variant="contained"
                          onClick={handleOTPSubmit}
                          disabled={remainingTime <= 0}
                        >
                          {t("auth.verifyOtp")}
                        </Button>
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Divider />
                      <br/>
                      <Typography className="otp-timer" style={{textAlign:"center"}}>
                        <span>{t("auth.resendOtpIn", { seconds: remainingTime })}</span>
                        <Button
                        color="success"
                        size="small"
                        variant="contained"
                          disabled={remainingTime > 0}
                          onClick={handleClick}
                        >
                          {t("auth.resend")}
                        </Button>
                      </Typography>
                    </Grid>
                  </Grid>
                </AuthCardWrapper>
              }
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <MinimalFooter />          
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

export default LoginOtp;
