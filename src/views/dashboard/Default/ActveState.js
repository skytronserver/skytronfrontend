import { useEffect, useState } from "react";
import React from "react";
import { Grid,Card, CardContent,Typography, Box } from "@mui/material";
import Widget from "./Widget";
import UserServices from "../../../services/UserServices";
import { lazy } from "react";
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
const SOSDashboard=lazy(()=>import("../../direct/SOSDashboard"))
const ActiveState = () => {
  const [userInfo,setUserInfo]=useState(dashboardInitialState.userInfo);
  const [fitmentInfo,setFitmentInfo]=useState(dashboardInitialState.fitmentInfo);
  const [dealerFitmentInfo,setDealerFitmentInfo]=useState(dashboardInitialState.dealerFitmentInfo);
  const [dealerDeviceInfo,setDealerDeviceInfo]=useState(dashboardInitialState.dealerDeviceInfo);
  const [eSIMInfo,setESIMInfo]=useState(dashboardInitialState.eSIMInfo);
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
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1];

  // Add check for restricted roles
  const webRestrictedRoles = ["police_ex", "ambulance_ex", "PCR", "ACR"];
  const m2mRestrictedRoles = ["esimprovider"];
  
  // For M2M providers, redirect to their main workflow
  useEffect(() => {
    if (m2mRestrictedRoles.includes(userRoles)) {
      window.location.href = '/device/activation-request/pending';
    }
  }, [userRoles]);

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
            <ErrorOutlineIcon 
              sx={{
                fontSize: '64px',
                color: '#e74c3c',
                marginBottom: '16px'
              }}
            />
            
            <Typography 
              variant="h4" 
              sx={{
                color: '#e74c3c',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              Mobile App Access Only
            </Typography>
            
            <Typography 
              variant="body1"
              sx={{
                color: '#666',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              This dashboard is only accessible through your mobile application. 
              Please use the dedicated mobile app to access your dashboard and features.
            </Typography>

            <Typography 
              variant="body2"
              sx={{
                color: '#888',
                marginTop: '24px',
                fontSize: '0.9rem'
              }}
            >
              If you need assistance, please contact your system administrator.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    switch (role) {
      case "superadmin":
        return (
          <div>
            <Grid container spacing={2} marginBottom={mar}>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total State Admin,Total eSim Provider,Total Manufacturer, Total SOS Admin"
                  cardValue={userInfoForAdmin}
                  iconImage={User}
                  heading="User Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Fitment,Tagged Device,Online Device,Offline Device"
                  cardValue={fitmentInfoForAdmin}
                  iconImage={Fitment}
                  heading="Fitment Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label="Total Alert,This Month,Today"
                  cardValue={overSpeedInfo}
                  iconImage={Overspeed}
                  heading="Over Speeding"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total Alert,This month,Today"
                  cardValue={emergencyInfo}
                  iconImage={Bell}
                  heading="Emergency Alert"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total State,Active,Inactive"
                  cardValue={stateInfo}
                  iconImage={state}
                  heading="State Details"
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
                label="Total Dealer,Total Manufacturer,Total DTO, Total Vehicle Owner"
                cardValue={userInfo}
                iconImage={User}
                heading="User Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Online Device,Offline Device"
                cardValue={fitmentInfo}
                iconImage={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                cardValue={deviceHealthInfo}
                iconImage={Car}
                heading="Health Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label="Total Alert,This Month,Today"
                cardValue={overSpeedInfo}
                iconImage={Overspeed}
                heading="Over Speeding"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total Alert,This month,Today"
                cardValue={emergencyInfo}
                iconImage={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Alert,This Month,Today"
                cardValue={harshBreakInfo}
                iconImage={Brake}
                heading="Harsh Break Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Alert,This Month,Today"
                cardValue={suddenBreakInfo}
                iconImage={Suddenturn}
                heading="Sudden Turn Alert"
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
                label="Assigned,Returned,Stocked,Faulty"
                cardValue={dealerDeviceInfo}
                iconImage={Stock}
                heading="Stock Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Fitment this Month,Fitment Today"
                cardValue={dealerFitmentInfo}
                iconImage={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Online, Offline Today, Offline for 7 days, Offline for 30 days"
                cardValue={deviceStatusInfo}
                iconImage={Car}
                heading="Device Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                cardValue={eSIMInfo}
                iconImage={Sim}
                heading="eSIM Statistics"
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
                label="Total Alert,Alert this Month,Alert Today"
                cardValue={{
                  alert: ownerDashboardInfo.alert,
                  monthlyAlert: ownerDashboardInfo.monthlyAlert,
                  dailyAlert: ownerDashboardInfo.dailyAlert
                }}
                iconImage={Alert}
                heading="Alert Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Vehicle,Active Device,Inactive Device"
                cardValue={{
                  vehicles: ownerDashboardInfo.vehicles,
                  deviceActivated: ownerDashboardInfo.deviceActivated,
                  offlineDevice: ownerDashboardInfo.offlineDevice
                }}
                iconImage={Vehicle}
                heading="Vehicle Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                cardValue={{
                  deviceActivated: ownerDashboardInfo.deviceActivated,
                  offlineDevice: ownerDashboardInfo.offlineDevice,
                  sevenDaysOffline: ownerDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline: ownerDashboardInfo.thirtyDaysOffline,
                }}
                iconImage={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total SOS calls,Genuine Calls,Fake calls"
                cardValue={{
                  sosCalls: ownerDashboardInfo.sosCalls,
                  genuineCalls: ownerDashboardInfo.genuineCalls,
                  fakeCalls: ownerDashboardInfo.fakeCalls
                }}
                iconImage={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Today Harsh Breaking,Today Sudden Turn Alert,Today Overspeeding Alert"
                cardValue={{
                  harshBreaking: ownerDashboardInfo.harshBreaking,
                  suddenTurn: ownerDashboardInfo.suddenTurn,
                  overSpeeding: ownerDashboardInfo.overSpeeding
                }}
                iconImage={Driver}
                heading="Driver Behaviour"
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
                label="Total Alert,Alert this Month,Alert Today"
                cardValue={{
                  alert: dtoDashboardInfo.alert,
                  monthlyAlert: dtoDashboardInfo.monthlyAlert,
                  dailyAlert: dtoDashboardInfo.dailyAlert
                }}
                iconImage={Alert}
                heading="Alert Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Vehicle,Active Device,Inactive Device"
                cardValue={{
                  vehicles: dtoDashboardInfo.vehicles,
                  device: dtoDashboardInfo.activated,
                  inactive: dtoDashboardInfo.offlineDevice
                }}
                iconImage={Fitment}
                heading="Vehicle Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                cardValue={{
                  activated: dtoDashboardInfo.activated,
                  dailyActivations: dtoDashboardInfo.dailyActivations,
                  sevenDaysOffline: dtoDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline:dtoDashboardInfo.thirtyDaysOffline
                }}
                iconImage={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total SOS calls,Genuine Calls,Fake calls"
                cardValue={{
                  sos: dtoDashboardInfo.sosCalls,
                  genuineCalls: dtoDashboardInfo.genuineCalls,
                  fakeCalls: dtoDashboardInfo.fakeCalls
                }}
                iconImage={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Activation,Activation this Month,Activation Today"
                cardValue={{
                  activated: dtoDashboardInfo.activated,
                  monthly: dtoDashboardInfo.monthlyActivations,
                  dailyActivations: dtoDashboardInfo.dailyActivations
                }}
                iconImage={Activation}
                heading="Activation Statistics"
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
                label="Total Dealer,Total Stock Allocated,Total Activation,Total Expired"
                cardValue={miscInfo}
                iconImage={Stock}
                heading="Stock Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Model,Total M2M provider"
                cardValue={modelInfo}
                iconImage={Model}
                heading="Model Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                cardValue={deviceStatusInfo}
                iconImage={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                cardValue={eSIMInfo}
                iconImage={Sim}
                heading="eSIM Statistics"
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
              label="Team,Desk Executive,Live Team,Live Desk Executive"
              cardValue={team}
              iconImage={UserImage}
              heading="Users & Teams"
            />
          ):(
            <Widget
              cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
              label="Desk Executive,Live Desk Executive"
              cardValue={teamForLead}
              iconImage={UserImage}
              heading="Users"
            />
          )}
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Widget
              cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
              label="Active,Closed,Pending,Average accepted time"
              cardValue={calls}
              iconImage={OnCall}
              heading="Calls"
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Widget
             cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
              label="Total,Monthly,Weekly,Daily"
              cardValue={fakeCall}
              iconImage={FakeCall}
              heading="Fake Calls"
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Widget
              cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
              label="Total,Monthly,Weekly,Daily"
              cardValue={incomingCall}
              iconImage={IncomingC}
              heading="Incoming Calls"
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Widget
              cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
              label="Total,Monthly,Weekly,Daily"
              cardValue={callRejection}
              iconImage={Rejection}
              heading="Rejected Calls"
            />
          </Grid>
          </Grid>
        )
        case "desk_ex":
          return (
            <Grid container spacing={2} marginBottom={mar}>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Monthly,Weekly,Daily,Total"
                cardValue={assignment}
                iconImage={Assignment}
                heading="Call Assignment"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #ff6666 0%, #ffcc99 100%)"
                label="Monthly,Weekly,Daily,Total"
                cardValue={falseAssignment}
                iconImage={FalseAssignment}
                heading="False Assignment"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
               cardColor="linear-gradient(to right, #ff6600 0%, #ffcc66 100%)"
                label="Monthly,Weekly,Daily,Total"
                cardValue={closedAssignment}
                iconImage={DoneAssignment}
                heading="Closed Assignment"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
              <Widget
                cardColor="linear-gradient(to right, #cc00cc 0%, #ff99ff 100%)"
                label="Monthly,Weekly,Daily,Total"
                cardValue={rejectedAssignment}
                iconImage={RejectedAssignment}
                heading="Rejected"
              />
            </Grid>
            </Grid>
          )
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
              No Dashboard Available
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
