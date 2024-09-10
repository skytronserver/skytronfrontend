import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, useMediaQuery, Button, TextField } from "@mui/material";
import { Navigate } from "react-router-dom";
import DialogAlert from "../../../ui-component/DialogAlert";
import CircularProgress from "@mui/material/CircularProgress";
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import AuthFooter from "../../../ui-component/cards/AuthFooter";
import { useParams } from "react-router-dom";
import axios from 'axios';
const ResetPassword = () => {
  const { reset_token } = useParams();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [arePasswordsMatch, setArePasswordsMatch] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(""); 
  const [isValidMobile, setIsValidMobile] = useState(true);
  const [idNo, setIdNo] = useState("");
  const [dob, setDob] = useState("");
  const [isNotEmpty, setIsNotEmpty] = useState({
    idNo:true,
    dob:true
  });
  const handleIdNo = (event) => {
    setIdNo(event.target.value);
    if (event.target.value!== "") {
        setIsNotEmpty((prev)=>({...prev,idNo:true}));
      } else {
        setIsNotEmpty((prev)=>({...prev,idNo:false}));
    }
  };
  const handleDob = (event) => {
    setDob(event.target.value);
    if (event.target.value!== "") {
        setIsNotEmpty((prev)=>({...prev,dob:true}));
      } else {
        setIsNotEmpty((prev)=>({...prev,dob:false}));
    }
  };
  const handlePasswordChange = (value) => {
    setPassword(value); 
    // const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    // Check if the password matches the pattern
    if (!passwordPattern.test(value)) {
      setPasswordError(
        'Password must contain at least one uppercase, lowercase, numeric, and special character'
      );
    } else {
      setPasswordError(''); // Clear error if password is valid
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
  };
  useEffect(()=>{
    setArePasswordsMatch(password === confirmPassword);
  },[password,confirmPassword]);
  const handleMobileNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, ''); 
    setMobileNumber(value);
    if (value.length!== 10) {
      setIsValidMobile(false);
    } else {
      setIsValidMobile(true);
      setMobileNumber(value);
    }
  };
  const closeDialog = () => {
    setDialog(false);
  };
  const redirectToHome = () => {
    setDialog(false);
    window.location.href = "/mis";
  };
  const handleResetPassword = async () => {
    if(password!=''){
        setLoading(true)
        try {
            await axios.post('https://skytrack.tech:2000/api/password_reset/', {mobile:mobileNumber, new_password: password,id_no:idNo,dob:dob },{
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "Token "+reset_token,
                  }
            });
            setDialog(true);
          } catch (err) {
            console.error(err);
            setError('Failed to reset password');
          }finally{
            setLoading(false);
          }
    }else{
        mobileNumber==='' && setIsValidMobile(false);
        dob==='' &&  setIsNotEmpty((prev)=>({...prev,dob:false}));
        idNo==='' &&   setIsNotEmpty((prev)=>({...prev,idNo:false}));
        setError('Failed to reset password or password field is empty');
    }
    
  };

  return (
    <AuthWrapper1>
       <DialogAlert
        open={dialog}
        title="Skytron Password Set"
        detailMessage="Password has been set successfully go to home page and login using the credentials"
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
              {(
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
                        direction={matchDownSM? "column-reverse" : "row"}
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
                              variant={matchDownSM? "h3" : "h2"}
                            >
                             SKYTRON
                            </Typography>
                            <Typography
                              variant="caption"
                              fontSize="16px"
                              textAlign={matchDownSM? "center" : "inherit"}
                            >
                              Set Password
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
                          error={!isValidMobile}
                          helperText={!isValidMobile? "Invalid mobile number" : ""}
                        />
                        <br/><br/>
                        <TextField
                          label="Last 4 Digit of your id proof"
                          type="text"
                          value={idNo}
                          onChange={handleIdNo}
                          fullWidth
                          required
                          error={!isNotEmpty.idNo}
                          helperText={!isNotEmpty.idNo? "This is required field" : ""}
                        />
                        <br/><br/>
                        <label htmlFor="dob" style={{textAlign:"left",display:"block"}}>Date of Birth</label>
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
                        <br/><br/>
                        <TextField
                          label="New Password"
                          type="password"
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          fullWidth
                          error={!!passwordError}
                          helperText={passwordError}
                        />
                        <br/><br/>
                        <TextField
                          label="Confirm New Password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          fullWidth
                          error={!arePasswordsMatch} // Set error state based on password match
                          helperText={!arePasswordsMatch? "Passwords do not match" : ""} // Show error message if passwords do not match
                        />
                        <br/><br/>
                        <Button
                          color="primary"
                          size="large"
                          type="button"
                          variant="contained"
                          onClick={handleResetPassword}
                          disabled={!arePasswordsMatch} // Disable button if passwords don't match
                        >
                          Set Password
                        </Button>
                      </Typography>
                    </Grid>
                    {error && <Typography style={{ color: "red", textAlign: 'center' }}>{error}</Typography>}
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

export default ResetPassword;
