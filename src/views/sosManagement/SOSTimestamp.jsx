import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Box } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { useTranslation } from 'react-i18next';

const SOSTimestamp = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sosTimestampData, setSosTimestampData] = useState([]);

  // Dummy data for SOS call lifecycle
  const dummySOSData = [
    {
      id: 1,
      date: "2024-01-15",
      vehicleRegNo: "MH12AB1234",
      incidentDate: "2024-01-15",
      sosCallHit: "2024-01-15 14:30:25",
      sosCallDisplay: "2024-01-15 14:30:30",
      broadArriving: "2024-01-15 14:35:15",
      closerRequest: "2024-01-15 14:40:22",
      actualCallClose: "2024-01-15 14:45:10",
      responseTime: "14:45",
      totalDuration: "14:45",
      status: "Completed"
    },
    {
      id: 2,
      date: "2024-01-16",
      vehicleRegNo: "DL01CD5678",
      incidentDate: "2024-01-16",
      sosCallHit: "2024-01-16 09:15:10",
      sosCallDisplay: "2024-01-16 09:15:15",
      broadArriving: "2024-01-16 09:20:30",
      closerRequest: "2024-01-16 09:25:45",
      actualCallClose: "2024-01-16 09:30:20",
      responseTime: "05:20",
      totalDuration: "15:10",
      status: "Completed"
    },
    {
      id: 3,
      date: "2024-01-17",
      vehicleRegNo: "KA05EF9012",
      incidentDate: "2024-01-17",
      sosCallHit: "2024-01-17 16:45:30",
      sosCallDisplay: "2024-01-17 16:45:35",
      broadArriving: "2024-01-17 16:50:20",
      closerRequest: "2024-01-17 16:55:10",
      actualCallClose: "2024-01-17 17:00:05",
      responseTime: "04:50",
      totalDuration: "14:35",
      status: "Completed"
    },
    {
      id: 4,
      date: "2024-01-18",
      vehicleRegNo: "TN07GH3456",
      incidentDate: "2024-01-18",
      sosCallHit: "2024-01-18 11:20:15",
      sosCallDisplay: "2024-01-18 11:20:20",
      broadArriving: "2024-01-18 11:25:40",
      closerRequest: "2024-01-18 11:30:25",
      actualCallClose: "2024-01-18 11:35:15",
      responseTime: "05:20",
      totalDuration: "15:00",
      status: "Completed"
    },
    {
      id: 5,
      date: "2024-01-19",
      vehicleRegNo: "AP02IJ7890",
      incidentDate: "2024-01-19",
      sosCallHit: "2024-01-19 13:10:45",
      sosCallDisplay: "2024-01-19 13:10:50",
      broadArriving: "2024-01-19 13:15:30",
      closerRequest: "2024-01-19 13:20:15",
      actualCallClose: "2024-01-19 13:25:00",
      responseTime: "04:45",
      totalDuration: "14:15",
      status: "Completed"
    }
  ];

  useEffect(() => {
    // Simulate API call delay
    const fetchSOSTimestampData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSosTimestampData(dummySOSData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching SOS timestamp data:', error);
        setLoading(false);
      }
    };

    fetchSOSTimestampData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate time difference between two timestamps
  const calculateTimeDifference = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Format time for display
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const sosTimestampColumns = [
    {
      name: "id",
      label: t('common.id'),
      options: {
        filter: false,
        sort: true,
        display: false,
      },
    },
    {
      name: "date",
      label: t('sosTimestamp.date'),
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatDate(value),
      },
    },
    {
      name: "vehicleRegNo",
      label: t('sosTimestamp.vehicleRegNo'),
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "incidentDate",
      label: t('sosTimestamp.incidentDate'),
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatDate(value),
      },
    },
    {
      name: "sosCallHit",
      label: t('sosTimestamp.sosCallHit'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => formatTime(value),
      },
    },
    {
      name: "sosCallDisplay",
      label: t('sosTimestamp.sosCallDisplay'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => formatTime(value),
      },
    },
    {
      name: "broadArriving",
      label: t('sosTimestamp.broadArriving'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => formatTime(value),
      },
    },
    {
      name: "closerRequest",
      label: t('sosTimestamp.closerRequest'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => formatTime(value),
      },
    },
    {
      name: "actualCallClose",
      label: t('sosTimestamp.actualCallClose'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => formatTime(value),
      },
    },
    {
      name: "responseTime",
      label: t('sosTimestamp.responseTime'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          // Raw timestamp values in tableMeta.rowData are in GMT/UTC; ensure we treat them as GMT wherever displayed/calculated.
          const sosCallHit = tableMeta.rowData[4]; // sosCallHit column
          const broadArriving = tableMeta.rowData[6]; // broadArriving column
          return calculateTimeDifference(sosCallHit, broadArriving);
        },
      },
    },
    {
      name: "totalDuration",
      label: t('sosTimestamp.totalDuration'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          // Raw timestamp values in tableMeta.rowData are in GMT/UTC; ensure we treat them as GMT wherever displayed/calculated.
          const sosCallHit = tableMeta.rowData[4]; // sosCallHit column
          const actualCallClose = tableMeta.rowData[8]; // actualCallClose column
          return calculateTimeDifference(sosCallHit, actualCallClose);
        },
      },
    },
    {
      name: "status",
      label: t('common.status'),
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <span style={{ 
            color: value === 'Completed' ? 'green' : 'orange',
            fontWeight: 'bold'
          }}>
            {value}
          </span>
        ),
      },
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        ) : (
          <DynamicDatatables
            tableTitle={t('sosTimestamp.title')}
            rows={sosTimestampData}
            columns={sosTimestampColumns}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SOSTimestamp;
