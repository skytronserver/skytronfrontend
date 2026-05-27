import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Formik } from "formik";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gridSpacing } from "../../store/constant";
import TaggingService from "../../services/TaggingService";
import HomePageService from "../../services/HomePage";
import StockServices from "../../services/StockServices";
import * as Yup from "yup";
import axios from "axios";
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
import { useLocation } from "react-router-dom";

const steps = [
  { label: "tagDeviceForm.steps.otCommandConfiguration", name: "Step 1" },
  { label: "tagDeviceForm.steps.tagDevice", name: "Step 2" },
  { label: "tagDeviceForm.steps.readyForActivation", name: "Step 3" },
  { label: "tagDeviceForm.steps.dealerVerification", name: "Step 4" },
  { label: "tagDeviceForm.steps.sosButtonPress", name: "Step 5" },
  { label: "tagDeviceForm.steps.activateSosInApp", name: "Step 6" },
  { label: "tagDeviceForm.steps.confirmLocation", name: "Step 7" },
  { label: "tagDeviceForm.steps.ownerOtpConfirmation", name: "Step 8" },
];

const rawOtCommands = [
  "1. IP 103.195.217.127",
  "2. Port: 8883",
  "3. Emergency fallback No: 9435496378",
  "4: Registration No in case of already registered vehicle.",
  "5: In case of new un-registered vehicle, please set Reg number in devices in following format-",
  "",
  "ASXXTEMPYYY",
  "",
  "Where,",
  "",
  "AS= Static for all",
  "XX= DTO code, example: 01",
  "TEMP= Static for all",
  "YYY= Last 3 digits of the vehicle chassis number",
  "",
  "Example:",
  "",
  "AS25TEMPC1Z"
];

const formattedOtCommands = rawOtCommands;

