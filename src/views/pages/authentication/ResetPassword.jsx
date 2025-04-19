import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, useMediaQuery, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import DialogAlert from "../../../ui-component/DialogAlert";
import CircularProgress from "@mui/material/CircularProgress";
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import AuthFooter from "../../../ui-component/cards/AuthFooter";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../store/constant";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ResetPassword = () => {
  const { reset_token } = useParams();
  const theme = useTheme();
  const { t } = useTranslation();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        t('auth.passwordRequirements')
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
    const value = event.target.value.replace(/\D/g, '').slice(0, 10); // Limit to 10 digits
    setMobileNumber(value);
    setIsValidMobile(value.length === 10);
  };
  const closeDialog = () => {
    setDialog(false);
  };
  const redirectToHome = () => {
    setDialog(false);
    window.location.href = "/";
  };
  const handleResetPassword = async () => {
    if(password!=''){
        setLoading(true)
        try {
            await axios.post(`${BASE_URL}api/password_reset/`, {mobile:mobileNumber, new_password: password,id_no:idNo,dob:dob },{
                headers:{
                    "Content-type": "application/json",
                    "Authorization": "Token "+reset_token,
                  }
            });
            setDialog(true);
          } catch (err) {
            console.error(err);
            setError(t('auth.failedPasswordReset'));
          }finally{
            setLoading(false);
          }
    }else{
        mobileNumber==='' && setIsValidMobile(false);
        dob==='' &&  setIsNotEmpty((prev)=>({...prev,dob:false}));
        idNo==='' &&   setIsNotEmpty((prev)=>({...prev,idNo:false}));
        setError(t('auth.failedPasswordResetEmpty'));
    }
    
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  return (
    <AuthWrapper1>
       <DialogAlert
        open={dialog}
        title={t('auth.skytronPasswordSet')}
        detailMessage={t('auth.passwordSetSuccess')}
        primaryAction={redirectToHome}
        primaryText={t('common.home')}
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
                              {t('auth.setPassword')}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography align="center">
                      <TextField
                          label={t('auth.mobileNumber')}
                          type="tel"
                          value={mobileNumber}
                          onChange={handleMobileNumberChange}
                          fullWidth
                          error={!isValidMobile}
                          helperText={!isValidMobile ? t('auth.invalidMobile') : ""}
                          inputProps={{ maxLength: 10 }}
                        />
                        <br/><br/>
                        <TextField
                          label={t('auth.idProofLastDigit')}
                          type="text"
                          value={idNo}
                          onChange={handleIdNo}
                          fullWidth
                          required
                          error={!isNotEmpty.idNo}
                          helperText={!isNotEmpty.idNo? t('auth.requiredField') : ""}
                        />
                        <br/><br/>
                        <label htmlFor="dob" style={{textAlign:"left",display:"block"}}>{t('auth.dateOfBirth')}</label>
                        <TextField
                          type="date"
                          value={dob}
                          onChange={handleDob}
                          id="dob"
                          fullWidth
                          required
                          error={!isNotEmpty.dob}
                          helperText={!isNotEmpty.dob? t('auth.requiredField') : ""}
                        />
                        <br/><br/>
                        <TextField
                          label={t('auth.newPassword')}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          fullWidth
                          error={!!passwordError}
                          helperText={passwordError}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleClickShowPassword} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <br/><br/>
                        <TextField
                          label={t('auth.confirmNewPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          fullWidth
                          error={!arePasswordsMatch}
                          helperText={!arePasswordsMatch ? t('auth.passwordsDoNotMatch') : ""}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
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
                          {t('auth.setPassword')}
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
