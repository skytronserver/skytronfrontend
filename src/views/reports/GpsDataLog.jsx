import React, { useEffect, useState } from 'react'
import HomePageService from 'services/HomePage'
import DynamicDatatables from '../../datatables/DynamicDatatables'
import Grid from "@mui/material/Grid"
import { gridSpacing } from "../../store/constant"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

const GpsDataLog = () => {
    const { t } = useTranslation();
    const gpsDataColumns = [
        {
            name: "timestamp",
            label: t('common.timestamp'),
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: "source_ip",
            label: "Source IP",
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: "imei",
            label: "IMEI",
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: "network_name",
            label: "Network Name",
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: "rawData",
            label: t('gpsData.rawData'),
            options: {
                filter: true,
                sort: false,
                setCellProps: () => ({ style: { wordBreak: 'break-all', minWidth: '300px' } })
            },
        },
    ];

    const [tabValue, setTabValue] = useState(0); // 0 for GPS, 1 for Emergency

    const displayColumns = tabValue === 1
        ? gpsDataColumns.filter(col => col.name !== 'network_name')
        : gpsDataColumns;
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [ipQuery, setIpQuery] = useState("")
    const [imeiQuery, setImeiQuery] = useState("")
    const [offlineFilter, setOfflineFilter] = useState('all')

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const parseData = (responseData) => {
        try {
            let parsedData;

            // Handle different response structures
            if (typeof responseData === 'string') {
                parsedData = JSON.parse(responseData);
            } else if (responseData?.data && typeof responseData.data === 'string') {
                parsedData = JSON.parse(responseData.data);
            } else if (responseData?.data?.data && typeof responseData.data.data === 'string') {
                parsedData = JSON.parse(responseData.data.data);
            } else {
                return [];
            }

            const transformedData = parsedData.map(item => ({
                id: item.pk,
                timestamp: item.fields.timestamp,
                source_ip: item.fields.source_ip,
                imei: item.fields.imei,
                network_name: item.fields.network_name,
                rawData: item.fields.raw_data,
                gpsDataArray: item.fields.raw_data.split(',')
            }));
            return transformedData;
        } catch (error) {
            console.error('Error parsing data:', error);
            return [];
        }
    }

    const fetchData = async (search = "", ip = "", imei = "") => {
        try {
            setLoading(true);
            let response;
            if (tabValue === 0) {
                response = await HomePageService.getGpsDataLog({
                    search: search,
                    ip: ip,
                    imei: imei
                });
            } else {
                response = await HomePageService.getEmergencyDataLogs({
                    search: search,
                    ip: ip,
                    imei: imei
                });
            }

            const parsedData = parseData(tabValue === 0 ? response.data : response);

            let filteredData = parsedData;
            if (offlineFilter !== 'all') {
                const hours = parseInt(offlineFilter, 10);
                if (!Number.isNaN(hours)) {
                    const thresholdTime = new Date(Date.now() - hours * 60 * 60 * 1000);
                    filteredData = parsedData.filter((row) => {
                        const timestamp = new Date(row.timestamp);
                        return timestamp < thresholdTime;
                    });
                }
            }

            setData(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (event) => {
        event.preventDefault();
        fetchData(searchQuery, ipQuery, imeiQuery);
    };

    useEffect(() => {
        fetchData(searchQuery, ipQuery, imeiQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabValue, offlineFilter]);

    const options = {
        search: false,
        searchPlaceholder: t('gpsData.searchPlaceholder'),
        serverSide: true,
        filter: false,
        sort: false,
        selectableRows: 'none'
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="data log tabs">
                        <Tab label="GPS Data Log" />
                        <Tab label="Emergency Data Log" />
                    </Tabs>
                </Box>
                <form onSubmit={handleSearch}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label={t('gpsData.searchByImei')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                label="IP"
                                value={ipQuery}
                                onChange={(e) => setIpQuery(e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                label="IMEI"
                                value={imeiQuery}
                                onChange={(e) => setImeiQuery(e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Device Offline Filter</InputLabel>
                                <Select
                                    value={offlineFilter}
                                    onChange={(e) => setOfflineFilter(e.target.value)}
                                    label="Device Offline Filter"
                                >
                                    <MenuItem value="all">All Records</MenuItem>
                                    <MenuItem value="0.25">Older than 15 minutes</MenuItem>
                                </Select>
                            </FormControl>
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
                        tableTitle={tabValue === 0 ? t('gpsData.title') : 'Emergency Data Logs'}
                        rows={data}
                        columns={displayColumns}
                        options={options}
                        helperText="Timestamps are in GMT/UTC."
                    />
                )}
            </Grid>
        </Grid>
    )
}

export default GpsDataLog
