import { useEffect, useState } from "react";
import React from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import UserServices from "../../../services/UserServices";

import Car from "../../../assets/images/Car.svg";
import Location from "../../../assets/images/Location.svg";
import Wifi from "../../../assets/images/Wifi.svg";
import Mobile from "../../../assets/images/Mobile.svg";
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
import { decipherEncryption } from "helper";
import { dashboardInitialState } from "./dashboardInitialState";
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
  const [stateInfo,setStateInfo]=useState(dashboardInitialState.stateInfo)
  const [stateData, setStateData] = useState({});
  const [alertData, setAlertData] = useState({});
  const [deviceData, setDeviceData] = useState({});
  const [taggedData, setTaggedData] = useState({});
  const [vehicleData, setVehicleData] = useState({
    total_vehicle: 0,
    tagged_vehicle: 0,
    untagged_vehicle: 0,
  });
  const [emergencyAlertData, setEmergencyAlertData] = useState({
    total_alart: 0,
    alart_month: 0,
    alart_today: 0,
  });

  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  useEffect(() => {
    //for owner
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
        //if superAdmin
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
    const retrievePosts = async () => {
      const stateDetails = await UserServices.getStateStats();
      const alertDetails = await UserServices.getAlertDetails();
      const deviceData = await UserServices.getDeviceStats();
      const taggedData = await UserServices.getTaggedDevices();
      setStateData(stateDetails.data);
      setAlertData(alertDetails.data);
      setDeviceData(deviceData.data);
      setTaggedData(taggedData.data);
    };
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
    retrievePosts();
  }, []);

  const mar = "100px";



  const DashboardView = ({ role }) => {
    switch (role) {
      case "superadmin":
        return (
          <div>
            <Grid container spacing={2} marginBottom={mar}>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total State Admin,Total eSim Provider,Total Manufacturer, Total SOS Admin"
                  device={userInfoForAdmin}
                  address={User}
                  heading="User Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Fitment,Tagged Device,Online Device,Offline Device"
                  device={fitmentInfoForAdmin}
                  address={Fitment}
                  heading="Fitment Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label="Total Alert,This Month,Today"
                  device={overSpeedInfo}
                  address={Overspeed}
                  heading="Over Speeding"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total Alert,This month,Today"
                  device={emergencyInfo}
                  address={Bell}
                  heading="Emergency Alert"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total State,Active,Inactive"
                  device={stateInfo}
                  address={state}
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
                device={userInfo}
                address={User}
                heading="User Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Online Device,Offline Device"
                device={fitmentInfo}
                address={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={deviceHealthInfo}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label="Total Alert,This Month,Today"
                device={overSpeedInfo}
                address={Overspeed}
                heading="Over Speeding"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total Alert,This month,Today"
                device={emergencyInfo}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Alert,This Month,Today"
                device={harshBreakInfo}
                address={Brake}
                heading="Harsh Break Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Alert,This Month,Today"
                device={suddenBreakInfo}
                address={Suddenturn}
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
                device={dealerDeviceInfo}
                address={Stock}
                heading="Stock Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Fitment this Month,Fitment Today"
                device={dealerFitmentInfo}
                address={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Online, Offline Today, Offline for 7 days, Offline for 30 days"
                device={deviceStatusInfo}
                address={Car}
                heading="Device Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                device={eSIMInfo}
                address={Sim}
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
                device={{
                  alert: ownerDashboardInfo.alert,
                  monthlyAlert: ownerDashboardInfo.monthlyAlert,
                  dailyAlert: ownerDashboardInfo.dailyAlert
                }}
                address={Alert}
                heading="Alert Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Vehicle,Active Device,Inactive Device"
                device={{
                  vehicles: ownerDashboardInfo.vehicles,
                  deviceActivated: ownerDashboardInfo.deviceActivated,
                  offlineDevice: ownerDashboardInfo.offlineDevice
                }}
                address={Vehicle}
                heading="Vehicle Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={{
                  deviceActivated: ownerDashboardInfo.deviceActivated,
                  offlineDevice: ownerDashboardInfo.offlineDevice,
                  sevenDaysOffline: ownerDashboardInfo.sevenDaysOffline,
                  thirtyDaysOffline: ownerDashboardInfo.thirtyDaysOffline,
                }}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total SOS calls,Genuine Calls,Fake calls"
                device={{
                  sosCalls: ownerDashboardInfo.sosCalls,
                  genuineCalls: ownerDashboardInfo.genuineCalls,
                  fakeCalls: ownerDashboardInfo.fakeCalls
                }}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Today Harsh Breaking,Today Sudden Turn Alert,Today Overspeeding Alert"
                device={{
                  harshBreaking: ownerDashboardInfo.harshBreaking,
                  suddenTurn: ownerDashboardInfo.suddenTurn,
                  overSpeeding: ownerDashboardInfo.overSpeeding
                }}
                address={Driver}
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
                device={stateData}
                address={Alert}
                heading="Alert Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Vehicle,Active Device,Inactive Device"
                device={deviceData}
                address={Fitment}
                heading="Vehicle Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total SOS calls,Genuine Calls,Fake calls"
                device={vehicleData}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Activation,Activation this Month,Activation Today"
                device={emergencyAlertData}
                address={Activation}
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
                device={miscInfo}
                address={Stock}
                heading="Stock Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Model,Total M2M provider"
                device={modelInfo}
                address={Model}
                heading="Model Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={deviceStatusInfo}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                device={eSIMInfo}
                address={Sim}
                heading="eSIM Statistics"
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardView role={userRoles} />
  );
};

export default ActiveState;
