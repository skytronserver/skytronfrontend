import React from "react";
import * as Yup from "yup";
import { Grid, Button } from "@mui/material";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import CustomOTP from "../../ui-component/CustomOTP";
import { useState, useEffect } from "react";
import TaggingService from "../../services/TaggingService";
import HomePageService from "../../services/HomePage";
import {
  vahanVerificationInitials,
  vahanVerificationFields,
} from "../../formjson/uploadReceipt";
import { retriveAwaitingList } from "../../helper";
import { gridSpacing } from "../../store/constant";
import DisplayTable from "../../ui-component/DisplayTable";
const VahanVerification = () => {
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(
    vahanVerificationFields
  );
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [apiData, setApiData] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [getMap, setGetMap] = useState({ imei: "", regno: "" });
  const [otp,setOtp]=useState("");
  const [otpSent,setOTPSent]=useState(false);
  const [deviceId, setDeviceId] = useState({
    device_id: "",
  });
  const [deviceDetails, setDeviceDetails] = useState({
    device_esn: "",
    iccid: "",
    imei: "",
    telecom_provider1: "",
    telecom_provider2: "",
    msisdn1: "",
    msisdn2: "",
    esim_validity: "",
    esim_provider: "",
    model: "",
  });
  const [ownerDetails, setOwnerDetails] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicle_reg_no: "",
    engine_no: "",
    chassis_no: "",
    vehicle_make: "",
    vehicle_model: "",
    category: "",
  });
  useEffect(() => {
    (async () => {
      const owner_list = await retriveAwaitingList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        device_id: {
          ...prevConfig.device_id,
          options: owner_list,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );
  const retriveMapData = async () => {
    try {
      const retriveData = await HomePageService.getLiveTracking(getMap);
      setHtmlContent(retriveData.data);
      setMapLoaded(true);
    } catch (error) {
      console.log(error);
    }
  };
  const sendOTP = async (e, deviceId) => {
    try {
       await TaggingService.sendTagSendOwnerOtpFinal(
        deviceId
      );
      setOTPSent(true);
    } catch (error) {
      console.log(error);
    }
  };
  const confirmOTP = async (e, deviceId,otp) => {
    if(otp.length===6){
    try {
      await TaggingService.verifyTagVerifyOwnerOtpFinal(
        {device_id:deviceId.device_id,otp:otp}
      );
      setOTPSent(false);
      setMapLoaded(false);
      setOtp("");
      setApiData(false);
    } catch (error) {
      console.log(error);
    }
  }
  };
  const handleOtpChange = (otp) => {
    setOtp(otp)
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      const response = await TaggingService.vahanVerificationApi(values);

      setApiData(true);
      const device = response.data.data.device;
      const owner = response.data.data.vehicle_owner.users[0];
      const vehicle = response.data.data;
      setMapLoaded(false);
      setOTPSent(false);
      setDeviceId((prev) => ({
        ...prev,
        device_id: device.id,
      }));
      setGetMap((prev) => ({
        ...prev,
        imei: vehicle.vehicle_reg_no,
        regno: device.imei,
      }));
      setDeviceDetails((prev) => ({
        ...prev,
        device_esn: device.device_esn,
        iccid: device.iccid,
        imei: device.imei,
        telecom_provider1: device.telecom_provider1,
        telecom_provider2: device.telecom_provider2,
        msisdn1: device.msisdn1,
        msisdn2: device.msisdn2,
        esim_validity: device.esim_validity,
        esim_provider: device.esim_provider[0],
        model: device.model,
      }));
      setOwnerDetails((prev) => ({
        ...prev,
        name: owner.name,
        email: owner.email,
        mobile: owner.mobile,
      }));
      setVehicleDetails((prev) => ({
        ...prev,
        vehicle_reg_no: vehicle.vehicle_reg_no,
        engine_no: vehicle.engine_no,
        chassis_no: vehicle.chassis_no,
        vehicle_make: vehicle.vehicle_make,
        vehicle_model: vehicle.vehicle_model,
        category: vehicle.category,
      }));
      setLoading(false);
      resetForm(vahanVerificationInitials);
    } catch (error) {
      console.error("Error :", error.message);
    }
  };
  return (
    <MainCard title="Vahan Verification">
      {isFormLoaded && (
        <Grid container spacing={gridSpacing}>
          <Grid item sm={6}>
            <Formik
              initialValues={vahanVerificationInitials}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
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
                        />
                      </Grid>
                    ))}
                    <Grid item xs={6} style={{ marginTop: "20px" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        size="large"
                      >
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </Grid>
          <Grid item sm={6} style={{ marginTop: "5px" }}>
            {!mapLoaded && apiData && (
              <Button
                type="submit"
                variant="outlined"
                color="info"
                onClick={(e) => retriveMapData(e)}
                size="large"
              >
                Location
              </Button>
            )}
            {mapLoaded && !otpSent && (
              <Button
                type="submit"
                variant="outlined"
                color="info"
                onClick={(e) => sendOTP(e, deviceId)}
                size="large"
              >
                Send OTP
              </Button>
            )}
            {mapLoaded && otpSent && (
              <Grid container>
                <Grid item sm={9}>
                <CustomOTP length={6} onChange={handleOtpChange} />
                </Grid>
                <Grid item sm={3}><Button
                  type="submit"
                  variant="contained"
                  color="info"
                  onClick={(e) => confirmOTP(e, deviceId,otp)}
                  size="large"
                >
                  Confirm
                </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
      {apiData && (
        <Grid container spacing={gridSpacing}>
          <Grid item sm={6}>
            <DisplayTable values={ownerDetails} title="Owner Details" />
            <DisplayTable values={deviceDetails} title="Device Details" />
            <DisplayTable values={vehicleDetails} title="Vehicle Details" />
          </Grid>
          <Grid item sm={6}>
            {mapLoaded && (
              <section>
                <iframe
                  title="HTML Content"
                  srcDoc={htmlContent} // Set the HTML content as srcDoc
                  style={{
                    width: "100%",
                    height: "500px",
                    border: "1px solid #ccc",
                  }}
                />
              </section>
            )}
          </Grid>
        </Grid>
      )}
    </MainCard>
  );
};
export default VahanVerification;
