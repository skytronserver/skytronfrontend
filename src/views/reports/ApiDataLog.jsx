import React, { useState, useEffect, useCallback } from 'react'
import HomePageService from 'services/HomePage'
import DynamicDatatables from '../../datatables/DynamicDatatables'
import Grid from "@mui/material/Grid"
import { gridSpacing } from "../../store/constant"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'

const ApiDataLog = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const apiDataColumns = [
        {
            name: "timestamp",
            label: t('common.timestamp'),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    return new Date(value).toLocaleString();
                }
            },
        },
        {
            name: "request_url",
            label: t('apiData.requestUrl'),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    return (
                        <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {value}
                        </div>
                    );
                }
            },
        },
        {
            name: "ip_address",
            label: t('apiData.ipAddress'),
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: "request_type",
            label: t('apiData.method'),
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: "status",
            label: t('common.status'),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    return value.includes('Failed') ? 
                        <Chip label={value} color="error" size="small" /> : 
                        <Chip label={value} color="success" size="small" />;
                }
            },
        },
        {
            name: "incoming_data",
            label: t('apiData.requestData'),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value) => {
                    try {
                        // Handle special format like "b'{\"token\":...}'"
                        if (typeof value === 'string' && value.startsWith('"b\'') && value.endsWith('\'"')) {
                            value = value.substring(3, value.length - 2);
                        }
                        
                        // For empty objects
                        if (value === '{}') {
                            return t('apiData.noData');
                        }
                        
                        // Try to parse and pretty print JSON
                        let displayValue = value;
                        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                            try {
                                const parsedJson = JSON.parse(value);
                                displayValue = JSON.stringify(parsedJson, null, 2);
                            } catch (e) {
                                // If parsing fails, use the original value
                            }
                        }
                        
                        return (
                            <div style={{ maxWidth: '300px', maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap' }}>
                                {displayValue}
                            </div>
                        );
                    } catch (e) {
                        console.error("Error rendering data:", e);
                        return <div>{t('apiData.errorDisplayingData')}</div>;
                    }
                }
            },
        },
    ];

    const parseApiData = (response) => {
        try {
            console.log('Parsing API Response:', response);
            
            // API response could be in different formats
            let results = [];
            let count = 0;
            
            // Handle the response from POST request
            if (response && response.data) {
                // Most likely structure for a POST response
                if (Array.isArray(response.data.results)) {
                    results = response.data.results;
                    count = response.data.count || results.length;
                } else if (Array.isArray(response.data)) {
                    results = response.data;
                    count = results.length;
                } else {
                    console.warn('Unexpected data structure:', response.data);
                    // Try to extract results if present in a different format
                    if (response.data.results) {
                        results = response.data.results;
                        count = response.data.count || results.length;
                    }
                }
            } else if (response && Array.isArray(response.results)) {
                results = response.results;
                count = response.count || results.length;
            } else if (Array.isArray(response)) {
                results = response;
                count = results.length;
            }
            
            if (!results || results.length === 0) {
                console.warn('No results found in API response');
                return { data: [], count: 0 };
            }

            const transformedData = results.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                timestamp: item.timestamp || new Date().toISOString(),
                request_url: item.request_url || 'N/A',
                ip_address: item.ip_address || 'N/A',
                request_type: item.request_type || 'N/A',
                incoming_data: item.incoming_data || '{}',
                status: item.error_code ? `Failed (${item.error_code})` : 'Success'
            }));
            
            return { 
                data: transformedData,
                count: count
            };
        } catch (error) {
            console.error('Error parsing API data:', error);
            return { data: [], count: 0 };
        }
    }

    // Use useCallback to prevent unnecessary re-renders
    const fetchData = useCallback(async (pageNum, rowsPerPageNum, searchQuery = "") => {
        setLoading(true);
        try {
            // Format parameters exactly as specified
            const params = {
                page: pageNum + 1, // API is 1-based, MUI is 0-based
                per_page: rowsPerPageNum
            };
            
            // Add search query if provided
            if (searchQuery && searchQuery.trim() !== '') {
                params.q = searchQuery.trim();
            }
            
            console.log('Fetching API logs with params:', params);
            
            // Make API call with params in URL
            const response = await HomePageService.getApiDataLog(params);
            
            // Debug successful response
            console.log('API response status:', response.status);
            
            // Parse data
            const { data, count } = parseApiData(response);
            console.log(`Found ${data.length} records out of ${count} total`);
            
            setData(data);
            setTotalCount(count);
        } catch (error) {
            console.error('Error fetching API data:', error);
            if (error.response) {
                console.error('Error status:', error.response.status);
            }
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        fetchData(page, rowsPerPage, searchQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle search form submission
    const handleSearch = (event) => {
        event.preventDefault();
        console.log('Search query:', searchQuery);
        setPage(0); // Reset to first page when searching
        fetchData(0, rowsPerPage, searchQuery);
    };

    // Handle page change
    const handleChangePage = (newPage) => {
        console.log('Changing to page:', newPage);
        setPage(newPage);
        fetchData(newPage, rowsPerPage, searchQuery);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        // MUI DataTable passes the event differently than standard Material UI
        // Check if it's a direct number or an event object
        let newRowsPerPage;
        if (typeof event === 'number') {
            newRowsPerPage = event;
        } else if (event && event.target) {
            newRowsPerPage = parseInt(event.target.value, 10);
        } else {
            console.error('Invalid rowsPerPage value:', event);
            return;
        }
        
        // Log the change for debugging
        console.log('Changing rows per page from', rowsPerPage, 'to', newRowsPerPage);
        
        // Update state and fetch data with new pagination
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page
        
        // Fetch data with the new pagination values
        fetchData(0, newRowsPerPage, searchQuery);
    };
    
    // Table options
    const options = {
        filter: false,
        filterType: 'dropdown',
        responsive: 'standard',
        serverSide: true,
        count: totalCount,
        page: page,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: [10, 25, 50, 100],
        onChangePage: handleChangePage,
        onChangeRowsPerPage: handleChangeRowsPerPage,
        selectableRows: 'none',
        download: true,
        print: true,
        search: false,
        sort: false,
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
                noMatch: loading ? 
                    t('common.loading') : 
                    t('common.noMatchingRecords'),
            },
            pagination: {
                next: t('common.nextPage'),
                previous: t('common.previousPage'),
                rowsPerPage: t('common.rowsPerPage'),
                displayRows: t('common.of'),
            },
        }
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <form onSubmit={handleSearch}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8} md={6} lg={4}>
                            <TextField
                                fullWidth
                                label={t('apiData.searchLabel')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="outlined"
                                placeholder={t('apiData.searchPlaceholder')}
                                helperText={t('apiData.searchHelperText')}
                            />
                        </Grid>
                        <Grid item xs="auto" style={{ marginTop: '8px' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<SearchIcon />}
                                disabled={loading}
                                style={{ height: '56px' }}
                            >
                                {t('common.search')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
            <Grid item xs={12}>
                {loading && data.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box position="relative">
                        {loading && (
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
                                bgcolor="rgba(255, 255, 255, 0.7)"
                            >
                                <Box textAlign="center">
                                    <CircularProgress />
                                    <Box mt={1}>{t('common.loading')}</Box>
                                </Box>
                            </Box>
                        )}
                        <Box mb={2}>
                            <small style={{ color: '#666' }}>
                                {t('common.pageInfo', { page: page + 1, rowsPerPage, total: totalCount })}
                            </small>
                        </Box>
                        <DynamicDatatables
                            tableTitle={t('apiData.title')}
                            rows={data}
                            columns={apiDataColumns}
                            options={options}
                        />
                    </Box>
                )}
            </Grid>
        </Grid>
    )
}

export default ApiDataLog 