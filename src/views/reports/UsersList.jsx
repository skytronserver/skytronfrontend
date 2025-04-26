import React, { useState, useEffect } from 'react';
import { Grid, Tooltip, IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { gridSpacing } from '../../store/constant';
import MainCard from '../../ui-component/cards/MainCard';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import ReportServices from '../../services/ReportServices';
import { IconRefresh, IconDownload } from '@tabler/icons';
import DialogComponent from '../../ui-component/DialogComponent';
import { useTranslation } from 'react-i18next';

const UsersList = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const response = await ReportServices.getUsersList();
      setUsersData(response.data);
    } catch (error) {
      console.error('Error fetching users data:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'Failed to fetch users data. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      // This will be handled by the DynamicDatatables component
      // We just need to trigger the event
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'Failed to export CSV. Please try again.',
        type: 'error'
      });
    }
  };

  const usersColumns = [
    {
      name: 'id',
      label: 'ID',
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: 'username',
      label: 'Username',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'email',
      label: 'Email',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'first_name',
      label: 'First Name',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'last_name',
      label: 'Last Name',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'role',
      label: 'Role',
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: 'last_login',
      label: 'Last Login',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return value ? new Date(value).toLocaleString() : 'Never';
        },
      },
    },
    {
      name: 'is_active',
      label: 'Status',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return value ? 'Active' : 'Inactive';
        },
      },
    },
    {
      name: 'date_joined',
      label: 'Date Joined',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return value ? new Date(value).toLocaleString() : 'N/A';
        },
      },
    },
  ];

  const tableOptions = {
    customToolbar: () => {
      return (
        <>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsersData}>
              <IconRefresh size={24} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExportCSV}>
              <IconDownload size={24} />
            </IconButton>
          </Tooltip>
        </>
      );
    },
    download: true,
    downloadOptions: {
      filename: 'users_report.csv',
      separator: ',',
    },
  };

  return (
    <>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard title={t('users.listTitle')} content={false}>
            <DynamicDatatables
              tableTitle=""
              rows={usersData}
              columns={usersColumns}
              options={tableOptions}
              loading={loading}
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* Alert Dialog */}
      <DialogComponent
        open={alertDialog.open}
        title={alertDialog.title}
        content={alertDialog.message}
        primaryButtonText="OK"
        primaryButtonOnClick={() => setAlertDialog(prev => ({ ...prev, open: false }))}
        handleClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default UsersList;