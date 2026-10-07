import React, { useEffect, useState } from 'react';
import HomePageService from 'services/HomePage';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {
    Grid,
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Link,
    Tabs,
    Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { gridSpacing } from "../../store/constant";

const DeviceIpHistory = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [tabValue, setTabValue] = useState(0); // 0 for Unique IPs, 1 for IMEI search
    const [days, setDays] = useState(7);
    const [source, setSource] = useState("all");
    
    // Modal state for showing IMEIs for a specific IP
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIp, setSelectedIp] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const formatArray = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString();
    };

    const mainColumns = [
        {
            name: "source_ip",
            label: "Source IP",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => (
                    <Link 
                        component="button"
                        variant="body2"
                        onClick={() => handleIpClick(value)}
                        style={{ fontWeight: 'bold' }}
                    >
                        {value}
                    </Link>
                )
            },
        },
        { name: "packet_count", label: "Packets", options: { filter: false, sort: true } },
        { name: "imei_count", label: "IMEI Count", options: { filter: false, sort: true, display: tabValue === 0 } },
        { 
            name: "first_seen", 
            label: "First Seen", 
            options: { filter: false, sort: true, customBodyRender: formatDate } 
        },
        { 
            name: "last_seen", 
            label: "Last Seen", 
            options: { filter: false, sort: true, customBodyRender: formatDate } 
        },
        { 
            name: "network_names", 
            label: "Networks", 
            options: { filter: true, sort: false, customBodyRender: formatArray } 
        },
        { 
            name: "seen_in", 
            label: "Source", 
            options: { filter: true, sort: false, customBodyRender: formatArray } 
        }
    ];

    const modalColumns = [
        { name: "imei", label: "IMEI", options: { filter: true, sort: true } },
        { name: "packet_count", label: "Packets", options: { filter: false, sort: true } },
        { name: "first_seen", label: "First Seen", options: { filter: false, sort: true, customBodyRender: formatDate } },
        { name: "last_seen", label: "Last Seen", options: { filter: false, sort: true, customBodyRender: formatDate } },
        { name: "network_names", label: "Networks", options: { filter: true, sort: false, customBodyRender: formatArray } },
        { name: "seen_in", label: "Source", options: { filter: true, sort: false, customBodyRender: formatArray } }
    ];

    const fetchMainData = async () => {
        try {
            setLoading(true);
            let res;
            
            if (tabValue === 1 && searchQuery.trim() !== '') {
                // Search by IMEI
                res = await HomePageService.getDeviceIpByImei({ 
                    imei: searchQuery.trim(), 
                    days, 
                    source, 
                    page: 1, 
                    page_size: 200 
                });
            } else {
                // Default: Unique IPs
                res = await HomePageService.getDeviceIpUnique({ 
                    search: tabValue === 0 ? searchQuery.trim() : '', 
                    days, 
                    source, 
                    page: 1, 
                    page_size: 200 
                });
            }
            
            if (res?.data?.status === 'success' && res?.data?.data) {
                setData(res.data.data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching device IP data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMainData();
    };

    useEffect(() => {
        // Clear search query when switching tabs to prevent confusion
        setSearchQuery("");
    }, [tabValue]);

    useEffect(() => {
        fetchMainData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days, source, tabValue]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleIpClick = async (ip) => {
        setSelectedIp(ip);
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await HomePageService.getDeviceIpImeis({
                ip: ip,
                days,
                page: 1,
                page_size: 200
            });
            if (res?.data?.status === 'success' && res?.data?.data) {
                setModalData(res.data.data);
            } else {
                setModalData([]);
            }
        } catch (error) {
            console.error("Error fetching IMEIs for IP:", error);
            setModalData([]);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedIp(null);
        setModalData([]);
    };

    const tableOptions = {
        search: true,
        searchPlaceholder: "Filter current page...",
        serverSide: false, // For simplicity in this example, handling pagination client side or showing max 200.
        filter: true,
        sort: true,
        selectableRows: 'none'
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    Device IP History
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="device ip history tabs">
                        <Tab label="Unique IPs" />
                        <Tab label="Search by IMEI" />
                    </Tabs>
                </Box>
                
                <Box mb={3}>
                    <form onSubmit={handleSearch}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label={tabValue === 0 ? "Search IP (e.g. 106.222)" : "Search Exact IMEI"}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Days</InputLabel>
                                    <Select
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                        label="Days"
                                    >
                                        <MenuItem value={1}>Last 24 Hours</MenuItem>
                                        <MenuItem value={7}>Last 7 Days</MenuItem>
                                        <MenuItem value={30}>Last 30 Days</MenuItem>
                                        <MenuItem value={90}>Last 90 Days</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Source</InputLabel>
                                    <Select
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        label="Source"
                                    >
                                        <MenuItem value="all">All Logs</MenuItem>
                                        <MenuItem value="gps">GPS Tracking Only</MenuItem>
                                        <MenuItem value="em">Emergency Only</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SearchIcon />}
                                    disabled={loading}
                                >
                                    {t('common.search', 'Search')}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Grid>

            <Grid item xs={12}>
                <DynamicDatatables
                    tableTitle={tabValue === 1 && searchQuery ? `IPs used by IMEI: ${searchQuery}` : "Unique IP Addresses"}
                    rows={data}
                    columns={mainColumns}
                    options={{...tableOptions, textLabels: { body: { noMatch: loading ? "Loading..." : "No records found" }}}}
                    helperText="Click on an IP address to see which IMEIs used it."
                />
            </Grid>

            {/* Modal for IP -> IMEIs */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="lg" fullWidth>
                <DialogTitle>IMEIs associated with IP: {selectedIp}</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        <DynamicDatatables
                            tableTitle={`IMEIs for ${selectedIp}`}
                            rows={modalData}
                            columns={modalColumns}
                            options={{...tableOptions, search: false, textLabels: { body: { noMatch: modalLoading ? "Loading..." : "No records found" }}}}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Grid>
    );
};

export default DeviceIpHistory;
