import React, { useState, useEffect, useCallback } from 'react';
import HomePageService from 'services/HomePage';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import Grid from "@mui/material/Grid";
import { gridSpacing } from "../../store/constant";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const BleSosAppLog = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    
    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        ble_mac: '',
        registration_no: '',
        phone_device_id: '',
        user_mobile: '',
        sos_type: '',
        date_from: '',
        date_to: '',
    });
    
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(50)
    const [totalCount, setTotalCount] = useState(0)

    const columns = [
        {
            name: "received_at",
            label: "Received At",
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => {
                    return value ? new Date(value).toLocaleString() : 'N/A';
                }
            },
        },
        {
            name: "event_time",
            label: "Event Time",
            options: {
                filter: false,
                sort: true,
                customBodyRender: (value) => {
                    return value ? new Date(value).toLocaleString() : 'N/A';
                }
            },
        },
        {
            name: "ble_mac",
            label: "BLE MAC",
            options: { filter: true, sort: false },
        },
        {
            name: "ble_device_name",
            label: "Device Name",
            options: { filter: true, sort: false },
        },
        {
            name: "registration_no",
            label: "Registration No",
            options: { filter: true, sort: false },
        },
        {
            name: "phone_device_id",
            label: "Phone Device ID",
            options: { filter: true, sort: false },
        },
        {
            name: "user_mobile",
            label: "User Mobile",
            options: { filter: true, sort: false },
        },
        {
            name: "sos_type",
            label: "SOS Type",
            options: { filter: true, sort: false },
        },
        {
            name: "app_version",
            label: "App Version",
            options: { filter: true, sort: false },
        },
        {
            name: "latitude",
            label: "Latitude",
            options: { filter: false, sort: false },
        },
        {
            name: "longitude",
            label: "Longitude",
            options: { filter: false, sort: false },
        },
    ];

    const fetchData = useCallback(async (pageNum, rowsPerPageNum, currentFilters = filters) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum + 1,
                page_size: rowsPerPageNum
            };
            
            if (currentFilters.search) params.search = currentFilters.search;
            if (currentFilters.ble_mac) params.ble_mac = currentFilters.ble_mac;
            if (currentFilters.registration_no) params.registration_no = currentFilters.registration_no;
            if (currentFilters.phone_device_id) params.phone_device_id = currentFilters.phone_device_id;
            if (currentFilters.user_mobile) params.user_mobile = currentFilters.user_mobile;
            if (currentFilters.sos_type) params.sos_type = currentFilters.sos_type;
            if (currentFilters.date_from) params.date_from = currentFilters.date_from;
            if (currentFilters.date_to) params.date_to = currentFilters.date_to;
            
            const response = await HomePageService.getBleSosAppLogs(params);
            
            if (response?.data?.status === 'success') {
                setData(response.data.data || []);
                setTotalCount(response.data.pagination?.total || 0);
            } else {
                setData([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching BLE SOS app logs:', error);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData(page, rowsPerPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(0);
        fetchData(0, rowsPerPage, filters);
    };
    
    const handleReset = () => {
        const resetFilters = {
            search: '',
            ble_mac: '',
            registration_no: '',
            phone_device_id: '',
            user_mobile: '',
            sos_type: '',
            date_from: '',
            date_to: '',
        };
        setFilters(resetFilters);
        setPage(0);
        fetchData(0, rowsPerPage, resetFilters);
    };

    const handleChangePage = (newPage) => {
        setPage(newPage);
        fetchData(newPage, rowsPerPage, filters);
    };

    const handleChangeRowsPerPage = (event) => {
        let newRowsPerPage;
        if (typeof event === 'number') {
            newRowsPerPage = event;
        } else if (event && event.target) {
            newRowsPerPage = parseInt(event.target.value, 10);
        } else {
            return;
        }
        
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        
        fetchData(0, newRowsPerPage, filters);
    };
    
    const handleFilterChange = (field) => (event) => {
        const value = event && event.target ? event.target.value : event;
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const options = {
        filter: false,
        responsive: 'standard',
        serverSide: true,
        count: totalCount,
        page: page,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: [10, 20, 50, 100, 200],
        onChangePage: handleChangePage,
        onChangeRowsPerPage: handleChangeRowsPerPage,
        selectableRows: 'none',
        download: true,
        print: true,
        search: false,
        sort: false, // Disabling sorting for now since ordering requires specific parameter
        viewColumns: true,
        pagination: true,
        customToolbar: () => {
            return (
                <div style={{ padding: '8px 0' }}>
                    {loading && (
                        <CircularProgress size={24} style={{ marginRight: 15 }} />
                    )}
                </div>
            );
        },
        textLabels: {
            body: {
                noMatch: loading ? 'Loading...' : 'Sorry, no matching records found',
            }
        }
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <form onSubmit={handleSearch}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Global Search"
                                value={filters.search}
                                onChange={handleFilterChange('search')}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Registration No"
                                value={filters.registration_no}
                                onChange={handleFilterChange('registration_no')}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="BLE MAC"
                                value={filters.ble_mac}
                                onChange={handleFilterChange('ble_mac')}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="User Mobile"
                                value={filters.user_mobile}
                                onChange={handleFilterChange('user_mobile')}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small" variant="outlined">
                                <InputLabel>SOS Type</InputLabel>
                                <Select
                                    value={filters.sos_type}
                                    onChange={handleFilterChange('sos_type')}
                                    label="SOS Type"
                                >
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    <MenuItem value="BLE_Public">BLE_Public</MenuItem>
                                    <MenuItem value="BLE_Login">BLE_Login</MenuItem>
                                    <MenuItem value="BLE_TM_PW_Fail">BLE_TM_PW_Fail</MenuItem>
                                    <MenuItem value="BLE_TM_Route">BLE_TM_Route</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Date From"
                                type="date"
                                value={filters.date_from}
                                onChange={handleFilterChange('date_from')}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Date To"
                                type="date"
                                value={filters.date_to}
                                onChange={handleFilterChange('date_to')}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={3} style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                Search
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
            
            <Grid item xs={12}>
                <Box position="relative">
                    {loading && data.length > 0 && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            zIndex={2}
                            bgcolor="rgba(255, 255, 255, 0.5)"
                        >
                            <CircularProgress />
                        </Box>
                    )}
                    <DynamicDatatables
                        tableTitle="BLE SOS App Logs"
                        rows={data}
                        columns={columns}
                        options={options}
                    />
                </Box>
            </Grid>
        </Grid>
    )
}

export default BleSosAppLog;
