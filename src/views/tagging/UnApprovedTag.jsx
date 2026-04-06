import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useNavigate } from "react-router-dom";
import { gridSpacing } from "../../store/constant";
import TaggingService from "../../services/TaggingService";
import { fetchTaggedAwaitingOwner } from "../../actions/commonDataActions";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { awaitingOwnerApproval } from "../../datatables/rowsColumn";
import MainCard from "../../ui-component/cards/MainCard";
import { openFile } from "../../helper";
import { useTranslation } from 'react-i18next';
const UnApprovedTag = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [apiError, setApiError] = useState(false);
  const [reload,setReload]=useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUnapprovedTag = async () => {
      try {
        const retriveData = await TaggingService.tagAwaitingOwnerApproval();
        dispatch(fetchTaggedAwaitingOwner(retriveData.data));
        setLoad(true);
      } catch (error) {
        setApiError(true);
      }
    };
    fetchUnapprovedTag();
  }, [dispatch,reload]);

  const unApprovedList = useSelector(
    (state) => state.userData.awaitApprovalOwnerList
  );

  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleSendOTP = async (id, deviceId) => {
    setDeviceId(deviceId);
    const otpData = {
      device_id: deviceId,
    };
    try {
      await TaggingService.tagSendOwnerOtp(otpData);
      console.log("OTP Verified");
      setShowOTP(true);
    } catch (error) {
      setApiError(true);
      console.error("Error while submitting data", error.message);
    }
  };

  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_id: deviceId,
    };
    try {
      await TaggingService.tagVerifyOwnerOtp(OTPData);
      console.log("OTP Verified");
      setShowOTP(false);
      setOtp("");
      setReload(prev=>!prev)
      navigate("/tag/unapproved-vehicle");
    } catch (error) {
      console.error("Error while submitting data", error.message);
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 403) {
        // Here we could use an alert state, but current code uses apiError
        // I will add a text-based error message if possible or just use the global one
        alert(t('common.wrongOtp') || "WRONG OTP");
      } else {
        setApiError(true);
      }
    }
  };

  const actionColumn = [
    {
      name: "Action",
      label: "OTP",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
          return (
            <Button
              color="primary"
              size="small"
              type="submit"
              variant="contained"
              onClick={() =>
                handleSendOTP(tableMeta.rowData[1], tableMeta.rowData[12])
              }
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
        {apiError && (
          <Alert severity="error" style={{ marginBottom: "16px" }}>
            <AlertTitle>Internal Server Error</AlertTitle>
            An error occurred in the server. Please contact the server
            administrator.
          </Alert>
        )}
        {load && !showOTP && (
          <DynamicDatatables
            tableTitle="Awaiting For Approval"
            rows={unApprovedList}
            columns={actionColumn.concat(awaitingOwnerApproval)}
          />
        )}
      </Grid>
      {showOTP && (
        <MainCard style={{ marginLeft: "16px" }}>
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
