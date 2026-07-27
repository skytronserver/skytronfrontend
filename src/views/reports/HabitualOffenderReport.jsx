import React, { useState } from 'react';
import {
    Grid, Typography, Button, Checkbox, FormControlLabel,
    Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MainCard from '../../ui-component/cards/MainCard';
import SettingService from '../../services/SettingService'; // Importing your service

// The full list of alerts from your screenshot
const ALERT_OPTIONS = [
    'Route Deviation', 'Geofence', 'Idling', 'OfflineDevice', 'Overtime', 'Unauthorized Stop', 'Unauthorized Skip', 'Network Loss',
    'GPS Loss', 'Permit', 'Permit Expiring Soon', 'Route Overspeed', 'State Border Cross', 'District Border Cross', 'City Border Cross', 'Incident',
    'Emergency SOS', 'EmPublicApp', 'EmRegisteredApp', 'EmMonitorTripSOS', 'EmMonitorTripInvalidPw', 'EmMonitorTripBLEDisconnect', 'EmMonitorTripDeviated', 'Engine Status',
    'Over Speed', 'Low Internal Battery', 'Low External Battery', 'External Battery Disconnected', 'Box Temperature', 'Emergency Temperature', 'Tilt', 'Harsh Braking',
    'Harsh Turn', 'Harsh Acceleration', 'Unauthorized Parking', 'Prohibited Area'
];

// Table columns matching the screenshot
const columns = [
    { field: 'vehicle_reg_no', headerName: 'Vehicle Reg No', flex: 1 },
    { field: 'imei', headerName: 'IMEI', flex: 1 },
    { field: 'alert_count', headerName: 'Alert Count', flex: 0.8 },
    { field: 'last_alert', headerName: 'Last Alert', flex: 1 },
    { field: 'breakdown', headerName: 'Breakdown', flex: 1 }
];

const HabitualOffenderReport = () => {
    const [selectedAlerts, setSelectedAlerts] = useState([
        'Over Speed', 'Harsh Turn', 'Harsh Acceleration', 'Route Overspeed', 'Harsh Braking'
    ]);
    const [selectedDate, setSelectedDate] = useState('This Year');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAlertToggle = (alert) => {
        setSelectedAlerts(prev =>
            prev.includes(alert) ? prev.filter(a => a !== alert) : [...prev, alert]
        );
    };

    const handleSelectAll = () => setSelectedAlerts(ALERT_OPTIONS);
    const handleReset = () => setSelectedAlerts([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Map the human-readable labels to the keys expected by the API
            const alertKeyMapping = {
                'Route Overspeed': 'Route_overspeed',
                'Over Speed': 'OverSpeed',
                'Harsh Braking': 'HarshBreak',
                'Harsh Turn': 'HarshTurn',
                'Harsh Acceleration': 'HarshAcceleration',
            };

            const mappedTypes = selectedAlerts.map(alert => alertKeyMapping[alert] || alert.replace(' ', ''));
            const formattedDate = selectedDate.toLowerCase().replace(' ', '_');

            // Calling your central service - the token header is handled automatically by Axios!
            const response = await SettingService.get_habitual_offender_report({
                types: mappedTypes.join(','),
                range: formattedDate,
                sort_by: 'alert_count',
                sort_dir: 'desc',
                page: 1,
                page_size: 20
            });

            const rawData = Array.isArray(response.data) ? response.data : (response.data?.devices || response.data?.results || []);
            
            setData(rawData.map((item, index) => {
                // Convert the breakdown object into a nice string (e.g., "OverSpeed: 10, HarshTurn: 12")
                let breakdownStr = '';
                if (item.breakdown && typeof item.breakdown === 'object') {
                    breakdownStr = Object.entries(item.breakdown)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                }

                return { 
                    id: item.device_tag_id || item.imei || index, 
                    ...item,
                    last_alert: item.last_alert_at || item.last_alert, // Map the new API field name
                    breakdown: breakdownStr // Replace the object with our formatted string
                };
            }));
        } catch (error) {
            console.error("Error fetching Habitual Offender Report:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainCard title="Habitual Offender Report">
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <span style={{ cursor: 'pointer', color: '#1976d2', marginRight: '15px' }} onClick={handleSelectAll}>Select all</span>
                    <span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={handleReset}>Reset to defaults</span>
                </Typography>

                <Grid container spacing={1}>
                    {ALERT_OPTIONS.map((alert) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={alert}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selectedAlerts.includes(alert)}
                                        onChange={() => handleAlertToggle(alert)}
                                    />
                                }
                                label={<Typography variant="body2">{alert}</Typography>}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {['Today', 'This Week', 'This Month', 'This Year', 'Since Beginning', 'Custom'].map((dateOption) => (
                    <Button
                        key={dateOption}
                        variant={selectedDate === dateOption ? "contained" : "outlined"}
                        onClick={() => setSelectedDate(dateOption)}
                        size="small"
                    >
                        {dateOption}
                    </Button>
                ))}
            </Box>

            <Button variant="contained" color="primary" onClick={fetchData} sx={{ mb: 3 }}>
                Apply
            </Button>

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    loading={loading}
                    disableSelectionOnClick
                />
            </div>
        </MainCard>
    );
};

export default HabitualOffenderReport;
