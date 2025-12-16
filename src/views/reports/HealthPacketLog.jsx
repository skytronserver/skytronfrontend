import React, { useEffect, useState } from 'react';
import HomePageService from 'services/HomePage';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import Grid from '@mui/material/Grid';
import { gridSpacing } from '../../store/constant';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const HealthPacketLog = () => {
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
        packetType: 'GPS',
        rawData: item.fields.raw_data,
      }));
    } catch (error) {
      console.error('Error parsing GPS health data:', error);
      return [];
    }
  };

  const parseEmergencyData = (response) => {
    try {
      if (!response?.data?.data) return [];
      const parsedData = JSON.parse(response.data.data);
      return parsedData.map((item) => ({
        id: `EM-${item.pk}`,
        timestamp: item.fields.timestamp,
        packetType: 'EMERGENCY',
        rawData: item.fields.raw_data,
      }));
    } catch (error) {
      console.error('Error parsing Emergency health data:', error);
      return [];
    }
  };

  const getHealthPackets = async (search = '') => {
    try {
      setLoading(true);

      const [gpsResponse, emergencyResponse] = await Promise.all([
        HomePageService.getGpsDataLog({ search }),
        HomePageService.getEmergencyDataLogs({ search }),
      ]);

      const gpsPackets = parseGpsData(gpsResponse.data);
      const emergencyPackets = parseEmergencyData(emergencyResponse);

      const merged = [...gpsPackets, ...emergencyPackets].sort((a, b) => {
        const ta = new Date(a.timestamp).getTime();
        const tb = new Date(b.timestamp).getTime();
        return ta - tb;
      });

      // Only keep Health Packets whose rawData starts with '$,HLM'
      const healthPacketsOnly = merged.filter((packet) => {
        if (!packet.rawData || typeof packet.rawData !== 'string') return false;
        return packet.rawData.startsWith('$,HLM');
      });

      setData(healthPacketsOnly);
    } catch (error) {
      console.error('Error fetching Health Packet Log data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    getHealthPackets(searchQuery);
  };

  useEffect(() => {
    getHealthPackets();
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
            tableTitle="Health Packet Log"
            rows={data}
            columns={columns}
            options={options}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default HealthPacketLog;
