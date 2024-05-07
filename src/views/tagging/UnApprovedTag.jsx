import { useSelector, useDispatch } from "react-redux";
import React from "react";
// project imports
import { Grid, Button, Typography } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import TaggingService from "../../services/TaggingService";
import { useEffect, useState } from "react";
import { fetchTaggedAwaitingOwner } from "../../actions/commonDataActions";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { awaitingOwnerApproval } from "../../datatables/rowsColumn";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useNavigate } from "react-router-dom";
import MainCard from "../../ui-component/cards/MainCard";
const UnApprovedTag = () => {
  const [load, setLoad] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUnapprovedTag = async () => {
      const retriveData = await TaggingService.tagAwaitingOwnerApproval();
      dispatch(fetchTaggedAwaitingOwner(retriveData.data));
      setLoad(true);
    };
    fetchUnapprovedTag();
  }, [dispatch]);

  const unApprovedList = useSelector(
    (state) => state.userData.awaitApprovalOwnerList
  );

  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleSendOTP = async (id,deviceId) => {
    setDeviceId(deviceId);
    const otpData = {
      device_id: id,
    };
    const response = await handleSendOTPValidation(otpData);
    if (response.code === "200") {
      console.log(response);
      setShowOTP(true);
    } else {
      console.log(response.error);
    }
  };

  const handleSendOTPValidation = async (OtpData) => {
    try {
      const response = await TaggingService.tagSendOwnerOtp(OtpData);
      console.log("OTP Verified", response.data);
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

  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_id: deviceId,
    };
    const response = await handleOTPValidation(OTPData);
    if (response.code === "200") {
      console.log(response);
      setShowOTP(false);
      setOtp("");
      navigate("/tag/unapproved-vehicle");
    } else {
      console.log(response.error);
    }
  };
  const handleOTPValidation = async (otpData) => {
    try {
      const response = await TaggingService.tagVerifyOwnerOtp(otpData);
      console.log("OTP Verified", response.data);
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
  const actionColumn = [
    {
      name: "Action",
      label: "OTP",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <Button
              color="primary"
              size="small"
              type="submit"
              variant="contained"
              onClick={() => handleSendOTP(tableMeta.rowData[1],tableMeta.rowData[12])}
            >
              Send
            </Button>
          );
        },
      },
    },
  ];
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && !showOTP && (
          <DynamicDatatables
            tableTitle="Awaiting For Approval"
            rows={unApprovedList}
            columns={actionColumn.concat(awaitingOwnerApproval)}
          />
        )}
      </Grid>
      {showOTP && (
        <MainCard style={{marginLeft: "16px"}}>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
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
          </Grid>
        </MainCard>
      )}
    </Grid>
  );
};

export default UnApprovedTag;
