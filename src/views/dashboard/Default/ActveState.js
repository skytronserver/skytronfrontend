import { useEffect, useState } from "react";
import React from "react";
import { Grid,Card, CardContent,Typography, Box, Fab, Tabs, Tab, Button } from "@mui/material";
import { Add as AddIcon, BarChart as ChartIcon } from "@mui/icons-material";
import Widget from "./Widget";
import UserServices from "../../../services/UserServices";
import { lazy } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
const SOSDashboard=lazy(()=>import("../../direct/SOSDashboard"))
const ActiveState = () => {
  const { t } = useTranslation();
  const [userInfo,setUserInfo]=useState(dashboardInitialState.userInfo);
  const [fitmentInfo,setFitmentInfo]=useState(dashboardInitialState.fitmentInfo);
  const [dealerFitmentInfo,setDealerFitmentInfo]=useState(dashboardInitialState.dealerFitmentInfo);
  const [dealerDeviceInfo,setDealerDeviceInfo]=useState(dashboardInitialState.dealerDeviceInfo);
  const [eSIMInfo,setESIMInfo]=useState(dashboardInitialState.eSIMInfo);
  const [eSIMActivationInfo,setESIMActivationInfo]=useState(dashboardInitialState.eSIMActivationInfo);
  const [deviceStatusInfo,setDeviceStatusInfo]=useState(dashboardInitialState.deviceStatusInfo);
  const [deviceHealthInfo,setDeviceHealthInfo]=useState(dashboardInitialState.deviceHealthInfo);
  const [overSpeedInfo,setOverSpeedInfo]=useState(dashboardInitialState.alertInfo);
  const [emergencyInfo,setEmergencyInfo]=useState(dashboardInitialState.alertInfo);
  const [harshBreakInfo,setHarshBreakInfo]=useState(dashboardInitialState.alertInfo);
  const [suddenBreakInfo,setSuddenBreakInfo]=useState(dashboardInitialState.alertInfo);
  const [miscInfo,setMiscInfo]=useState(dashboardInitialState.miscInfo);
  const [modelInfo,setModelInfo]=useState(dashboardInitialState.modelInfo);
  const [ownerDashboardInfo,setOwnerDashboardInfo]=useState(dashboardInitialState.userDashboardInfo);
  const [fitmentInfoForAdmin,setFitmentInfoForAdmin]=useState(dashboardInitialState.adminFitmentInfo)
  const [userInfoForAdmin,setUserInfoForAdmin]=useState(dashboardInitialState.userInfoForAdmin)
  const [stateInfo,setStateInfo]=useState(dashboardInitialState.stateInfo);
  const [dtoDashboardInfo,setDtoDashboardInfo]=useState(dashboardInitialState.dtoDashboardInfo)
  const [team,setTeam]=useState(dashboardInitialState.team)
  const [teamForLead,setTeamForLead]=useState(dashboardInitialState.teamForLead)
  const [incomingCall,setIncomingCall]=useState(dashboardInitialState.incomingCall)
  const [fakeCall,setFakeCall]=useState(dashboardInitialState.fakeCall)
  const [callRejection,setCallRejection]=useState(dashboardInitialState.callRejection)
  const [calls,setCalls]=useState(dashboardInitialState.calls)
  const [assignment,setAssignment]=useState(dashboardInitialState.assignment);
  const [closedAssignment,setClosedAssignment]=useState(dashboardInitialState.closedAssignment);
  const [falseAssignment,setFalseAssignment]=useState(dashboardInitialState.falseAssignment);
  const [rejectedAssignment,setRejectedAssignment]=useState(dashboardInitialState.rejectedAssignment);
  const [avgAcceptance,setAvgAcceptance]=useState("");
  
  // Chart-related state
  const [activeTab, setActiveTab] = useState(0);
  
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  useEffect(() => {
    //for owner
    if(userRoles=='dtorto'){
      (async()=>{
        const response=await UserServices.getDTODashboardData();
        const data=await response.data;
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
    if(userRoles=='owner'){
      (async()=>{
        const response=await UserServices.getOwnerDashboard();
        const data=await response.data;
        setOwnerDashboardInfo((prev) => ({
          ...prev,
          deviceActivated: data.Total_Device_Activated,
          vehicles: data.Total_Vehicles,
          onlineDevice: data.Total_Online_Device,
          offlineDevice: data.Total_Offline_Device_today,
          sevenDaysOffline: data.Total_Offline_Device_7day,
          thirtyDaysOffline: data.Total_Offline_Device_30day,
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
    if(userRoles=='esimprovider') {
      (async()=>{
        const response = await UserServices.getESIMProviderDashboard();
        const data = await response.data.data;
        setESIMInfo(prev=>({
          ...prev,
          totalDevicesWithESim: data.Total_Devices_With_ESim || 0,
          validated: data.ESim_Validated || 0,
          expired: data.ESim_Expired || 0,
          active: data.ESim_Active || 0,
          pending: data.ESim_Pending || 0,
          invalid: data.ESim_Invalid || 0
        }));
        setESIMActivationInfo(prev=>({
          ...prev,
          activationRequestSent: data.ESim_Activation_Req_Sent || 0,
          activationConfirmed: data.ESim_Activation_Confirmed || 0,
          activationRejected: data.ESim_Activation_Rejected || 0,
          expiringSoon: data.ESim_Expiring_Soon_30_Days || 0,
          todayRequests: data.Today_Activation_Requests || 0,
          weeklyRequests: data.This_Week_Activation_Requests || 0,
          monthlyRequests: data.This_Month_Activation_Requests || 0,
        }));
      })();
    }
    //for manufacturer
    if(userRoles=='devicemanufacture'){
      (async()=>{
        const response=await UserServices.getManufacturerDashboard();
        const data=await response.data;
        setESIMInfo(prev=>({
          ...prev,
          totalActivation:data.Total_esim_activation_request,
          oneYearRenewal:data.Total_1year_renewal_request,
          twoYearRenewal:data.Total_2year_renewal_request
        }));
        setDeviceStatusInfo(prev=>({
          ...prev,
          online:data.Total_Online_Device,
          todayOffline:data.Total_Offline_Device_today,
          sevenDaysOffline:data.Total_Offline_Device_7day,
          thirtyDaysOffline:data.Total_Offline_Device_30day,
        }));
        setMiscInfo(prev=>({
          ...prev,
          dealer:data.Total_Dealer,
          allocated:data.Total_Stock_Allocated,
          activation:data.Total_Activation,
          expired:data.Total_expired_device,
        }));
        setModelInfo(prev=>({
          ...prev,
          model:data.Total_Model,
          m2mLinked:data.Total_M2M_linked
        }))
      })();
    }
    //for Dealer
    if(userRoles=='dealer'){
      (async()=>{
        const response=await UserServices.getDealerDashboard();
        const data=await response.data;
        setDealerFitmentInfo(prev=>({
          ...prev,
          total:data.Total_Fitment_done,
          monthly:data.Fitment_month,
          daily:data.Fitment_today,
        }));
        setDealerDeviceInfo(prev=>({
          ...prev,
          assigned:data.Total_Device_Assigned,
          returned:data.Total_Device_Returned,
          stocked:data.Current_Device_stock,
          faulty:data.Current_Device_faulty
        }));
        setESIMInfo(prev=>({
          ...prev,
          totalActivation:data.Total_esim_activation_request,
          oneYearRenewal:data.Total_1_year_renewal_request,
          twoYearRenewal:data.Total_2_year_renewal_request
        }));
        setDeviceStatusInfo(prev=>({
          ...prev,
          online:data.Total_Online_now,
          todayOffline:data.Total_Online_today,
          sevenDaysOffline:data.Total_Offline_7_days,
          thirtyDaysOffline:data.Total_Offline_30_days,
        }))
      })();
    }
    //only for superAdmin
    if(userRoles=='superadmin'){
      (async()=>{
        const response=await UserServices.getDashboardUserData();
        const res=await UserServices.getDashboardData();
        const dashboardData=await res.data;
        const data=await response.data;
        setUserInfoForAdmin(prev=>({
          ...prev,
          stateUser:data.state_admin,
          eSimUser:data.eSimProvider,
          manufacturer:data.manufacturer_admin,
          sosAdmin:data.SOS_admin
        }))
        setFitmentInfoForAdmin((prev=>({
          ...prev,
          fitted:dashboardData.TotalDevice,
          toggedDevice:dashboardData.TotalTaggedDevice,
          onlineDevice:dashboardData.TotalOnlineDevice,
          offlineDevice:dashboardData.TotalOfflineDevice,
        })))
        setEmergencyInfo(prev=>({
          ...prev,
          totalAlert:dashboardData.TotalAlerts,
          thisMonthAlert:dashboardData.TotalAlerts_month,
          todayAlert:dashboardData.TotalAlerts_today
        })) 
        setOverSpeedInfo(prev=>({
          ...prev,
          totalAlert:dashboardData.SpeedAlerts,
          thisMonthAlert:dashboardData.SpeedAlerts_month,
          todayAlert:dashboardData.SpeedAlerts_today
        }))
        setStateInfo(prev=>({
          ...prev,
          total:dashboardData.Total_States,
          active:dashboardData.Active_States,
          inactive:dashboardData.Inactive_States
        }))
      
      })();
    }
    // for stateAdmin
    if(userRoles=='stateadmin'){
      (async()=>{
        const response=await UserServices.getStateAdminDashboard();
        const data=await response.data;
        setUserInfo(prev=>({
          ...prev,
          dealer:data.Total_Dealer_available,
          manufacturer:data.Total_Manufacture_available,
          dto:data.Total_DTO_available,
          owner:data.Total_Vehicle_Owner_available
        }));
        setFitmentInfo((prev=>({
          ...prev,
          fitted:data.Total_Fit_Device,
          onlineDevice:data.Online_Devices,
          offlineDevice:data.Offline_Devices
        })))
        setDeviceHealthInfo((prev=>({
          ...prev,
          totalActivatedDevice:data.Total_Device_Activated,
          todayActive:data.Active_Device_Today,
          inActiveFor30Days:data.Inactive_Device_30days,
          inActiveFor7Days:data.Inactive_Device_7days
        })))
        setOverSpeedInfo(prev=>({
          ...prev,
          totalAlert:data.Total_overspeeding_Alert,
          thisMonthAlert:data.Monthly_overspeeding_Alert,
          todayAlert:data.Today_overspeeding_Alert
        }))
        setEmergencyInfo(prev=>({
          ...prev,
          totalAlert:data.Total_emergency_Alert,
          thisMonthAlert:data.This_month_emergency_Alert,
          todayAlert:data.Today_emergency_Alert
        }))
        setHarshBreakInfo(prev=>({
          ...prev,
          totalAlert:data.Total_harsh_brake_Alert,
          thisMonthAlert:data.This_month_harsh_brake_Alert,
          todayAlert:data.Today_harsh_brake_Alert
        }))
      })();
    }
    if(userRoles==='sosadmin'){
      (async () => {
        const response = await UserServices.getSOSAdminDashboard();
        const data = await response.data;
        setTeam((prev) => ({
          ...prev,
          Total_Teams: data.Total_Teams,
          Total_DeskExecutives: data.Total_DeskExecutives,
          Live_Teams: data.Live_Teams,
          Live_DeskExecutives: data.Live_DeskExecutives,
        }));
        setIncomingCall((prev) => ({
          ...prev,
          Total_Incoming_Calls:data.Total_Incoming_Calls,
          Total_Incoming_Calls_thismonth:data.Total_Incoming_Calls_thismonth,
          Total_Incoming_Calls_thisweek:data.Total_Incoming_Calls_thisweek,
          Total_Incoming_Calls_today:data.Total_Incoming_Calls_today,
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
          Total_Rejected_Assignemnt:data.Total_Rejected_Assignemnt,
          Total_Rejected_Assignemnt_thismonth:data.Total_Rejected_Assignemnt_thismonth,
          Total_Rejected_Assignemnt_thisweek:data.Total_Rejected_Assignemnt_thisweek,
          Total_Rejected_Assignemnt_today:data.Total_Rejected_Assignemnt_today,
        }));

      })();
    }
    if(userRoles==='teamlead'){
      (async () => {
        const response=await UserServices.getSOSLeadDashboard();
        const data = await response.data;
        setTeamForLead((prev) => ({
          ...prev,
          Total_DeskExecutives: data.Total_DeskExecutives,
          Live_DeskExecutives: data.Live_DeskExecutives,
        }));
        setIncomingCall((prev) => ({
          ...prev,
          Total_Incoming_Calls:data.Total_Incoming_Calls,
          Total_Incoming_Calls_thismonth:data.Total_Incoming_Calls_thismonth,
          Total_Incoming_Calls_thisweek:data.Total_Incoming_Calls_thisweek,
          Total_Incoming_Calls_today:data.Total_Incoming_Calls_today,
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
          Total_Rejected_Assignemnt:data.Total_Rejected_Assignemnt,
          Total_Rejected_Assignemnt_thismonth:data.Total_Rejected_Assignemnt_thismonth,
          Total_Rejected_Assignemnt_thisweek:data.Total_Rejected_Assignemnt_thisweek,
          Total_Rejected_Assignemnt_today:data.Total_Rejected_Assignemnt_today,
        }));
        
      })()
    }
    if(userRoles==='desk_ex'){
      (async () => {
        const response=await UserServices.getSOSExeDashboard();
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
          Total_Rejected_Assignemnt_thistmonth:data.Total_Rejected_Assignemnt_thistmonth,
          Total_Rejected_Assignemnt_thisweek:data.Total_Rejected_Assignemnt_thisweek,
          Total_Rejected_Assignemnt_today:data.Total_Rejected_Assignemnt_today,
          Total_Rejected_Assignemnt:data.Total_Rejected_Assignemnt,
        }));
        setAvgAcceptance(data.Average_time_to_Accept);
      })()
    }
  }, []);

  // Simple chart rendering functions for existing dashboard data
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderDashboardCharts = (role) => {
    const charts = [];
    
    if (role === 'superadmin') {
      // User Statistics Pie Chart
      const userStatsData = [
        { name: 'State Admin', value: userInfoForAdmin.stateUser || 0 },
        { name: 'eSIM Provider', value: userInfoForAdmin.eSimUser || 0 },
        { name: 'Manufacturer', value: userInfoForAdmin.manufacturer || 0 },
        { name: 'SOS Admin', value: userInfoForAdmin.sosAdmin || 0 }
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
        { name: 'Tagged', count: fitmentInfoForAdmin.toggedDevice || 0 }
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
        { name: 'Vehicle Owners', value: userInfo.owner || 0 }
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
      // Vehicle Overview Pie Chart
      const vehicleData = [
        { name: 'Total Vehicles', value: ownerDashboardInfo.vehicles || 0 },
        { name: 'Active Devices', value: ownerDashboardInfo.deviceActivated || 0 },
        { name: 'Offline Devices', value: ownerDashboardInfo.offlineDevice || 0 }
      ];
      
      charts.push(
        <Grid item xs={12} md={6} key="vehicle-overview">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Vehicle Overview</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={vehicleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {vehicleData.map((entry, index) => (
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
      // eSIM Status Distribution Pie Chart
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
            <Typography variant="h6" gutterBottom>eSIM Status Distribution</Typography>
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

      // eSIM Activation Trends Bar Chart (All activation data)
      const activationTrendsData = [
        { name: 'Requests Sent', count: eSIMActivationInfo.activationRequestSent || 0 },
        { name: 'Confirmed', count: eSIMActivationInfo.activationConfirmed || 0 },
        { name: 'Rejected', count: eSIMActivationInfo.activationRejected || 0 },
        { name: 'Expiring Soon (30 Days)', count: eSIMActivationInfo.expiringSoon || 0 }
      ];
      
      charts.push(
        <Grid item xs={12} md={6} key="activation-trends">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>eSIM Activation Status</Typography>
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
        { name: 'With eSIM Status', value: (eSIMInfo.validated || 0) + (eSIMInfo.active || 0) + (eSIMInfo.expired || 0) + (eSIMInfo.pending || 0) + (eSIMInfo.invalid || 0) }
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
                <strong>Company:</strong> Gobind PVT LTD
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>State:</strong> Assam
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Status:</strong> Created
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Created Date:</strong> 2025-07-12
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Expiry Date:</strong> 2025-07-12
              </Typography>
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                  Total Devices: {eSIMInfo.totalDevicesWithESim || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Validated eSIMs: {eSIMInfo.validated || 0}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      );

      // Complete eSIM Status Breakdown
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
            <Typography variant="h6" gutterBottom>Complete eSIM Status Breakdown</Typography>
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
        { name: 'Returned', value: dealerDeviceInfo.returned || 0 },
        { name: 'Stocked', value: dealerDeviceInfo.stocked || 0 },
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

      // eSIM Statistics Bar Chart
      const esimStatsData = [
        { name: 'Total with eSIM', count: eSIMInfo.totalDevicesWithESim || 0 },
        { name: 'Validated', count: eSIMInfo.validated || 0 },
        { name: 'Active', count: eSIMInfo.active || 0 },
        { name: 'Expired', count: eSIMInfo.expired || 0 },
        { name: 'Pending', count: eSIMInfo.pending || 0 },
        { name: 'Invalid', count: eSIMInfo.invalid || 0 }
      ];
      
      charts.push(
        <Grid item xs={12} md={6} key="esim-statistics">
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>eSIM Statistics</Typography>
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
          </Tabs>
        </Box>

        {/* Dashboard Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          {renderDashboardContent(role)}
        </TabPanel>

        {/* Analytics & Charts Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>Analytics & Charts</Typography>
            <Typography variant="body1" color="textSecondary">
              Visual representation of your dashboard data
            </Typography>
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
                  label={t('dashboard.widgets.total_state_admin,total_esim_provider,total_manufacturer,total_sos_admin')}
                  cardValue={userInfoForAdmin}
                  iconImage={User}
                  heading={t('dashboard.headings.userStatistics')}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label={t('dashboard.widgets.total_fitment,tagged_device,online_device,offline_device')}
                  cardValue={fitmentInfoForAdmin}
                  iconImage={Fitment}
                  heading={t('dashboard.headings.fitmentStatistics')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label={t('dashboard.widgets.total_alert,this_month,today')}
                  cardValue={overSpeedInfo}
                  iconImage={Overspeed}
                  heading={t('dashboard.headings.overSpeeding')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label={t('dashboard.widgets.total_alert,this_month,today')}
                  cardValue={emergencyInfo}
                  iconImage={Bell}
                  heading={t('dashboard.headings.emergencyAlert')}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label={t('dashboard.widgets.total_state,active,inactive')}
                  cardValue={stateInfo}
                  iconImage={state}
                  heading={t('dashboard.headings.stateDetails')}
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
                label={t('dashboard.widgets.total_dealer,total_manufacturer,total_dto,total_vehicle_owner')}
                cardValue={userInfo}
                iconImage={User}
                heading={t('dashboard.headings.userInfo')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.fitmentStatistics')}
                cardValue={fitmentInfo}
                iconImage={Fitment}
                heading={t('dashboard.headings.fitmentStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.healthStatistics')}
                cardValue={deviceHealthInfo}
                iconImage={Car}
                heading={t('dashboard.headings.healthStatistics')}
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
          </Grid>
        );      
      case "dealer":
        return (
          <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.stockStatistics')}
                cardValue={dealerDeviceInfo}
                iconImage={Stock}
                heading={t('dashboard.headings.stockStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.fitmentStatistics')}
                cardValue={dealerFitmentInfo}
                iconImage={Fitment}
                heading={t('dashboard.headings.fitmentStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.deviceStatistics')}
                cardValue={deviceStatusInfo}
                iconImage={Car}
                heading={t('dashboard.headings.deviceStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.eSIMStatistics')}
                cardValue={eSIMInfo}
                iconImage={Sim}
                heading={t('dashboard.headings.eSIMStatistics')}
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
                label={t('dashboard.labels.vehicleStatistics')}
                cardValue={{
                  vehicles: ownerDashboardInfo.vehicles,
                  deviceActivated: ownerDashboardInfo.deviceActivated,
                  offlineDevice: ownerDashboardInfo.offlineDevice
                }}
                iconImage={Vehicle}
                heading={t('dashboard.headings.vehicleStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.healthStatistics')}
                cardValue={{
                  deviceActivated: ownerDashboardInfo.deviceActivated,
                  offlineDevice: ownerDashboardInfo.offlineDevice,
                  sevenDaysOffline: ownerDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline: ownerDashboardInfo.thirtyDaysOffline,
                }}
                iconImage={Car}
                heading={t('dashboard.headings.healthStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.emergencyAlert')}
                cardValue={{
                  sosCalls: ownerDashboardInfo.sosCalls,
                  genuineCalls: ownerDashboardInfo.genuineCalls,
                  fakeCalls: ownerDashboardInfo.fakeCalls
                }}
                iconImage={Bell}
                heading={t('dashboard.headings.emergencyAlert')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.driverBehaviour')}
                cardValue={{
                  harshBreaking: ownerDashboardInfo.harshBreaking,
                  suddenTurn: ownerDashboardInfo.suddenTurn,
                  overSpeeding: ownerDashboardInfo.overSpeeding
                }}
                iconImage={Driver}
                heading={t('dashboard.headings.driverBehaviour')}
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
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.vehicleStatistics')}
                cardValue={{
                  vehicles: dtoDashboardInfo.vehicles,
                  device: dtoDashboardInfo.activated,
                  inactive: dtoDashboardInfo.offlineDevice
                }}
                iconImage={Fitment}
                heading={t('dashboard.headings.vehicleStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.healthStatistics')}
                cardValue={{
                  activated: dtoDashboardInfo.activated,
                  dailyActivations: dtoDashboardInfo.dailyActivations,
                  sevenDaysOffline: dtoDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline:dtoDashboardInfo.thirtyDaysOffline
                }}
                iconImage={Car}
                heading={t('dashboard.headings.healthStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.emergencyAlert')}
                cardValue={{
                  sos: dtoDashboardInfo.sosCalls,
                  genuineCalls: dtoDashboardInfo.genuineCalls,
                  fakeCalls: dtoDashboardInfo.fakeCalls
                }}
                iconImage={Bell}
                heading={t('dashboard.headings.emergencyAlert')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label={t('dashboard.labels.activationStatistics')}
                cardValue={{
                  activated: dtoDashboardInfo.activated,
                  monthly: dtoDashboardInfo.monthlyActivations,
                  dailyActivations: dtoDashboardInfo.dailyActivations
                }}
                iconImage={Activation}
                heading={t('dashboard.headings.activationStatistics')}
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
                label={t('dashboard.labels.stockStatistics')}
                cardValue={miscInfo}
                iconImage={Stock}
                heading={t('dashboard.headings.stockStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label={t('dashboard.labels.modelStatistics')}
                cardValue={modelInfo}
                iconImage={Model}
                heading={t('dashboard.headings.modelStatistics')}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label={t('dashboard.labels.healthStatistics')}
                cardValue={deviceStatusInfo}
                iconImage={Car}
                heading={t('dashboard.headings.healthStatistics')}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label={t('dashboard.labels.eSIMStatistics')}
                cardValue={eSIMInfo}
                iconImage={Sim}
                heading={t('dashboard.headings.eSIMStatistics')}
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
                heading="eSIM Status Overview"
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
                label="Company,State,Status"
                cardValue={{
                  company: "Gobind PVT LTD",
                  state: "Assam", 
                  status: "Created"
                }}
                iconImage={User}
                heading="Provider Information"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff7300 0%, #ffcc66 100%)"
                label="Created Date,Expiry Date"
                cardValue={{
                  created: "2025-07-12",
                  expiry: "2025-07-12"
                }}
                iconImage={Alert}
                heading="Provider Dates"
              />
            </Grid>
          </Grid>
        );
      case "sosadmin":
      case "teamlead":
        return (
          <Grid container spacing={2} marginBottom={mar}>
          <Grid item xs={12} sm={12} md={6} lg={4}>
          {role === "sosadmin" ? (
            <Widget
              cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
              label={t('dashboard.labels.usersTeams')}
              cardValue={team}
              iconImage={UserImage}
              heading={t('dashboard.headings.usersTeams')}
            />
          ):(
            <Widget
              cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
              label={t('dashboard.labels.users')}
              cardValue={teamForLead}
              iconImage={UserImage}
              heading={t('dashboard.headings.users')}
            />
          )}
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
    {userRoles==='teamlead' || userRoles==='desk_ex' ? (
        <SOSDashboard role={userRoles} calls={calls} deskCalls={{
          Total_Assignemnt_today:assignment.Total_Assignemnt_today,
Total_Assignemnt:assignment.Total_Assignemnt,
averageTime:avgAcceptance,
Total_Assignemnt_thisweek:assignment.Total_Assignemnt_thisweek
        }}/>
    ):(
    <DashboardView role={userRoles} />
  )}
    </>
    
  );
};

export default ActiveState;
