import React from 'react';
// project imports
import { Grid, Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from '../../services/DeviceModelServices';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tableTheme from "../../ui-component/customTableUi";
import { ThemeProvider } from "@mui/material/styles";
//Datatables
import { useSelector, useDispatch } from 'react-redux'
import { stockFilterAction } from '../../actions/stockActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { showDeviceColumns } from '../../datatables/rowsColumn';
import { decipherEncryption, getRole } from "../../helper";

const ShowDevice = () => {
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  const userRole = getRole();
  //Datatables data using redux

  const dispatch = useDispatch();
  const deviceList = useSelector((state) => state.stock.stockList);

  useEffect(() => {
    const retrievePosts = async () => {
      try {
        const retriveData = await DeviceModelServices.getDeviceList();
        dispatch(stockFilterAction(retriveData.data.data));
        setLoad(true)
      } catch {
        console.error('Internal Server Error');
        setError(true);
      }
    };
    retrievePosts();
  }, [dispatch]);

  const handleMarkDefective = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(t('device.confirmDefective'));
    if (confirmed) {
      try {
        // Add your API call to mark device as defective
        console.log('Marking device as defective:', id);
      } catch (error) {
        console.error('Error marking device as defective:', error);
      }
    }
  };

  const handleSell = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(t('device.confirmSell'));
    if (confirmed) {
      try {
        // Add your API call to mark device as sold
        console.log('Marking device as sold:', id);
      } catch (error) {
        console.error('Error marking device as sold:', error);
      }
    }
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
            <div className="cellAction" style={{display: 'flex', gap: '8px'}}>
              <Button
                type="submit"
                variant="outlined"
                color="error"
                size="small"
                onClick={(event) => handleMarkDefective(event, tableMeta.rowData[1])}
              >
                {t('device.defective')}
              </Button>
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                size="small"
                onClick={(event) => handleSell(event, tableMeta.rowData[1])}
              >
                {t('device.sell')}
              </Button>
            </div>
          );
        },
      },
    },
  ];

  // Only include action column if user is not a manufacturer
  const columns = userRole !== 'devicemanufacture' ? [...showDeviceColumns, ...actionColumn] : showDeviceColumns;

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <ThemeProvider theme={tableTheme}>
        {error && (
          <Alert severity="error">
            <AlertTitle>{t('showDevice.errors.title')}</AlertTitle>
            {t('showDevice.errors.message')}
          </Alert>
        )}
        {load && (
          <DynamicDatatables
            tableTitle={t('showDevice.title')}
            rows={deviceList}
            columns={columns}
          />
        )}
        </ThemeProvider>
      </Grid>
    </Grid>
  );
}

export default ShowDevice;

