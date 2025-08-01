import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from '../../services/DeviceModelServices';
import { useEffect,useState } from 'react';
import { fetchDeviceModels } from '../../actions/deviceModelActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {deviceModelColumns} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';

const DeviceModelList = () => {
  const { t } = useTranslation();
  const [load,setLoad]=useState(false)
  const dispatch=useDispatch();
  
  useEffect(()=>{
    const retriveDeviceModel = async () => {
      const retriveData=await DeviceModelServices.getAdminAwaitingModels();
      dispatch(fetchDeviceModels(retriveData.data)) ;
      setLoad(true)
    };
    retriveDeviceModel();
  },[dispatch])
 
  const deviceModelList = useSelector((state) => 
    state.deviceModel.deviceModelList.map((model) => ({
      ...model,
      status: model.status.toLowerCase().replace(/ /g, '_')
    }))
  );

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Get the original data object for this row
          const rowData = deviceModelList[tableMeta.rowIndex];
          const modelId = rowData?.id;
          
          return (
            <div className="cellAction" style={{display:'flex'}}>
              <Link
                to={`/deviceModel/view/${modelId}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton"><VisibilityIcon/></div>
              </Link>
            </div>
          );
        },
      },
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle={t('deviceModel.awaitingApprovalTitle')} rows={deviceModelList} columns={actionColumn.concat(deviceModelColumns)}/>}
        </Grid>
    </Grid>
);
}

export default DeviceModelList