import { useSelector, useDispatch } from "react-redux";
import React from "react";
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import { useEffect, useState } from "react";
import { fetchCOPDeviceModels } from "../../actions/deviceModelActions";
import { deviceCOPModelColumns } from "../../datatables/rowsColumn";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MUIDataTable from "mui-datatables";
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

const UnapproveCopList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const retriveDeviceModel = async () => {
      try {
        const retriveData = await DeviceModelServices.getAdminAwaitingCOPModels();
        dispatch(fetchCOPDeviceModels(retriveData.data));
      } catch (error) {
        console.error('getAdminAwaitingCOPModels failed:', error?.response?.data || error?.message || error);
        dispatch(fetchCOPDeviceModels([]));
      } finally {
        setLoad(true);
      }
    };
    retriveDeviceModel();
  }, [dispatch]);

  const deviceCOPModelList = useSelector(
    (state) => state.deviceModel.deviceCOPModelList
  );

  const shouldShowGmtNote = Array.isArray(deviceCOPModelList)
    && deviceCOPModelList.some((r) => typeof r?.timestamp === 'string' && /Z\s*$/.test(r.timestamp));

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Link
                to={`/deviceCOPModel/view/${tableMeta.rowData[1]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton">
                  <VisibilityIcon />
                </div>
              </Link>
            </div>
          );
        },
      },
    },
  ];
 
  const options = {
    selectableRows: "none",
    viewColumns: false,
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <div className="datatable">
      {shouldShowGmtNote && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Timestamps are in GMT/UTC.
        </Typography>
      )}
      <MUIDataTable
              title={t('deviceModel.copListTitle')}
        data={deviceCOPModelList}
        columns={actionColumn.concat(
          deviceCOPModelColumns.map((col) => {
            if (col?.name !== 'timestamp') {
              return col;
            }
            if (!shouldShowGmtNote) {
              return col;
            }
            const label = col?.label;
            if (typeof label !== 'string') {
              return col;
            }
            if (label.includes('(GMT/UTC)')) {
              return col;
            }
            return { ...col, label: `${label} (GMT/UTC)` };
          })
        )}
        options={options}
      />
    </div>
        )}
      </Grid>
    </Grid>
  );
};

export default UnapproveCopList;
