import { useEffect, useState } from "react";
import React from "react";
import { Grid } from "@mui/material";
import Widget from "./Widget";
import { gridSpacing } from "../../../store/constant";
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
import Stock from "../../../assets/images/Stock.svg";
import Sim from "../../../assets/images/Sim.svg";
import Alert from "../../../assets/images/Alert.svg";
import Vehicle from "../../../assets/images/Vehicle.svg";
import Driver from "../../../assets/images/Driver.svg";
import Activation from "../../../assets/images/Activation.svg";
import Model from "../../../assets/images/Model.svg";
import { decipherEncryption } from "helper";

const ActiveState = () => {
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
  useEffect(() => {
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
    retrievePosts();
  }, []);
  console.log(stateData);
  const mar = "100px";

  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store

  const DashboardView = ({ role }) => {
    console.log(role)
    switch (role) {
      case "superuser":
        return (
          <div>
            <Grid container spacing={gridSpacing} marginBottom={mar}>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Dealer,Total Manufacturer,Total DTO, Total Vehicle Owner"
                  device={stateData}
                  address={User}
                  heading="User Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Fitment,Online Device,Offline Device"
                  device={deviceData}
                  address={Fitment}
                  heading="Fitment Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                  device={taggedData}
                  address={Car}
                  heading="Health Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label="Total Alert,This Month,Today"
                  device={alertData}
                  address={Overspeed}
                  heading="Over Speeding"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total Alert,This month,Today"
                  device={vehicleData}
                  address={Bell}
                  heading="Emergency Alert"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Alert,This Month,Today"
                  device={emergencyAlertData}
                  address={Brake}
                  heading="Harsh Break Alert"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Alert,This Month,Today"
                  device={deviceData}
                  address={Suddenturn}
                  heading="Sudden Turn Alert"
                />
              </Grid>
            </Grid>

            <Grid container spacing={gridSpacing} marginBottom={mar}>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Make,Total Device,Activated Device, Free Device"
                  device={stateData}
                  address={Stock}
                  heading="Stock Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Fitment,Fitment this Month,Fitment Today"
                  device={deviceData}
                  address={Fitment}
                  heading="Fitment Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                  device={taggedData}
                  address={Car}
                  heading="Health Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                  device={vehicleData}
                  address={Sim}
                  heading="eSIM Statistics"
                />
              </Grid>
            </Grid>

            <Grid container spacing={gridSpacing} marginBottom={mar}>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Alert,Alert this Month,Alert Today"
                  device={stateData}
                  address={Alert}
                  heading="Alert Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Vehicle,Active Device,Inactive Device"
                  device={deviceData}
                  address={Vehicle}
                  heading="Vehicle Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                  device={taggedData}
                  address={Car}
                  heading="Health Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total SOS calls,Genuine Calls,Fake calls"
                  device={vehicleData}
                  address={Bell}
                  heading="Emergency Alert"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Today Harsh Breaking,Today Sudden Turn Alert,Today Overspeeding Alert"
                  device={emergencyAlertData}
                  address={Driver}
                  heading="Driver Behaviour"
                />
              </Grid>
            </Grid>

            <Grid container spacing={gridSpacing} marginBottom={mar}>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Alert,Alert this Month,Alert Today"
                  device={stateData}
                  address={Alert}
                  heading="Alert Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Vehicle,Active Device,Inactive Device"
                  device={deviceData}
                  address={Fitment}
                  heading="Vehicle Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                  device={taggedData}
                  address={Car}
                  heading="Health Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total SOS calls,Genuine Calls,Fake calls"
                  device={vehicleData}
                  address={Bell}
                  heading="Emergency Alert"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Activation,Activation this Month,Activation Today"
                  device={emergencyAlertData}
                  address={Activation}
                  heading="Activation Statistics"
                />
              </Grid>
            </Grid>

            <Grid container spacing={gridSpacing} marginBottom={mar}>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                  label="Total Dealer,Total Stock Allocated,Total Activation"
                  device={stateData}
                  address={Stock}
                  heading="Stock Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                  label="Total Model,Total M2M provider"
                  device={deviceData}
                  address={Model}
                  heading="Model Statistics"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                  label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                  device={taggedData}
                  address={Car}
                  heading="Health Statistics"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Widget
                  cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                  label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                  device={vehicleData}
                  address={Sim}
                  heading="eSIM Statistics"
                />
              </Grid>
            </Grid>
          </div>
        );
      case "stateadmin":
        return (
          <Grid container spacing={gridSpacing} marginBottom={mar}>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Dealer,Total Manufacturer,Total DTO, Total Vehicle Owner"
                device={stateData}
                address={User}
                heading="User Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Online Device,Offline Device"
                device={deviceData}
                address={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label="Total Alert,This Month,Today"
                device={alertData}
                address={Overspeed}
                heading="Over Speeding"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total Alert,This month,Today"
                device={vehicleData}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Alert,This Month,Today"
                device={emergencyAlertData}
                address={Brake}
                heading="Harsh Break Alert"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Alert,This Month,Today"
                device={deviceData}
                address={Suddenturn}
                heading="Sudden Turn Alert"
              />
            </Grid>
          </Grid>
        );
      case "stateadmin":
        return (
          <Grid container spacing={gridSpacing} marginBottom={mar}>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Dealer,Total Manufacturer,Total DTO, Total Vehicle Owner"
                device={stateData}
                address={User}
                heading="User Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Online Device,Offline Device"
                device={deviceData}
                address={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label="Total Alert,This Month,Today"
                device={alertData}
                address={Overspeed}
                heading="Over Speeding"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total Alert,This month,Today"
                device={vehicleData}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Alert,This Month,Today"
                device={emergencyAlertData}
                address={Brake}
                heading="Harsh Break Alert"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Alert,This Month,Today"
                device={deviceData}
                address={Suddenturn}
                heading="Sudden Turn Alert"
              />
            </Grid>
          </Grid>
        );
      case "dealer":
        return (
          <Grid container spacing={gridSpacing} marginBottom={mar}>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Make,Total Device,Activated Device, Free Device"
                device={stateData}
                address={Stock}
                heading="Stock Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Fitment,Fitment this Month,Fitment Today"
                device={deviceData}
                address={Fitment}
                heading="Fitment Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                device={vehicleData}
                address={Sim}
                heading="eSIM Statistics"
              />
            </Grid>
          </Grid>
        );
      case "vehicleowner":
        return (
          <Grid container spacing={gridSpacing} marginBottom={mar}>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Alert,Alert this Month,Alert Today"
                device={stateData}
                address={Alert}
                heading="Alert Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Vehicle,Active Device,Inactive Device"
                device={deviceData}
                address={Vehicle}
                heading="Vehicle Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total SOS calls,Genuine Calls,Fake calls"
                device={vehicleData}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Today Harsh Breaking,Today Sudden Turn Alert,Today Overspeeding Alert"
                device={emergencyAlertData}
                address={Driver}
                heading="Driver Behaviour"
              />
            </Grid>
          </Grid>
        );
      case "dto":
        return (
          <Grid container spacing={gridSpacing} marginBottom={mar}>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Alert,Alert this Month,Alert Today"
                device={stateData}
                address={Alert}
                heading="Alert Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Vehicle,Active Device,Inactive Device"
                device={deviceData}
                address={Fitment}
                heading="Vehicle Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total SOS calls,Genuine Calls,Fake calls"
                device={vehicleData}
                address={Bell}
                heading="Emergency Alert"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
      case "manufacture":
        return (
          <Grid container spacing={gridSpacing} marginBottom={mar}>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to right, #9933ff 0%, #99ccff 100%)"
                label="Total Dealer,Total Stock Allocated,Total Activation"
                device={stateData}
                address={Stock}
                heading="Stock Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #cc00cc 0%, #ff99ff 100%)"
                label="Total Model,Total M2M provider"
                device={deviceData}
                address={Model}
                heading="Model Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6600 0%, #ffcc66 100%)"
                label=" Total Device Activated, Active Today, Inactive for 7 days, Inactive for 30 days"
                device={taggedData}
                address={Car}
                heading="Health Statistics"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Widget
                cardColor="linear-gradient(to left, #ff6666 0%, #ffcc99 100%)"
                label="Total eSim Activation request,Total 1 year renewal,Total 2 year renewal"
                device={vehicleData}
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
