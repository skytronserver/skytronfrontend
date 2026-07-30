// material-ui
import React from "react";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { useEffect, useState } from "react";
import StockServices from "../../services/StockServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { isCertValid } from "../../helper";
// ==============================|| Configure Page ||============================== //
import { MenuItem, Button, Grid, TextField, Alert, Stack,CircularProgress } from "@mui/material";

const ConfigureDevice = ({ status }) => {
  const [loadAgain, setLoadAgain] = useState(0);
  const [deviceList, setDeviceList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [submitDis, setSubmitDis] = useState(false);
  const [showAction,setShowAction]=useState({
    fitment:{
      status:false,
      button:false,
    }
  })
  const [open, setOpen] = useState(false);
  const [error,setError]=useState(false)
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const handleClose = () => {
    if(error){
      setOpen(false);
      setError(false);
    }else{
      setOpen(false);
    }
   
  };
  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };
  useEffect(() => {
    const filter = {
      stock_status: status,
    };
    const fetchAvailableDevice = async () => {
      const retriveData = await StockServices.getAvailableDeviceList(filter);
      const devices = retriveData.data.data || [];
      const validDevices = devices.filter(device => isCertValid(device.model));
      const arrUniq = [
        ...new Map(
          validDevices.map((item) => [item.id, item])
        ).values(),
      ];
      setDeviceList(arrUniq);
    };
    fetchAvailableDevice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAgain]);
  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deviceId !== "") {
      const response = await StockServices.devicePatch(deviceId, 'fitment');
      setShowAction((prev)=>({...prev,'fitment':{'status':true}}))
      setSubmitDis(true)
    }
  };
  const buttonAction=async (prevAct,nextAct)=>{
    setShowAction((prev)=>({...prev,[prevAct]:{'button':true,'status':true}}))
    if (deviceId !== "") {
      const response = await StockServices.devicePatch(deviceId, nextAct);
      if(response.status===200){
        setShowAction((prev)=>({...prev,[nextAct]:{'status':true}}))
      }else{
        handleAlert("Form Not Submitted");
        setError(true);
      }
      if(response.status===200 && nextAct==='completed'){
        setLoadAgain(prevValue => prevValue + 1);
        setDeviceId("");
        setShowAction({})
        setSubmitDis(false);
      }
    }
  }
  return (
    <>
     <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />
   
    <MainCard>
      <p>Device Fitment</p>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            {/* <FormControl fullWidth> */}
            <TextField
              select
              label="Select Device IMEI No"
              variant="outlined"
              fullWidth
              margin="normal"
              value={deviceId}
              onChange={handleDeviceChange}
              disabled={submitDis}
              readOnly={submitDis}
            >
              <MenuItem value="">Select</MenuItem>
              {deviceList.length > 0 &&
                deviceList.map((item) => {
                  return (
                    <MenuItem value={item.id} key={item.id}>
                      {item.imei}
                    </MenuItem>
                  );
                })}
            </TextField>
          </Grid>

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "38px" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ height: "48px" }}
              disabled={submitDis}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
      <table>
        {showAction?.fitment?.status && (
          <tr>
            <td>
              <Stack sx={{ width: "100%" }} spacing={2}>
                <Alert severity="success">Device fitted Successfully</Alert>
              </Stack>
            </td>
            <td>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                sx={{ width: "100%" }}
                disabled={showAction?.fitment.button}
                onClick={()=>buttonAction('fitment','m2mActivate')}
              >
                Request M2M Activation
              </Button>
            </td>
            <td>
            {!showAction?.m2mActivate?.status && showAction?.fitment.button && (<CircularProgress color="success"/>)}
            </td>
          </tr>
        )}
        {showAction?.m2mActivate?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">
                M2M activation request is successfully send
              </Alert>
            </Stack>
          </td>
          <td>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%" }}
              disabled={showAction?.m2mActivate.button}
              onClick={()=>buttonAction('m2mActivate','m2mActivated')}
            >
              Activate M2M
            </Button>
          </td>
          <td>
            {!showAction?.m2mActivated?.status && showAction?.m2mActivate.button && (<CircularProgress color="success"/>)}
            </td>
        </tr>)}
        {showAction?.m2mActivated?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">M2M is activated </Alert>
            </Stack>
          </td>
          <td>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%" }}
              disabled={showAction?.m2mActivated.button}
              onClick={()=>buttonAction('m2mActivated','configIP')}
            >
              Configure IP Port
            </Button>
          </td>
          <td>
            {!showAction?.configIP?.status && showAction?.m2mActivated.button && (<CircularProgress color="success"/>)}
            </td>
        </tr>)}
        {showAction?.configIP?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">
                IP Port is configured successfully{" "}
              </Alert>
            </Stack>
          </td>
          <td>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%" }}
              disabled={showAction?.configIP.button}
              onClick={()=>buttonAction('configIP','configSOS')}
            >
              Configure SOS
            </Button>
          </td>
          <td>
            {!showAction?.configSOS?.status && showAction?.configIP.button && (<CircularProgress color="success"/>)}
            </td>
        </tr>)}
        {showAction?.configSOS?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">SOS is configured successfully </Alert>
            </Stack>
          </td>
          <td>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%" }}
              disabled={showAction?.configSOS.button}
              onClick={()=>buttonAction('configSOS','configSMS')}
            >
              Configure SMS
            </Button>
          </td>
          <td>
            {!showAction?.configSMS?.status && showAction?.configSOS.button && (<CircularProgress color="success"/>)}
            </td>
        </tr>)}
        {showAction?.configSMS?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">SMS is configured successfully.</Alert>
            </Stack>
          </td>
          <td>
            <Button
              type="submit"
              variant="contained"
              color="success"
              size="small"
              sx={{ width: "100%" }}
              disabled={showAction?.configSMS.button}
              onClick={()=>buttonAction('configSMS','completed')}
            >
              Complete
            </Button>
          </td>
          <td>
            {!showAction?.completed?.status && showAction?.configSMS.button && (<CircularProgress color="success"/>)}
            </td>
        </tr>)}
      </table>
    </MainCard>
    </>
  );
};
export default ConfigureDevice;
