import React, { useEffect, useState } from 'react';
import HomePageService from 'services/HomePage';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import Grid from '@mui/material/Grid';
import { gridSpacing } from '../../store/constant';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const ActivationLogReport = () => {
  const { t } = useTranslation();

  const columns = [
    {
      name: 'timestamp',
      label: t('common.timestamp'),
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'rawData',
      label: t('gpsData.rawData'),
      options: {
        filter: true,
        sort: false,
      },
    },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const parseGpsData = (responseData) => {
    try {
      const dataString = responseData?.data;
      if (!dataString) return [];
      const parsedData = JSON.parse(dataString);
      return parsedData.map((item) => ({
        id: `GPS-${item.pk}`,
        timestamp: item.fields.timestamp,
        rawData: item.fields.raw_data,
      }));
    } catch (error) {
      console.error('Error parsing GPS activation data:', error);
      return [];
    }
  };

  const getActivationLogs = async (search = '') => {
    // If no search query is provided, default to 'ACTV'
    if (!search) search = 'ACTV';
    console.log('ActivationLogReport: Fetching GPS log with search:', search);
    try {
      setLoading(true);

      const gpsResponse = await HomePageService.getGpsDataLog({ search });
      console.log('ActivationLogReport: API raw response:', gpsResponse);
      const gpsPackets = parseGpsData(gpsResponse.data);
      console.log('ActivationLogReport: Parsed GPS packets:', gpsPackets);
      // Print all rawData for manual inspection
      gpsPackets.forEach((packet, idx) => {
        console.log(`ActivationLogReport: [${idx}] rawData=`, packet.rawData);
      });

      // No client-side ACTV filtering, show all results from API
      setData(gpsPackets);
    } catch (error) {
      console.error('Error fetching Activation Log Report data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    getActivationLogs(searchQuery);
  };

  useEffect(() => {
    getActivationLogs('ACTV');
  }, []);

  const options = {
    search: false,
    searchPlaceholder: t('gpsData.searchPlaceholder'),
    serverSide: true,
    filter: false,
    sort: false,
    selectableRows: 'none',
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('gpsData.searchByImei')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
              >
                {t('common.search')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
      <Grid item xs={12}>
        {!loading && (
          <DynamicDatatables
            tableTitle="Activation Log Report"
            rows={data}
            columns={columns}
            options={options}
            helperText="Timestamps are in GMT/UTC."
          />
        )}
      </Grid>
    </Grid>
  );
};

export default ActivationLogReport;
