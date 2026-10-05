import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Collapse
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FilterList, Clear, ExpandMore, ExpandLess } from "@mui/icons-material";
import MainCard from "../../ui-component/cards/MainCard";
import CustomLoader from "../../ui-component/CustomLoader";
import SOSManagement from "../../services/SOSManagement";

const fetchPerformanceReport = async (filters) => {
  try {
    const response = await SOSManagement.getExecutivePerformanceReport(filters);
    // The backend returns results inside response.data.results
    return response.data?.results || [];
  } catch (error) {
    console.error("Error fetching performance report:", error);
    throw error;
  }
};

const ExecutivePerformanceReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [userType, setUserType] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const columns = [
    { field: "name", headerName: "Executive Name", flex: 1, minWidth: 150 },
    { field: "user_type", headerName: "Role", flex: 1, minWidth: 100 },
    { field: "ex_id", headerName: "Executive ID", flex: 1, minWidth: 120 },
    { field: "online_duration", headerName: "Online Duration", flex: 1, minWidth: 130 },
    { field: "offline_duration", headerName: "Offline Duration", flex: 1, minWidth: 130 },
    { field: "total_sos_call_duration", headerName: "Total Call Duration", flex: 1, minWidth: 150 },
    { field: "average_sos_call_time", headerName: "Avg Call Time", flex: 1, minWidth: 120 },
    { field: "total_sos_calls", headerName: "Total SOS Calls", type: 'number', flex: 1, minWidth: 120 },
    { field: "unattended_total_duration", headerName: "Unattended Duration", flex: 1, minWidth: 150 },
  ];

  const loadReport = async () => {
    setLoading(true);
    try {
      const filters = { start_date: startDate, end_date: endDate };
      if (userType) filters.user_type = userType;
      
      const data = await fetchPerformanceReport(filters);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadReport();
  };

  const clearFilters = () => {
    setStartDate(today);
    setEndDate(today);
    setUserType("");
  };

  return (
    <MainCard title="Executive Performance Report">
      <Grid container spacing={3}>
        {/* Filter Section */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                bgcolor: 'grey.50'
              }}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList fontSize="small" />
                Report Filters
              </Typography>
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </Box>

            <Collapse in={filtersExpanded}>
              <CardContent>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        select
                        label="User Type"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        fullWidth
                        size="small"
                        SelectProps={{ native: true }}
                      >
                        <option value="">All Roles</option>
                        <option value="desk_ex">Executive (desk_ex)</option>
                        <option value="teamlead">Team Lead (teamlead)</option>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearch}
                          startIcon={<FilterList />}
                          sx={{ minWidth: 120 }}
                        >
                          Generate Report
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={clearFilters}
                          startIcon={<Clear />}
                        >
                          Reset Date
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Report Data
              </Typography>
            </Box>

            {loading ? (
              <CustomLoader />
            ) : (
              <Box sx={{
                height: 500,
                width: '100%',
                '& .MuiDataGrid-root': {
                  border: 'none',
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    borderBottom: '2px solid #e0e0e0'
                  }
                }
              }}>
                <DataGrid
                  rows={reportData}
                  columns={columns}
                  pageSize={25}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  getRowId={(row) => row.ex_id}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ExecutivePerformanceReport;
