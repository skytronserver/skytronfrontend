
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download, Refresh, People, Group, AdminPanelSettings, Business } from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import showDeviceApi from '../../services/showDeviceApi';

const UserStatisticsReport = () => {
  // Component states
  const [statisticsData, setStatisticsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState({
    currently_logged_in_registered_users: 0,
    offline_registered_users: 0,
    offline_temporary_users: 0,
    online_registered_users: 0,
    online_temporary_users: 0,
    recent_logins_7d: 0,
    recent_logins_24h: 0,
    recent_temp_users_24h: 0,
    total_logins: 0,
    total_registered_users: 0,
    total_temporary_users: 0,
    users_by_role: {}
  });

  // Data Grid columns for role statistics
  const columns = [
    {
      field: 'role',
      headerName: 'User Role',
      width: 200,
      sortable: true,
      renderCell: (params) => {
        const role = params.row?.role || 'Unknown';
        const color = role === 'superadmin' ? 'error' : 
                     role === 'stateadmin' ? 'warning' : 
                     role === 'dealer' ? 'info' : 
                     role === 'devicemanufacture' ? 'secondary' :
                     role === 'owner' ? 'success' :
                     role === 'sosadmin' ? 'primary' :
                     role === 'sosexecutive' ? 'primary' :
                     role === 'dtorto' ? 'warning' :
                     role === 'esimprovider' ? 'info' : 'default';
        return <Chip label={role} color={color} size="small" />;
      }
    },
    {
      field: 'count',
      headerName: 'User Count',
      width: 150,
      sortable: true,
      type: 'number'
    },
    {
      field: 'percentage',
      headerName: 'Percentage',
      width: 150,
      sortable: true,
      renderCell: (params) => {
        return `${params.row?.percentage || 0}%`;
      }
    }
  ];

  // Fetch statistics data on component mount
  useEffect(() => {
    fetchUserStatistics();
  }, []);

  const fetchUserStatistics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await showDeviceApi.getUserStatistics();
      
      if (response.data) {
        // The API returns statistics directly, not a list of users
        const stats = {
          currently_logged_in_registered_users: response.data.currently_logged_in_registered_users || 0,
          offline_registered_users: response.data.offline_registered_users || 0,
          offline_temporary_users: response.data.offline_temporary_users || 0,
          online_registered_users: response.data.online_registered_users || 0,
          online_temporary_users: response.data.online_temporary_users || 0,
          recent_logins_7d: response.data.recent_logins_7d || 0,
          recent_logins_24h: response.data.recent_logins_24h || 0,
          recent_temp_users_24h: response.data.recent_temp_users_24h || 0,
          total_logins: response.data.total_logins || 0,
          total_registered_users: response.data.total_registered_users || 0,
          total_temporary_users: response.data.total_temporary_users || 0,
          users_by_role: response.data.users_by_role || {}
        };
        
        setUserStats(stats);
        
        // Create data for the grid from users_by_role
        const roleData = Object.entries(stats.users_by_role).map(([role, count], index) => ({
          id: index,
          role: role,
          count: count,
          percentage: ((count / stats.total_registered_users) * 100).toFixed(1)
        }));
        
        setStatisticsData(roleData);
        setTotalRows(roleData.length);
      } else {
        setError('Failed to fetch user statistics');
        setStatisticsData([]);
        setTotalRows(0);
        setUserStats({
          currently_logged_in_registered_users: 0,
          offline_registered_users: 0,
          offline_temporary_users: 0,
          online_registered_users: 0,
          online_temporary_users: 0,
          recent_logins_7d: 0,
          recent_logins_24h: 0,
          recent_temp_users_24h: 0,
          total_logins: 0,
          total_registered_users: 0,
          total_temporary_users: 0,
          users_by_role: {}
        });
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      setError('Failed to fetch user statistics. Please try again.');
      setStatisticsData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUserStatistics();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const exportToCSV = () => {
    if (statisticsData.length === 0) {
      alert('No data to export');
      return;
    }

    // Export both role statistics and overall statistics
    const headers = [
      'Metric',
      'Value'
    ];

    const overallStats = [
      ['Total Registered Users', userStats.total_registered_users],
      ['Online Registered Users', userStats.online_registered_users],
      ['Currently Logged In Users', userStats.currently_logged_in_registered_users],
      ['Offline Registered Users', userStats.offline_registered_users],
      ['Total Temporary Users', userStats.total_temporary_users],
      ['Online Temporary Users', userStats.online_temporary_users],
      ['Offline Temporary Users', userStats.offline_temporary_users],
      ['Recent Logins (24h)', userStats.recent_logins_24h],
      ['Recent Logins (7d)', userStats.recent_logins_7d],
      ['Recent Temp Users (24h)', userStats.recent_temp_users_24h],
      ['Total Logins', userStats.total_logins],
      ['', ''], // Empty row separator
      ['User Role', 'Count']
    ];

    const roleStats = statisticsData.map(row => [
      row.role || '',
      row.count || 0
    ]);

    const csvData = [...overallStats, ...roleStats];

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_statistics_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainCard title="User Statistics Report">
      <Box sx={{ width: '100%' }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* User Statistics Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {userStats.total_registered_users}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Registered Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Group sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {userStats.online_registered_users}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Online Registered Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {userStats.currently_logged_in_registered_users}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Currently Logged In
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {userStats.total_temporary_users}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Temporary Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">
                  {userStats.offline_registered_users}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Offline Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="info.main">
                  {userStats.recent_logins_24h}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Logins (24h)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="secondary.main">
                  {userStats.recent_logins_7d}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Logins (7d)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  {userStats.total_logins}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Logins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                startIcon={<Refresh />}
                disabled={loading}
              >
                Refresh Data
              </Button>
              
              <Tooltip title="Export to CSV">
                <Button
                  variant="outlined"
                  onClick={exportToCSV}
                  startIcon={<Download />}
                  disabled={loading || statisticsData.length === 0}
                >
                  Export CSV
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Data Grid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          {loading && <CustomLoader />}
          <DataGrid
            rows={statisticsData}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            pagination
            paginationMode="client"
            page={page}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #d0d0d0',
              },
            }}
          />
        </Paper>
      </Box>
    </MainCard>
  );
};

export default UserStatisticsReport;
