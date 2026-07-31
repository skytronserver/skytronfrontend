/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Typography,
  useMediaQuery,
  Button,
  TextField,
} from "@mui/material";
import { BASE_URL } from "../../../store/constant";
import CircularProgress from "@mui/material/CircularProgress";
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import AuthFooter from "../../../ui-component/cards/AuthFooter";
import axios from "axios";
import DialogAlert from "../../../ui-component/DialogAlert";
import AlertBox from "../../../ui-component/AlertBox";
import SendIcon from "@mui/icons-material/Send";
import HomeIcon from "@mui/icons-material/Home";
import Stack from "@mui/material/Stack";
const ForgotPassword = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState(null);
  const [idNo, setIdNo] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isValidMobile, setIsValidMobile] = useState(true);
  const [isOpen,setIsOpen]=useState(false);
  const [isNotEmpty, setIsNotEmpty] = useState({
    idNo: true,
    dob: true,
    email: true,
  });
  const handleIdNo = (event) => {
    setIdNo(event.target.value);
    if (event.target.value !== "") {
      setIsNotEmpty((prev) => ({ ...prev, idNo: true }));
    } else {
      setIsNotEmpty((prev) => ({ ...prev, idNo: false }));
    }
  };
  const handleDob = (event) => {
    setDob(event.target.value);
    if (event.target.value !== "") {
      setIsNotEmpty((prev) => ({ ...prev, dob: true }));
    } else {
      setIsNotEmpty((prev) => ({ ...prev, dob: false }));
    }
  };
  const handleEmail = (event) => {
    setEmail(event.target.value);
    if (event.target.value !== "") {
      setIsNotEmpty((prev) => ({ ...prev, email: true }));
    } else {
      setIsNotEmpty((prev) => ({ ...prev, email: false }));
    }
  };

  const handleMobileNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setMobileNumber(value);
      if (value.length !== 10) {
        setIsValidMobile(false);
      } else {
        setIsValidMobile(true);
      }
    }
  };
  const handleForgotPassword = async () => {
    if (isValidMobile && email !== "") {
      setLoading(true);
      try {
        await axios.post(
          `${BASE_URL}api/reset_password_request/`,
          { mobile: mobileNumber, email: email },
          {
            headers: {
              "Content-type": "application/json",
            },
          }
        );
        setDialog(true);
      } catch (err) {       
        setError("Failed to send reset password link please check your details or contact Administrator");
        setIsOpen(true)
      } finally {
        setLoading(false);
      }
    } else {
      mobileNumber === "" && setIsValidMobile(false);
      email === "" && setIsNotEmpty((prev) => ({ ...prev, email: false }));
      // idNo==='' &&   setIsNotEmpty((prev)=>({...prev,idNo:false}));
      setError("All fields are mandatory, please fill up the details");
      setIsOpen(true)
    }
  };
  const closeDialog = () => {
    setDialog(false);
  };
  const redirectToHome = () => {
    setDialog(false);
    window.location.href = "/";
  };
  const handleAlert=()=>{
    setIsOpen(false);
  }
  return (
    <AuthWrapper1>
      <AlertBox
      severity="error"
      isOpen={isOpen}
      handleAlertClick={handleAlert}
      title="Error"
      message={error}
      />
      <DialogAlert
        open={dialog}
        title="Skytron Password Reset"
        detailMessage="Password reset link has been shared successfully to your registered email id and phone which is valid for 5 minutes please follow the instruction in the mail"
        primaryAction={redirectToHome}
        primaryText="Home"
        handleClose={closeDialog}
      />
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
              {
                <AuthCardWrapper>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {/* Existing content */}
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
                              Forgot Password
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography align="center">
                        <TextField
                          label="Mobile Number"
                          type="tel"
                          value={mobileNumber}
                          onChange={handleMobileNumberChange}
                          fullWidth
                          inputProps={{ maxLength: 10 }}
                          error={!isValidMobile}
                          helperText={!isValidMobile ? "Invalid mobile number" : ""}
                          required
                        />
                        <br />
                        <br />
                        {/* <TextField
                          label="Last 4 Digit of your id proof"
                          type="text"
                          value={idNo}
                          onChange={handleIdNo}
                          fullWidth
                          required
                          error={!isNotEmpty.idNo}
                          helperText={!isNotEmpty.idNo? "This is required field" : ""}
                        /> */}
                        <TextField
                          label="Email Id"
                          type="email"
                          value={email}
                          onChange={handleEmail}
                          fullWidth
                          required
                          error={!isNotEmpty.email}
                          helperText={
                            !isNotEmpty.email ? "This is required field" : ""
                          }
                        />
                        <br />
                        <br />
                        {/* <label htmlFor="dob" style={{textAlign:"left",display:"block"}}>Date of Birth</label>
                        <TextField
                          type="date"
                          value={dob}
                          onChange={handleDob}
                          id="dob"
                          fullWidth
                          required
                          error={!isNotEmpty.dob}
                          helperText={!isNotEmpty.dob? "This is required field" : ""}
                        />
                        <br/><br/> */}
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ float: "right" }}
                        >
                          <Button
                            color="primary"
                            size="small"
                            type="button"
                            variant="contained"
                            onClick={handleForgotPassword}
                            endIcon={<SendIcon />}
                          >
                            Send Link
                          </Button>
                          <Button
                            color="primary"
                            size="small"
                            type="button"
                            variant="outlined"
                            onClick={redirectToHome}
                            startIcon={<HomeIcon />}
                          >
                            Home
                          </Button>
                        </Stack>
                      </Typography>
                    </Grid>
                  </Grid>
                </AuthCardWrapper>
              }
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

export default ForgotPassword;
