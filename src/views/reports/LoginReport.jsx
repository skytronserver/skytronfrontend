import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography
} from '@mui/material';
import MUIDataTable from 'mui-datatables';
import PageHeader from '../../ui-component/cards/PageHeader';
import { gridSpacing } from '../../store/constant';
import UserServices from '../../services/UserServices';

const LoginReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    is_online: '',
    status: ''
  });

  // Table state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: page + 1, // API usually 1-indexed
        page_size: pageSize
      };
      
      const response = await UserServices.getLoginReport(params);
      if (response && response.data) {
        // Handle paginated response or array response
        if (response.data.results && Array.isArray(response.data.results)) {
          setData(response.data.results);
          setTotalCount(response.data.count || response.data.results.length);
        } else if (Array.isArray(response.data)) {
          setData(response.data);
          setTotalCount(response.data.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
          setTotalCount(response.data.count || response.data.total || response.data.data.length);
        } else {
          setData([]);
          setTotalCount(0);
          console.warn("Unexpected data format:", response.data);
        }
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching login report:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]); // refetch when pagination changes

  useEffect(() => {
   const timer = setTimeout(() => {
    fetchReport();
  }, 10000); // 10 seconds

  return () => clearTimeout(timer);
}, [
  page,
  pageSize,
  filters.search,
  filters.role,
  filters.status,
  filters.is_online
]);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    if (page === 0) {
      fetchReport();
    } else {
      setPage(0); // changing page will trigger useEffect
    }
  };

  const handleClearFilters = () => {
    setFilters({
      role: '',
      search: '',
      is_online: '',
      status: ''
    });
    if (page === 0) {
      setTimeout(fetchReport, 0);
    } else {
      setPage(0);
    }
  };

  const columns = [
    {
      name: "id",
      label: "SL No",
      options: {
        customBodyRenderLite: (dataIndex, rowIndex) => {
          return (page * pageSize) + rowIndex + 1;
        }
      }
    },
    {
      name: "name",
      label: "Name",
    },
    {
      name: "mobile",
      label: "Mobile",
    },
    {
      name: "role",
      label: "Role",
    },
    {
      name: "status",
      label: "Status",
    },
    {
      name: "is_online",
      label: "Online Status",
      options: {
        customBodyRender: (value) => value ? <Typography color="success.main">Online</Typography> : <Typography color="text.secondary">Offline</Typography>
      }
    },
    {
      name: "last_login",
      label: "Last Login",
      options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleString() : 'N/A'
      }
    }
  ];

  const options = {
    serverSide: true,
    count: totalCount,
    page: page,
    rowsPerPage: pageSize,
    rowsPerPageOptions: [10, 20, 50, 100],
    selectableRows: "none",
    viewColumns: false,
    filter: false,
    search: false,
    print: false,
    download: true,
    elevation: 0,
    textLabels: {
      body: {
        noMatch: loading ? "Loading..." : "Sorry, no matching records found",
      }
    },
    onTableChange: (action, tableState) => {
      switch (action) {
        case 'changePage':
          setPage(tableState.page);
          break;
        case 'changeRowsPerPage':
          setPageSize(tableState.rowsPerPage);
          setPage(0);
          break;
        default:
          break;
      }
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Login Report" />
      </Grid>
      
      <Grid item xs={12}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Search Users"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Name, mobile..."
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="superadmin">Super Admin</MenuItem>
                  <MenuItem value="stateadmin">State Admin</MenuItem>
                  <MenuItem value="schooladmin">School Admin</MenuItem>
                  <MenuItem value="dealer">Dealer</MenuItem>
                  <MenuItem value="devicemanufacture">Manufacturer</MenuItem>
                  <MenuItem value="sosadmin">SOS Admin</MenuItem>
                  <MenuItem value="dtorto">DTO</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  fullWidth
                  label="Is Online"
                  name="is_online"
                  value={filters.is_online}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Online</MenuItem>
                  <MenuItem value="false">Offline</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" gap={1}>
                  <Button variant="contained" color="primary" onClick={handleApplyFilters}>
                    Search
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <MUIDataTable
            title="User Login Status"
            data={data}
            columns={columns}
            options={options}
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export default LoginReport;
