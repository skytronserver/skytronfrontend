/* eslint-disable no-unused-vars */
import { useDispatch } from 'react-redux'
import React from 'react';
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from '../../services/DeviceModelServices';
import { useEffect, useState } from 'react';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { approvedCOPColumns } from '../../datatables/approvedCOPColumns';
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';

const ApprovedCOPsList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const retrieveApprovedCOPs = async () => {
      try {
        const retrieveData = await DeviceModelServices.stateadminApprovedCOPModels({});
        if (retrieveData?.data?.data?.cops) {
          setData(retrieveData.data.data.cops);
          setLoad(true);
          setError(null);
        } else {
          setError('No data available');
          setLoad(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch approved COPs');
        setLoad(false);
      }
    };
    retrieveApprovedCOPs();
  }, []);

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
          tableTitle={t('deviceModel.approvedCOPsTitle')} 
          rows={data} 
          columns={actionColumn.concat(approvedCOPColumns)}
          helperText="Timestamps are in GMT/UTC."
        />}
      </Grid>
    </Grid>
  );
}

export default ApprovedCOPsList; 