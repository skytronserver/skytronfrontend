import { useEffect, useState, useMemo, useCallback } from "react";
import React from "react";
import { Grid, Card, CardContent, Typography, Box, Fab, Tabs, Tab, Button, Paper, Divider, TextField, MenuItem, IconButton, Tooltip as MuiTooltip, Chip } from "@mui/material";
import { Add as AddIcon, BarChart as ChartIcon, DeleteOutline as DeleteIcon, Visibility, VisibilityOff, ContentCopy, KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import Widget from "./Widget";
import UserServices from "../../../services/UserServices";
import { lazy } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Car from "../../../assets/images/Car.svg";
import Bell from "../../../assets/images/Bell.svg";
import Overspeed from "../../../assets/images/Overspeed.svg";
import User from "../../../assets/images/User.svg";
import Fitment from "../../../assets/images/Fitment.svg";
import Suddenturn from "../../../assets/images/Suddenturn.svg";
import Brake from "../../../assets/images/Brake.svg";
import state from "../../../assets/images/state.svg";
import Stock from "../../../assets/images/Stock.svg";
import Sim from "../../../assets/images/Sim.svg";
import Alert from "../../../assets/images/Alert.svg";
import Vehicle from "../../../assets/images/Vehicle.svg";
import Driver from "../../../assets/images/Driver.svg";
import Activation from "../../../assets/images/Activation.svg";
import Model from "../../../assets/images/Model.svg";
import IncomingC from "../../../assets/images/incomingC.svg";
import Rejection from "../../../assets/images/rejection.svg";
import FakeCall from "../../../assets/images/fakeCall.svg";
import OnCall from "../../../assets/images/onCall.svg";
import UserImage from "../../../assets/images/userImage.svg";
import DoneAssignment from "../../../assets/images/doneAssignment.svg";
import RejectedAssignment from "../../../assets/images/rejectedAssignment.svg";
import Assignment from "../../../assets/images/assignmentCall.svg";
import FalseAssignment from "../../../assets/images/falseAssignment.svg";
import { decipherEncryption } from "../../../helper";
import { dashboardInitialState } from "./dashboardInitialState";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
//const SOSDashboard = lazy(() => import("../../direct/SOSDashboard"))
const SOSDashboard = lazy(() => import("../../direct/SOSPoliceDashboard"))

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const flattenNumericPaths = (source, prefix = "") => {
  if (!source || typeof source !== "object") {
    return {};
  }

  return Object.entries(source).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenNumericPaths(value, path));
    } else if (typeof value === "number" && Number.isFinite(value)) {
      acc[path] = Number(value);
    }

    return acc;
  }, {});
};

const getNestedValue = (path, source) =>
  path
    .split(".")
    .reduce((accumulator, segment) => (accumulator && accumulator[segment] !== undefined ? accumulator[segment] : undefined), source);
