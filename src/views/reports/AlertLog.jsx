import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, TextField, Button } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import showDeviceApi from '../../services/showDeviceApi';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import CustomLoader from '../../ui-component/CustomLoader';
import { dateTimeUpdate } from "../../helper";

const AlertLog = () => {

      useEffect(()=>{
         const response=showDeviceApi.getDeviceTagsSearch()
         console.log(response)
      },[])

    const currentDate = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const [deviceTagId, setDeviceTagId] = useState('');
    const [alertData, setAlertData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fromDate, setFromDate] = useState(dateTimeUpdate(new Date(Date.now() - 86400000))); // 24 hours ago
    const [toDate, setToDate] = useState(dateTimeUpdate(new Date())); // current time

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'device_tag_id', headerName: 'Device Tag ID', width: 130 },
        { field: 'alert_type', headerName: 'Alert Type', width: 130 },
        { field: 'alert_message', headerName: 'Alert Message', width: 300 },
        { field: 'timestamp', headerName: 'Timestamp', width: 200 },
    ];

    const handleFromDateChange = (e) => {
        const selected = new Date(e.target.value);
        const today = new Date();
        if (selected <= today) {
            setFromDate(e.target.value);
        }
    };

    const handleToDateChange = (e) => {
        const selected = new Date(e.target.value);
        const today = new Date();
        if (selected <= today) {
            setToDate(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await showDeviceApi.getDeviceAlert({
                device_tag_id: parseInt(deviceTagId),
                start_datetime: fromDate,
                end_datetime: toDate
            });
            
            setAlertData(response.data.map((alert, index) => ({
                ...alert,
                id: index + 1
            })));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch alert data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainCard title="Alert Log Report">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Device Tag ID"
                                        value={deviceTagId}
                                        onChange={(e) => setDeviceTagId(e.target.value)}
                                        type="number"
                                        required
                                        error={!!error}
                                        helperText={error}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="From Date"
                                        type="datetime-local"
                                        value={fromDate}
                                        onChange={handleFromDateChange}
                                        inputProps={{ max: yesterday }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="To Date"
                                        type="datetime-local"
                                        value={toDate}
                                        onChange={handleToDateChange}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ max: currentDate }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        fullWidth
                                        style={{ height: "48px" }}
                                    >
                                        Get Alerts
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    {loading ? (
                        <CustomLoader />
                    ) : (
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={alertData}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                checkboxSelection
                                disableSelectionOnClick
                            />
                        </div>
                    )}
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default AlertLog; 