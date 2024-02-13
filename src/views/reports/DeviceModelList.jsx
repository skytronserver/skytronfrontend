import {useSelector,useDispatch} from 'react-redux'
import React from 'react';
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from 'services/DeviceModelServices';
import { useEffect,useState } from 'react';
import { fetchDeviceModels } from '../../actions/deviceModelActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {deviceModelColumns} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
const DeviceModelList = () => {
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
 
  const deviceModelList=useSelector((state)=>state.deviceModel.deviceModelList);
  console.log(deviceModelList);
  
  const handleDelete = (id) => {
    console.log(id)
    // setData(data.filter((item) => item.id !== id));
  };

  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{display:'flex'}}>
              <Link
                to={`/deviceModel/view/${tableMeta.rowData[1]}`}
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
        {load && <DynamicDatatables tableTitle="Device Model List" rows={deviceModelList} columns={actionColumn.concat(deviceModelColumns)}/>}
        </Grid>
    </Grid>
);
}

export default DeviceModelList