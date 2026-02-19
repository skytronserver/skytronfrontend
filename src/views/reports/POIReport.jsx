import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Collapse,
    Card,
    CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import POIService from '../../services/POIService';

const POIReport = () => {
    // Filter states
    const [filters, setFilters] = useState({
        name: '',
        status: '',
        mark_type: '',
        use_type: '',
    });

    const [quickRange, setQuickRange] = useState('');

    // Component states
    const [poiData, setPoiData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Mark types
    const markTypes = [
        'Point',
        'Circle',
        'Polygon',
        'Road'
    ];

    // Use types (simplified list, add more if needed)
    const useTypes = [
        'School', 'Hospital', 'PoliceStation', 'BusStop', 'RailwayStation',
        'Airport', 'FuelStation', 'TollGate', 'Other', 'Personal',
        'dealer', 'Unauthorised Stop', 'no_entry', 'parking', 'no_parking',
        'StateBoundary', 'DistrictBoundary', 'CityBoundary', 'VillageBoundary', 'PermitRoute'
    ];

    // POI status options
    const statusOptions = ['Active', 'NotActive'];

    // Fetch POI data on component mount
    useEffect(() => {
        fetchPOIData();
    }, []);

    // Fetch POI data
    const fetchPOIData = async () => {
        setLoading(true);
        try {
            const response = await POIService.getAllPOIs();
            if (response && response.data) {
                setPoiData(response.data);
                setFilteredData(response.data);
            } else {
                setPoiData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error('Error fetching POI data:', error);
            setPoiData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resolveQuickRangeFromDate = (rangeKey) => {
        const now = new Date();
        if (!rangeKey) return null;

        if (rangeKey === 'past_hour') {
            return new Date(now.getTime() - 60 * 60 * 1000);
        }
        if (rangeKey === 'past_24h') {
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        if (rangeKey === 'past_3d') {
            return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        }
        if (rangeKey === 'past_7d') {
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        if (rangeKey === 'past_3m') {
            const from = new Date(now);
            from.setMonth(from.getMonth() - 3);
            return from;
        }

        return null;
    };

    // Apply filters
    const applyFilters = () => {
        let result = [...poiData];

        if (quickRange) {
            const from = resolveQuickRangeFromDate(quickRange);
            const now = new Date();
            if (from) {
                result = result.filter((poi) => {
                    const createdRaw = poi?.created;
                    if (!createdRaw) return false;
                    const createdDate = new Date(createdRaw);
                    if (!Number.isFinite(createdDate.getTime())) return false;
                    return createdDate >= from && createdDate <= now;
                });
            }
        }

        if (filters.name) {
            const searchLower = filters.name.toLowerCase();
            result = result.filter(poi =>
                (poi.name && poi.name.toLowerCase().includes(searchLower)) ||
                (poi.description && poi.description.toLowerCase().includes(searchLower)) ||
                (poi.address && poi.address.toLowerCase().includes(searchLower))
            );
        }

        if (filters.status) {
            result = result.filter(poi => poi.status === filters.status);
        }

        if (filters.mark_type) {
            result = result.filter(poi => poi.mark_type === filters.mark_type);
        }

        if (filters.use_type) {
            const searchType = filters.use_type === 'Unauthorised Stop' ? 'prohibited_area' : filters.use_type;
            result = result.filter(poi => poi.use_type === searchType || poi.use_type === filters.use_type);
        }

        setFilteredData(result);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            name: '',
            status: '',
            mark_type: '',
            use_type: '',
        });
        setQuickRange('');
        setFilteredData(poiData);
    };

    // Count active filters
    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => filters[key] !== '').length;
    };

    // DataGrid columns
    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            flex: 0.3
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 150,
            flex: 1
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 200,
            flex: 1.5
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 200,
            flex: 1.5,
            valueGetter: (params) => params.row.address || 'N/A'
        },
        {
            field: 'use_type',
            headerName: 'Type',
            width: 130,
            flex: 1,
            renderCell: (params) => {
                let displayValue = params.value;
                if (displayValue === 'prohibited_area') {
                    displayValue = 'Unauthorised Stop';
                }
                return (
                    <Chip
                        label={displayValue}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'mark_type',
            headerName: 'Shape',
            width: 100,
            flex: 0.8,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color="secondary"
                    variant="outlined"
                />
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            flex: 0.8,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'Active' ? 'success' : 'error'}
                />
            )
        },
        {
            field: 'radius',
            headerName: 'Radius (m)',
            width: 100,
            flex: 0.8,
            valueGetter: (params) => params.row.radius || '-'
        },
        {
            field: 'location',
            headerName: 'Location Data',
            width: 200,
            flex: 1.5,
            valueGetter: (params) => {
                try {
                    // Just show a snippet of the JSON location data
                    return params.row.location;
                } catch (e) {
                    return 'Invalid Data';
                }
            },
            renderCell: (params) => (
                <Tooltip title={params.value || ''}>
                    <Typography variant="body2" noWrap>{params.value}</Typography>
                </Tooltip>
            )
        }
    ];

    // Export to CSV
    const exportToCSV = () => {
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = [
            'ID', 'Name', 'Description', 'Address', 'Use Type', 'Mark Type',
            'Status', 'Radius', 'Location'
        ];

        const csvData = filteredData.map(row => [
            row.id,
            row.name,
            `"${(row.description || '').replace(/"/g, '""')}"`, // Escape quotes
            `"${(row.address || '').replace(/"/g, '""')}"`,
            row.use_type,
            row.mark_type,
            row.status,
            row.radius || '',
            `"${(row.location || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))]
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `poi_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <MainCard title="POI Report">
            <Grid container spacing={3}>
                {/* Filter Section */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ pb: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setFiltersExpanded(!filtersExpanded)}
                            >
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FilterList sx={{ mr: 1 }} />
                                    Filter Options
                                    {!filtersExpanded && getActiveFiltersCount() > 0 && (
                                        <Chip
                                            label={`${getActiveFiltersCount()} active`}
                                            size="small"
                                            color="primary"
                                            sx={{ ml: 2 }}
                                        />
                                    )}
                                </Typography>
                                <IconButton size="small">
                                    {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>

                            <Collapse in={filtersExpanded}>
                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        {/* Search Name/Desc */}
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Search (Name/Desc/Address)"
                                                value={filters.name}
                                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                            />
                                        </Grid>

                                        {/* Status */}
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={filters.status}
                                                    label="Status"
                                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                                >
                                                    <MenuItem value="">All Statuses</MenuItem>
                                                    {statusOptions.map(status => (
                                                        <MenuItem key={status} value={status}>{status}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Mark Type */}
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Shape</InputLabel>
                                                <Select
                                                    value={filters.mark_type}
                                                    label="Shape"
                                                    onChange={(e) => handleFilterChange('mark_type', e.target.value)}
                                                >
                                                    <MenuItem value="">All Shapes</MenuItem>
                                                    {markTypes.map(type => (
                                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Use Type */}
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Type</InputLabel>
                                                <Select
                                                    value={filters.use_type}
                                                    label="Type"
                                                    onChange={(e) => handleFilterChange('use_type', e.target.value)}
                                                >
                                                    <MenuItem value="">All Types</MenuItem>
                                                    {useTypes.map(type => (
                                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Quick Range */}
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel id="poi-quick-range-label">Quick Range</InputLabel>
                                                <Select
                                                    labelId="poi-quick-range-label"
                                                    value={quickRange}
                                                    label="Quick Range"
                                                    onChange={(e) => setQuickRange(e.target.value)}
                                                >
                                                    <MenuItem value=""><em>None</em></MenuItem>
                                                    <MenuItem value="past_hour">Past hour</MenuItem>
                                                    <MenuItem value="past_24h">Past 24 hours</MenuItem>
                                                    <MenuItem value="past_3d">Past 3 days</MenuItem>
                                                    <MenuItem value="past_7d">Past 7 days</MenuItem>
                                                    <MenuItem value="past_3m">Past 3 months</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Action Buttons */}
                                        <Grid item xs={12} md={12}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={applyFilters}
                                                    startIcon={<FilterList />}
                                                >
                                                    Apply Filters
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={clearFilters}
                                                    startIcon={<Clear />}
                                                >
                                                    Clear Filters
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Collapse>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Results Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                POI List ({filteredData.length})
                            </Typography>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Download />}
                                onClick={exportToCSV}
                                disabled={filteredData.length === 0}
                                size="small"
                            >
                                Export CSV
                            </Button>
                        </Box>

                        {loading ? (
                            <CustomLoader />
                        ) : (
                            <Box sx={{
                                height: 600,
                                width: '100%',
                                '& .MuiDataGrid-root': {
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #e0e0e0'
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #e0e0e0'
                                    }
                                }
                            }}>
                                <DataGrid
                                    rows={filteredData}
                                    columns={columns}
                                    pageSize={25}
                                    rowsPerPageOptions={[10, 25, 50, 100]}
                                    pagination
                                    disableSelectionOnClick
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default POIReport;
