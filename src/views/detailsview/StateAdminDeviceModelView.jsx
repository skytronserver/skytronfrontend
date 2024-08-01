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

import { getDeviceModel } from "../../actions/deviceModelActions";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";
const docViewStyle={
  padding:"0px"
}
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
      setShowOTP(false);
      navigate("/device/list");
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

  const handleSendOTPValidation = async (OtpData) => {
    try {
      const response = await OtpServices.AdminDeviceSendOtp(OtpData);
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
  const openFile = async (e, filePath) => {
    let splitData = filePath.split("/");
    let filename = splitData.length > 1 && splitData[splitData.length-1];
    e.preventDefault();
    try {
      // Make the request to download the file
      const response = await SettingService.file_Download({
        file_path: filePath,
      });

      // Extract the filename from the response headers or use the provided filename
      const contentDisposition = response.headers["content-disposition"];
      let fileName = filename;

      if (contentDisposition && contentDisposition.includes("attachment")) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      // Determine the content type
      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      // Create a Blob from the response data with the correct MIME type
      const blob = new Blob([response.data], { type: contentType });

      // Check if the Blob is not empty
      if (blob.size === 0) {
        throw new Error("The downloaded file is empty.");
      }

      // Convert Blob to base64 string

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data = reader.result;

        // Open the file in a new window or tab with the correct filename
        const newWindow = window.open("", "_blank");
        const extension = filename.split(".").pop();
        const validExtensions = /^(png|jpg|jpeg)$/i;
        if (validExtensions.test(extension)) {
          // Open image in a new window/tab
          newWindow.document.write(
            `<html><head><title>${fileName}</title></head><body><img src="${base64data}" alt="${fileName}"></body></html>`
          );
        } else if (extension === "pdf" || extension === "PDF") {
          // Open PDF in a new window/tab using an iframe
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName; // Specify the filename you want
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
          
          // For other file types, provide a link to download/view the file
          newWindow.document.write(
            `<html><head><title>${fileName}</title></head><body><a href="${base64data}" download="${fileName}">Download ${fileName}</a></body></html>`
          );
        }

        // Optionally, revoke the object URL after some time to release memory
        setTimeout(() => window.URL.revokeObjectURL(base64data), 60000); // revoke after 1 minute
      };
    } catch (error) {
      console.error("Error viewing file:", error);
    }
  };
  return (
    <>
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
                            <strong>Created By:</strong>
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
                          <TableCell>{deviceDetails.status}</TableCell>
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
