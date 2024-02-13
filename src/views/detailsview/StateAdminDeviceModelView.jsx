
/* package import sections */
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Button,Typography} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MuiOtpInput } from "mui-one-time-password-input";

/* project component/helper import sections */

import { getDeviceModel } from "../../actions/deviceModelActions";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";

const StateAdminDeviceModelView = () => {

/* packages helper functionality */

  const { deviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
/* define state sections */

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");
    const [alert, setAlert] = useState({
      error: false,
      message: "",
      errorList: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

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
      console.log(response);
      setShowOTP(false);
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
      console.log(response);
      setShowOTP(false);
    } else {
      console.log(response.error);
    }
  };

  const handleOTPValidation = async (modelOtpData) => {
    try {
      const response = await OtpServices.AdminDeviceVerifyOtp(modelOtpData);
      console.log("Device Model is OTP Verified", response.data);
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
      const response = await OtpServices.AdminDeviceSendOtp(OtpData);
      console.log("Device Model is OTP Verified", response.data);
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
    const retrieveSingleItem = async () => {
      const getDetailsOf = {
        device_model_id: deviceId,
      };
      try {
        const retrieveData = await DeviceModelServices.getModel(getDetailsOf);
        dispatch(getDeviceModel(retrieveData.data));
        setLoading(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Data not found"); 
        } else {
          setError("An error occurred while fetching data");
        }
        setLoading(true);
      }
    };
    retrieveSingleItem();
  }, [dispatch, deviceId]);

  const deviceDetails = useSelector((state) => state.deviceModel.deviceModel);
  console.log(deviceDetails);

  return (
    <>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {loading && (
            <MainCard title={`Model Name : ${deviceDetails.model_name}`}>
              <Grid container>
                <Grid item xs={12} md={8} lg={6}>
                  <Typography>
                    <strong>Model Name:</strong> {deviceDetails.model_name}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Test Agency:</strong> {deviceDetails.test_agency}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Vendor ID:</strong> {deviceDetails.vendor_id}
                  </Typography>

                  <Typography variant="body1">
                    <strong>TAC No:</strong> {deviceDetails.tac_no}
                  </Typography>

                  <Typography variant="body1">
                    <strong>TAC Validity:</strong> {deviceDetails.tac_validity}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Hardware Version:</strong>{" "}
                    {deviceDetails.hardware_version}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Created By:</strong> {deviceDetails.created_by}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Created:</strong> {deviceDetails.created}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Status:</strong> {deviceDetails.status}
                  </Typography>
                </Grid>
              </Grid>
              <Button
                color="primary"
                size="large"
                type="submit"
                variant="contained"
                onClick={handleSendOTP}
              >
                Verify
              </Button>
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={12} md="5">
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
              </Grid>
            </MainCard>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default StateAdminDeviceModelView;
