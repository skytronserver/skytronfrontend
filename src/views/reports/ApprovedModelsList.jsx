import { useSelector, useDispatch } from 'react-redux'
import React from 'react';
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from '../../services/DeviceModelServices';
import { useEffect, useState } from 'react';
import { fetchDeviceModels } from '../../actions/deviceModelActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { approvedModelColumns } from '../../datatables/approvedModelColumns';
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';

const ApprovedModelsList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const retrieveApprovedModels = async () => {
      try {
        const retrieveData = await DeviceModelServices.stateadminApprovedModels({});
        if (retrieveData?.data?.data?.models) {
          setData(retrieveData.data.data.models);
          setLoad(true);
          setError(null);
        } else {
          setError('No data available');
          setLoad(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch approved models');
        setLoad(false);
      }
    };
    retrieveApprovedModels();
  }, []);


  console.log(data,'data')
  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          console.log(tableMeta.rowData[1],'tableMeta.rowData[0]')
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

  if (error) {
    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div style={{ color: 'red', padding: '20px' }}>{error}</div>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && <DynamicDatatables 
          tableTitle={t('deviceModel.approvedModelsTitle')} 
          rows={data} 
          columns={actionColumn.concat(approvedModelColumns)}
        />}
      </Grid>
    </Grid>
  );
}

export default ApprovedModelsList; 