import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DealerServices from '../../services/DealerServices';
import { useTranslation } from 'react-i18next';
import AutoHideAlert from '../../ui-component/AutoHideAlert';
import Datatable from '../../datatables/DynamicDatatables';
import { esimStatusColumns } from '../../datatables/deviceColumns';

const EsimStatusReport = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchEsimStatus();
  }, []);

  const fetchEsimStatus = async () => {
    try {
      const response = await DealerServices.checkEsimStatus({});
      console.log('API Response:', response);
      console.log('Devices Data:', response.data?.devices);
      setStatusData(response.data);
      setAlertType("success");
      setAlertMessage(t('simActivation.messages.statusSuccess'));
      setOpenAlert(true);
    } catch (error) {
      console.error('API Error:', error);
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || t('simActivation.messages.statusError'));
      setOpenAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <MainCard title={t('simActivation.titles.checkStatus')}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={gridSpacing}>
          {statusData?.summary && (
            <Grid item xs={12}>
              <MainCard>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6">Total Devices</Typography>
                    <Typography variant="h3">{statusData.summary.total_devices}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6">Active</Typography>
                    <Typography variant="h3">{statusData.summary.esim_validity_summary.active}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6">Expired</Typography>
                    <Typography variant="h3">{statusData.summary.esim_validity_summary.expired}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6">Expiring Soon</Typography>
                    <Typography variant="h3">{statusData.summary.esim_validity_summary.expiring_soon}</Typography>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          )}

          <Grid item xs={12}>
            {console.log('Data being passed to Datatable:', statusData?.devices)}
            <Datatable
              rows={statusData?.devices || []}
              columns={esimStatusColumns}
              tableTitle=""
              options={{
                selectableRows: 'none',
                print: false,
                filter: true,
                download: true,
                search: true,
                viewColumns: true,
                responsive: 'standard',
                enableNestedDataAccess: '.',
                downloadOptions: {
                  filename: "esim_status_report.csv",
                  separator: ","
                }
              }}
            />
          </Grid>
        </Grid>
      )}

      <AutoHideAlert
        open={openAlert}
        onClose={handleCloseAlert}
        message={alertMessage}
        type={alertType}
      />
    </MainCard>
  );
};

export default EsimStatusReport; 