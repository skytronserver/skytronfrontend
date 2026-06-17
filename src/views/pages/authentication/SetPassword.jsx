import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Divider, Grid, Stack, Typography, useMediaQuery, Button, TextField } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import CircularProgress from "@mui/material/CircularProgress";
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import AuthFooter from "../../../ui-component/cards/AuthFooter";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../store/constant";
import { encryptWithPublicKey } from '../../../actions/loginActions';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Tooltip from '@mui/material/Tooltip';

const SetPassword = () => {
  const { t } = useTranslation();
  const { reset_token } = useParams();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState('');
  const [arePasswordsMatch, setArePasswordsMatch] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [isValidMobile, setIsValidMobile] = useState(true);
  const [idNo, setIdNo] = useState("");
  const [dob, setDob] = useState("");
  const [isNotEmpty, setIsNotEmpty] = useState({
    idNo: true,
    dob: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const handlePasswordChange = (value) => {
    setPassword(value);
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordPattern.test(value)) {
      setPasswordError(
        t('auth.passwordRequirements') || "Password must be more than 8 characters long,must contain at least one uppercase, lowercase, numeric, and special character."
      );
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
  };
  useEffect(() => {
    setArePasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);
  const handleMobileNumberChange = (event) => {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
    setMobileNumber(value);
    setIsValidMobile(value.length === 10);
  };
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split('T')[0];
  const handleSetPassword = async () => {
    if (password != '') {
      setLoading(true)
      try {
        // Encrypt the password before sending
        const encryptedPassword = encryptWithPublicKey(password);
        await axios.post(`${BASE_URL}api/password_reset/`, { mobile: mobileNumber, new_password: encryptedPassword, id_no: idNo, dob: dob, token: reset_token }, {
          headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + reset_token,
          }
        });
        window.location.href = "/"
      } catch (err) {
        console.error(err);
        setError('Failed to reset password');
      } finally {
        setLoading(false)
      }
    } else {
      mobileNumber === '' && setIsValidMobile(false);
      dob === '' && setIsNotEmpty((prev) => ({ ...prev, dob: false }));
      idNo === '' && setIsNotEmpty((prev) => ({ ...prev, idNo: false }));
      setError('Failed to reset password or password field is empty');
    }

  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

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
                              Reset Password
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
                          helperText={!isValidMobile ? "Invalid mobile number" : ""}
                          inputProps={{ maxLength: 10 }}
                        />
                        <br /><br />
                        <TextField
                          label="Last 4 Digit of your id proof"
                          type="text"
                          value={idNo}
                          onChange={handleIdNo}
                          fullWidth
                          required
                          error={!isNotEmpty.idNo}
                          helperText={!isNotEmpty.idNo ? "This is required field" : ""}
                        />
                        <br /><br />
                        <label htmlFor="dob" style={{ textAlign: "left", display: "block" }}>Date of Birth</label>
                        <TextField
                          type="date"
                          value={dob}
                          onChange={handleDob}
                          id="dob"
                          fullWidth
                          required
                          error={!isNotEmpty.dob}
                          helperText={!isNotEmpty.dob ? "This is required field" : ""}
                          inputProps={{ max: maxDob }}
                        />
                        <br /><br />
                        <Tooltip title={t('auth.passwordRequirements') || "Password must be more than 8 characters long,must contain at least one uppercase, lowercase, numeric, and special character."} arrow placement="top">
                          <TextField
                            label="New Password"
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
                        </Tooltip>
                        <br /><br />
                        <TextField
                          label="Confirm New Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          fullWidth
                          error={!arePasswordsMatch}
                          helperText={!arePasswordsMatch ? "Passwords do not match" : ""}
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
                        <br /><br />
                        <Button
                          color="primary"
                          size="large"
                          type="button"
                          variant="contained"
                          onClick={handleSetPassword}
                          disabled={!arePasswordsMatch || !!passwordError || !password}
                        >
                          Reset Password
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

export default SetPassword;
