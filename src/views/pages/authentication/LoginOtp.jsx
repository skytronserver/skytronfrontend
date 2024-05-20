import { Link } from "react-router-dom";
import {useState} from 'react';
// material-ui
import { useTheme } from "@mui/material/styles";
import { Divider, Grid, Stack, Typography, useMediaQuery,Button } from "@mui/material";
import { useSelector,useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
// project imports
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import AuthFooter from "../../../ui-component/cards/AuthFooter";
import { MuiOtpInput } from "mui-one-time-password-input";
import { verifyOtp } from "../../../actions/loginActions";
import { createAxiosInstance } from '../../../services/axiosInstance';
const LoginOtp = () => {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("md"));
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated');
  const userEmail=useSelector((state) => state.login.user.email);
  const otpToken=useSelector((state) => state.login.user.otpToken);
  const token=useSelector((state) => state.login.user.token);
  const loading = useSelector((state) => state.login.loading);
  const error = useSelector((state) => state.login.error);
  if (isAuthenticated) {
    createAxiosInstance(sessionStorage.getItem('oAuthToken'));
    return <Navigate to="/dashboard" replace />;
  }
  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleOTPSubmit = async () => {
    dispatch(verifyOtp(otpToken,otp,userEmail));
  };
  return (
    <AuthWrapper1>
      <Grid
        container
        direction="column"
        justifyContent="flex-end"
        sx={{ minHeight: "100vh" }}
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
              {(
                <AuthCardWrapper>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {/* Logo Section */}
                    {/* <Grid item sx={{ mb: 3 }}>
                      <Link to="#">
                        <Logo />
                      </Link>
                    </Grid> */}
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
                             SKYTRON
                            </Typography>
                            <Typography
                              variant="caption"
                              fontSize="16px"
                              textAlign={matchDownSM ? "center" : "inherit"}
                            >
                              Enter your OTP sent to your Mobile No 
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                    <MuiOtpInput value={otp} onChange={handleChange} length={6} />
                    <br/>
                    <Typography align="center">
                    <Button
                      color="primary"
                      size="large"
                      type="submit"
                      variant="contained"
                      onClick={handleOTPSubmit}
                    >
                      Verify OTP
                    </Button>
                  </Typography>
                    </Grid>
                    <Grid item xs={12} alignItems="center"
                        justifyContent="center">
                      <Divider />
                      {error.message!=null && <Typography style={{color:"red",textAlign:'center'}}>Invalid OTP</Typography>}
                    </Grid>
                  </Grid>
                </AuthCardWrapper>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

export default LoginOtp;
