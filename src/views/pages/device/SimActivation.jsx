import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../../store/constant";
import StockServices from '../../../services/StockServices';
import DeviceModelServices from '../../../services/DeviceModelServices'
import { useEffect,useState } from 'react';
//Datatables
import {useSelector,useDispatch} from 'react-redux'
import { getDeviceListAvailable } from '../../../actions/stockActions';
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import {availableForSalesColumnForFitment} from '../../../datatables/deviceColumns';
import { useTranslation } from 'react-i18next';
import AutoHideAlert from '../../../ui-component/AutoHideAlert';
import CustomLoader from '../../../ui-component/CustomLoader';

const SimActivation = () => {
  const { t } = useTranslation();
  const [load,setLoad]=useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  
  //Datatables data using redux
  const dispatch=useDispatch();
  const availableDeviceList=useSelector((state)=>state.stock.availableList);

  const fetchDeviceList = async () => {
    try {
      const filter={
        "stock_status": "Available_for_fitting",
        "esim_status":	"NotAssigned"
      }
      const retriveData = await DeviceModelServices.getDeviceList(filter); 
      dispatch(getDeviceListAvailable(retriveData.data.data));
      setLoad(true);
    } catch (error) {
      console.error('Error fetching device list:', error);
      setAlert({
        open: true,
        message: t('common.errors.fetchError'),
        type: 'error'
      });
    }
  };

  useEffect(()=>{
    fetchDeviceList();
  },[dispatch])

  const handleMarkDefective=async (e,data)=>{
    e.preventDefault();
    const confirmed = window.confirm(
      t('simActivation.messages.confirmActivation')
    );
    if (confirmed) {
      setLoading(true);
      const formData = {
        eSim_provider: data[1][0]?.id,
        valid_from: data[5],
        valid_upto: data[6],
        device: data[0],
      };
      try {
        const status = await StockServices.simActivationReq(formData);
        setAlert({
          open: true,
          message: t('simActivation.messages.activationSuccess'),
          type: 'success'
        });
        // Refresh the device list after successful activation
        await fetchDeviceList();
      } catch (error) {
        console.error('Error activating SIM:', error);
        setAlert({
          open: true,
          message: t('simActivation.messages.activationError'),
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  }

  const handleAlertClose = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
          return (
            <div className="cellAction" style={{display:'flex'}}>
             <div style={{"marginRight":"5px"}}>
             <Button
                type="submit"
                variant="outlined"
                color="error"
                size="small"
                onClick={(event) => handleMarkDefective(event, tableMeta.rowData)}
                disabled={loading}
              >
                {t('simActivation.actions.requestActivation')}
              </Button>
             </div>
            </div>
          );
        },
      },
    },
  ];
  return (
    <>
      {loading && <CustomLoader />}
      <AutoHideAlert
        open={alert.open}
        onClose={handleAlertClose}
        message={alert.message}
        type={alert.type}
      />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {load && <DynamicDatatables tableTitle={t('simActivation.titles.pending')} rows={availableDeviceList} columns={availableForSalesColumnForFitment.concat(actionColumn)}/>}
        </Grid>
      </Grid>
    </>
  );
}

export default SimActivation;

