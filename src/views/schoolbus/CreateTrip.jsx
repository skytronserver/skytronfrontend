import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

import SchoolBusService from '../../services/SchoolBusService';

const CreateTrip = () => {
    const [loading, setLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);

    const [formData, setFormData] = useState({
        bus: '',
        route: '',
        trip_date: '',
        start_time: '',
        end_time: ''
    });

    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);


    const loadAssignments = async () => {
        try {
            const response = await SchoolBusService.getRouteAssignments();

            setAssignments(response?.data?.data || []);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        loadAssignments();
    }, []);
    const handleBusChange = (e) => {
        const busId = e.target.value;

        const selectedAssignment = assignments.find(
            (item) => item.bus === busId
        );

        setFormData((prev) => ({
            ...prev,
            bus: busId,
            route: selectedAssignment?.route || ''
        }));
    };
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const selectedDateTime = new Date(
                `${formData.trip_date}T${formData.start_time}`
            );

            const currentDateTime = new Date();

            if (selectedDateTime < currentDateTime) {
                setSuccess(false);
                setMessage(
                    "Trip date and start time cannot be earlier than current date and time"
                );
                setLoading(false);
                return;
            }

            const payload = {
                bus: Number(formData.bus),
                route: Number(formData.route),
                trip_date: formData.trip_date,
                start_time: formData.start_time,
                end_time: formData.end_time
            };

            await SchoolBusService.createTrip(payload);

            setSuccess(true);
            setMessage('Trip Created Successfully');

            setFormData({
                bus: '',
                route: '',
                trip_date: '',
                start_time: '',
                end_time: ''
            });
        } catch (error) {
            setSuccess(false);
            setMessage(
                error?.response?.data?.message ||
                'Failed to create trip'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="h3" gutterBottom>
                        Create Trip
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Bus</InputLabel>

                                <Select
                                    value={formData.bus}
                                    label="Bus"
                                    onChange={handleBusChange}
                                >
                                    {assignments.map((item) => (
                                        <MenuItem key={item.id} value={item.bus}>
                                            {item.bus_number}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Route</InputLabel>

                                <Select
                                    value={formData.route}
                                    label="Route"
                                    disabled
                                >
                                    {assignments.map((item) => (
                                        <MenuItem key={item.id} value={item.route}>
                                            {item.route_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Trip Date"
                                name="trip_date"
                                value={formData.trip_date}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="time"
                                label="Start Time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="time"
                                label="End Time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Trip'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={4000}
                onClose={() => setMessage('')}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
            >
                <Alert
                    severity={success ? 'success' : 'error'}
                    onClose={() => setMessage('')}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CreateTrip;