const ActiveState = () => {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(dashboardInitialState.userInfo);
  const [fitmentInfo, setFitmentInfo] = useState(dashboardInitialState.fitmentInfo);
  const [dealerFitmentInfo, setDealerFitmentInfo] = useState(dashboardInitialState.dealerFitmentInfo);
  const [dealerDeviceInfo, setDealerDeviceInfo] = useState(dashboardInitialState.dealerDeviceInfo);
  const [dealerVehicleOwnerInfo, setDealerVehicleOwnerInfo] = useState(dashboardInitialState.dealerVehicleOwnerInfo);
  const [dealerESIMInfo, setDealerESIMInfo] = useState(dashboardInitialState.dealerESIMInfo);
  const [eSIMInfo, setESIMInfo] = useState(dashboardInitialState.eSIMInfo);
  const [eSIMActivationInfo, setESIMActivationInfo] = useState(dashboardInitialState.eSIMActivationInfo);
  const [deviceStatusInfo, setDeviceStatusInfo] = useState(dashboardInitialState.deviceStatusInfo);
  const [deviceHealthInfo, setDeviceHealthInfo] = useState(dashboardInitialState.deviceHealthInfo);
  const [overSpeedInfo, setOverSpeedInfo] = useState(dashboardInitialState.alertInfo);
  const [emergencyInfo, setEmergencyInfo] = useState(dashboardInitialState.alertInfo);
  const [totalAlertInfo, setTotalAlertInfo] = useState(dashboardInitialState.alertInfo);
  const [harshBreakInfo, setHarshBreakInfo] = useState(dashboardInitialState.alertInfo);
  const [suddenBreakInfo, setSuddenBreakInfo] = useState(dashboardInitialState.alertInfo);
  const [temperAlertInfo, setTemperAlertInfo] = useState(dashboardInitialState.temperAlertInfo);
  const [miscInfo, setMiscInfo] = useState(dashboardInitialState.miscInfo);
  const [modelInfo, setModelInfo] = useState(dashboardInitialState.modelInfo);
  const [ownerDashboardInfo, setOwnerDashboardInfo] = useState(dashboardInitialState.userDashboardInfo);
  const [manufacturerDashboardInfo, setManufacturerDashboardInfo] = useState({
    Total_Model: 0,
    Total_esim_linked: 0,
    Total_Dealer: 0,
    Total_Inactive_Dealer: 0,
    Total_Vehicle_Owner: 0,
    Total_Expired_Vehicle_Owner: 0,
    Total_Stock_Created: 0,
    Total_Stock_Allocated: 0,
    Total_Activation: 0,
    Total_Return: 0,
    Total_Faulty: 0,
    Total_esim_activation_request: 0,
    ESim_Activated: 0,
    Total_1year_renewal_request: 0,
    Total_2year_renewal_request: 0,
    Total_Online_Device: 0,
    Total_Offline_Device_today: 0,
    Total_Offline_Device_7day: 0,
    Total_Offline_Device_30day: 0,
    Total_expired_device: 0
  });
  const [fitmentInfoForAdmin, setFitmentInfoForAdmin] = useState(dashboardInitialState.adminFitmentInfo)
  const [userInfoForAdmin, setUserInfoForAdmin] = useState(dashboardInitialState.userInfoForAdmin)
  const [stateInfo, setStateInfo] = useState(dashboardInitialState.stateInfo);
  const [districtInfo, setDistrictInfo] = useState(dashboardInitialState.districtInfo);
  const [stockInfo, setStockInfo] = useState(dashboardInitialState.stockInfo);
  const [activeUsersInfo, setActiveUsersInfo] = useState(dashboardInitialState.activeUsersInfo);
  const [dtoDashboardInfo, setDtoDashboardInfo] = useState(dashboardInitialState.dtoDashboardInfo)
  const [team, setTeam] = useState(dashboardInitialState.team)
  const [sosUsers, setSosUsers] = useState(dashboardInitialState.sosUsers)
  const [teamForLead, setTeamForLead] = useState(dashboardInitialState.teamForLead)
  const [incomingCall, setIncomingCall] = useState(dashboardInitialState.incomingCall)
  const [fakeCall, setFakeCall] = useState(dashboardInitialState.fakeCall)
  const [callRejection, setCallRejection] = useState(dashboardInitialState.callRejection)
  const [calls, setCalls] = useState(dashboardInitialState.calls)
  const [assignment, setAssignment] = useState(dashboardInitialState.assignment);
  const [closedAssignment, setClosedAssignment] = useState(dashboardInitialState.closedAssignment);
  const [falseAssignment, setFalseAssignment] = useState(dashboardInitialState.falseAssignment);
  const [rejectedAssignment, setRejectedAssignment] = useState(dashboardInitialState.rejectedAssignment);
  const [avgAcceptance, setAvgAcceptance] = useState("");
  const [vehicleAlertStats, setVehicleAlertStats] = useState(dashboardInitialState.vehicleAlertStatistics);
  const [reportBuilderState, setReportBuilderState] = useState(dashboardInitialState.reportBuilder);
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");
  const [providerInfo, setProviderInfo] = useState({ company: '', state: '', status: '', createdDate: '', expiryDate: '' });

  // Chart-related state
  const [activeTab, setActiveTab] = useState(0);
  const [sosAdminStartDate, setSosAdminStartDate] = useState("");
  const [sosAdminEndDate, setSosAdminEndDate] = useState("");

  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData") || localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  const isSuperAdmin = userRoles === 'superadmin';

  const fetchSOSData = useCallback(async (startDate = "", endDate = "") => {
    try {
      if (userRoles === 'sosadmin') {
        const response = await UserServices.getSOSAdminDashboard(startDate, endDate);
        const data = await response.data;
        setTeam((prev) => ({
          ...prev,
          Total_Teams: data.SOS_Team_Leads,
          Total_DeskExecutives: data.SOS_Desk_Executives,
          Live_Teams: data.SOS_Online_Team_Leads,
          Live_DeskExecutives: data.SOS_Online_Desk_Executives,
        }));
        setIncomingCall((prev) => ({
          ...prev,
          Total_Incoming_Calls: data.Total_Incoming_Calls,
          Total_Incoming_Calls_thismonth: data.Total_Incoming_Calls_thismonth,
          Total_Incoming_Calls_thisweek: data.Total_Incoming_Calls_thisweek,
          Total_Incoming_Calls_today: data.Total_Incoming_Calls_today,
        }));
        setCalls((prev) => ({
          ...prev,
          Total_Active_Calls: data.Total_Active_Calls,
          Total_Closed_Calls: data.Total_Closed_Calls,
          Total_Pending_Calls: data.Total_Pending_Calls,
          Average_time_to_Accept: data.Average_time_to_Accept,
        }));
        setFakeCall((prev) => ({
          ...prev,
          Total_Fake_Calls: data.Total_Fake_Calls,
          Total_Fake_Calls_thismonth: data.Total_Fake_Calls_thismonth,
          Total_Fake_Calls_thisweek: data.Total_Fake_Calls_thisweek,
          Total_Fake_Calls_today: data.Total_Fake_Calls_today,
        }));
        setCallRejection((prev) => ({
          ...prev,
          Total_Rejected_Assignemnt: data.Total_Rejected_Assignemnt,
          Total_Rejected_Assignemnt_thismonth: data.Total_Rejected_Assignemnt_thismonth,
          Total_Rejected_Assignemnt_thisweek: data.Total_Rejected_Assignemnt_thisweek,
          Total_Rejected_Assignemnt_today: data.Total_Rejected_Assignemnt_today,
        }));
        setSosUsers((prev) => ({
          ...prev,
          teamLeader: data.SOS_Team_Leads || 0,
          onlineTeamLeader: data.SOS_Online_Team_Leads || 0,
          deskExecutive: data.SOS_Desk_Executives || 0,
          onlineDeskExecutive: data.SOS_Online_Desk_Executives || 0,
          police: data.SOS_Police_Executives || 0,
          onlinePolice: data.SOS_Online_Police_Executives || 0,
          ambulance: data.SOS_Ambulance_Executives || 0,
          onlineAmbulance: data.SOS_Online_Ambulance_Executives || 0,
        }));

        const vehicleAlertResponse = await UserServices.getVehicleAlertStatistics();
        const vehicleAlertData = await vehicleAlertResponse.data;

        setVehicleAlertStats({
          ...vehicleAlertData,
          broadcasts: {
            ...vehicleAlertData.broadcasts,
            total: data.Broadcast_Total || 0,
            total_closed: data.Broadcast_Total_Closed || 0,
            broadcast_today: data.Broadcast_Total_Today || 0,
            closed_today: data.Broadcast_Total_Closed_Today || 0,
            pending_today: data.Broadcast_Currently_Pending || 0,
          }
        });
      }

      if (userRoles === 'teamlead') {
        const response = await UserServices.getSOSLeadDashboard(startDate, endDate);
        const data = await response.data;
        setTeamForLead((prev) => ({
          ...prev,
          Total_DeskExecutives: data.Total_DeskExecutives,
          Live_DeskExecutives: data.Live_DeskExecutives,
        }));
        setIncomingCall((prev) => ({
          ...prev,
          Total_Incoming_Calls: data.Total_Incoming_Calls,
          Total_Incoming_Calls_thismonth: data.Total_Incoming_Calls_thismonth,
          Total_Incoming_Calls_thisweek: data.Total_Incoming_Calls_thisweek,
          Total_Incoming_Calls_today: data.Total_Incoming_Calls_today,
        }));
        setCalls((prev) => ({
          ...prev,
          Total_Active_Calls: data.Total_Active_Calls,
          Total_Closed_Calls: data.Total_Closed_Calls,
          Total_Pending_Calls: data.Total_Pending_Calls,
          Average_time_to_Accept: data.Average_time_to_Accept,
        }));
        setFakeCall((prev) => ({
          ...prev,
          Total_Fake_Calls: data.Total_Fake_Calls,
          Total_Fake_Calls_thismonth: data.Total_Fake_Calls_thismonth,
          Total_Fake_Calls_thisweek: data.Total_Fake_Calls_thisweek,
          Total_Fake_Calls_today: data.Total_Fake_Calls_today,
        }));
        setCallRejection((prev) => ({
          ...prev,
          Total_Rejected_Assignemnt: data.Total_Rejected_Assignemnt,
          Total_Rejected_Assignemnt_thismonth: data.Total_Rejected_Assignemnt_thismonth,
          Total_Rejected_Assignemnt_thisweek: data.Total_Rejected_Assignemnt_thisweek,
          Total_Rejected_Assignemnt_today: data.Total_Rejected_Assignemnt_today,
        }));
      }
    } catch (error) {
      console.error('Error fetching SOS dashboard data:', error);
    }
  }, [userRoles]);
  useEffect(() => {
    //for owner
    if (userRoles == 'dtorto') {
      (async () => {
        const response = await UserServices.getDTODashboardData();
        const data = await response.data;
        setDtoDashboardInfo((prev) => ({
          ...prev,
          activated: data.Total_Device_Activated,
          vehicles: data.Total_Vehicles,
          onlineDevice: data.Total_Online_Device,
          offlineDevice: data.Total_Offline_Device_today,
          sevenDaysOffline: data.Total_Offline_Device_7day,
          thirtyDaysOffline: data.Total_Offline_Device_30day,
          alert: data.Total_Alert,
          monthlyAlert: data.Alert_month,
          dailyAlert: data.Alert_today,
          activations: data.Total_activations,
          monthlyActivations: data.Activations_month,
          dailyActivations: data.Activations_today,
          sosCalls: data.Total_SOS_calls,
          genuineCalls: data.Genuine_calls,
          fakeCalls: data.Fake_calls
        }));
      })();
    }
    if (userRoles == 'owner') {
      (async () => {
        const response = await UserServices.getOwnerDashboard();
        const data = await response.data;
        setOwnerDashboardInfo((prev) => ({
          ...prev,
          deviceActivated: data.Total_Device_Activated,
          vehicles: data.Total_Vehicles,
          movingVehicles: data.Total_Moving_Vehicles,
          stoppedVehicles: data.Total_Stopped_Vehicles,
          idleVehicles: data.Total_Idle_Vehicles,
          onlineDevice: data.Total_Online_Device,
          offlineDevice: data.Total_Offline_Device_today,
          sevenDaysOffline: data.Total_Offline_Device_7day,
          thirtyDaysOffline: data.Total_Offline_Device_30day,
          travelDistanceKm: data.Total_Travel_Distance_km,
          alert: data.Total_Alert,
          monthlyAlert: data.Alert_month,
          dailyAlert: data.Alert_today,
          harshBreaking: data.Total_Harshbraking,
          suddenTurn: data.Total_suddenturn,
          overSpeeding: data.Total_overspeeding,
          sosCalls: data.Total_SOS_calls,
          genuineCalls: data.Genuine_calls,
          fakeCalls: data.Fake_calls,
        }));
      })();
    }

    ////////////////////////////////////////////
    if (userRoles == 'esimprovider') {
      (async () => {
        const response = await UserServices.getESIMProviderDashboard();
        const data = await response.data.data;
        setESIMInfo(prev => ({
          ...prev,
          totalDevicesWithESim: data.Total_Devices_With_ESim || 0,
          validated: data.ESim_Validated || 0,
          expired: data.ESim_Expired || 0,
          active: data.ESim_Active || 0,
          pending: data.ESim_Pending || 0,
          invalid: data.ESim_Invalid || 0,
          manufactures: data.Manufacturers_With_This_ESimProvider || 0,
          activationReceived: data.ESim_Activation_Request_Received || 0,
          activated: data.ESim_Activated || 0,
          oneYearActivation: data.ESim_1_Year_Expiry || 0,
          twoYearsActivation: data.ESim_2_Year_Expiry || 0,
          expiredEsim: data.ESim_Already_Expired || 0,
        }));
        setESIMActivationInfo(prev => ({
          ...prev,
          activationRequestSent: data.ESim_Activation_Req_Sent || 0,
          activationConfirmed: data.ESim_Activation_Confirmed || 0,
          activationRejected: data.ESim_Activation_Rejected || 0,
          expiringSoon: data.ESim_Expiring_Soon_30_Days || 0,
          todayRequests: data.Today_Activation_Requests || 0,
          weeklyRequests: data.This_Week_Activation_Requests || 0,
          monthlyRequests: data.This_Month_Activation_Requests || 0,
        }));
        setProviderInfo({
          company: data.Provider_Company_Name || '',
          state: data.Provider_State || '',
          status: data.Provider_Status || '',
          createdDate: data.Provider_Created_Date || '',
          expiryDate: data.Provider_Expiry_Date || '',
        });
      })();
    }
    //for manufacturer
    if (userRoles == 'devicemanufacture') {
      (async () => {
        const response = await UserServices.getManufacturerDashboard();
        const data = await response.data;
        setManufacturerDashboardInfo({
          Total_Model: data.Total_Model || 0,
          Total_esim_linked: data.ESim_Attached_M2M_Service_Provider || data.Total_esim_linked || 0,
          Total_Dealer: data.User_Total_Dealer || data.Total_Dealer || 0,
          Total_Inactive_Dealer: data.User_Inactive_Dealer || data.Total_Inactive_Dealer || 0,
          Total_Vehicle_Owner: data.User_Total_Unique_Vehicle_Owners || data.Total_Vehicle_Owner || 0,
          Total_Expired_Vehicle_Owner: data.User_Expired_Vehicle_Owners || data.Total_Expired_Vehicle_Owner || 0,
          Total_Stock_Created: data.Device_Total_Stock || data.Total_Stock_Created || 0,
          Total_Stock_Allocated: data.Device_Assigned_To_Dealer || data.Total_Stock_Allocated || 0,
          Total_Activation: data.Device_Tagged || data.Total_Activation || 0,
          Total_Return: data.Total_Return || 0,
          Total_Faulty: data.Total_Faulty || 0,
          Total_esim_activation_request: data.ESim_Activation_Request_Sent || data.Total_esim_activation_request || 0,
          ESim_Activated: data.ESim_Activated || 0,
          Total_1year_renewal_request: data.ESim_1_Year_Expiry || data.Total_1year_renewal_request || 0,
          Total_2year_renewal_request: data.ESim_2_Year_Expiry || data.Total_2year_renewal_request || 0,
          Total_Online_Device: data.Device_Online_Today || data.Total_Online_Device || 0,
          Total_Offline_Device_today: data.Total_Offline_Device_today || 0,
          Total_Offline_Device_7day: data.Device_Offline_Since_7_Days || data.Total_Offline_Device_7day || 0,
          Total_Offline_Device_30day: data.Device_Offline_Since_30_Days || data.Total_Offline_Device_30day || 0,
          Total_expired_device: data.ESim_Already_Expired || data.Total_expired_device || 0
        });

        // Also update standard state objects in case they are referenced by generic charts
        setESIMInfo(prev => ({
          ...prev,
          totalActivation: data.Total_esim_activation_request,
          oneYearRenewal: data.Total_1year_renewal_request,
          twoYearRenewal: data.Total_2year_renewal_request
        }));
        setDeviceStatusInfo(prev => ({
          ...prev,
          online: data.Total_Online_Device,
          todayOffline: data.Total_Offline_Device_today,
          sevenDaysOffline: data.Total_Offline_Device_7day,
          thirtyDaysOffline: data.Total_Offline_Device_30day,
        }));
        setMiscInfo(prev => ({
          ...prev,
          dealer: data.Total_Dealer,
          activation: data.Total_Activation,
          expired: data.Total_expired_device,
        }));
        setManufacturerDashboardInfo({
          Total_Model: data.Total_Model || 0,
          Total_esim_linked: data.ESim_Attached_M2M_Service_Provider || data.Total_esim_linked || 0,
          Total_Dealer: data.User_Total_Dealer || data.Total_Dealer || 0,
          Total_Inactive_Dealer: data.User_Inactive_Dealer || data.Total_Inactive_Dealer || 0,
          Total_Vehicle_Owner: data.User_Total_Unique_Vehicle_Owners || data.Total_Vehicle_Owner || 0,
          Total_Expired_Vehicle_Owner: data.User_Expired_Vehicle_Owners || data.Total_Expired_Vehicle_Owner || 0,
          Total_Stock_Created: data.Device_Total_Stock || data.Total_Stock_Created || 0,
          Total_Stock_Allocated: data.Device_Assigned_To_Dealer || data.Total_Stock_Allocated || 0,
          Total_Activation: data.Device_Tagged || data.Total_Activation || 0,
          Total_Return: data.Total_Return || 0,
          Total_Faulty: data.Total_Faulty || 0,
          Total_esim_activation_request: data.ESim_Activation_Request_Sent || data.Total_esim_activation_request || 0,
          ESim_Activated: data.ESim_Activated || 0,
          Total_1year_renewal_request: data.ESim_1_Year_Expiry || data.Total_1year_renewal_request || 0,
          Total_2year_renewal_request: data.ESim_2_Year_Expiry || data.Total_2year_renewal_request || 0,
          Total_Online_Device: data.Device_Online_Today || data.Total_Online_Device || 0,
          Total_Offline_Device_today: data.Total_Offline_Device_today || 0,
          Total_Offline_Device_7day: data.Device_Offline_Since_7_Days || data.Total_Offline_Device_7day || 0,
          Total_Offline_Device_30day: data.Device_Offline_Since_30_Days || data.Total_Offline_Device_30day || 0,
          Total_expired_device: data.ESim_Already_Expired || data.Total_expired_device || 0
        });
        setModelInfo(prev => ({
          ...prev,
          model: data.Total_Model,
          m2mLinked: data.Total_esim_linked
        }));
      })();
    }
    //for Dealer
    if (userRoles == 'dealer') {
      (async () => {
        const response = await UserServices.getDealerDashboard();
        const data = await response.data;
        setDealerFitmentInfo({
          total: data.Total_Fitment_done || 0,
          taggedDevice: data.TotalTaggedDevice || 0,
          onlineDevice: data.Total_Online_now || 0,
          offlineDevice: (data.TotalTaggedDevice || 0) - (data.Total_Online_now || 0),
        });
        setDealerDeviceInfo({
          assigned: data.Total_Device_Assigned || 0,
          returned: data.Total_Device_Returned || 0,
          stocked: data.Current_Device_stock || 0,
          faulty: data.Current_Device_faulty || 0,
          freeDevice: data.Available_Free_Device || 0
        });
        setDealerVehicleOwnerInfo({
          total: data.Unique_Vehicle_Owners_Associated || data.Total_Vehicle_Owner || 0,
          month: data.Unique_Vehicle_Owners_Associated_This_Month || data.Total_Vehicle_Owner_month || 0,
          today: data.Unique_Vehicle_Owners_Associated_Today || data.Total_Vehicle_Owner_today || 0,
        });
        setDealerESIMInfo({
          totalActivation: data.Total_esim_activation_request || data.ESim_Activation_Request_Sent || 0,
          activated: data.Total_esim_activated || 0,
          oneYearRenewal: data.Total_1_year_renewal_request || 0,
          twoYearRenewal: data.Total_2_year_renewal_request || 0,
          expired: data.Total_esim_expired || data.Total_expired_device || 0
        });
        setDeviceStatusInfo({
          onlineNow: data.Total_Online_now || 0,
          onlineToday: data.Total_Online_today || 0,
          sevenDaysOffline: data.Total_Offline_7_days || 0,
          thirtyDaysOffline: data.Total_Offline_30_days || 0,
        })
      })();
    }
    //only for superAdmin
    if (userRoles == 'superadmin') {
      (async () => {
        const response = await UserServices.getDashboardUserData();
        const res = await UserServices.getDashboardData();
        const dashboardData = await res.data;
        const data = await response.data;
        setUserInfoForAdmin(prev => ({
          ...prev,
          stateAdmin: data.state_admin || 0,
          sosAdmin: data.SOS_admin || 0,
          m2mServiceProvider: data.eSimProvider || 0,
          manufacturer: dashboardData.Manufacture || 0,
          dealer: dashboardData.Dealer || 0,
          vehicleOwner: dashboardData.VehicleOwner || 0
        }))
        setFitmentInfoForAdmin((prev => ({
          ...prev,
          devicesFitted: dashboardData.TotalDevice || 0,
          onlineDevice: dashboardData.TotalOnlineDevice || 0,
          offlineDevice: dashboardData.TotalOfflineDevice || 0,
        })))
        setTotalAlertInfo(prev => ({
          ...prev,
          totalAlert: dashboardData.TotalAlerts,
          thisMonthAlert: dashboardData.TotalAlerts_month,
          todayAlert: dashboardData.TotalAlerts_today
        }))
        setEmergencyInfo(prev => ({
          ...prev,
          totalAlert: dashboardData.EmergencyAlerts,
          thisMonthAlert: dashboardData.EmergencyAlerts_month,
          todayAlert: dashboardData.EmergencyAlerts_today
        }))
        setOverSpeedInfo(prev => ({
          ...prev,
          totalAlert: dashboardData.SpeedAlerts,
          thisMonthAlert: dashboardData.SpeedAlerts_month,
          todayAlert: dashboardData.SpeedAlerts_today
        }))
        setStateInfo(prev => ({
          ...prev,
          total: dashboardData.Total_States,
          active: dashboardData.Active_States,
          inactive: dashboardData.Inactive_States
        }))
        setTemperAlertInfo(prev => ({
          ...prev,
          totalAlert: dashboardData.TemperatureAlerts || 0,
          thisMonthAlert: dashboardData.TemperatureAlerts_month || 0,
          todayAlert: dashboardData.TemperatureAlerts_today || 0,
        }))
        setStockInfo(prev => ({
          ...prev,
          total: dashboardData.Total_device_stock || 0,
          taggedDevice: dashboardData.TotalTaggedDevice || 0,
          unassigned: dashboardData.unassigned_device_stock || 0,
        }))

      })();
    }
    // for stateAdmin
    if (userRoles == 'stateadmin') {
      (async () => {
        const response = await UserServices.getStateAdminDashboard();
        const data = await response.data;
        setUserInfo({
          dto: data.Total_DTO_available,
          m2m: data.Total_M2M_Service_Provider_available || 0,
          manufacturer: data.Total_Manufacture_available,
          dealer: data.Total_Dealer_available,
          owner: data.Total_Vehicle_Owner_available
        });
        setFitmentInfo({
          fitted: data.Total_Fit_Device,
          onlineDevice: data.Online_Devices,
          offlineDevice: data.Offline_Devices,
          inActiveFor7Days: data.Inactive_Device_7days,
          inActiveFor30Days: data.Inactive_Device_30days,
        });
        setDeviceHealthInfo((prev => ({
          ...prev,
          totalActivatedDevice: data.Total_Device_Activated,
          todayActive: data.Active_Device_Today,
          inActiveFor30Days: data.Inactive_Device_30days,
          inActiveFor7Days: data.Inactive_Device_7days
        })))
        setOverSpeedInfo(prev => ({
          ...prev,
          totalAlert: data.Total_overspeeding_Alert,
          thisMonthAlert: data.Monthly_overspeeding_Alert,
          todayAlert: data.Today_overspeeding_Alert
        }))
        setEmergencyInfo(prev => ({
          ...prev,
          totalAlert: data.Total_emergency_Alert,
          thisMonthAlert: data.This_month_emergency_Alert,
          todayAlert: data.Today_emergency_Alert
        }))
        setHarshBreakInfo(prev => ({
          ...prev,
          totalAlert: data.Total_harsh_brake_Alert,
          thisMonthAlert: data.This_month_harsh_brake_Alert,
          todayAlert: data.Today_harsh_brake_Alert
        }))
        setSuddenBreakInfo(prev => ({
          ...prev,
          totalAlert: data.Total_sudden_turn_Alert,
          thisMonthAlert: data.This_month_sudden_turn_Alert,
          todayAlert: data.Today_sudden_turn_Alert
        }))
        setStockInfo(prev => ({
          ...prev,
          total: data.Total_device_stock,
          unassigned: data.unassigned_device_stock,
          waiting: data.waiting_device_stock
        }))
        setDistrictInfo({
          district: data.Total_district,
          active: data.Active_district,
        });
        setActiveUsersInfo(prev => ({
          ...prev,
          stateAdmin: data.ActiveUsers_stateadmin,
          esimProvider: data.ActiveUsers_esimprovider,
          manufacturer: data.ActiveUsers_manufacturer,
          sosAdmin: data.ActiveUsers_sosadmin,
          sosExecutive: data.ActiveUsers_sosexecutive,
          sosTeamLead: data.ActiveUsers_sos_teamlead,
          sosDeskExecutive: data.ActiveUsers_sos_deskexecutive
        }))
      })();
    }
    if (userRoles === 'sosadmin' || userRoles === 'teamlead') {
      fetchSOSData();
    }
    if (userRoles === 'desk_ex') {
      (async () => {
        const response = await UserServices.getSOSExeDashboard();
        const data = await response.data;
        setAssignment((prev) => ({
          ...prev,
          Total_Assignemnt_thistmonth: data.Total_Assignemnt_thistmonth,
          Total_Assignemnt_thisweek: data.Total_Assignemnt_thisweek,
          Total_Assignemnt_today: data.Total_Assignemnt_today,
          Total_Assignemnt: data.Total_Assignemnt,
        }));
        setFalseAssignment((prev) => ({
          ...prev,
          Total_False_Assignemnt_thistmonth:
            data.Total_False_Assignemnt_thistmonth,
          Total_False_Assignemnt_thisweek: data.Total_False_Assignemnt_thisweek,
          Total_False_Assignemnt_today: data.Total_False_Assignemnt_today,
          Total_False_Assignemnt: data.Total_False_Assignemnt,
        }));
        setClosedAssignment((prev) => ({
          ...prev,
          Total_Closed_Assignemnt_thistmonth:
            data.Total_Closed_Assignemnt_thistmonth,
          Total_Closed_Assignemnt_thisweek:
            data.Total_Closed_Assignemnt_thisweek,
          Total_Closed_Assignemnt_today: data.Total_Closed_Assignemnt_today,
          Total_Closed_Assignemnt: data.Total_Closed_Assignemnt,
        }));
        setRejectedAssignment((prev) => ({
          ...prev,
          Total_Rejected_Assignemnt_thistmonth: data.Total_Rejected_Assignemnt_thistmonth,
          Total_Rejected_Assignemnt_thisweek: data.Total_Rejected_Assignemnt_thisweek,
          Total_Rejected_Assignemnt_today: data.Total_Rejected_Assignemnt_today,
          Total_Rejected_Assignemnt: data.Total_Rejected_Assignemnt,
        }));
        setAvgAcceptance(data.Average_time_to_Accept);
      })()
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin && activeTab > 1) {
      setActiveTab(0);
    }
  }, [isSuperAdmin, activeTab]);

  const superAdminData = useMemo(() => ({
    userStats: userInfoForAdmin,
    fitmentStats: fitmentInfoForAdmin,
    alertStats: emergencyInfo,
    totalAlertStats: totalAlertInfo,
    overspeedStats: overSpeedInfo,
    stateStats: stateInfo,
    deviceHealth: deviceStatusInfo,
    vehicleHealth: deviceHealthInfo
  }), [
    userInfoForAdmin,
    fitmentInfoForAdmin,
    emergencyInfo,
    totalAlertInfo,
    overSpeedInfo,
    stateInfo,
    deviceStatusInfo,
    deviceHealthInfo
  ]);

  const aggregatedData = superAdminData;

  const fieldLabelMap = useMemo(() => ({
    'userStats.stateAdmin': 'State Admin',
    'userStats.sosAdmin': 'SOS Admin',
    'userStats.m2mServiceProvider': 'M2M Service Provider',
    'userStats.manufacturer': 'Manufacturer',
    'userStats.dealer': 'Dealer',
    'userStats.vehicleOwner': 'Vehicle Owner',
    'fitmentStats.devicesFitted': 'Devices Fitted',
    'fitmentStats.onlineDevice': 'Online Device',
    'fitmentStats.offlineDevice': 'Offline Device',
    'alertStats.totalAlert': 'Emergency Alerts',
    'alertStats.thisMonthAlert': 'Emergency Monthly Alerts',
    'alertStats.todayAlert': 'Emergency Today Alerts',
    'totalAlertStats.totalAlert': 'Total Alerts',
    'totalAlertStats.thisMonthAlert': 'Total Monthly Alerts',
    'totalAlertStats.todayAlert': 'Total Today Alerts',
    'overspeedStats.totalAlert': 'Overspeed Alerts',
    'overspeedStats.thisMonthAlert': 'Overspeed Monthly Alerts',
    'overspeedStats.todayAlert': 'Overspeed Today Alerts',
    'stateStats.total': 'Total States',
    'stateStats.active': 'Active States',
    'stateStats.inactive': 'Inactive States',
    'deviceHealth.online': 'Devices Online',
    'deviceHealth.todayOffline': 'Offline Today',
    'deviceHealth.sevenDaysOffline': 'Offline 7 Days',
    'deviceHealth.thirtyDaysOffline': 'Offline 30 Days',
    'vehicleHealth.totalActivatedDevice': 'Activated Devices',
    'vehicleHealth.todayActive': 'Active Today',
    'vehicleHealth.inActiveFor7Days': 'Inactive 7 Days',
    'vehicleHealth.inActiveFor30Days': 'Inactive 30 Days'
  }), []);

  const numericFields = useMemo(() => flattenNumericPaths(aggregatedData), [aggregatedData]);
  const numericFieldEntries = useMemo(
    () => Object.entries(numericFields).filter(([key]) => fieldLabelMap[key]),
    [numericFields, fieldLabelMap]
  );

  const filteredFieldEntries = useMemo(() => {
    if (!fieldSearchTerm) {
      return numericFieldEntries;
    }

    const matcher = new RegExp(escapeRegExp(fieldSearchTerm), "i");
    return numericFieldEntries.filter(([path]) => matcher.test(path));
  }, [fieldSearchTerm, numericFieldEntries]);

  const updateReportBuilder = useCallback((updater) => {
    setReportBuilderState((prev) => {
      const nextState =
        typeof updater === "function"
          ? updater(prev)
          : {
            ...prev,
            ...updater
          };

      return {
        ...nextState,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const formatNumber = useCallback((value, precision = 0) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return "-";
    }

    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  }, []);

  const evaluateFormulaValue = useCallback(
    (expression) => {
      if (!expression) {
        return { value: 0, error: null };
      }

      const tokenRegex = /{{\s*([^}]+)\s*}}/g;
      const replaced = expression.replace(tokenRegex, (_, path) => {
        const value = getNestedValue(path.trim(), aggregatedData);
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : 0;
      });

      if (/[^0-9+\-*/().\s]/.test(replaced)) {
        return { value: null, error: "Invalid characters in expression" };
      }

      try {
        // eslint-disable-next-line no-new-func
        const result = Function("'use strict'; return (" + (replaced || 0) + ");")();
        return { value: Number.isFinite(result) ? result : 0, error: null };
      } catch (error) {
        return { value: null, error: "Unable to evaluate expression" };
      }
    },
    [aggregatedData]
  );

  const paletteItems = useMemo(
    () => [
      { type: "text", title: "Text Block", description: "Add headings or annotations" },
      { type: "metric", title: "Metric Card", description: "Highlight a single data point" },
      { type: "chart", title: "Chart", description: "Visualize multiple metrics" },
      { type: "formula", title: "Formula", description: "Combine metrics with custom formulas" }
    ],
    []
  );

  const createCanvasItem = useCallback(
    (itemType) => {
      const id = `report-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const numericFieldKeys = Object.keys(numericFields);
      const defaultField = numericFieldKeys[0] || null;

      switch (itemType) {
        case "text":
          return {
            id,
            type: "text",
            text: "New Heading",
            variant: "h5",
            align: "left",
            color: "textPrimary"
          };
        case "metric":
          return {
            id,
            type: "metric",
            label: "Metric Insight",
            dataField: defaultField,
            prefix: "",
            suffix: "",
            precision: 0,
            color: "primary"
          };
        case "chart":
          return {
            id,
            type: "chart",
            title: "Performance Chart",
            chartType: "bar",
            dataFields: numericFieldKeys.slice(0, 3),
            showLegend: true
          };
        case "formula":
          return {
            id,
            type: "formula",
            title: "Computed Metric",
            expression: defaultField ? `{{${defaultField}}}` : "",
            precision: 2
          };
        default:
          return null;
      }
    },
    [numericFields]
  );

  const handleAddItem = useCallback(
    (itemType) => {
      const newItem = createCanvasItem(itemType);
      if (!newItem) {
        return;
      }

      updateReportBuilder((prev) => ({
        ...prev,
        canvasItems: [...prev.canvasItems, newItem],
        selectedItemId: newItem.id
      }));
    },
    [createCanvasItem, updateReportBuilder]
  );

  const handlePaletteDragStart = useCallback((event, itemType) => {
    event.dataTransfer.setData("application/x-report-item", itemType);
    event.dataTransfer.effectAllowed = "copy";
  }, []);

  const handleCanvasDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleCanvasDrop = useCallback(
    (event) => {
      event.preventDefault();
      const itemType = event.dataTransfer.getData("application/x-report-item");
      if (!itemType) {
        return;
      }

      handleAddItem(itemType);
    },
    [handleAddItem]
  );

  const handleSelectCanvasItem = useCallback(
    (itemId) => {
      updateReportBuilder((prev) => ({
        ...prev,
        selectedItemId: itemId
      }));
    },
    [updateReportBuilder]
  );

  const handleRemoveItem = useCallback(
    (itemId) => {
      updateReportBuilder((prev) => {
        const updatedItems = prev.canvasItems.filter((item) => item.id !== itemId);
        const nextSelected = prev.selectedItemId === itemId ? null : prev.selectedItemId;
        return {
          ...prev,
          canvasItems: updatedItems,
          selectedItemId: nextSelected
        };
      });
    },
    [updateReportBuilder]
  );

  const handleDuplicateItem = useCallback(
    (itemId) => {
      updateReportBuilder((prev) => {
        const index = prev.canvasItems.findIndex((item) => item.id === itemId);
        if (index === -1) {
          return prev;
        }

        const source = prev.canvasItems[index];
        const clone = {
          ...source,
          id: `report-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        };

        const updatedItems = [
          ...prev.canvasItems.slice(0, index + 1),
          clone,
          ...prev.canvasItems.slice(index + 1)
        ];

        return {
          ...prev,
          canvasItems: updatedItems,
          selectedItemId: clone.id
        };
      });
    },
    [updateReportBuilder]
  );

  const handleMoveItem = useCallback(
    (itemId, direction) => {
      updateReportBuilder((prev) => {
        const index = prev.canvasItems.findIndex((item) => item.id === itemId);
        if (index === -1) {
          return prev;
        }

        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= prev.canvasItems.length) {
          return prev;
        }

        const updatedItems = [...prev.canvasItems];
        const [movedItem] = updatedItems.splice(index, 1);
        updatedItems.splice(targetIndex, 0, movedItem);

        return {
          ...prev,
          canvasItems: updatedItems,
          selectedItemId: movedItem.id
        };
      });
    },
    [updateReportBuilder]
  );

  const handleItemChange = useCallback(
    (itemId, changes) => {
      updateReportBuilder((prev) => ({
        ...prev,
        canvasItems: prev.canvasItems.map((item) =>
          item.id === itemId
            ? {
              ...item,
              ...changes
            }
            : item
        )
      }));
    },
    [updateReportBuilder]
  );

  const selectedReportItem = useMemo(
    () =>
      reportBuilderState.canvasItems.find((item) => item.id === reportBuilderState.selectedItemId) || null,
    [reportBuilderState.canvasItems, reportBuilderState.selectedItemId]
  );

  const itemLabels = useMemo(
    () => ({
      text: "Text Block",
      metric: "Metric Card",
      chart: "Chart",
      formula: "Formula"
    }),
    []
  );

  const handleReportTitleChange = useCallback(
    (event) => {
      updateReportBuilder({ reportTitle: event.target.value });
    },
    [updateReportBuilder]
  );

  const handleTogglePreview = useCallback(() => {
    updateReportBuilder((prev) => ({
      ...prev,
      previewMode: !prev.previewMode
    }));
  }, [updateReportBuilder]);

  const handleClearCanvas = useCallback(() => {
    updateReportBuilder((prev) => ({
      ...prev,
      canvasItems: [],
      selectedItemId: null
    }));
  }, [updateReportBuilder]);

  const handleExportJson = useCallback(() => {
    const payload = {
      ...reportBuilderState,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(reportBuilderState.reportTitle || "custom-report").replace(/\s+/g, "-").toLowerCase()}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [reportBuilderState]);

  const handleCopyFieldToken = useCallback((path) => {
    const token = `{{${path}}}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(token);
    }
  }, []);

  const handleFieldSearchChange = useCallback((event) => {
    setFieldSearchTerm(event.target.value);
  }, []);

  const showConfigurationPanel = !reportBuilderState.previewMode && Boolean(selectedReportItem);

  const renderCanvasItemContent = useCallback(
    (item) => {
      switch (item.type) {
        case "text":
          return (
            <Typography
              variant={item.variant || "h6"}
              align={item.align || "left"}
              color={item.color || "textPrimary"}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {item.text || "Add your text"}
            </Typography>
          );
        case "metric": {
          const metricValue = getNestedValue(item.dataField, aggregatedData);
          const colorMap = {
            primary: "#1976d2",
            secondary: "#9c27b0",
            success: "#388e3c",
            error: "#d32f2f",
            warning: "#f57c00",
            info: "#0288d1"
          };
          const displayColor = colorMap[item.color || "primary"] || colorMap.primary;
          return (
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid #e0e0e0" }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                {item.label || "Metric"}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: displayColor }}>
                {(item.prefix || "")}
                {formatNumber(metricValue, item.precision ?? 0)}
                {(item.suffix || "")}
              </Typography>
              {item.dataField && (
                <Chip label={item.dataField} size="small" variant="outlined" sx={{ mt: 1 }} />
              )}
            </Box>
          );
        }
        case "chart": {
          const dataFields = item.dataFields && item.dataFields.length
            ? item.dataFields
            : Object.keys(numericFields).slice(0, 5);
          const chartData = dataFields.map((field) => ({
            name: field.split(".").pop(),
            field,
            value: Number(getNestedValue(field, aggregatedData)) || 0
          }));
          const palette = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

          if (!chartData.length) {
            return (
              <Typography variant="body2" color="textSecondary">
                Select at least one data field to render the chart.
              </Typography>
            );
          }

          const allZeros = chartData.every((entry) => entry.value === 0);

          return (
            <Box sx={{ height: 280 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {item.title || "Chart"}
              </Typography>
              {allZeros ? (
                <Box
                  sx={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.50",
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Data points will appear here when values are available.
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  {
                    {
                      line: (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      ),
                      pie: (
                        <PieChart>
                          <Tooltip />
                          <Legend />
                          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                            {chartData.map((entry, index) => (
                              <Cell key={entry.field} fill={palette[index % palette.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      )
                    }[item.chartType || "bar"] || (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    )
                  }
                </ResponsiveContainer>
              )}
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {chartData.map((entry, index) => (
                  <Chip
                    key={entry.field}
                    label={`${entry.field}: ${formatNumber(entry.value)}`}
                    size="small"
                    sx={{ bgcolor: `${palette[index % palette.length]}14` }}
                  />
                ))}
              </Box>
            </Box>
          );
        }
        case "formula": {
          const { value, error } = evaluateFormulaValue(item.expression);
          const referencedFields = Array.from(
            new Set(
              (item.expression?.match(/{{\s*([^}]+)\s*}}/g) || []).map((token) =>
                token.replace(/{{|}}/g, "").trim()
              )
            )
          );

          return (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                {item.title || "Formula"}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: error ? "error.main" : "primary.main" }}>
                {value !== null && value !== undefined ? formatNumber(value, item.precision ?? 2) : "-"}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {item.expression || "Use {{metric.path}} tokens and mathematical operators."}
              </Typography>
              {error && (
                <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {error}
                </Typography>
              )}
              {referencedFields.length > 0 && (
                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {referencedFields.map((field) => (
                    <Chip key={field} label={field} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>
          );
        }
        default:
          return (
            <Typography variant="body2" color="textSecondary">
              Unsupported element type.
            </Typography>
          );
      }
    },
    [aggregatedData, evaluateFormulaValue, formatNumber, numericFields]
  );

  const canvasGridColumns = reportBuilderState.previewMode || !showConfigurationPanel ? 9 : 6;

  // Simple chart rendering functions for existing dashboard data
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderDashboardCharts = (role) => {
    const charts = [];

    if (role === 'superadmin') {
      // User Statistics Pie Chart
      const userStatsData = [
        { name: 'State Admin', value: userInfoForAdmin.stateAdmin || 0 },
        { name: 'SOS Admin', value: userInfoForAdmin.sosAdmin || 0 },
        { name: 'M2M Service Provider', value: userInfoForAdmin.m2mServiceProvider || 0 },
        { name: 'Manufacturer', value: userInfoForAdmin.manufacturer || 0 },
        { name: 'Dealer', value: userInfoForAdmin.dealer || 0 },
        { name: 'Vehicle Owner', value: userInfoForAdmin.vehicleOwner || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="user-stats">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>User Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={userStatsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {userStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Device Status Bar Chart
      const deviceStatusData = [
        { name: 'Online', count: fitmentInfoForAdmin.onlineDevice || 0 },
        { name: 'Offline', count: fitmentInfoForAdmin.offlineDevice || 0 },
        { name: 'Devices Fitted', count: fitmentInfoForAdmin.devicesFitted || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="device-status">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Status</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={deviceStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Super Admin Alert Overview
      const alertOverviewData = [
        { name: 'Overspeeding', total: overSpeedInfo.totalAlert || 0, monthly: overSpeedInfo.thisMonthAlert || 0, today: overSpeedInfo.todayAlert || 0 },
        { name: 'Emergency', total: emergencyInfo.totalAlert || 0, monthly: emergencyInfo.thisMonthAlert || 0, today: emergencyInfo.todayAlert || 0 },
        { name: 'Harsh Brake', total: harshBreakInfo.totalAlert || 0, monthly: harshBreakInfo.thisMonthAlert || 0, today: harshBreakInfo.todayAlert || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="alert-overview">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Alert Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={alertOverviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
                <Bar dataKey="monthly" fill="#82ca9d" />
                <Bar dataKey="today" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Super Admin State Information
      const stateInfoData = [
        { name: 'Total States', value: stateInfo.total || 0 },
        { name: 'Active States', value: stateInfo.active || 0 },
        { name: 'Inactive States', value: stateInfo.inactive || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="state-info">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>State Information</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stateInfoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {stateInfoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'stateadmin') {
      // User Distribution Pie Chart
      const userDistData = [
        { name: 'Dealers', value: userInfo.dealer || 0 },
        { name: 'Manufacturers', value: userInfo.manufacturer || 0 },
        { name: 'DTOs', value: userInfo.dto || 0 },
        { name: 'Vehicle Owners', value: userInfo.owner || 0 },
        { name: 'M2M Service Providers', value: userInfo.m2m || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="user-distribution">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>User Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={userDistData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {userDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Alert Comparison Bar Chart
      const alertData = [
        { name: 'Total', overspeeding: overSpeedInfo.totalAlert || 0, emergency: emergencyInfo.totalAlert || 0, harsh_brake: harshBreakInfo.totalAlert || 0 },
        { name: 'This Month', overspeeding: overSpeedInfo.thisMonthAlert || 0, emergency: emergencyInfo.thisMonthAlert || 0, harsh_brake: harshBreakInfo.thisMonthAlert || 0 },
        { name: 'Today', overspeeding: overSpeedInfo.todayAlert || 0, emergency: emergencyInfo.todayAlert || 0, harsh_brake: harshBreakInfo.todayAlert || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="alert-comparison">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Alert Comparison</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="overspeeding" fill="#8884d8" />
                <Bar dataKey="emergency" fill="#82ca9d" />
                <Bar dataKey="harsh_brake" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // State Admin Device Health Overview
      const stateDeviceHealthData = [
        { name: 'Total Activated', value: deviceHealthInfo.totalActivatedDevice || 0 },
        { name: 'Today Active', value: deviceHealthInfo.todayActive || 0 },
        { name: 'Inactive 7 Days', value: deviceHealthInfo.inActiveFor7Days || 0 },
        { name: 'Inactive 30 Days', value: deviceHealthInfo.inActiveFor30Days || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="state-device-health">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Health Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stateDeviceHealthData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {stateDeviceHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // State Admin Fitment Overview
      const stateFitmentData = [
        { name: 'Fitted Devices', value: fitmentInfo.fitted || 0 },
        { name: 'Online Devices', value: fitmentInfo.onlineDevice || 0 },
        { name: 'Offline Devices', value: fitmentInfo.offlineDevice || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="state-fitment">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Fitment Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stateFitmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'owner') {
      // Driver Behavior Bar Chart
      const behaviorData = [
        { name: 'Harsh Braking', incidents: ownerDashboardInfo.harshBreaking || 0 },
        { name: 'Sudden Turn', incidents: ownerDashboardInfo.suddenTurn || 0 },
        { name: 'Over Speeding', incidents: ownerDashboardInfo.overSpeeding || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="driver-behavior">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Driver Behavior Analysis</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={behaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="incidents" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Owner Alert Trends
      const ownerAlertTrendsData = [
        { name: 'Total Alerts', count: ownerDashboardInfo.alert || 0 },
        { name: 'Monthly Alerts', count: ownerDashboardInfo.monthlyAlert || 0 },
        { name: 'Daily Alerts', count: ownerDashboardInfo.dailyAlert || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="owner-alert-trends">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Alert Trends</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={ownerAlertTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Owner Device Status Timeline
      const ownerDeviceTimelineData = [
        { period: 'Online', count: ownerDashboardInfo.onlineDevice || 0 },
        { period: '7 Days Offline', count: ownerDashboardInfo.sevenDaysOffline || 0 },
        { period: '30 Days Offline', count: ownerDashboardInfo.thirtyDaysOffline || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="owner-device-timeline">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Status Timeline</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={ownerDeviceTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Owner Call Statistics
      const ownerCallStatsData = [
        { name: 'SOS Calls', value: ownerDashboardInfo.sosCalls || 0 },
        { name: 'Genuine Calls', value: ownerDashboardInfo.genuineCalls || 0 },
        { name: 'Fake Calls', value: ownerDashboardInfo.fakeCalls || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="owner-call-stats">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Call Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={ownerCallStatsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {ownerCallStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'esimprovider') {
      // M2M Status Distribution Pie Chart
      const esimStatusData = [
        { name: 'Validated', value: eSIMInfo.validated || 0 },
        { name: 'Active', value: eSIMInfo.active || 0 },
        { name: 'Expired', value: eSIMInfo.expired || 0 },
        { name: 'Pending', value: eSIMInfo.pending || 0 },
        { name: 'Invalid', value: eSIMInfo.invalid || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="esim-status">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>M2M Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={esimStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {esimStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // M2M Activation Trends Bar Chart (All activation data)
      const activationTrendsData = [
        { name: 'Requests Sent', count: eSIMActivationInfo.activationRequestSent || 0 },
        { name: 'Confirmed', count: eSIMActivationInfo.activationConfirmed || 0 },
        { name: 'Rejected', count: eSIMActivationInfo.activationRejected || 0 },
        { name: 'Expiring Soon (30 Days)', count: eSIMActivationInfo.expiringSoon || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="activation-trends">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>M2M Activation Status</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={activationTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Activation Requests Timeline Bar Chart
      const requestTimelineData = [
        { period: 'Today', requests: eSIMActivationInfo.todayRequests || 0 },
        { period: 'This Week', requests: eSIMActivationInfo.weeklyRequests || 0 },
        { period: 'This Month', requests: eSIMActivationInfo.monthlyRequests || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="request-timeline">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Activation Requests Timeline</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={requestTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Total Devices Overview
      const deviceOverviewData = [
        { name: 'Total Devices', value: eSIMInfo.totalDevicesWithESim || 0 },
        { name: 'With M2M Status', value: (eSIMInfo.validated || 0) + (eSIMInfo.active || 0) + (eSIMInfo.expired || 0) + (eSIMInfo.pending || 0) + (eSIMInfo.invalid || 0) }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="device-overview">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={deviceOverviewData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Provider Information Summary Card
      charts.push(
        <Grid item xs={12} md={6} key="provider-info">
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Provider Information</Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Company:</strong> {providerInfo.company || '-'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>State:</strong> {providerInfo.state || '-'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Created Date:</strong> {providerInfo.createdDate || '-'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Expiry Date:</strong> {providerInfo.expiryDate || '-'}
              </Typography>
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                  Total Devices: {eSIMInfo.totalDevicesWithESim || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Validated M2Ms: {eSIMInfo.validated || 0}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      );

      // Complete M2M Status Breakdown
      const completeStatusData = [
        { name: 'Validated', value: eSIMInfo.validated || 0, color: '#00C49F' },
        { name: 'Active', value: eSIMInfo.active || 0, color: '#0088FE' },
        { name: 'Expired', value: eSIMInfo.expired || 0, color: '#FF8042' },
        { name: 'Pending', value: eSIMInfo.pending || 0, color: '#FFBB28' },
        { name: 'Invalid', value: eSIMInfo.invalid || 0, color: '#8884d8' }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="complete-status">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Complete M2M Status Breakdown</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={completeStatusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'dealer') {
      // Stock Statistics Pie Chart
      const stockData = [
        { name: 'Assigned', value: dealerDeviceInfo.assigned || 0 },
        { name: 'Available for Fitment', value: dealerDeviceInfo.freeDevice || 0 },
        { name: 'Returned', value: dealerDeviceInfo.returned || 0 },
        { name: 'Faulty', value: dealerDeviceInfo.faulty || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="stock-stats">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Stock Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Fitment Trends Bar Chart
      const fitmentTrendsData = [
        { name: 'Total', count: dealerFitmentInfo.total || 0 },
        { name: 'Monthly', count: dealerFitmentInfo.monthly || 0 },
        { name: 'Daily', count: dealerFitmentInfo.daily || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="fitment-trends">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Fitment Trends</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={fitmentTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Device Statistics Pie Chart
      const deviceStatsData = [
        { name: 'Online Devices', value: fitmentInfo.onlineDevice || 0 },
        { name: 'Offline Devices', value: fitmentInfo.offlineDevice || 0 },
        { name: 'Fitted Devices', value: fitmentInfo.fitted || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="device-statistics">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={deviceStatsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // M2M Statistics Bar Chart
      const esimStatsData = [
        { name: 'Total with M2M', count: eSIMInfo.totalDevicesWithESim || 0 },
        { name: 'Validated', count: eSIMInfo.validated || 0 },
        { name: 'Active', count: eSIMInfo.active || 0 },
        { name: 'Expired', count: eSIMInfo.expired || 0 },
        { name: 'Pending', count: eSIMInfo.pending || 0 },
        { name: 'Invalid', count: eSIMInfo.invalid || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="esim-statistics">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>M2M Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={esimStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Device Health Overview Pie Chart
      const deviceHealthData = [
        { name: 'Total Activated', value: deviceHealthInfo.totalActivatedDevice || 0 },
        { name: 'Today Active', value: deviceHealthInfo.todayActive || 0 },
        { name: 'Inactive 7 Days', value: deviceHealthInfo.inActiveFor7Days || 0 },
        { name: 'Inactive 30 Days', value: deviceHealthInfo.inActiveFor30Days || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="device-health">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Health Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={deviceHealthData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Device Status Timeline Bar Chart
      const deviceStatusData = [
        { name: 'Online', count: deviceStatusInfo.online || 0 },
        { name: 'Today Offline', count: deviceStatusInfo.todayOffline || 0 },
        { name: '7 Days Offline', count: deviceStatusInfo.sevenDaysOffline || 0 },
        { name: '30 Days Offline', count: deviceStatusInfo.thirtyDaysOffline || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="device-status-timeline">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Status Timeline</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={deviceStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'dtorto') {
      // DTO Dashboard Overview Pie Chart
      const dtoOverviewData = [
        { name: 'Activated Devices', value: dtoDashboardInfo.activated || 0 },
        { name: 'Total Vehicles', value: dtoDashboardInfo.vehicles || 0 },
        { name: 'Online Devices', value: dtoDashboardInfo.onlineDevice || 0 },
        { name: 'Offline Devices', value: dtoDashboardInfo.offlineDevice || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="dto-overview">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>DTO Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={dtoOverviewData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {dtoOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // DTO Alerts and Activations Bar Chart
      const dtoActivityData = [
        { name: 'Total Alerts', count: dtoDashboardInfo.alert || 0 },
        { name: 'Monthly Alerts', count: dtoDashboardInfo.monthlyAlert || 0 },
        { name: 'Daily Alerts', count: dtoDashboardInfo.dailyAlert || 0 },
        { name: 'Total Activations', count: dtoDashboardInfo.activations || 0 },
        { name: 'Monthly Activations', count: dtoDashboardInfo.monthlyActivations || 0 },
        { name: 'Daily Activations', count: dtoDashboardInfo.dailyActivations || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="dto-activity">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>DTO Activity Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dtoActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // DTO Call Statistics Pie Chart
      const dtoCallsData = [
        { name: 'SOS Calls', value: dtoDashboardInfo.sosCalls || 0 },
        { name: 'Genuine Calls', value: dtoDashboardInfo.genuineCalls || 0 },
        { name: 'Fake Calls', value: dtoDashboardInfo.fakeCalls || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="dto-calls">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>DTO Call Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={dtoCallsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {dtoCallsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Device Status Timeline Bar Chart
      const deviceStatusTimelineData = [
        { period: '7 Days Offline', count: dtoDashboardInfo.sevenDaysOffline || 0 },
        { period: '30 Days Offline', count: dtoDashboardInfo.thirtyDaysOffline || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="device-timeline">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Device Offline Timeline</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={deviceStatusTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'devicemanufacture') {
      // Model Information Pie Chart
      const modelData = [
        { name: 'Total Models', value: modelInfo.model || 0 },
        { name: 'M2M Linked', value: modelInfo.m2mLinked || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="model-info">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Model Information</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={modelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {modelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Miscellaneous Information Bar Chart
      const miscData = [
        { name: 'Dealers', count: miscInfo.dealer || 0 },
        { name: 'Allocated', count: miscInfo.allocated || 0 },
        { name: 'Activations', count: miscInfo.activation || 0 },
        { name: 'Expired', count: miscInfo.expired || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="misc-info">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Miscellaneous Information</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={miscData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'desk_ex') {
      // Assignment Overview Pie Chart
      const assignmentOverviewData = [
        { name: 'Total Assignments', value: assignment.Total_Assignemnt || 0 },
        { name: 'Closed Assignments', value: closedAssignment.Total_Closed_Assignemnt || 0 },
        { name: 'False Assignments', value: falseAssignment.Total_False_Assignemnt || 0 },
        { name: 'Rejected Assignments', value: rejectedAssignment.Total_Rejected_Assignemnt || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="assignment-overview">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Assignment Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={assignmentOverviewData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {assignmentOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Assignment Trends Bar Chart
      const assignmentTrendsData = [
        { period: 'Today', assignments: assignment.Total_Assignemnt_today || 0, closed: closedAssignment.Total_Closed_Assignemnt_today || 0, false: falseAssignment.Total_False_Assignemnt_today || 0, rejected: rejectedAssignment.Total_Rejected_Assignemnt_today || 0 },
        { period: 'This Week', assignments: assignment.Total_Assignemnt_thisweek || 0, closed: closedAssignment.Total_Closed_Assignemnt_thisweek || 0, false: falseAssignment.Total_False_Assignemnt_thisweek || 0, rejected: rejectedAssignment.Total_Rejected_Assignemnt_thisweek || 0 },
        { period: 'This Month', assignments: assignment.Total_Assignemnt_thistmonth || 0, closed: closedAssignment.Total_Closed_Assignemnt_thistmonth || 0, false: falseAssignment.Total_False_Assignemnt_thistmonth || 0, rejected: rejectedAssignment.Total_Rejected_Assignemnt_thistmonth || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="assignment-trends">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Assignment Trends</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={assignmentTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assignments" fill="#8884d8" />
                <Bar dataKey="closed" fill="#82ca9d" />
                <Bar dataKey="false" fill="#ffc658" />
                <Bar dataKey="rejected" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );
    }

    if (role === 'sosadmin' || role === 'teamlead') {
      // Call Statistics Pie Chart
      const callStatsData = [
        { name: 'Active Calls', value: calls.Total_Active_Calls || 0 },
        { name: 'Closed Calls', value: calls.Total_Closed_Calls || 0 },
        { name: 'Pending Calls', value: calls.Total_Pending_Calls || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="call-statistics">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Call Statistics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={callStatsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {callStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Call Trends Bar Chart
      const callTrendsData = [
        { name: 'Total', incoming: incomingCall.Total_Incoming_Calls || 0, fake: fakeCall.Total_Fake_Calls || 0, rejected: callRejection.Total_Rejected_Assignemnt || 0 },
        { name: 'This Month', incoming: incomingCall.Total_Incoming_Calls_thismonth || 0, fake: fakeCall.Total_Fake_Calls_thismonth || 0, rejected: callRejection.Total_Rejected_Assignemnt_thismonth || 0 },
        { name: 'This Week', incoming: incomingCall.Total_Incoming_Calls_thisweek || 0, fake: fakeCall.Total_Fake_Calls_thisweek || 0, rejected: callRejection.Total_Rejected_Assignemnt_thisweek || 0 },
        { name: 'Today', incoming: incomingCall.Total_Incoming_Calls_today || 0, fake: fakeCall.Total_Fake_Calls_today || 0, rejected: callRejection.Total_Rejected_Assignemnt_today || 0 }
      ];

      charts.push(
        <Grid item xs={12} md={6} key="call-trends">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Call Trends</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={callTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="incoming" fill="#8884d8" />
                <Bar dataKey="fake" fill="#82ca9d" />
                <Bar dataKey="rejected" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      );

      // Vehicle Alert Statistics Charts (SOS Admin only)
      if (role === 'sosadmin') {
        // Vehicle Status Pie Chart
        const vehicleStatusData = [
          { name: 'Total Tagged', value: vehicleAlertStats.vehicles.total_tagged_vehicles || 0 },
          { name: 'Online', value: vehicleAlertStats.vehicles.online_vehicles || 0 },
          { name: 'Offline', value: vehicleAlertStats.vehicles.offline_vehicles || 0 }
        ];

        charts.push(
          <Grid item xs={12} md={6} key="vehicle-status">
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Vehicle Status Distribution</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        );

        // SOS Calls Timeline Bar Chart
        const sosCallsTimelineData = [
          { period: 'Daily', calls: vehicleAlertStats.sos_calls.daily || 0 },
          { period: 'Weekly', calls: vehicleAlertStats.sos_calls.weekly || 0 },
          { period: 'Monthly', calls: vehicleAlertStats.sos_calls.monthly || 0 },
          { period: 'Yearly', calls: vehicleAlertStats.sos_calls.yearly || 0 }
        ];

        charts.push(
          <Grid item xs={12} md={6} key="sos-calls-timeline">
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>SOS Calls Timeline</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={sosCallsTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        );

        // SOS Call Status Pie Chart
        const sosCallStatusData = [
          { name: 'Closed', value: vehicleAlertStats.sos_calls.by_status.closed || 0 },
          { name: 'Pending', value: vehicleAlertStats.sos_calls.by_status.pending || 0 }
        ];

        charts.push(
          <Grid item xs={12} md={6} key="sos-call-status">
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>SOS Call Status</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={sosCallStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sosCallStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        );

        // Alert Types Distribution Bar Chart
        const alertTypesData = Object.entries(vehicleAlertStats.alerts.by_type || {}).map(([type, count]) => ({
          type,
          count: count || 0
        }));

        charts.push(
          <Grid item xs={12} md={6} key="alert-types">
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Alert Types Distribution</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={alertTypesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        );

        // Broadcast Statistics Bar Chart
        const broadcastData = [
          { name: 'Total', count: vehicleAlertStats.broadcasts.total || 0 },
          { name: 'Closed', count: vehicleAlertStats.broadcasts.total_closed || 0 },
          { name: 'Pending', count: vehicleAlertStats.broadcasts.pending || 0 }
        ];

        charts.push(
          <Grid item xs={12} md={6} key="broadcast-stats">
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Broadcast Statistics</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={broadcastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        );

        // Alert Timeline Bar Chart
        const alertTimelineData = [
          { period: 'Daily', alerts: vehicleAlertStats.alerts.daily || 0 },
          { period: 'Weekly', alerts: vehicleAlertStats.alerts.weekly || 0 },
          { period: 'Monthly', alerts: vehicleAlertStats.alerts.monthly || 0 },
          { period: 'Yearly', alerts: vehicleAlertStats.alerts.yearly || 0 }
        ];

        charts.push(
          <Grid item xs={12} md={6} key="alert-timeline">
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Alert Timeline</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={alertTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="alerts" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        );
      }
    }

    return charts;
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`dashboard-tabpanel-${index}`}
        aria-labelledby={`dashboard-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  const mar = "100px";

  const DashboardView = ({ role }) => {
    // Add check for restricted roles
    const webRestrictedRoles = ["police_ex", "ambulance_ex"];
    if (webRestrictedRoles.includes(role)) {
      return (
        <Card
          sx={{
            maxWidth: 600,
            margin: '40px auto',
            padding: '32px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: '16px'
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              sx={{
                color: '#e74c3c',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {t('dashboard.accessRestricted')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              {t('dashboard.mobileAccessOnly')}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Box>
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Dashboard Overview" />
            <Tab label="Analytics & Charts" />
            {isSuperAdmin && <Tab label="Custom Reports Builder" />}
          </Tabs>
        </Box>

        {/* Dashboard Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          {renderDashboardContent(role)}
        </TabPanel>

        {/* Analytics & Charts Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>Analytics & Charts</Typography>
              <Typography variant="body1" color="textSecondary">
                Visual representation of your dashboard data
              </Typography>
            </Box>
            
            {/* Date Filter for SOS Admin */}
            {(role === 'sosadmin' || role === 'teamlead') && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', backgroundColor: 'background.paper', p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={sosAdminStartDate}
                  onChange={(e) => setSosAdminStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={sosAdminEndDate}
                  onChange={(e) => setSosAdminEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => fetchSOSData(sosAdminStartDate, sosAdminEndDate)}
                >
                  Generate Report
                </Button>
              </Box>
            )}
          </Box>

          {/* Dashboard Charts Grid */}
          <Grid container spacing={3}>
            {renderDashboardCharts(role)}

            {renderDashboardCharts(role).length === 0 && (
              <Grid item xs={12}>
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <ChartIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No chart data available
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Charts will appear here once dashboard data is loaded
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {isSuperAdmin && (
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' } }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" gutterBottom>
                        Custom Report Builder
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Drag items from the palette to craft bespoke dashboards with metrics, charts, and formulas.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <TextField
                        label="Report Title"
                        value={reportBuilderState.reportTitle}
                        onChange={handleReportTitleChange}
                        size="small"
                      />
                      <Button variant="outlined" onClick={handleTogglePreview} startIcon={reportBuilderState.previewMode ? <VisibilityOff /> : <Visibility />}>
                        {reportBuilderState.previewMode ? 'Exit Preview' : 'Preview'}
                      </Button>
                      <Button variant="outlined" onClick={handleExportJson} startIcon={<ContentCopy />}>
                        Export JSON
                      </Button>
                      <Button variant="outlined" color="error" onClick={handleClearCanvas} startIcon={<DeleteIcon />}>
                        Clear Canvas
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Palette
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Drag into the canvas or click to add ready-made widgets.
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Grid container spacing={2}>
                            {paletteItems.map((item) => (
                              <Grid item xs={12} key={item.type}>
                                <Paper
                                  elevation={reportBuilderState.previewMode ? 0 : 1}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px dashed',
                                    borderColor: 'grey.300',
                                    backgroundColor: reportBuilderState.previewMode ? 'grey.100' : 'background.paper',
                                    opacity: reportBuilderState.previewMode ? 0.6 : 1,
                                    cursor: reportBuilderState.previewMode ? 'not-allowed' : 'grab'
                                  }}
                                  draggable={!reportBuilderState.previewMode}
                                  onDragStart={(event) => !reportBuilderState.previewMode && handlePaletteDragStart(event, item.type)}
                                  onClick={() => !reportBuilderState.previewMode && handleAddItem(item.type)}
                                >
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {item.title}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {item.description}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                      <Card variant="outlined" sx={{ mt: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1">Available Fields</Typography>
                            <MuiTooltip title="Click a field to copy its token">
                              <IconButton size="small">
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </MuiTooltip>
                          </Box>
                          <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            value={fieldSearchTerm}
                            onChange={handleFieldSearchChange}
                            sx={{ mb: 2 }}
                          />
                          <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                            {filteredFieldEntries.length === 0 ? (
                              <Typography variant="body2" color="textSecondary">
                                No matching fields.
                              </Typography>
                            ) : (
                              filteredFieldEntries.map(([path, value]) => (
                                <Paper
                                  key={path}
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    mb: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: 'grey.100'
                                    }
                                  }}
                                  onClick={() => handleCopyFieldToken(path)}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {path}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {formatNumber(value)}
                                  </Typography>
                                </Paper>
                              ))
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={canvasGridColumns}>
                      <Box
                        onDragOver={handleCanvasDragOver}
                        onDrop={handleCanvasDrop}
                        sx={{
                          minHeight: 400,
                          p: 2,
                          border: '2px dashed',
                          borderColor: reportBuilderState.canvasItems.length ? 'primary.light' : 'grey.400',
                          borderRadius: 2,
                          backgroundColor: 'grey.50',
                          position: 'relative'
                        }}
                      >
                        {reportBuilderState.canvasItems.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="textSecondary">
                              {reportBuilderState.previewMode ? 'Preview mode active.' : 'Drag items here to start building your report.'}
                            </Typography>
                          </Box>
                        ) : (
                          <Grid container spacing={2}>
                            {reportBuilderState.canvasItems.map((item) => {
                              const isSelected = reportBuilderState.selectedItemId === item.id;
                              return (
                                <Grid item xs={12} key={item.id}>
                                  <Paper
                                    elevation={isSelected ? 4 : 1}
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      position: 'relative',
                                      border: isSelected ? '2px solid' : '1px solid',
                                      borderColor: isSelected ? 'primary.main' : 'grey.200',
                                      cursor: reportBuilderState.previewMode ? 'default' : 'pointer'
                                    }}
                                    onClick={() => !reportBuilderState.previewMode && handleSelectCanvasItem(item.id)}
                                  >
                                    {!reportBuilderState.previewMode && (
                                      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                                        <MuiTooltip title="Move Up">
                                          <span>
                                            <IconButton
                                              size="small"
                                              disabled={reportBuilderState.previewMode}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleMoveItem(item.id, -1);
                                              }}
                                            >
                                              <KeyboardArrowUp fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </MuiTooltip>
                                        <MuiTooltip title="Move Down">
                                          <span>
                                            <IconButton
                                              size="small"
                                              disabled={reportBuilderState.previewMode}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleMoveItem(item.id, 1);
                                              }}
                                            >
                                              <KeyboardArrowDown fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </MuiTooltip>
                                        <MuiTooltip title="Duplicate">
                                          <span>
                                            <IconButton
                                              size="small"
                                              disabled={reportBuilderState.previewMode}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleDuplicateItem(item.id);
                                              }}
                                            >
                                              <ContentCopy fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </MuiTooltip>
                                        <MuiTooltip title="Delete">
                                          <span>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              disabled={reportBuilderState.previewMode}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleRemoveItem(item.id);
                                              }}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </MuiTooltip>
                                      </Box>
                                    )}
                                    <Typography variant="overline" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                                      {itemLabels[item.type] || 'Unknown'}
                                    </Typography>
                                    {renderCanvasItemContent(item)}
                                  </Paper>
                                </Grid>
                              );
                            })}
                          </Grid>
                        )}
                      </Box>
                    </Grid>

                    {showConfigurationPanel && (
                      <Grid item xs={12} md={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Configuration
                            </Typography>
                            {selectedReportItem ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {selectedReportItem.type === 'text' && (
                                  <>
                                    <TextField
                                      fullWidth
                                      label="Text"
                                      multiline
                                      minRows={3}
                                      maxRows={6}
                                      value={selectedReportItem.text || ''}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { text: event.target.value })}
                                      placeholder="Enter your text here"
                                    />
                                    <TextField
                                      fullWidth
                                      label="Variant"
                                      select
                                      value={selectedReportItem.variant || 'h5'}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { variant: event.target.value })}
                                    >
                                      {['h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'].map((variant) => (
                                        <MenuItem key={variant} value={variant}>
                                          {variant}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    <TextField
                                      fullWidth
                                      label="Align"
                                      select
                                      value={selectedReportItem.align || 'left'}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { align: event.target.value })}
                                    >
                                      {['left', 'center', 'right', 'justify'].map((align) => (
                                        <MenuItem key={align} value={align}>
                                          {align}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </>
                                )}

                                {selectedReportItem.type === 'metric' && (
                                  <>
                                    <TextField
                                      fullWidth
                                      label="Label"
                                      value={selectedReportItem.label || ''}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { label: event.target.value })}
                                      placeholder="e.g., Total Vehicles"
                                    />
                                    <TextField
                                      fullWidth
                                      label="Data Field"
                                      select
                                      value={selectedReportItem.dataField || ''}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { dataField: event.target.value })}
                                    >
                                      <MenuItem value="">
                                        <em>Select field</em>
                                      </MenuItem>
                                      {Object.keys(numericFields).map((path) => (
                                        <MenuItem key={path} value={path}>
                                          {path}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <TextField
                                        fullWidth
                                        label="Prefix"
                                        value={selectedReportItem.prefix || ''}
                                        onChange={(event) => handleItemChange(selectedReportItem.id, { prefix: event.target.value })}
                                        placeholder="e.g., $"
                                      />
                                      <TextField
                                        fullWidth
                                        label="Suffix"
                                        value={selectedReportItem.suffix || ''}
                                        onChange={(event) => handleItemChange(selectedReportItem.id, { suffix: event.target.value })}
                                        placeholder="e.g., %"
                                      />
                                    </Box>
                                    <TextField
                                      fullWidth
                                      label="Precision (Decimal Places)"
                                      type="number"
                                      inputProps={{ min: 0, max: 10 }}
                                      value={selectedReportItem.precision ?? 0}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { precision: Number(event.target.value) })}
                                    />
                                    <TextField
                                      fullWidth
                                      label="Color"
                                      select
                                      value={selectedReportItem.color || 'primary'}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { color: event.target.value })}
                                    >
                                      <MenuItem value="primary">Primary (Blue)</MenuItem>
                                      <MenuItem value="secondary">Secondary (Purple)</MenuItem>
                                      <MenuItem value="success">Success (Green)</MenuItem>
                                      <MenuItem value="error">Error (Red)</MenuItem>
                                      <MenuItem value="warning">Warning (Orange)</MenuItem>
                                      <MenuItem value="info">Info (Cyan)</MenuItem>
                                    </TextField>
                                  </>
                                )}

                                {selectedReportItem.type === 'chart' && (
                                  <>
                                    <TextField
                                      fullWidth
                                      label="Title"
                                      value={selectedReportItem.title || ''}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { title: event.target.value })}
                                      placeholder="e.g., Sales Performance"
                                    />
                                    <TextField
                                      fullWidth
                                      label="Chart Type"
                                      select
                                      value={selectedReportItem.chartType || 'bar'}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { chartType: event.target.value })}
                                    >
                                      <MenuItem value="bar">Bar Chart</MenuItem>
                                      <MenuItem value="line">Line Chart</MenuItem>
                                      <MenuItem value="pie">Pie Chart</MenuItem>
                                    </TextField>
                                    <TextField
                                      fullWidth
                                      label="Data Fields (Select multiple)"
                                      select
                                      SelectProps={{ multiple: true }}
                                      value={selectedReportItem.dataFields || []}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { dataFields: event.target.value })}
                                    >
                                      {Object.keys(numericFields).map((path) => (
                                        <MenuItem key={path} value={path}>
                                          {path}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    <TextField
                                      fullWidth
                                      label="Show Legend"
                                      select
                                      value={selectedReportItem.showLegend ? 'true' : 'false'}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { showLegend: event.target.value === 'true' })}
                                    >
                                      <MenuItem value="true">Yes</MenuItem>
                                      <MenuItem value="false">No</MenuItem>
                                    </TextField>
                                  </>
                                )}

                                {selectedReportItem.type === 'formula' && (
                                  <>
                                    <TextField
                                      fullWidth
                                      label="Title"
                                      value={selectedReportItem.title || ''}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { title: event.target.value })}
                                      placeholder="e.g., Growth Rate"
                                    />
                                    <TextField
                                      fullWidth
                                      label="Expression"
                                      multiline
                                      minRows={3}
                                      maxRows={6}
                                      value={selectedReportItem.expression || ''}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { expression: event.target.value })}
                                      helperText="Use {{metric.path}} placeholders and math operations. Example: {{vehicles.total}} / {{devices.online}} * 100"
                                      placeholder="e.g., {{metric1}} + {{metric2}} * 2"
                                    />
                                    <TextField
                                      fullWidth
                                      label="Precision (Decimal Places)"
                                      type="number"
                                      inputProps={{ min: 0, max: 10 }}
                                      value={selectedReportItem.precision ?? 2}
                                      onChange={(event) => handleItemChange(selectedReportItem.id, { precision: Number(event.target.value) })}
                                    />
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Select an element to configure its appearance and data bindings.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        )}
      </Box>
    );
  };

  const renderDashboardContent = (role) => {
    switch (role) {
      case "superadmin":
        return (
          <div>
            <Grid container spacing={2} marginBottom={mar}>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label={t('dashboard.widgets.total_state_admin,sos_admin,m2m_service_provider,manufacturer,dealer,vehicle_owner')}
                  cardValue={userInfoForAdmin}
                  iconImage={User}
                  heading={t('dashboard.headings.userStatistics')}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label={t('dashboard.widgets.devices_fitted,online_device,offline_device')}
                  cardValue={fitmentInfoForAdmin}
                  iconImage={Fitment}
                  heading={t('dashboard.headings.fitmentStatistics')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #66ccff 0%, #3399ff 100%)"
                  label={t('dashboard.widgets.total_alerts,alerts_this_month,alerts_today')}
                  cardValue={totalAlertInfo}
                  iconImage={Alert}
                  heading={t('dashboard.headings.totalAlert')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label={t('dashboard.widgets.total_alerts,alerts_this_month,alerts_today')}
                  cardValue={overSpeedInfo}
                  iconImage={Overspeed}
                  heading={t('dashboard.headings.overSpeeding')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label={t('dashboard.widgets.total_alerts,alerts_this_month,alerts_today')}
                  cardValue={emergencyInfo}
                  iconImage={Bell}
                  heading={t('dashboard.headings.emergencyAlert')}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label={t('dashboard.widgets.total_temper,temper_this_month,temper_today')}
                  cardValue={temperAlertInfo}
                  iconImage={Alert}
                  heading={t('dashboard.headings.temperAlert')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Stock, Tagged Device, Unassigned"
                  cardValue={stockInfo}
                  iconImage={Stock}
                  heading="Device Stock Information"
                />
              </Grid>
            </Grid>
          </div>
        );
      case "stateadmin":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="DTO, M2M Service Provider, Manufacturer, Dealer, Vehicle Owner"
                cardValue={userInfo}
                iconImage={User}
                heading={t('dashboard.headings.userInfo')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Devices Fitted, Online Device, Offline Device, Inactive for 7 days, Inactive for 30 days"
                cardValue={fitmentInfo}
                iconImage={Fitment}
                heading={t('dashboard.headings.fitmentStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.overSpeeding')}
                cardValue={overSpeedInfo}
                iconImage={Overspeed}
                heading={t('dashboard.headings.overSpeeding')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.emergencyAlert')}
                cardValue={emergencyInfo}
                iconImage={Bell}
                heading={t('dashboard.headings.emergencyAlert')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.harshBreakAlert')}
                cardValue={harshBreakInfo}
                iconImage={Brake}
                heading={t('dashboard.headings.harshBreakAlert')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.suddenTurnAlert')}
                cardValue={suddenBreakInfo}
                iconImage={Suddenturn}
                heading={t('dashboard.headings.suddenTurnAlert')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="District, Active"
                cardValue={districtInfo}
                iconImage={state}
                heading="District Information"
              />
            </Grid>
          </Grid>
        );
      case "dealer":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Assigned, Available for Fitment, Returned, Faulty"
                cardValue={{
                  assigned: dealerDeviceInfo.assigned || 0,
                  availableForFitment: dealerDeviceInfo.freeDevice || 0,
                  returned: dealerDeviceInfo.returned || 0,
                  faulty: dealerDeviceInfo.faulty || 0
                }}
                iconImage={Stock}
                heading={t('dashboard.headings.stockStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment"
                cardValue={{
                  total: dealerFitmentInfo.total || 0,
                }}
                iconImage={Fitment}
                heading={t('dashboard.headings.fitmentStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label="Total Stock, Tagged, Online Device, Offline Device, Online today, Offline 7 days, Offline 30 days"
                cardValue={{
                  stocked: dealerDeviceInfo.stocked || 0,
                  tagged: dealerFitmentInfo.taggedDevice || 0,
                  online: dealerFitmentInfo.onlineDevice || 0,
                  offline: dealerFitmentInfo.offlineDevice || 0,
                  onlineToday: deviceStatusInfo.onlineToday || 0,
                  sevenDaysOffline: deviceStatusInfo.sevenDaysOffline || 0,
                  thirtyDaysOffline: deviceStatusInfo.thirtyDaysOffline || 0
                }}
                iconImage={Car}
                heading={t('dashboard.headings.deviceStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.eSIMStatistics')}
                cardValue={{
                  totalActivation: dealerESIMInfo.totalActivation,
                  activated: dealerESIMInfo.activated,
                  oneYear: dealerESIMInfo.oneYearRenewal,
                  twoYear: dealerESIMInfo.twoYearRenewal,
                  expired: dealerESIMInfo.expired
                }}
                iconImage={Sim}
                heading={t('dashboard.headings.eSIMStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.vehicleOwner')}
                cardValue={dealerVehicleOwnerInfo}
                iconImage={User}
                heading={t('dashboard.headings.vehicleOwner')}
              />
            </Grid>
          </Grid>
        );
      case "owner":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.alertStatistics')}
                cardValue={{
                  alert: ownerDashboardInfo.alert,
                  monthlyAlert: ownerDashboardInfo.monthlyAlert,
                  dailyAlert: ownerDashboardInfo.dailyAlert
                }}
                iconImage={Alert}
                heading={t('dashboard.headings.alertStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.ownerVehicleStatus')}
                cardValue={{
                  total: ownerDashboardInfo.vehicles,
                  ignitionOn: ownerDashboardInfo.movingVehicles + ownerDashboardInfo.idleVehicles,
                  ignitionOff: ownerDashboardInfo.stoppedVehicles
                }}
                iconImage={Vehicle}
                heading={t('dashboard.headings.ownerVehicleStatus')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.ownerHealthStatistics')}
                cardValue={{
                  vehicles: ownerDashboardInfo.vehicles,
                  onlineDevice: ownerDashboardInfo.onlineDevice,
                  offlineDevice: ownerDashboardInfo.offlineDevice,
                  sevenDaysOffline: ownerDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline: ownerDashboardInfo.thirtyDaysOffline,
                }}
                iconImage={Car}
                heading={t('dashboard.headings.ownerHealthStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.ownerSOSStatistics')}
                cardValue={{
                  sosCalls: ownerDashboardInfo.sosCalls,
                  genuineCalls: ownerDashboardInfo.genuineCalls,
                  fakeCalls: ownerDashboardInfo.fakeCalls
                }}
                iconImage={Bell}
                heading={t('dashboard.headings.ownerSOSStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.ownerDriverBehaviour')}
                cardValue={{
                  harshBreaking: ownerDashboardInfo.harshBreaking,
                  suddenTurn: ownerDashboardInfo.suddenTurn,
                  overSpeeding: ownerDashboardInfo.overSpeeding
                }}
                iconImage={Driver}
                heading={t('dashboard.headings.ownerDriverBehaviour')}
              />
            </Grid>
          </Grid>
        );
      case "dtorto":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.alertStatistics')}
                cardValue={{
                  alert: dtoDashboardInfo.alert,
                  monthlyAlert: dtoDashboardInfo.monthlyAlert,
                  dailyAlert: dtoDashboardInfo.dailyAlert
                }}
                iconImage={Alert}
                heading={t('dashboard.headings.alertStatistics')}
              />
            </Grid>


            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.dtoHealthStatistics')}
                cardValue={{
                  vehicles: dtoDashboardInfo.vehicles,
                  onlineDevice: dtoDashboardInfo.onlineDevice,
                  offlineDevice: dtoDashboardInfo.offlineDevice,
                  sevenDaysOffline: dtoDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline: dtoDashboardInfo.thirtyDaysOffline
                }}
                iconImage={Car}
                heading={t('dashboard.headings.dtoHealthStatistics')}
              />
            </Grid>


          </Grid>
        );
      case "devicemanufacture":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.manufacturerStockStatistics')}
                cardValue={{
                  created: manufacturerDashboardInfo.Total_Stock_Created,
                  allocated: manufacturerDashboardInfo.Total_Stock_Allocated,
                  returned: manufacturerDashboardInfo.Total_Return,
                  faulty: manufacturerDashboardInfo.Total_Faulty
                }}
                iconImage={Stock}
                heading={t('dashboard.headings.stockStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.manufacturerModelStatistics')}
                cardValue={{
                  model: manufacturerDashboardInfo.Total_Model,
                  esimLinked: manufacturerDashboardInfo.Total_esim_linked
                }}
                iconImage={Model}
                heading={t('dashboard.headings.modelStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.manufacturerDeviceStatistics')}
                cardValue={{
                  totalStock: manufacturerDashboardInfo.Total_Stock_Created,
                  assignedToDealers: manufacturerDashboardInfo.Total_Stock_Allocated,
                  tagged: manufacturerDashboardInfo.Total_Activation,
                  onlineToday: manufacturerDashboardInfo.Total_Online_Device,
                  offline7day: manufacturerDashboardInfo.Total_Offline_Device_7day,
                  offline30day: manufacturerDashboardInfo.Total_Offline_Device_30day
                }}
                iconImage={Car}
                heading={t('dashboard.headings.deviceStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.manufacturereSIMStatistics')}
                cardValue={{
                  m2mServiceProvider: manufacturerDashboardInfo.Total_esim_linked,
                  eSimActivationRequest: manufacturerDashboardInfo.Total_esim_activation_request,
                  eSimActivated: manufacturerDashboardInfo.ESim_Activated,
                  oneYearRenewal: manufacturerDashboardInfo.Total_1year_renewal_request,
                  twoYearRenewal: manufacturerDashboardInfo.Total_2year_renewal_request,
                  expired: manufacturerDashboardInfo.Total_expired_device
                }}
                iconImage={Sim}
                heading={t('dashboard.headings.eSIMStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #66ccff 0%, #3399ff 100%)"
                label={t('dashboard.labels.manufacturerUserStatistics')}
                cardValue={{
                  totalDealers: manufacturerDashboardInfo.Total_Dealer,
                  inactiveDealers: manufacturerDashboardInfo.Total_Inactive_Dealer,
                  totalVehicleOwners: manufacturerDashboardInfo.Total_Vehicle_Owner,
                  expiredVehicleOwners: manufacturerDashboardInfo.Total_Expired_Vehicle_Owner
                }}
                iconImage={User}
                heading={t('dashboard.headings.userInfo')}
              />
            </Grid>
          </Grid>
        );
      case 'esimprovider':
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={`${t('dashboard.labels.esimDevices.totalDevices')},${t('dashboard.labels.esimDevices.validated')},${t('dashboard.labels.esimDevices.active')},${t('dashboard.labels.esimDevices.expired')}`}
                cardValue={{
                  total: eSIMInfo.totalDevicesWithESim || 0,
                  validated: eSIMInfo.validated || 0,
                  active: eSIMInfo.active || 0,
                  expired: eSIMInfo.expired || 0
                }}
                iconImage={Sim}
                heading={t('dashboard.headings.esimDeviceStatus')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={`${t('dashboard.labels.activationStatus.requestsSent')},${t('dashboard.labels.activationStatus.confirmed')},${t('dashboard.labels.activationStatus.rejected')},${t('dashboard.labels.activationStatus.expiringSoon')}`}
                cardValue={{
                  sent: eSIMActivationInfo.activationRequestSent || 0,
                  confirmed: eSIMActivationInfo.activationConfirmed || 0,
                  rejected: eSIMActivationInfo.activationRejected || 0,
                  expiring: eSIMActivationInfo.expiringSoon || 0
                }}
                iconImage={Bell}
                heading={t('dashboard.headings.activationStatus')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #ff6600 0%, #ffcc66 100%)"
                label="Pending,Invalid,Total Devices"
                cardValue={{
                  pending: eSIMInfo.pending || 0,
                  invalid: eSIMInfo.invalid || 0,
                  total: eSIMInfo.totalDevicesWithESim || 0
                }}
                iconImage={Sim}
                heading="M2M Status Overview"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #00C49F 0%, #82ca9d 100%)"
                label="Today,This Week,This Month"
                cardValue={{
                  today: eSIMActivationInfo.todayRequests || 0,
                  week: eSIMActivationInfo.weeklyRequests || 0,
                  month: eSIMActivationInfo.monthlyRequests || 0
                }}
                iconImage={Activation}
                heading="Activation Requests Timeline"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #8884d8 0%, #82ca9d 100%)"
                label="Company,State,Created Date,Expiry Date"
                cardValue={{
                  company: providerInfo.company || '-',
                  state: providerInfo.state || '-',
                  createdDate: providerInfo.createdDate || '-',
                  expiryDate: providerInfo.expiryDate || '-'
                }}
                iconImage={User}
                heading="Provider Information"
              />
            </Grid>



            {/* Added eSIM statistics widget */}
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.esimproviderStatistics')}
                cardValue={{
                  manufactures: eSIMInfo.manufactures || 0,
                  activationReceived: eSIMInfo.activationReceived || 0,
                  activated: eSIMInfo.activated || 0,
                  oneYear: eSIMInfo.oneYearActivation || 0,
                  twoYears: eSIMInfo.twoYearsActivation || 0,
                  expired: eSIMInfo.expiredEsim || 0
                }}
                iconImage={Sim}
                heading={t('dashboard.headings.eSIMStatistics')}
              />
            </Grid>
          </Grid>
        );
      case "sosadmin":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.sosUsers')}
                cardValue={sosUsers}
                iconImage={UserImage}
                heading={t('dashboard.headings.sosUsers')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total,This month,Today"
                cardValue={{
                  total: vehicleAlertStats.sos_calls.total,
                  thisMonth: vehicleAlertStats.sos_calls.monthly,
                  today: vehicleAlertStats.sos_calls.daily
                }}
                iconImage={OnCall}
                heading="SOS Calls"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label="Total, This month, Today"
                cardValue={{
                  total: fakeCall.Total_Fake_Calls,
                  monthly: fakeCall.Total_Fake_Calls_thismonth,
                  today: fakeCall.Total_Fake_Calls_today
                }}
                iconImage={FakeCall}
                heading={t('dashboard.headings.fakeCalls')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #8884d8 0%, #82ca9d 100%)"
                label="Closed,Pending"
                cardValue={{
                  closed: vehicleAlertStats.sos_calls.by_status.closed,
                  pending: vehicleAlertStats.sos_calls.by_status.pending
                }}
                iconImage={OnCall}
                heading="SOS Today"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #FFBB28 0%, #ffc658 100%)"
                label="Total Broadcast, Total Closed, Broadcast Today, Closed Today, Pending Today"
                cardValue={{
                  total: vehicleAlertStats.broadcasts.total,
                  closed: vehicleAlertStats.broadcasts.total_closed,
                  today: vehicleAlertStats.broadcasts.broadcast_today,
                  closedToday: vehicleAlertStats.broadcasts.closed_today,
                  pendingToday: vehicleAlertStats.broadcasts.pending_today
                }}
                iconImage={Alert}
                heading="Broadcast Statistics"
              />
            </Grid>
          </Grid>
        );
      case "teamlead":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.users')}
                cardValue={teamForLead}
                iconImage={UserImage}
                heading={t('dashboard.headings.users')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.calls')}
                cardValue={calls}
                iconImage={OnCall}
                heading={t('dashboard.headings.calls')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.fakeCalls')}
                cardValue={fakeCall}
                iconImage={FakeCall}
                heading={t('dashboard.headings.fakeCalls')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.incomingCalls')}
                cardValue={incomingCall}
                iconImage={IncomingC}
                heading={t('dashboard.headings.incomingCalls')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.rejectedCalls')}
                cardValue={callRejection}
                iconImage={Rejection}
                heading={t('dashboard.headings.rejectedCalls')}
              />
            </Grid>
          </Grid>
        );
      case "desk_ex":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.callAssignment')}
                cardValue={assignment}
                iconImage={Assignment}
                heading={t('dashboard.headings.callAssignment')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.falseAssignment')}
                cardValue={falseAssignment}
                iconImage={FalseAssignment}
                heading={t('dashboard.headings.falseAssignment')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.closedAssignment')}
                cardValue={closedAssignment}
                iconImage={DoneAssignment}
                heading={t('dashboard.headings.closedAssignment')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.rejected')}
                cardValue={rejectedAssignment}
                iconImage={RejectedAssignment}
                heading={t('dashboard.headings.rejected')}
              />
            </Grid>
          </Grid>
        );
      default:
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: '4rem',
                color: 'error.main',
                mb: 2
              }}
            />
            <Typography
              variant="h4"
              color="error"
              align="center"
              sx={{
                fontWeight: 500,
                mb: 1
              }}
            >
              {t('dashboard.noDashboardAvailable')}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <>
      {userRoles === 'teamlead' || userRoles === 'desk_ex' ? (
        <SOSDashboard role={userRoles} calls={calls} deskCalls={{
          Total_Assignemnt_today: assignment.Total_Assignemnt_today,
          Total_Assignemnt: assignment.Total_Assignemnt,
          averageTime: avgAcceptance,
          Total_Assignemnt_thisweek: assignment.Total_Assignemnt_thisweek
        }} />
      ) : (
        <DashboardView role={userRoles} />
      )}
    </>

  );
};

export default ActiveState;
