import { useDispatch, useSelector } from "react-redux";
import React from "react";
import Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { Link } from "react-router-dom";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import HolidayService from '../../services/HolidayService';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const docViewStyle = {
  padding: "0px"
};

const SchoolHolidayList = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState({ show: false, message: '' });

  // Add debug logging
  console.log('Edit translation:', t('common.edit'));
  console.log('Delete translation:', t('common.delete'));

  const handleCloseError = () => {
    setError({ show: false, message: '' });
  };

  const showError = (message) => {
    setError({ show: true, message });
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await HolidayService.getAllHolidays();
        console.log('API Response:', response); // Debug log

        // Check if response has the expected structure
        if (!response?.data?.data) {
          throw new Error('Invalid response format from server');
        }

        // Transform the data to match the table column names
        const transformedData = Array.isArray(response.data.data) ? response.data.data.map(holiday => ({
          id: holiday.id,
          holidayName: holiday.holiday_name,
          startDate: holiday.start_date,
          endDate: holiday.end_date,
          description: holiday.description,
          status: holiday.status,
          holidayType: holiday.holiday_type,
          vehicles: holiday.vehicles || []
        })) : [];

        setHolidays(transformedData);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status
        });
        showError(t('holiday.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [refreshKey, t]);

  const deleteHoliday = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm(t('holiday.confirmDelete'));
    if (confirmed) {
      try {
        await HolidayService.deleteHoliday(id);
        setRefreshKey(prevKey => prevKey + 1);
        showError(t('holiday.deleteSuccess')); // Show success message
      } catch (error) {
        console.error('Error deleting holiday:', error);
        showError(t('holiday.deleteError'));
      }
    }
  };

  const holidayColumns = [
    {
      name: "holidayName",
      label: t('holiday.name'),
    },
    {
      name: "startDate",
      label: t('holiday.startDate'),
      options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : '',
      },
    },
    {
      name: "endDate",
      label: t('holiday.endDate'),
      options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : '',
      },
    },
    {
      name: "holidayType",
      label: t('holiday.type'),
    },
    {
      name: "status",
      label: t('common.status'),
    },
  ];

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const holidayId = holidays[tableMeta.rowIndex]?.id;
          return (
            <div className="cellAction" style={{ display: "flex", gap: "8px" }}>
              <Link
                to={`/setting/holiday/${holidayId}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  color="primary"
                  size="small"
                  startIcon={<CreateIcon />}
                >
                  {t('common.edit')}
                </Button>
              </Link>
              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={(e) => deleteHoliday(e, holidayId)}
              >
                {t('common.delete')}
              </Button>
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      <Snackbar 
        open={error.show} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity={error.message === t('holiday.deleteSuccess') ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {error.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title={t('holiday.listTitle')} />
        </Grid>
        <Grid item xs={12}>
          <DynamicDatatables
            tableTitle={t('holiday.listTitle')}
            rows={holidays}
            columns={holidayColumns.concat(actionColumn)}
            loading={loading}
            helperText="Timestamps are in GMT/UTC."
          />
        </Grid>
      </Grid>
    </>
  );
};

export default SchoolHolidayList; 