import React, { useEffect, useState } from 'react';
import HomePageService from 'services/HomePage';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import Grid from "@mui/material/Grid";
import { gridSpacing } from "../../store/constant";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`device-ip-tabpanel-${index}`}
            aria-labelledby={`device-ip-tab-${index}`}
            {...other}
            style={{ width: '100%' }}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const DeviceIpDashboard = () => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);

    // Common states
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState(7);
    const [source, setSource] = useState('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalRecords, setTotalRecords] = useState(0);

    // Tab 1: Unique IPs
    const [uniqueIpsData, setUniqueIpsData] = useState([]);
    const [ipSearch, setIpSearch] = useState("");

    // Tab 2: IMEIs by IP
    const [imeisByIpData, setImeisByIpData] = useState([]);
    const [targetIp, setTargetIp] = useState("");

    // Tab 3: IPs by IMEI
    const [ipsByImeiData, setIpsByImeiData] = useState([]);
    const [targetImei, setTargetImei] = useState("");

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        try {
            const d = new Date(timeString);
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        } catch (e) {
            return timeString;
        }
    };

    // Columns
    const uniqueIpsColumns = [
        { name: "source_ip", label: "Source IP" },
        { name: "packet_count", label: "Packet Count" },
        { name: "imei_count", label: "IMEI Count" },
        { name: "first_seen", label: "First Seen", options: { customBodyRender: formatTime } },
        { name: "last_seen", label: "Last Seen", options: { customBodyRender: formatTime } },
        { name: "network_names", label: "Networks", options: { customBodyRender: (val) => val?.join(', ') || "-" } },
        { name: "seen_in", label: "Seen In", options: { customBodyRender: (val) => val?.join(', ') || "-" } }
    ];

    const imeisByIpColumns = [
        { name: "imei", label: "IMEI" },
        { name: "packet_count", label: "Packet Count" },
        { name: "first_seen", label: "First Seen", options: { customBodyRender: formatTime } },
        { name: "last_seen", label: "Last Seen", options: { customBodyRender: formatTime } },
        { name: "network_names", label: "Networks", options: { customBodyRender: (val) => val?.join(', ') || "-" } },
        { name: "seen_in", label: "Seen In", options: { customBodyRender: (val) => val?.join(', ') || "-" } }
    ];

    const ipsByImeiColumns = [
        { name: "source_ip", label: "Source IP" },
        { name: "packet_count", label: "Packet Count" },
        { name: "first_seen", label: "First Seen", options: { customBodyRender: formatTime } },
        { name: "last_seen", label: "Last Seen", options: { customBodyRender: formatTime } },
        { name: "network_names", label: "Networks", options: { customBodyRender: (val) => val?.join(', ') || "-" } },
        { name: "seen_in", label: "Seen In", options: { customBodyRender: (val) => val?.join(', ') || "-" } }
    ];

    const fetchUniqueIps = async () => {
        setLoading(true);
        try {
            const res = await HomePageService.getDeviceIpUnique({
                source, days, page, page_size: pageSize, search: ipSearch
            });
            if (res?.data?.status === 'success') {
                setUniqueIpsData(res.data.data || []);
                setTotalRecords(res.data.pagination?.total || 0);
            } else {
                setUniqueIpsData([]);
            }
        } catch (error) {
            console.error("Error fetching unique IPs", error);
            setUniqueIpsData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchImeisByIp = async () => {
        if (!targetIp) return;
        setLoading(true);
        try {
            const res = await HomePageService.getDeviceIpImeis({
                ip: targetIp, source, days, page, page_size: pageSize
            });
            if (res?.data?.status === 'success') {
                setImeisByIpData(res.data.data || []);
                setTotalRecords(res.data.pagination?.total || 0);
            } else {
                setImeisByIpData([]);
            }
        } catch (error) {
            console.error("Error fetching IMEIs by IP", error);
            setImeisByIpData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchIpsByImei = async () => {
        if (!targetImei) return;
        setLoading(true);
        try {
            const res = await HomePageService.getDeviceIpByImei({
                imei: targetImei, source, days, page, page_size: pageSize
            });
            if (res?.data?.status === 'success') {
                setIpsByImeiData(res.data.data || []);
                setTotalRecords(res.data.pagination?.total || 0);
            } else {
                setIpsByImeiData([]);
            }
        } catch (error) {
            console.error("Error fetching IPs by IMEI", error);
            setIpsByImeiData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(1);
        setTotalRecords(0);
    };

    useEffect(() => {
        if (tabValue === 0) fetchUniqueIps();
        else if (tabValue === 1 && targetIp) fetchImeisByIp();
        else if (tabValue === 2 && targetImei) fetchIpsByImei();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabValue, page, pageSize, days, source]);

    const handleSearch = (e) => {
        e?.preventDefault();
        setPage(1);
        if (tabValue === 0) fetchUniqueIps();
        else if (tabValue === 1) fetchImeisByIp();
        else if (tabValue === 2) fetchIpsByImei();
    };

    const handleTableChange = (action, tableState) => {
        if (action === 'changePage') {
            setPage(tableState.page + 1);
        } else if (action === 'changeRowsPerPage') {
            setPageSize(tableState.rowsPerPage);
            setPage(1);
        }
    };

    const getOptions = () => ({
        serverSide: true,
        count: totalRecords,
        page: page - 1,
        rowsPerPage: pageSize,
        rowsPerPageOptions: [10, 50, 100, 200],
        onTableChange: handleTableChange,
        search: false,
        filter: false,
        selectableRows: 'none'
    });

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Typography variant="h3" sx={{ mb: 2 }}>Device IP Dashboard</Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="device ip tabs">
                        <Tab label="Unique IPs" />
                        <Tab label="IMEIs by IP" />
                        <Tab label="IPs by IMEI" />
                    </Tabs>
                </Box>

                {/* Common Filters */}
                <Box sx={{ mb: 3 }}>
                    <form onSubmit={handleSearch}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Source</InputLabel>
                                    <Select
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        label="Source"
                                    >
                                        <MenuItem value="all">All (GPS + EM)</MenuItem>
                                        <MenuItem value="gps">GPS Only</MenuItem>
                                        <MenuItem value="em">Emergency Only</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Days (Look-back)"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    variant="outlined"
                                    inputProps={{ min: 1, max: 90 }}
                                />
                            </Grid>
                            
                            {tabValue === 0 && (
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Search IP Prefix (e.g. 106.222)"
                                        value={ipSearch}
                                        onChange={(e) => setIpSearch(e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                            )}
                            
                            {tabValue === 1 && (
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Target IP"
                                        value={targetIp}
                                        onChange={(e) => setTargetIp(e.target.value)}
                                        variant="outlined"
                                        placeholder="e.g. 106.222.247.168"
                                    />
                                </Grid>
                            )}
                            
                            {tabValue === 2 && (
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Target IMEI"
                                        value={targetImei}
                                        onChange={(e) => setTargetImei(e.target.value)}
                                        variant="outlined"
                                        placeholder="14-17 digits"
                                    />
                                </Grid>
                            )}

                            <Grid item>
                                <Button type="submit" variant="contained" color="primary" startIcon={<SearchIcon />}>
                                    Search
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Grid>

            <Grid item xs={12}>
                <TabPanel value={tabValue} index={0}>
                    <DynamicDatatables
                        tableTitle="Unique Source IPs"
                        rows={uniqueIpsData}
                        columns={uniqueIpsColumns}
                        options={getOptions()}
                    />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                    <DynamicDatatables
                        tableTitle={`IMEIs using IP: ${targetIp || '...'}`}
                        rows={imeisByIpData}
                        columns={imeisByIpColumns}
                        options={getOptions()}
                    />
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                    <DynamicDatatables
                        tableTitle={`IPs used by IMEI: ${targetImei || '...'}`}
                        rows={ipsByImeiData}
                        columns={ipsByImeiColumns}
                        options={getOptions()}
                    />
                </TabPanel>
            </Grid>
        </Grid>
    );
};

export default DeviceIpDashboard;
