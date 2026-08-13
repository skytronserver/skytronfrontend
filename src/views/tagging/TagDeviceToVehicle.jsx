/* eslint-disable no-unused-vars */
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
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
  fetchDeviceListForOldVehicle,
  fetchVehicleCategory,
  fetchVehicleCategoryCode,
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
import { useLocation, useNavigate } from "react-router-dom";
import DeviceDataHealth from "../reports/DeviceDataHealth";
import ActivationCertificatePreview from "./ActivationCertificatePreview";

const steps = [
  { label: "tagDeviceForm.steps.otCommandConfiguration", name: "Step 1" },
  { label: "tagDeviceForm.steps.tagDevice", name: "Step 2" },
  { label: "M2M Data", name: "Step 3" },
  { label: "tagDeviceForm.steps.dealerVerification", name: "Step 4" },
  { label: "Device Data Health", name: "Step 5" },
  { label: "tagDeviceForm.steps.confirmLocation", name: "Step 6" },
  { label: "tagDeviceForm.steps.ownerOtpConfirmation", name: "Step 7" },
];

const rawOtCommands = [
  "1. IP 103.195.217.127",
  "2. Port: 8883",
  "3. Emergency fallback No: 7635975659",
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
  const navigate = useNavigate();
  const [updatedFormFields, setUpdatedFormField] = useState(taggingFields);
  const [deviceId, setDeviceId] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const [htmlContent, setHtmlContent] = useState({ data: [] });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [step9EnteredAt, setStep9EnteredAt] = useState(null);
  const pollingIntervalRef = useRef(null);
  const [reload, setReload] = useState(false);
  const [getMap, setGetMap] = useState({ imei: "", regno: "" });
  const [finalOwnerOtpSent, setFinalOwnerOtpSent] = useState(true);

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
  const [trailerType, setTrailerType] = useState("without_trailer");
  const [rfidNo, setRfidNo] = useState("");
  // Sub-phase: when with_trailer, RFID must be verified before showing the map
  const [rfidVerified, setRfidVerified] = useState(false);
  const [activationCommandSent, setActivationCommandSent] = useState(false);
  const [vahanForm, setVahanForm] = useState({ imei: "", regNo: "", ownerNo: "" });
  const [vahanFormError, setVahanFormError] = useState("");
  const [m2mData, setM2mData] = useState(null);
  const [m2mLoading, setM2mLoading] = useState(false);
  const [m2mError, setM2mError] = useState("");

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
        const deviceList = await fetchDeviceListForOldVehicle(); // default is "old" vehicle
        const categoryList = await fetchVehicleCategory();
        const categoryCodeList = await fetchVehicleCategoryCode();

        // Ensure lists are arrays before updating
        const safeDeviceList = Array.isArray(deviceList) ? deviceList : [];
        const safeCategoryList = Array.isArray(categoryList) ? categoryList : [];
        const safeCategoryCodeList = Array.isArray(categoryCodeList) ? categoryCodeList : [];

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
          category_code: {
            ...prevConfig.category_code,
            options: safeCategoryCodeList,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  useEffect(() => {
    const stepFromQuery = getStepFromQuery();
    if (stepFromQuery === null) return;
    setActiveStep(stepFromQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    if (activeStep === 2) {
      fetchM2MData();
    } else if (activeStep === 3) {
      if (deviceId) {
        handleResendOtp("dealer");
      }
      setResendTimer(180);
    } else if (activeStep === 6) {
      setResendTimer(180);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 5) {
      if (!mapStepEnteredAtRef.current) mapStepEnteredAtRef.current = new Date();
      setStep9EnteredAt(new Date());
      retriveMapData();
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);


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
      // finalOwner: do NOT call the API here — just advance to step 8
      if (type === 'finalOwner') {
        setFinalOwnerOtpSent(false); // show SMS instructions first
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        return;
      }
      setActiveStep(prevActiveStep => prevActiveStep + 1);
      setResendTimer(180);
      setDismissibleAlert(prev => ({ ...prev, isOpen: true, message: 'Vehicle Owner OTP has been sent successfully', type: 'success' }));
    } catch (error) {
      console.error("Error while submitting data", error.message);
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: "Something went wrong! Please try after sometimes or check your details",
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };

  // Called when user clicks "Check Activation Status" on step 8
  const checkActivationStatus = async () => {
    setLoading((prev) => ({ ...prev, loader: true }));
    const otpData = { device_id: deviceId };
    try {
      await TaggingService.sendTagSendOwnerOtpFinal(otpData);
      setFinalOwnerOtpSent(true);
      setResendTimer(180);
      setDismissibleAlert(prev => ({ ...prev, isOpen: true, message: 'Vehicle Owner OTP has been sent successfully', type: 'success' }));
    } catch (error) {
      console.error("Error checking activation status", error.message);
      setDismissibleAlert((prev) => ({
        ...prev,
        isOpen: true,
        message: "Activation not yet received. Please send the SMS and try again.",
        type: "error",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
  };
  const fetchM2MData = async () => {
    setM2mLoading(true);
    setM2mError("");
    try {
      // TODO: Replace with actual M2M API call when backend is ready
      // const response = await TaggingService.getM2MData({ device_id: deviceId });
      // setM2mData(response?.data);
      //
      // For now, show placeholder with device data we already have
      setM2mData(null); // will be populated from API
    } catch (error) {
      console.error("Error fetching M2M data:", error);
      setM2mError("Failed to fetch M2M data. Please retry.");
    } finally {
      setM2mLoading(false);
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
      setVahanForm({
        imei: device.imei || "",
        regNo: vehicle.vehicle_reg_no || "",
        ownerNo: owner.mobile || ""
      });
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
        // email and mobile intentionally excluded from Vahan display
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
    Object.keys(taggingFields).reduce((acc, field) => {
      acc[field] = taggingFields[field].validation;
      return acc;
    }, {})
  );

  const handleTagging = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading((prev) => ({ ...prev, loader: true }));
    try {
      const apiValues = { ...values };

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

  const handleSendActivationCommand = async () => {
    setLoading((prev) => ({ ...prev, loader: true }));
    try {
      // The API requires device_tag_id.
      // Assuming 'deviceId' is the tag ID or we need to pass it. 
      // If we don't have the tag ID, we can pass imei if the API supports it, or use deviceId state.
      const payload = { device_tag_id: deviceId }; 
      await TaggingService.sendActivationCommand(payload);
      setDismissibleAlert({
        isOpen: true,
        message: 'Activation command queued successfully.',
        type: 'success'
      });
      setActivationCommandSent(true);
      // Optionally redirect or reset
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to send activation command.';
      setDismissibleAlert({
        isOpen: true,
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setLoading((prev) => ({ ...prev, loader: false }));
    }
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
        <Grid item xs={12} style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ flexGrow: 1, overflowX: "auto" }}>
            <CustomStepper activeStep={activeStep} label={false} steps={steps.map(step => ({ ...step, label: t(step.label) }))} />
          </div>

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
                sx={{ minHeight: "350px", textAlign: "center", p: 4 }}
              >
                {/* Success Icon */}
                <Grid item xs={12} sx={{ mb: 2 }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4CAF50, #2e7d32)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.4)"
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Grid>

                {/* Title */}
                <Grid item xs={12} sx={{ mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                    Tagging Completed!
                  </Typography>
                </Grid>

                {/* Completion Line */}
                <Grid item xs={12} sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ color: "#555", fontSize: "0.95rem" }}>
                    Tagging for <strong>{ownerDetails?.vehicle_reg_no || getMap?.regno || "N/A"}</strong> with <strong>{ownerDetails?.IMEI || getMap?.imei || "N/A"}</strong> is completed.
                  </Typography>
                </Grid>



                {/* Action Buttons */}
                <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {!activationCommandSent ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          px: 3,
                          py: 1.2,
                          borderRadius: 2,
                          fontWeight: 600,
                          boxShadow: "0 4px 14px rgba(103, 58, 183, 0.4)",
                          textTransform: "none",
                          fontSize: "0.95rem"
                        }}
                        onClick={handleSendActivationCommand}
                      >
                        Send Activation Command
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={reset}
                        sx={{
                          px: 3,
                          py: 1.2,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "0.95rem"
                        }}
                      >
                        Skip
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={reset}
                      sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "0.95rem"
                      }}
                    >
                      Finish & New Tagging
                    </Button>
                  )}
                </Grid>
                
                {/* Render Certificate Preview Below Actions */}
                <Grid item xs={12} sx={{ width: '100%', mt: 4 }}>
                  <ActivationCertificatePreview deviceId={deviceId} />
                </Grid>
              </Grid>
            ) : (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 2 }} variant="h4">
                  {activeStep === 6 && trailerType === "with_trailer" && !rfidVerified
                    ? "RFID Verification"
                    : t(steps[activeStep].label)}
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
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Button
                      color="primary"
                      type="button"
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      {t("common.continue", "Continue")}
                    </Button>
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Skip
                    </Button>
                  </div>
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
                      {Object.keys(updatedFormFields).map((field) => (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={{
                              ...updatedFormFields[field],
                              label: t(updatedFormFields[field].label) || updatedFormFields[field].label,
                            }}
                            formik={formik}
                            onChange={(e) => {
                              let value = e.target.value;
                              formik.setFieldValue(field, value);
                            }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} className="grid-item-button-div" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start' }}>
                        <Button
                          color="secondary"
                          variant="outlined"
                          onClick={() => setActiveStep((prev) => prev + 1)}
                        >
                          Skip
                        </Button>
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
            {/* Step 3: M2M Data */}
            {activeStep === 2 && (() => {
              const m2mFields = [
                { label: "ICCID",               key: "iccid" },
                { label: "IMEI",                key: "imei" },
                { label: "M2M Number (MSISDN)", key: "msisdn" },
              ];

              return (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      SIM / M2M connectivity details fetched for this device.
                    </Typography>
                  </Grid>

                  {m2mLoading && (
                    <Grid item xs={12} sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={36} />
                      <Typography variant="body2" sx={{ mt: 1.5 }} color="textSecondary">
                        Fetching M2M data…
                      </Typography>
                    </Grid>
                  )}

                  {m2mError && !m2mLoading && (
                    <Grid item xs={12}>
                      <Typography color="error" sx={{ mb: 1 }}>{m2mError}</Typography>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={fetchM2MData}
                      >
                        Retry
                      </Button>
                    </Grid>
                  )}

                  {!m2mLoading && !m2mError && (
                    <>
                      {/* Info banner while backend is in progress */}
                      {!m2mData && (
                        <Grid item xs={12}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            backgroundColor: "#fff8e1",
                            border: "1px solid #ffe082",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            marginBottom: "8px",
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f59e0b"/>
                            </svg>
                            <Typography variant="body2" sx={{ color: "#92400e" }}>
                              M2M backend integration is in progress. Data fields are shown below and will be populated once the API is live.
                            </Typography>
                          </div>
                        </Grid>
                      )}

                      {/* M2M data fields */}
                      {m2mFields.map(({ label, key }) => (
                        <Grid key={key} item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={label}
                            value={m2mData?.[key] || "—"}
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiInputBase-input": {
                                color: m2mData?.[key] ? "inherit" : "#aaa",
                                fontStyle: m2mData?.[key] ? "normal" : "italic",
                              }
                            }}
                          />
                        </Grid>
                      ))}
                    </>
                  )}

                  <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Skip
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                      disabled={m2mLoading}
                    >
                      Confirm &amp; Next
                    </Button>
                  </Grid>
                </Grid>
              );
            })()}

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
                        <Button
                          color="secondary"
                          variant="outlined"
                          onClick={() => setActiveStep((prev) => prev + 1)}
                        >
                          Skip
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

            {/* Step 5: Device Data Health */}
            {activeStep === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DeviceDataHealth initialImei={ownerDetails?.IMEI || getMap?.imei || ""} isTagging={true} />
                </Grid>
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '16px' }}>
                  <Button
                    color="secondary"
                    variant="outlined"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                  >
                    Skip
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            )}

            {/* Step 6: Confirm Location / Map — with RFID sub-phase if with_trailer */}
            {activeStep === 5 && (
              <Grid container spacing={2}>
                {/* RFID Verification sub-phase — shown first when with_trailer and not yet verified */}
                {trailerType === "with_trailer" && !rfidVerified ? (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                        Please verify the RFID number on the trailer matches the one recorded during tagging before proceeding to live location.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} md={5}>
                      <div
                        style={{
                          border: '2px solid #1976d2',
                          borderRadius: '12px',
                          padding: '28px 32px',
                          textAlign: 'center',
                          backgroundColor: '#f0f6ff',
                        }}
                      >
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
                          Registered RFID No.
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            color: '#1976d2',
                            fontFamily: 'monospace',
                            mt: 1,
                          }}
                        >
                          {rfidNo || '—'}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        color="primary"
                        type="button"
                        variant="contained"
                        onClick={() => setRfidVerified(true)}
                      >
                        RFID Verified — Proceed to Live Location
                      </Button>
                    </Grid>
                  </>
                ) : (
                  /* Map phase — shown when without_trailer OR rfid has been verified */
                  <>
                    <Grid item xs={12}>
                      <Typography>Confirm the vehicle location on the map and request OTP for final verification.</Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          onClick={() => sendOwnerOtp("finalOwner")}
                          disabled={!htmlContent?.data || !Array.isArray(htmlContent.data) || htmlContent.data.length === 0}
                        >
                          {t("common.confirmLocation", "Confirm Location")}
                        </Button>
                        <Button
                          color="secondary"
                          variant="outlined"
                          onClick={() => setActiveStep((prev) => prev + 1)}
                        >
                          Skip
                        </Button>
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <MapComponent
                        gpsData={htmlContent?.data}
                        width="100%"
                        height="600px"
                        autoFit={true}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {/* Step 7: Final Owner OTP */}
            {activeStep === 6 && (
              <Grid container spacing={2}>
                {!finalOwnerOtpSent ? (
                  /* Phase 1 — show SMS activation instructions + Check Activation Status button */
                  <>
                    <Grid item xs={12}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Send the following activation message to the Primary MSISDN or Fallback MSISDN of the VLT device.
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Activation Message Request Format to the VLT Device (Through SMS):</strong>
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "monospace",
                          backgroundColor: "#f4f4f4",
                          p: 1.5,
                          borderRadius: 1,
                          display: "inline-block",
                          letterSpacing: "0.03em",
                          mb: 2,
                        }}
                      >
                        ACTV,348752,7635975659
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        The OTP will be send to the owner's phone number after the Activation Message Response for the IMEI{" "}
                        <strong>{ownerDetails?.IMEI || getMap?.imei || "—"}</strong>{" "}
                        is successfully received at <strong>7635975659</strong>.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', gap: '16px' }}>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={checkActivationStatus}
                        disabled={loading.loader}
                      >
                        Check Activation Status
                      </Button>
                      <Button
                        color="secondary"
                        variant="outlined"
                        onClick={() => setActiveStep((prev) => prev + 1)}
                      >
                        Skip
                      </Button>
                    </Grid>
                  </>
                ) : (
                  /* Phase 2 — API succeeded, show OTP entry */
                  <>
                    <Grid item xs={12}>
                      <Typography>
                        An OTP has been sent to vehicle owner mobile number. Please enter the OTP below to continue.
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
                            <Button
                              color="secondary"
                              variant="outlined"
                              onClick={() => setActiveStep((prev) => prev + 1)}
                            >
                              Skip
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
                  </>
                )}
              </Grid>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
export default TagDeviceToVehicle;
