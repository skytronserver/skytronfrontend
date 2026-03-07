/* package import sections */
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Grid, Button, Typography, Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useTranslation } from "react-i18next";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import DescriptionIcon from '@mui/icons-material/Description';

/* project component/helper import sections */
import { getCOPDeviceModel } from "../../actions/deviceModelActions";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import OtpServices from "../../services/OtpServices";
import { openFile } from "helper";

// Add styles object
const styles = {
  documentButton: {
    textTransform: 'none',
    color: '#0088ff',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: 'rgba(0, 136, 255, 0.04)'
    },
    '& .MuiButton-startIcon': {
      color: '#0088ff'
    }
  }
};

const StateAdminCOPModelView = () => {
  const { t } = useTranslation();

  /* packages helper functionality */
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* define state sections */
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [message, setMessage] = useState("");

  /* custom helper functionality */
  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_model_id: deviceId,
    };
    const response = await handleOTPValidation(OTPData);
    if (response.code === "200") {
      setShowOTP(false);
      setOpenAlert(true);
      setAlertType("success");
      setMessage(t('copModelView.messages.verificationSuccess'));
      setTimeout(() => {
        navigate("/deviceCOP/list");
      }, 2000);
    } else {
      setOpenAlert(true);
      setAlertType("error");
      setMessage(t('copModelView.messages.internalError'));
    }
  };

  const handleSendOTP = async () => {
    const deviceOTPData = {
      device_model_id: deviceId,
    };
    const response = await handleSendOTPValidation(deviceOTPData);
    if (response.code === "200") {
      setShowOTP(true);
      setOpenAlert(true);
      setAlertType("success");
      setMessage(t('copModelView.messages.otpSent'));
    } else {
      setOpenAlert(true);
      setAlertType("error");
      setMessage(t('copModelView.messages.internalError'));
    }
  };

  const handleOTPValidation = async (modelOtpData) => {
    try {
      const response = await OtpServices.AdminCOPDeviceVerifyOtp(modelOtpData);
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error while submitting data", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };

  const handleSendOTPValidation = async (OtpData) => {
    try {
      const response = await OtpServices.AdminCOPDeviceSendOtp(OtpData);
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error while submitting data", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };

  useEffect(() => {
    const retrieveSingleItem = () => {
      try {
        dispatch(getCOPDeviceModel(deviceId));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    retrieveSingleItem();
  }, [dispatch, deviceId]);

  const deviceDetails = useSelector((state) => state.deviceModel.deviceModel);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Grid>
    );
  }

  if (!deviceDetails) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <Typography>{t('common.noDataFound')}</Typography>
      </Grid>
    );
  }

  return (
    <>
      <AutoHideAlert open={openAlert} onClose={handleCloseAlert} message={message} type={alertType} />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title={`${t('copModelView.title')}: ${deviceDetails.device_model || ''}`}>
            <Grid container>
              {!showOTP && (
                <Grid item xs={12} md={6} lg={6}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "50%" }}>
                            <strong>{t('copModelView.modelDetails.modelName')}:</strong>
                          </TableCell>
                          <TableCell style={{ width: "50%" }}>
                            {deviceDetails.cop_no}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>{t('copModelView.modelDetails.validity')}:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.cop_validity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>{t('copModelView.modelDetails.copFile')}:</strong>
                          </TableCell>
                          <TableCell>
                            <Button
                              startIcon={<DescriptionIcon />}
                              sx={styles.documentButton}
                              onClick={(e) => openFile(e, deviceDetails.cop_file)}
                            >
                              View COP
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>{t('copModelView.modelDetails.createdBy')}:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.created_by}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <br />
                  <Typography align="center">
                    <Button
                      color="primary"
                      size="large"
                      type="submit"
                      variant="contained"
                      onClick={handleSendOTP}
                    >
                      {t('copModelView.actions.verifyAndSendOtp')}
                    </Button>
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {showOTP && (
                <Grid item xs={12} md={5}>
                  <MuiOtpInput value={otp} onChange={handleChange} length={6} />
                  <br />
                  <Typography align="center">
                    <Button
                      color="primary"
                      size="large"
                      type="submit"
                      variant="contained"
                      onClick={handleOTPSubmit}
                    >
                      {t('copModelView.actions.verifyOtp')}
                    </Button>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default StateAdminCOPModelView;
