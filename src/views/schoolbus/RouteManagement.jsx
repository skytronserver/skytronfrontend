import React, { useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Alert,
    Divider,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import { routeFields, busStopFields } from '../../formjson/schoolbus';

const RouteManagement = () => {
    const theme = useTheme();
    const [openRoute, setOpenRoute] = useState(false);
    const [openStop, setOpenStop] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const t = (key) => key;

    // Mock data
    const [routes] = useState([
        { id: '1', routeName: 'Route A - North', description: 'Morning/Evening North Zone', status: 'Active', stopsCount: 5 },
    ]);

    const [stops] = useState([
        { id: '1', stopName: 'Sector 5 Gates', latitude: '28.6139', longitude: '77.2090', timing: '07:30 AM' },
        { id: '2', stopName: 'Modern School Stop', latitude: '28.6145', longitude: '77.2095', timing: '07:45 AM' },
    ]);

    const routeColumns = [
        { name: 'routeName', label: 'Route Name' },
        { name: 'description', label: 'Description' },
        {
            name: 'status',
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip label={value} color={value === 'Active' ? 'success' : 'default'} size="small" />
                )
            }
        },
        { name: 'stopsCount', label: 'No. of Stops' },
        {
            name: 'id',
            label: 'Actions',
            options: {
                customBodyRender: (value) => (
                    <Button size="small" variant="outlined" onClick={() => setSelectedRoute(value)}>Manage Stops</Button>
                )
            }
        }
    ];

    const stopColumns = [
        { name: 'stopName', label: 'Stop Name' },
        { name: 'latitude', label: 'Lat' },
        { name: 'longitude', label: 'Lon' },
        { name: 'timing', label: 'Timing' },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                {/* Header */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, bgcolor: theme.palette.success.light, borderRadius: 2 }}>
                                    <RouteIcon fontSize="large" color="success" />
                                </Box>
                                <Box>
                                    <Typography variant="h3" fontWeight={700}>Route & Stop Management</Typography>
                                    <Typography variant="body2" color="text.secondary">Create paths and designated stops with geo-coordinates</Typography>
                                </Box>
                            </Box>
                            <AnimateButton>
                                <Button variant="contained" color="success" startIcon={<RouteIcon />} onClick={() => setOpenRoute(true)}>Create New Route</Button>
                            </AnimateButton>
                        </Box>
                    </MainCard>
                </Grid>

                {/* Routes Report */}
                <Grid item xs={12} lg={7}>
                    <MainCard title="Registered Routes">
                        <DynamicDatatables
                            tableTitle="School Route Directory"
                            rows={routes}
                            columns={routeColumns}
                            options={{ selectableRows: 'none', filter: true, search: true }}
                        />
                    </MainCard>
                </Grid>

                {/* Map Shortcut/Stops */}
                <Grid item xs={12} lg={5}>
                    <MainCard title="Bus Stops Inventory" secondary={<Button size="small" startIcon={<AddLocationIcon />} onClick={() => setOpenStop(true)}>Add Stop</Button>}>
                        <DynamicDatatables
                            tableTitle="Stops on Selected Route"
                            rows={stops}
                            columns={stopColumns}
                            options={{ selectableRows: 'none', filter: false, search: true, pagination: false }}
                        />
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                            Map integration for visual route fixing is coming soon. Use latitude and longitude to fix stops for now.
                        </Alert>
                    </MainCard>
                </Grid>
            </Grid>

            {/* Create Route Dialog */}
            <Dialog open={openRoute} onClose={() => setOpenRoute(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Create Bus Route</Typography>
                    <IconButton onClick={() => setOpenRoute(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{ routeName: '', description: '', status: 'Active' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(routeFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values) => { console.log(values); setOpenRoute(false); }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={routeFields(t).routeName} formik={formik} />
                                <FormField fieldConfig={routeFields(t).description} formik={formik} />
                                <FormField fieldConfig={routeFields(t).status} formik={formik} />
                                <Box sx={{ mt: 2 }}>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="success" type="submit">Save Route</Button>
                                    </AnimateButton>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

            {/* Add Stop Dialog */}
            <Dialog open={openStop} onClose={() => setOpenStop(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Add Bus Stop</Typography>
                    <IconButton onClick={() => setOpenStop(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{ stopName: '', latitude: '', longitude: '', timing: '' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(busStopFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values) => { console.log(values); setOpenStop(false); }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={busStopFields(t).stopName} formik={formik} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormField fieldConfig={busStopFields(t).latitude} formik={formik} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormField fieldConfig={busStopFields(t).longitude} formik={formik} />
                                    </Grid>
                                </Grid>
                                <FormField fieldConfig={busStopFields(t).timing} formik={formik} />
                                <Box sx={{ mt: 2 }}>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="primary" type="submit" startIcon={<LocationOnIcon />}>Fix Geofence Stop</Button>
                                    </AnimateButton>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default RouteManagement;
