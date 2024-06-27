
/* package import sections */
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Button,Typography, Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MuiOtpInput } from "mui-one-time-password-input";

/* project component/helper import sections */

import { getCOPDeviceModel } from "../../actions/deviceModelActions";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import OtpServices from "../../services/OtpServices";

const StateAdminCOPModelView = () => {

/* packages helper functionality */

  const { deviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
/* define state sections */

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);


/* custom helper functionality */
 
  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_model_id: deviceId,
    };
    const response = await handleOTPValidation(OTPData);
    if (response.code === "200") {
      setShowOTP(false);
      navigate("/deviceCOP/list");
    } else {
      console.log(response.error);
    }
  };

  const handleSendOTP = async () => {
    const deviceOTPData = {
      device_model_id: deviceId,
    };
    const response = await handleSendOTPValidation(deviceOTPData);
    if (response.code === "200") {
      setShowOTP(true);
    } else {
      console.log(response.error);
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
    const retrieveSingleItem =  () => {
 
        dispatch(getCOPDeviceModel(deviceId));
        setLoading(true);

    };
    retrieveSingleItem();
  }, [dispatch, deviceId]);

  const deviceDetails = useSelector((state) => state.deviceModel.deviceModel);
  return (
    <>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {loading && (
            <MainCard title={`Model Name : ${deviceDetails.device_model}`}>
              <Grid container>
                {!showOTP && (
                <Grid item xs={12} md={6} lg={6}>
                 
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "50%" }}>
                            <strong>Model Name:</strong>
                          </TableCell>
                          <TableCell style={{ width: "50%" }}>
                          {deviceDetails.cop_no}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Validity</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.cop_validity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>COP File:</strong>
                          </TableCell>
                          <TableCell> {deviceDetails.cop_file}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Created By:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.created_by}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <br/>
              <Typography align="center">
              <Button
                color="primary"
                size="large"
                type="submit"
                variant="contained"
                onClick={handleSendOTP}
              >
                Verify & Send OTP
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
                      Verify OTP
                    </Button>
                  </Typography>
                </Grid>
                 )}
              </Grid>
            </MainCard>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default StateAdminCOPModelView;
