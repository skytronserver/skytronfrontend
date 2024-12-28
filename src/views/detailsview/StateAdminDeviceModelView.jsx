/* package import sections */
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Button,
  Typography,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MuiOtpInput } from "mui-one-time-password-input";
import SettingService from "../../services/SettingService";
/* project component/helper import sections */
import AutoHideAlert from "../../ui-component/AutoHideAlert"
import { getDeviceModel } from "../../actions/deviceModelActions";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";
import { openFile } from "../../helper";
const docViewStyle={
  padding:"0px"
}
const StateAdminDeviceModelView = () => {
  /* packages helper functionality */
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType,setAlertType]=useState("success");
  const [message, setMessage] = useState('');
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
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_model_id: deviceId,
    };
    try {
      await OtpServices.AdminDeviceVerifyOtp(OTPData);
      setShowOTP(false);
      navigate("/device/list");
      setOpenAlert(true);
      setAlertType("success")
      setMessage('Model has been successfully verified');
    } catch (error) {
      setOpenAlert(true);
      setAlertType("error")
      setMessage('Internal Server Error ! Please try again');
    }
  };

  const handleSendOTP = async () => {
    const deviceOTPData = {
      device_model_id: deviceId,
    };
    try {
      await OtpServices.AdminDeviceSendOtp(deviceOTPData);
      setShowOTP(true);
      setOpenAlert(true);
      setAlertType("success")
      setMessage('OTP has been successfully send to your registered mobile number please enter in the below form');
    } catch (error) {
      setOpenAlert(true);
      setAlertType("error")
      setMessage('Internal Server Error ! Please try again');
    }
  };

  const handleOTPValidation = async (modelOtpData) => {
    try {
      const response = await OtpServices.AdminDeviceVerifyOtp(modelOtpData);
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
  
  return (
    <>
    <AutoHideAlert open={openAlert} onClose={handleCloseAlert} message={message} type={alertType}/>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {loading && (
            <MainCard title={`Model Name : ${deviceDetails.model_name}`}>
              {!showOTP && ( <>
              <Grid container>
              
                <Grid item xs={12} md={6} lg={6}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                      <TableRow>
                          <TableCell style={{ width: "50%" }}>
                            <strong>M2M Provider:</strong>
                          </TableCell>
                          <TableCell style={{ width: "50%" }}>
                          {deviceDetails.eSimProviders.length>0 && deviceDetails.eSimProviders.map(item=><span>{item.company_name}</span>)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ width: "50%" }}>
                            <strong>Model Name:</strong>
                          </TableCell>
                          <TableCell style={{ width: "50%" }}>
                            {deviceDetails.model_name}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Test Agency:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.test_agency}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Vendor ID:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.vendor_id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>TAC No:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.tac_no}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>TAC Validity:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.tac_validity}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "50%" }}>
                            <strong>Hardware Version:</strong>
                          </TableCell>
                          <TableCell style={{ width: "50%" }}>
                            {deviceDetails.hardware_version}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Manufacturer Name:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.created_by.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Created:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.created}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Status:</strong>
                          </TableCell>
                          <TableCell>{deviceDetails.status.replace(/_/g, ' ')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>TAC File:</strong>
                          </TableCell>
                          <TableCell><Button color="primary" style={docViewStyle} onClick={(e)=>openFile(e,deviceDetails.tac_doc_path)} ><span>View TAC</span></Button></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
              <br />
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
              </>)}
              {showOTP && (
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <p>Please validate your submission by entering the OTP sent to your registered mobile no.</p>
                </Grid>
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
              )}
            </MainCard>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default StateAdminDeviceModelView;
