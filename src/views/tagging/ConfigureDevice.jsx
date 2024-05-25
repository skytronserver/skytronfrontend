// material-ui
import React from "react";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { useEffect, useState } from "react";
import StockServices from "../../services/StockServices";
import DialogComponent from "../../ui-component/DialogComponent";
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
      retriveData.data.data.map((item) =>
        console.log('dummies')
      );
      const arrUniq = [
        ...new Map(
          retriveData.data.data.map((item) => [item.device.id, item])
        ).values(),
      ];
      setDeviceList(arrUniq);
    };
    fetchAvailableDevice();
  }, [loadAgain]);
  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deviceId != "") {
      const response = await StockServices.devicePatch(deviceId, 'fitment');
      setShowAction((prev)=>({...prev,'fitment':{'status':true}}))
      setSubmitDis(true)
    }
  };
  const buttonAction=async (prevAct,nextAct)=>{
    setShowAction((prev)=>({...prev,[prevAct]:{'button':true,'status':true}}))
    if (deviceId != "") {
      const response = await StockServices.devicePatch(deviceId, nextAct);
      if(response.status==200){
        setShowAction((prev)=>({...prev,[nextAct]:{'status':true}}))
      }else{
        handleAlert("Form Not Submitted");
        setError(true);
      }
      if(response.status==200 && nextAct=='completed'){
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
                    <MenuItem value={item.device.id} key={item.device.id}>
                      {item.device.imei}
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
                onClick={()=>buttonAction('fitment','eSimActivate')}
              >
                Request eSIM Activation
              </Button>
            </td>
            <td>
            {!showAction?.eSimActivate?.status && showAction?.fitment.button && (<CircularProgress color="success"/>)}
            </td>
          </tr>
        )}
        {showAction?.eSimActivate?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">
                eSIM activation request is successfully send
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
              disabled={showAction?.eSimActivate.button}
              onClick={()=>buttonAction('eSimActivate','eSimActivated')}
            >
              Activate eSIM
            </Button>
          </td>
          <td>
            {!showAction?.eSimActivated?.status && showAction?.eSimActivate.button && (<CircularProgress color="success"/>)}
            </td>
        </tr>)}
        {showAction?.eSimActivated?.status && (<tr>
          <td>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="success">eSIM is activated </Alert>
            </Stack>
          </td>
          <td>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%" }}
              disabled={showAction?.eSimActivated.button}
              onClick={()=>buttonAction('eSimActivated','configIP')}
            >
              Configure IP Port
            </Button>
          </td>
          <td>
            {!showAction?.configIP?.status && showAction?.eSimActivated.button && (<CircularProgress color="success"/>)}
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
