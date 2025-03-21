import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import TaggingService from "../../services/TaggingService";
import HomePageService from "../../services/HomePage";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import {
  fetchDeviceListForTagging,
  fetchVehicleCategory,
} from "../../helper";
import {
  taggingFields,
  taggingInitials,
} from "../../formjson/tagDeviceToVehicle";
import { MuiOtpInput } from "mui-one-time-password-input";
import "../forms/form.css";
import CustomStepper from "../../ui-component/CustomStepper";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import DisplayTable from "../../ui-component/DisplayTable";
import MapComponent from "views/direct/LiveMap";
const steps = [
  { label: "Tag Device to Vehicle", name: "Step 1" },
  { label: "Dealer Verification", name: "Step 2" },
  { label: "Send Owner OTP", name: "Step 3" },
  { label: "Vehicle Owner Verification", name: "Step 4" },
  { label: "Ready for Activation", name: "Step 5" },
  { label: "Get Location", name: "Step 6" },
  { label: "Confirm Location", name: "Step 7" },
  { label: "Owner OTP Confirmation", name: "Step 8" },
];
function TagDeviceToVehicle() {
  const [updatedFormFields, setUpdatedFormField] = useState(taggingFields);
  const [deviceId, setDeviceId] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [htmlContent, setHtmlContent] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [reload, setReload] = useState(false);
  const [getMap, setGetMap] = useState({ imei: "", regno: "" });
  const [loading, setLoading] = useState({
    loader: false,
    form: false,
  });
  const [error, setError] = useState({
    normal: false,
    api: false,
  });

  const [otp, setOtp] = useState({
    dealer: "",
    owner: "",
    finalOwner: "",
  });
  const [dismissibleAlert, setDismissibleAlert] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });


  const [ownerDetails, setOwnerDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    device_ESN: "",
    ICCID: "",
    IMEI: "",
    vehicle_reg_no: "",
    vehicle_make: "",
    vehicle_model: "",
    engine_no: "",
    chassis_no: "",
    category: "",
    telecom_provider_1: "",
    telecom_provider_2: "",
    MSSISDN_1: "",
    MSSISDN_2: "",
    esim_validity: "",
    esim_provider: "",
    model: "",

  });

  const [vahanDetails, setVahanDetails] = useState({
    owner_name: "",
    email: "",
    mobile: "",
    device_serial_no: "",
    ICCID: "",
    IMEI: "",
    vehicle_reg_no: "",
    vehicle_make: "",
    vehicle_model: "",
    engine_no: "",
    chassis_no: "",
    vehicle_class: "",
    date_of_registration: "",
    device_activation_status: "",
    fitment_centre_name: "",
    GNSS_constellation_code: "",
    tac_no: "",
    tac_valid_upto: "",

  })

  useEffect(() => {
    (async () => {
      const deviceList = await fetchDeviceListForTagging();
      const categoryList = await fetchVehicleCategory();

      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,

        device: {
          ...prevConfig.device,
          options: deviceList,
        },
        category: {
          ...prevConfig.category,
          options: categoryList,
        },
      }));
      setLoading((prev) => ({ ...prev, form: true }));
    })();
    setActiveStep(4);
  }, [reload]);

  const handleDealerOtp = (otp) => {
    setOtp((prev) => ({ ...prev, dealer: otp }));
  };
  const handleOwnerOtp = (otp) => {
    setOtp((prev) => ({ ...prev, owner: otp }));
  };
  const handleFinalOwnerOtp = (otp) => {
    setOtp((prev) => ({ ...prev, finalOwner: otp }));
  };
  const handleOtpSubmit = async (type) => {
    setLoading((prev) => ({ ...prev, loader: true }));
    const OtpData = {
      otp: otp?.[type],
      device_id: deviceId,
    };
    try {
      if (type === 'dealer') { await TaggingService.tagVerifyDealerOtp(OtpData); }
      if (type === 'owner') { await TaggingService.tagVerifyOwnerOtp(OtpData); }
      if (type === 'finalOwner') { await TaggingService.verifyTagVerifyOwnerOtpFinal(OtpData); }
      setActiveStep(prevActiveStep => prevActiveStep + 1)
      setDismissibleAlert(prev => ({ ...prev, isOpen: true, message: 'OTP has been successfully verified', type: 'success' }));

    } catch (error) {
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message:
          "Something went wrong! Please try after sometimes or check your details",
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };
  const sendOwnerOtp = async (type) => {
    setLoading((prev) => ({ ...prev, loader: true }));
    const otpData = {
      device_id: deviceId,
    };
    try {
      if (type === 'owner') { await TaggingService.tagSendOwnerOtp(otpData); }
      if (type === 'finalOwner') { await TaggingService.sendTagSendOwnerOtpFinal(otpData); }
      setActiveStep(prevActiveStep => prevActiveStep + 1)
      setDismissibleAlert(prev => ({ ...prev, isOpen: true, message: 'Vehicle Owner OTP has been sent successfully', type: 'success' }));
    } catch (error) {
      console.error("Error while submitting data", error.message);
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message:
          "Something went wrong! Please try after sometimes or check your details",
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };
  const getVahanDetail = async () => {
    setLoading((prev) => ({ ...prev, loader: true }));
    const deviceData = {
      device_id: deviceId,
    };
    try {
      const response = await TaggingService.vahanVerificationApi(deviceData);
      const device = response?.data?.Skytrack_data?.device || response?.Skytrack_data?.device;
      const owner = response?.data?.Skytrack_data?.vehicle_owner.users[0] || response?.Skytrack_data?.vehicle_owner.users[0];
      const vehicle = response?.data?.Skytrack_data || response?.Skytrack_data;
      
      // Handle vahan_data based on its type
      const vahanData = typeof response?.data?.vahan_data === 'string' 
        ? JSON.parse(response.data.vahan_data)?.VltdDetailsDobj 
        : response?.data?.vahan_data?.VltdDetailsDobj;

      console.log("vahanData", vahanData);
      
      setGetMap((prev) => ({
        ...prev,
        regno: vehicle.vehicle_reg_no,
        imei: device.imei,
      }));
      setOwnerDetails((prev) => ({
        ...prev,
        name: owner.name,
        email: owner.email,
        mobile: owner.mobile,
        device_ESN: device.device_esn,
        ICCID: device.iccid,
        IMEI: device.imei,
        telecom_provider_1: device.telecom_provider1,
        telecom_provider_2: device.telecom_provider2,
        MSSISDN_1: device.msisdn1,
        MSSISDN_2: device.msisdn2,
        esim_validity: device.esim_validity,
        esim_provider: device.esim_provider[0],
        model: device.model,
        vehicle_reg_no: vehicle.vehicle_reg_no,
        engine_no: vehicle.engine_no,
        chassis_no: vehicle.chassis_no,
        vehicle_make: vehicle.vehicle_make,
        vehicle_model: vehicle.vehicle_model,
        category: vehicle.category,
      }));
      setVahanDetails((prev) => ({
        ...prev,
        chassis_no: vahanData?.chassisNo,
        date_of_registration: vahanData?.dateOfRegistration,
        device_activation_status: vahanData?.deviceActivationStatus,
        device_serial_no: vahanData?.deviceSerialno,
        engine_no: vahanData?.engineNo,
        fitment_centre_name: vahanData?.fitmentCentreName,
        GNSS_constellation_code: vahanData?.gnssConstellationCode,
        ICCID: vahanData?.iccId,
        IMEI: vahanData?.imeiNo,
        vehicle_make: vahanData?.makerName,
        vehicle_model: vahanData?.modelName,
        owner_name: vahanData?.ownerName,
        vehicle_reg_no: vahanData?.regnNo,
        tac_no: vahanData?.tacNo,
        tac_valid_upto: vahanData?.tacValidUpto,
        vehicle_class: vahanData?.vehClass,
      }));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setDismissibleAlert(prev => ({ ...prev, isOpen: true, message: 'Vahan Details are successfully fetched', type: 'success' }));

    } catch (error) {
      console.error("Error :", error?.message);
      let errorString = "Something went wrong! Please try after sometimes or check your details";
      if (error?.response) {
        const errorObject = error?.response?.data || '';
        errorString = errorObject !== '' && Object.values(errorObject).flat().join(" ");
      }
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: errorString,
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };
  const retriveMapData = async () => {
    setLoading((prev) => ({ ...prev, loader: true }));
    try {
      const retriveData = await HomePageService.getLiveTracking_data(getMap);
      console.log("Retrieved Map Data:", retriveData.data);
      setHtmlContent(retriveData.data);
      setMapLoaded(true);

      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: "Map Details is fetched successfully",
        type: "success",
      }));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.log("Error retrieving map data:", error);
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message:
          "Something went wrong! Please try after sometimes or check your details",
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };
  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const validationTagging = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleTagging = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading((prev) => ({ ...prev, loader: true }));
    try {
      const response = await TaggingService.tagDeviceToVehicle(values);
      resetForm(taggingInitials);
      setDeviceId(response?.data?.data?.device);
      setActiveStep(prevActiveStep => prevActiveStep + 1);
      setDismissibleAlert(prev => ({ ...prev, isOpen: true, message: 'Successfully OTP has been sent to your registered mobile number', type: 'success' }));
    } catch (error) {
      console.log(error);
      const errorData = error?.response?.data?.detail || error?.response?.data?.error
      const message = errorData ? "Error Details " + errorData : 'Something went wrong! Please try after sometimes or check your details';
      if (error?.message === "Network Error") {
        setError((prev) => ({ ...prev, api: true }));
      } else {

        setError((prev) => ({ ...prev, normal: true }));
      }
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: message,
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
      setSubmitting(false);
    }
  };
  const handleDismissibleAlert = () => {
    setDismissibleAlert((prev) => ({ ...prev, isOpen: false, message: "" }));
  };
  const reset = () => {
    setReload((prev) => !prev);
  };

  return (
    <>
      <AutoHideAlert
        open={dismissibleAlert.isOpen}
        onClose={handleDismissibleAlert}
        message={dismissibleAlert.message}
        type={dismissibleAlert.type}
      />
      {error.api && (
        <Alert severity="error" style={{ marginBottom: "16px" }}>
          <AlertTitle>Internal Server Error</AlertTitle>
          An error occurred in the server. Please contact the server
          administrator.
        </Alert>
      )}
      <Grid container spacing={gridSpacing}>
        {loading.loader && (
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}
        <Grid item xs={12} style={{ width: "100%" }}>
          <CustomStepper activeStep={activeStep} label={false} steps={steps} />
        </Grid>
        <Grid
          item
          xs={12}
          className={loading.loader ? "loading" : "not-loading"}
        >
          <MainCard>
            {activeStep === 8 ? (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>
                  All steps completed - you're finished with Tagging device to
                  the vehicle receipt in the Download Receipt Tab!
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={reset}
                >
                  Finish
                </Button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 2 }} variant="h4">
                  {steps[activeStep].label}
                </Typography>
              </React.Fragment>
            )}

            {activeStep === 0 && loading.form && (
              <Formik
                initialValues={taggingInitials}
                validationSchema={validationTagging}
                onSubmit={handleTagging}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(updatedFormFields).map((field) => (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={updatedFormFields[field]}
                            formik={formik}
                            handleFileChange={handleFileChange}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} className="grid-item-button-div">
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading.loader}
                        >
                          Next
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            )}
            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    An OTP has been sent to your registered mobile number.
                    Please enter the OTP below to continue.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <MuiOtpInput
                    value={otp.dealer}
                    onChange={handleDealerOtp}
                    length={6}
                  />
                  <br />
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={() => handleOtpSubmit("dealer")}
                    >
                      Confirm
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>Request OTP for Owner Verification</Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={() => sendOwnerOtp("owner")}
                    >
                      Request
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
            {activeStep === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    An OTP has been sent to vehicle owner mobile number. Please
                    enter the OTP below to continue.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <MuiOtpInput
                    value={otp.owner}
                    onChange={handleOwnerOtp}
                    length={6}
                  />
                  <br />
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={() => handleOtpSubmit("owner")}
                    >
                      Confirm
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
            {activeStep === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>Click below to get details from Vahan</Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <br />
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={getVahanDetail}
                    >
                      Get Details
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
            {activeStep === 5 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    Click below to get location of Vehicle
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <br />
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={retriveMapData}
                    >
                      Get Location
                    </Button>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid
                      item
                      xs={6}
                      sx={{
                        borderRadius: '8px 0 0 8px',
                        border: '1px solid #f0f0f0',
                        backgroundColor: 'white'
                      }}
                    >
                      <DisplayTable
                        values={ownerDetails}
                        title="Details as in Skytron"
                      />
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sx={{
                        borderRadius: '0 8px 8px 0',
                        border: '1px solid #f0f0f0',
                        backgroundColor: 'white'
                      }}
                    >
                      <DisplayTable
                        values={vahanDetails}
                        title="Details as in Vahan"
                      />
                    </Grid>
                  </Grid>

                </Grid>
              </Grid>
            )}
            {activeStep === 6 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>Request OTP for Owner Verification</Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={() => sendOwnerOtp("finalOwner")}
                    >
                      Request
                    </Button>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {mapLoaded && (
                      <MapComponent
                        gpsData={htmlContent?.data}
                        width="100%"
                        height="600px"
                      />
                  )}
                </Grid>
              </Grid>
            )}
            {activeStep === 7 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    An OTP has been sent to vehicle owner mobile number. Please
                    enter the OTP below to continue.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <MuiOtpInput
                    value={otp.finalOwner}
                    onChange={handleFinalOwnerOtp}
                    length={6}
                  />
                  <br />
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={() => handleOtpSubmit("finalOwner")}
                    >
                      Submit
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
export default TagDeviceToVehicle;
