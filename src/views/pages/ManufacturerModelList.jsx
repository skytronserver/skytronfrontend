import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from '../../services/DeviceModelServices';
import { fetchDeviceModels } from '../../actions/deviceModelActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';

const ManufacturerModelList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const retrieveDeviceModel = async () => {
      try {
        const retrieveData = await DeviceModelServices.getManufacturerModelOverview({ page: 1, page_size: 1000 });
        let models = [];
        const resData = retrieveData.data;
        if (Array.isArray(resData)) models = resData;
        else if (Array.isArray(resData?.device_models)) models = resData.device_models;
        else if (Array.isArray(resData?.results)) models = resData.results;
        else if (Array.isArray(resData?.data)) models = resData.data;
        
        dispatch(fetchDeviceModels(models));
      } catch (error) {
        console.error('getManufacturerModelOverview failed:', error?.response?.data || error?.message || error);
        dispatch(fetchDeviceModels([]));
      } finally {
        setLoad(true);
      }
    };
    retrieveDeviceModel();
  }, [dispatch]);

  const deviceModelList = useSelector((state) => {
    const list = state.deviceModel?.deviceModelList;
    if (!Array.isArray(list)) return [];
    return list.map((model) => {
      let statusRaw = 'Pending';
      if (model.rejected_at) {
        statusRaw = 'Rejected';
      } else if (model.model_status && model.model_status.toLowerCase() === 'stateadminapproved') {
        statusRaw = 'Approved';
      }
      return {
        ...model,
        id: model.id || model.device_model_id,
        status: statusRaw
      };
    });
  });

  const overviewColumns = [
    { name: "model_name", label: "Model", options: { filter: true, sort: false } },
    { name: "tac_no", label: "Tac No", options: { filter: false, sort: false } },
    { name: "tac_validity", label: "TAC Validity", options: { filter: false, sort: false } },
    { name: "vendor_id", label: "Vendor", options: { filter: false, sort: false } },
    { name: "hardware_version", label: "Hardware Version", options: { filter: false, sort: false } },
    { name: "status", label: "Status", options: { filter: false, sort: false } },
    { 
      name: "created", 
      label: "Created On", 
      options: { 
        filter: true, 
        sort: false,
        customBodyRender: (value) => {
          if (!value) return "N/A";
          const d = new Date(value);
          return d.toLocaleString("en-GB").replace(",", "");
        }
      } 
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <DynamicDatatables
            tableTitle="My Models"
            rows={deviceModelList}
            columns={overviewColumns}
            helperText="Timestamps are in GMT/UTC."
          />
        )}
      </Grid>
    </Grid>
  );
};

export default ManufacturerModelList;