function TagDeviceToVehicle() {
  const { t } = useTranslation();
  const location = useLocation();
  const [updatedFormFields, setUpdatedFormField] = useState(taggingFields);
  const [deviceId, setDeviceId] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [deviceSosAlertReceived, setDeviceSosAlertReceived] = useState(false);
  const [appSosAlertReceived, setAppSosAlertReceived] = useState(false);
  const [htmlContent, setHtmlContent] = useState({ data: [] });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [step9EnteredAt, setStep9EnteredAt] = useState(null);
  const pollingIntervalRef = useRef(null);
  const [reload, setReload] = useState(false);
  const [getMap, setGetMap] = useState({ imei: "", regno: "" });
  const deviceSosEnteredAtRef = useRef(null);
  const appSosEnteredAtRef = useRef(null);
  const mapStepEnteredAtRef = useRef(null);
  const [loading, setLoading] = useState({
    loader: false,
    form: false,
  });
  const [error, setError] = useState({
    normal: false,
    api: false,
  });
  const [dealerDistricts, setDealerDistricts] = useState([]);

  const getStepFromQuery = () => {
    try {
      const stepParam = new URLSearchParams(location.search).get("step");
      const stepNumber = stepParam === null ? null : Number(stepParam);
      if (!Number.isInteger(stepNumber)) return null;
      if (stepNumber < 0 || stepNumber > steps.length - 1) return null;
      return stepNumber;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const dealerDistricts = localStorage.getItem('dealerDistricts');
    if (dealerDistricts) {
      const districts = JSON.parse(dealerDistricts);
      const mappedDistricts = districts.map(district => ({
        label: district.district,
        value: district.id
      }));
      const mappedDistrictCode = districts.map(district => {
        const fullCode = district.district_code || "";
        const stateMatch = fullCode.match(/^[A-Za-z]+/);
        const numericPart = stateMatch ? fullCode.slice(stateMatch[0].length).trim() : fullCode;
        return {
          label: numericPart, // e.g. "01 02" shown in dropdown
          value: fullCode,    // e.g. "AS01 02" kept as actual value
        };
      });
      setDealerDistricts(mappedDistricts);

      // Update the form fields with the mapped districts
      setUpdatedFormField(prevConfig => ({
        ...prevConfig,
        district: {
          ...prevConfig.district,
          options: mappedDistricts,
          disabled: true
        },
        district_code: {
          ...prevConfig.district_code,
          options: mappedDistrictCode
        }
      }));
    }
  }, []);

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
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = async (type) => {
    setLoading((prev) => ({ ...prev, loader: true }));
    const otpData = {
      device_id: deviceId,
    };
    try {
      if (type === "dealer") {
        await TaggingService.tagResendDealerOtp(otpData);
      } else if (type === "owner") {
        await TaggingService.tagResendOwnerOtp(otpData);
      } else if (type === "finalOwner") {
        await TaggingService.tagResendOwnerOtpFinal(otpData);
      }
      setResendTimer(180);
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: "OTP has been sent successfully",
        type: "success",
      }));
    } catch (error) {
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message:
          "Something went wrong while resending OTP! Please try again later.",
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };


  const [ownerDetails, setOwnerDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    device_ESN: "",
    ICCID: "",
    ICCID2: "",
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

  const handleDistrictCodeChange = (event, formik) => {
    const value = event?.target?.value || "";
    const stateMatch = value.match(/^[A-Za-z]+/);
    const stateCode = stateMatch ? stateMatch[0] : "";
    formik.setFieldValue("state_code", stateCode);

    // Auto-fill district based on district_code
    const dealerDistrictsJson = localStorage.getItem('dealerDistricts');
    if (dealerDistrictsJson) {
      try {
        const districts = JSON.parse(dealerDistrictsJson);
        const districtObj = districts.find(d => (d.district_code === value));
        if (districtObj) {
          formik.setFieldValue("district", districtObj.id);
        }
      } catch (e) {
        console.error("Error parsing dealerDistricts from localStorage", e);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const deviceList = await fetchDeviceListForTagging();
        const categoryList = await fetchVehicleCategory();

        // Ensure deviceList and categoryList are arrays before updating
        const safeDeviceList = Array.isArray(deviceList) ? deviceList : [];
        const safeCategoryList = Array.isArray(categoryList) ? categoryList : [];

        setUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          device: {
            ...prevConfig.device,
            options: safeDeviceList,
          },
          category: {
            ...prevConfig.category,
            options: safeCategoryList,
          },
        }));
        setLoading((prev) => ({ ...prev, form: true }));
      } catch (error) {
        console.error("Error fetching form data:", error);
        setDismissibleAlert((prev) => ({
          ...prev,
          isOpen: true,
          message: "Error loading form data. Please try again.",
          type: "error",
        }));
      }
    })();
    const stepFromQuery = getStepFromQuery();
    setActiveStep(stepFromQuery ?? 0);
  }, [reload]);

  useEffect(() => {
    const stepFromQuery = getStepFromQuery();
    if (stepFromQuery === null) return;
    setActiveStep(stepFromQuery);
  }, [location.search]);

  useEffect(() => {
    if (activeStep === 2) {
      getVahanDetail();
    } else if (activeStep === 3) {
      if (deviceId) {
        handleResendOtp("dealer");
      }
      setResendTimer(180);
    } else if (activeStep === 7) {
      setResendTimer(180);
    }
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 4) {
      if (!deviceSosEnteredAtRef.current) deviceSosEnteredAtRef.current = new Date();
    } else if (activeStep === 5) {
      if (!appSosEnteredAtRef.current) appSosEnteredAtRef.current = new Date();
    } else if (activeStep === 6) {
      if (!mapStepEnteredAtRef.current) mapStepEnteredAtRef.current = new Date();
      setStep9EnteredAt(new Date());
      retriveMapData();
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 4 && activeStep !== 5) return;

    const enteredAt = (activeStep === 4 ? deviceSosEnteredAtRef.current : appSosEnteredAtRef.current) || new Date();
    const alreadyReceived = activeStep === 4 ? deviceSosAlertReceived : appSosAlertReceived;
    if (alreadyReceived) return;

    const baseUrl = (process.env.REACT_APP_BASE_URL || "").replace(/\/+$/, "");
    const emergencyLogUrl = baseUrl
      ? `${baseUrl}/api/gps-em-data-log-table/`
      : "/api/gps-em-data-log-table/";

    const poll = async () => {
      try {
        const registrationNo = ownerDetails?.vehicle_reg_no || getMap?.regno || "";
        const searchValue = (activeStep === 5 && registrationNo) ? `SOS_PUB_${registrationNo}` : (ownerDetails?.IMEI || getMap?.imei || "");

        const res = await axios.get(emergencyLogUrl, { params: { search: searchValue } });
        const dataString = res?.data?.data;
        if (!dataString) return;
        const parsed = JSON.parse(dataString);
        if (!Array.isArray(parsed) || parsed.length === 0) return;

        const latestItem = parsed[0];
        const fields = latestItem?.fields || latestItem;
        let ts = fields?.timestamp || fields?.entry_time || "";
        if (!ts) return;

        if (ts && !ts.endsWith("Z") && !ts.includes("+")) {
          ts = ts.replace(" ", "T") + "Z";
        }
        const logTime = new Date(ts).getTime();
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        // Strict "After Entry" logic: No buffer, must be >= the exact second you reached the step.
        const entryTime = enteredAt.getTime();
        const hasNew = logTime >= entryTime && logTime >= fiveMinutesAgo;

        if (hasNew) {
          if (activeStep === 4) setDeviceSosAlertReceived(true);
          else if (activeStep === 5) setAppSosAlertReceived(true);
        }
      } catch (error) {
        console.error("SOS Polling error:", error);
      }
    };

    poll();
    const intervalId = setInterval(poll, 5000);
    // Timeout polling after 5 minutes
    const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
    }, 5 * 60 * 1000);

    return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
    };
  }, [activeStep, deviceSosAlertReceived, appSosAlertReceived, ownerDetails?.IMEI, getMap?.imei, ownerDetails?.vehicle_reg_no, getMap?.regno]);

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
      const status = error.response?.status;
      let message = "Something went wrong! Please try after sometimes or check your details";
      if (status === 400 || status === 401 || status === 403) {
        message = t('common.wrongOtp') || "WRONG OTP";
      }
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: message,
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
      setResendTimer(180);
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
      const rawVahanData = response?.data?.vahan_data ?? response?.vahan_data;
      let vahanPayload = rawVahanData;
      if (rawVahanData && typeof rawVahanData === "string") {
        try {
          vahanPayload = JSON.parse(rawVahanData);
        } catch (e) {
          console.error("Failed to parse vahan_data string", e);
        }
      }
      const vahanData = vahanPayload?.VltdDetailsDobj || response?.data?.VltdDetailsDobj || response?.VltdDetailsDobj;
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
        ICCID2: device.iccid2,
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
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const poll = async () => {
      try {
        const response = await HomePageService.getGpsDataLog({ search: getMap.imei });
        let logs = [];
        const rawData = response?.data?.data;
        if (typeof rawData === "string") {
          try {
            logs = JSON.parse(rawData);
          } catch (e) {
            console.error("Failed to parse logs string:", e);
          }
        } else {
          logs = Array.isArray(response.data) ? response.data : response.data?.results || [];
        }

        console.log("GPS Logs retrieved for polling:", logs.length);
        setMapLoaded(true);

        if (logs.length > 0) {
          const latestLog = logs[0];
          const fields = latestLog?.fields || latestLog;
          const imei = getMap.imei || ownerDetails?.imei_no || "";

          let logTimeStr = fields?.timestamp || fields?.entry_time || fields?.created_at || "";
          if (logTimeStr && !logTimeStr.endsWith("Z") && !logTimeStr.includes("+")) {
            logTimeStr = logTimeStr.replace(" ", "T") + "Z";
          }
          const logTime = new Date(logTimeStr).getTime();
          const now = Date.now();
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          // Use the locked ref time - No buffer allowed per user request
          const enteredAtTime = mapStepEnteredAtRef.current.getTime();

          const freshEnough = logTime >= enteredAtTime && logTime >= fiveMinutesAgo;

          if (freshEnough) {
            const parseRawData = (raw) => {
              if (!raw || typeof raw !== "string") return { lat: 0, lon: 0 };
              const parts = raw.split(",");
              if (parts[1] === "PVT") {
                let lat = parseFloat(parts[12]);
                let lon = parseFloat(parts[14]);
                if (parts[13] === "S") lat = -lat;
                if (parts[15] === "W") lon = -lon;
                return { lat, lon };
              }
              return { lat: 0, lon: 0 };
            };

            const { lat: rawLat, lon: rawLon } = parseRawData(fields.raw_data);
            const latestPoint = {
              ...fields,
              latitude: Number(fields.latitude || fields.lat || fields.latitude_dec || rawLat || 0),
              longitude: Number(fields.longitude || fields.lon || fields.longitude_dec || rawLon || 0),
              category: fields.category || "bus",
              vehicle_registration_number: getMap.regno || getMap.imei,
              imei: imei
            };

            if (latestPoint.latitude !== 0 && latestPoint.longitude !== 0) {
              setHtmlContent({ data: [latestPoint] });
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 7000);
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
      const isNewVehicle = values?.vehicle_type === "new";
      const suffix = isNewVehicle ? (values?.owner_id || "") : (values?.vehicle_number || "");
      const vehicleRegNo = `${values.district_code || ""}${suffix}`;

      const apiValues = {
        ...values,
        temp_reg: isNewVehicle,
        vehicle_reg_no: vehicleRegNo,
      };
      delete apiValues.vehicle_type;
      delete apiValues.owner_id;
      delete apiValues.district_code;
      delete apiValues.vehicle_number;
      const response = await TaggingService.tagDeviceToVehicle(apiValues);
      resetForm(taggingInitials);
      const newDeviceId = response?.data?.data?.device;
      setDeviceId(newDeviceId);
      
      // Mark device as fitted after tagging
      if (newDeviceId) {
        try {
          await StockServices.sellFitDevice(newDeviceId);
        } catch (fitError) {
          console.error("Error marking device as fitted:", fitError);
        }
      }

      setActiveStep(prevActiveStep => prevActiveStep + 1);
      setResendTimer(180);
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
          <AlertTitle>{t("common.error")}</AlertTitle>
          {t("common.internalServerError")}
        </Alert>
      )}
      <Grid container spacing={gridSpacing}>
        {loading.loader && (
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}
        <Grid item xs={12} style={{ width: "100%" }}>
          <CustomStepper activeStep={activeStep} label={false} steps={steps.map(step => ({ ...step, label: t(step.label) }))} />
        </Grid>
        <Grid
          item
          xs={12}
          className={loading.loader ? "loading" : "not-loading"}
        >
          <MainCard>
            {activeStep === steps.length ? (
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: "350px", textAlign: "center", p: 2 }}
              >
                <Grid item xs={12}>
                  <Typography variant="h2" sx={{ fontWeight: "bold", color: "#000" }}>
                    Tagging for {ownerDetails?.vehicle_reg_no || getMap?.regno || "N/A"} with {ownerDetails?.IMEI || getMap?.imei || "N/A"} is completed.
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 2 }} variant="h4">
                  {t(steps[activeStep].label)}
                </Typography>
              </React.Fragment>
            )}

            {/* Step 1: Device Configuration (Original Step 7) */}
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={{ mb: 1 }}>
                    {t(
                      "tagDeviceForm.messages.executeOtCommands",
                      "Please set the following parameters in the device before proceeding"
                    )}
                  </Typography>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {formattedOtCommands.map((command, index) => {
                      const isBold = ["ASXXTEMPYYY", "Example:"].includes(command);
                      return (
                        <li key={index}>
                          <Typography
                            variant="body1"
                            sx={{
                              minHeight: command === "" ? "1em" : "auto",
                              fontWeight: isBold ? "bold" : "normal"
                            }}
                          >
                            {command}
                          </Typography>
                        </li>
                      );
                    })}
                  </ul>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography>
                    <Button
                      color="primary"
                      type="button"
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      {t("common.continue", "Continue")}
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
            {/* Step 2: Tagging Form (Original Step 1) */}
            {activeStep === 1 && loading.form && (
              <Formik
                initialValues={taggingInitials}
                validationSchema={validationTagging}
                onSubmit={handleTagging}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(updatedFormFields).map((field) => {
                        const isNewVehicle = formik?.values?.vehicle_type === "new";
                        if (field === "vehicle_reg_no") return null;
                        if (field === "state_code") return null;
                        if (field === "district_code") {
                          return (
                            <Grid key="vehicle_reg_group" item md={6} sm={12} xs={12}>
                              <Grid container spacing={1} alignItems="flex-end">
                                <Grid item xs={3}>
                                  <FormField
                                    fieldConfig={updatedFormFields["state_code"]}
                                    formik={formik}
                                  />
                                </Grid>
                                <Grid item xs={4}>
                                  <FormField
                                    fieldConfig={updatedFormFields["district_code"]}
                                    formik={formik}
                                    handleOptionChange={handleDistrictCodeChange}
                                  />
                                </Grid>
                                <Grid item xs={5}>
                                  {isNewVehicle ? (
                                    <FormField
                                      fieldConfig={{
                                        ...updatedFormFields["owner_id"],
                                        label: "Temporary ID (autofill)",
                                      }}
                                      formik={formik}
                                    />
                                  ) : (
                                    <FormField
                                      fieldConfig={updatedFormFields["vehicle_number"]}
                                      formik={formik}
                                      onChange={(e) => {
                                        let value = e.target.value.toUpperCase();
                                        formik.setFieldValue("vehicle_number", value);
                                      }}
                                    />
                                  )}
                                </Grid>
                              </Grid>
                            </Grid>
                          );
                        }
                        if (field === "vehicle_number") return null;
                        if (field === "owner_id") return null;

                        return (
                          <Grid key={field} item md={6} sm={12} xs={12}>
                            <FormField
                              fieldConfig={{
                                ...updatedFormFields[field],
                                label: field === "rcFile" && isNewVehicle ? "Upload vehicle purchase document" : t(updatedFormFields[field].label)
                              }}
                              formik={formik}
                              handleFileChange={handleFileChange}
                              onChange={
                                field === "chassis_no"
                                  ? (e) => {
                                      const value = e?.target?.value ?? "";
                                      if (formik?.values?.vehicle_type === "new") {
                                        const lastThree = value.length >= 3 ? value.slice(-3) : value;
                                        formik.setFieldValue("owner_id", `TMP${lastThree}`);
                                      }
                                    }
                                  : undefined
                              }
                              handleOptionChange={
                                field === "vehicle_type"
                                  ? (e) => {
                                      const value = e?.target?.value;
                                      formik.setFieldValue("vehicle_type", value);
                                      if (value === "new") {
                                        formik.setFieldValue("vehicle_number", "");
                                        const chassisValue = formik?.values?.chassis_no ?? "";
                                        const lastThree = chassisValue.length >= 3 ? chassisValue.slice(-3) : chassisValue;
                                        formik.setFieldValue("owner_id", `TMP${lastThree}`);
                                      } else {
                                        formik.setFieldValue("owner_id", "");
                                      }
                                    }
                                  : undefined
                              }
                            />
                          </Grid>
                        );
                      })}
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
            {/* Step 3: Ready for Activation / Vahan (Original Step 5) */}
            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {!vahanDetails.IMEI && !loading.loader && (
                    <Typography color="error">
                      Failed to fetch VAHAN data. Please ensure the device is correctly tagged or try again.
                    </Typography>
                  )}
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
                        title="Details as in Skytron VLTD Backend"
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

                <Grid item xs={12}>
                  <br />
                  <Typography align="right" sx={{ mt: 2 }}>
                    {loading.loader ? (
                      <CircularProgress size={24} />
                    ) : (
                      vahanDetails.IMEI && (
                        <Button
                          color="primary"
                          type="button"
                          variant="contained"
                          onClick={() => setActiveStep((prev) => prev + 1)}
                        >
                          Next
                        </Button>
                      )
                    )}
                    {!vahanDetails.IMEI && !loading.loader && (
                       <Button
                       color="secondary"
                       type="button"
                       variant="outlined"
                       onClick={getVahanDetail}
                       sx={{ ml: 1 }}
                     >
                       Retry Fetching Data
                     </Button>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            )}

            {/* Step 4: Dealer Verification (Original Step 2) */}
            {activeStep === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    {t("tagDeviceForm.messages.dealerOtpSent")}
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
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          onClick={() => handleOtpSubmit("dealer")}
                        >
                          {t("common.Confirm")}
                        </Button>
                      </Grid>
                      <Grid item>
                        {resendTimer > 0 ? (
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {t("auth.resendOtpIn", { seconds: resendTimer })}
                          </Typography>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => handleResendOtp("dealer")}
                            disabled={loading.loader}
                            sx={{ textTransform: "none", ml: 1 }}
                          >
                            {t("auth.resend")}
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Typography>
                </Grid>
              </Grid>
            )}

            {/* Step 5: SOS Button Press (Original Step 9) */}
            {activeStep === 4 && (
              <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                <Grid item xs={12} sx={{ mb: 4, mt: 4 }}>
                  <Typography variant="body1" align="center" color="textSecondary">
                    {deviceSosAlertReceived
                      ? t("tagDeviceForm.messages.sosAlertReceived")
                      : t("tagDeviceForm.messages.sosButtonInstruction")}
                  </Typography>
                </Grid>
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: deviceSosAlertReceived ? '#4caf50' : '#f44336',
                      boxShadow: deviceSosAlertReceived
                        ? '0 8px 16px rgba(76,175,80,0.3)'
                        : '0 8px 16px rgba(244,67,54,0.3)',
                      '&:hover': {
                        backgroundColor: deviceSosAlertReceived ? '#388e3c' : '#d32f2f',
                        boxShadow: deviceSosAlertReceived
                          ? '0 10px 20px rgba(76,175,80,0.4)'
                          : '0 10px 20px rgba(244,67,54,0.4)',
                      }
                    }}
                  >
                    SOS
                  </Button>
                </Grid>
                {deviceSosAlertReceived && (
                  <Grid item xs={12} sx={{ mt: 3 }} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      color="primary"
                      type="button"
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      {t("common.next", "Next")}
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Step 6: Activate SOS in App (Original Step 10) */}
            {activeStep === 5 && (
              <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
                <Grid item xs={12} sx={{ mb: 4, mt: 4 }}>
                  <Typography variant="body1" align="center" color="textSecondary">
                    {appSosAlertReceived
                      ? t("tagDeviceForm.messages.sosAlertReceived")
                      : t("tagDeviceForm.messages.sosActivateInstruction")}
                  </Typography>
                </Grid>
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: appSosAlertReceived ? '#4caf50' : '#f44336',
                      boxShadow: appSosAlertReceived
                        ? '0 8px 16px rgba(76,175,80,0.3)'
                        : '0 8px 16px rgba(244,67,54,0.3)',
                      '&:hover': {
                        backgroundColor: appSosAlertReceived ? '#388e3c' : '#d32f2f',
                        boxShadow: appSosAlertReceived
                          ? '0 10px 20px rgba(76,175,80,0.4)'
                          : '0 10px 20px rgba(244,67,54,0.4)',
                      }
                    }}
                  >
                    SOS
                  </Button>
                </Grid>
                {appSosAlertReceived && (
                  <Grid item xs={12} sx={{ mt: 3 }} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      color="primary"
                      type="button"
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      {t("common.next", "Next")}
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Step 7: Confirm Location / Map (Original Step 8) */}
            {activeStep === 6 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>Confirm the vehicle location on the map and request OTP for final verification.</Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography>
                    <Button
                      color="primary"
                      type="submit"
                      variant="contained"
                      onClick={() => sendOwnerOtp("finalOwner")}
                      disabled={!htmlContent?.data || !Array.isArray(htmlContent.data) || htmlContent.data.length === 0}
                    >
                      {t("common.confirmLocation", "Confirm Location")}
                    </Button>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <MapComponent
                    gpsData={htmlContent?.data}
                    width="100%"
                    height="600px"
                    autoFit={true}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 8: Final Owner OTP (Original Step 11) */}
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
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          onClick={() => handleOtpSubmit("finalOwner")}
                        >
                          Submit
                        </Button>
                      </Grid>
                      <Grid item>
                        {resendTimer > 0 ? (
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {t("auth.resendOtpIn", { seconds: resendTimer })}
                          </Typography>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => handleResendOtp("finalOwner")}
                            disabled={loading.loader}
                            sx={{ textTransform: "none", ml: 1 }}
                          >
                            {t("auth.resend")}
                          </Button>
                        )}
                      </Grid>
                    </Grid>
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
