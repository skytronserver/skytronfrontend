import React, { useEffect, useState } from 'react';
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
    Chip,
    Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteIcon from '@mui/icons-material/Route';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import { routeFields, busStopFields } from '../../formjson/schoolbus';
import SchoolBusService from '../../services/SchoolBusService';

const RouteManagement = () => {
    const theme = useTheme();
    const [openRoute, setOpenRoute] = useState(false);
    const [openEditRoute, setOpenEditRoute] = useState(false);
    const [openStop, setOpenStop] = useState(false);
    const [openEditStop, setOpenEditStop] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [editingRoute, setEditingRoute] = useState(null);
    const [editingStop, setEditingStop] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const t = (key) => key;

    const [routes, setRoutes] = useState([]);
    const [stops, setStops] = useState([]);

    const selectedRouteObj = routes.find((r) => String(r.id) === String(selectedRoute));

    const loadStops = async (routeId) => {
        if (!routeId) {
            setStops([]);
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await SchoolBusService.getStops(routeId);
            setStops(Array.isArray(res?.data) ? res.data : []);
        } catch (e) {
            setError(e?.message || 'Failed to load stops');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);
        SchoolBusService.getRoutes()
            .then((res) => {
                if (!mounted) return;
                const list = Array.isArray(res?.data?.data) ? res.data?.data : [];
                setRoutes(list);
                if (!selectedRoute && list.length > 0) {
                    setSelectedRoute(list[0]?.id);
                }
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load routes');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadStops(selectedRoute);
    }, [selectedRoute]);

    const routeColumns = [
        { name: 'name', label: 'Route Name' },
        { name: 'description', label: 'Description' },
        {
            name: 'status',
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip label={value} color={value === 'active' ? 'success' : 'default'} size="small" />
                )
            }
        },
        {
            name: 'stop_count',
            label: 'No. of Stops',
            options: {
                setCellHeaderProps: () => ({ style: { whiteSpace: 'nowrap', textAlign: 'center' } }),
                setCellProps: () => ({ style: { textAlign: 'center' } })
            }
        },
        {
            name: 'id',
            label: 'Actions',
            options: {
                customBodyRender: (value) => {
                    const route = routes.find((r) => String(r.id) === String(value));
                    return (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Edit Route">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setEditingRoute(route || null);
                                            setOpenEditRoute(true);
                                        }}
                                        disabled={!route}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Delete Route">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                        setConfirmConfig({
                                            title: 'Delete Route',
                                            message: 'Are you sure you want to delete this route? This will also remove all its stops.',
                                            onConfirm: async () => {
                                                setOpenConfirm(false);
                                                setError('');
                                                setLoading(true);
                                                await SchoolBusService.deleteRoute(value);
                                                const res = await SchoolBusService.getRoutes();
                                                const list = Array.isArray(res?.data) ? res.data : [];
                                                setRoutes(list);
                                                if (String(selectedRoute) === String(value)) {
                                                    setSelectedRoute(list?.[0]?.id || null);
                                                }
                                            }
                                        });
                                        setOpenConfirm(true);
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                }
            }
        }
    ];

    const stopColumns = [
        { name: 'stopName', label: 'Stop Name' },
        { name: 'latitude', label: 'Lat' },
        { name: 'longitude', label: 'Lon' },
        { name: 'timing', label: 'Timing' },
        {
            name: 'id',
            label: 'Actions',
            options: {
                customBodyRender: (value) => {
                    const stop = stops.find((s) => String(s.id) === String(value));
                    return (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Edit Stop">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setEditingStop(stop || null);
                                            setOpenEditStop(true);
                                        }}
                                        disabled={!stop}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Delete Stop">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                        setConfirmConfig({
                                            title: 'Delete Stop',
                                            message: 'Are you sure you want to delete this stop?',
                                            onConfirm: async () => {
                                                setOpenConfirm(false);
                                                setError('');
                                                setLoading(true);
                                                await SchoolBusService.deleteStop(value);
                                                await loadStops(selectedRoute);
                                                const rr = await SchoolBusService.getRoutes();
                                                setRoutes(Array.isArray(rr?.data) ? rr.data : []);
                                            }
                                        });
                                        setOpenConfirm(true);
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                }
            }
        }
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

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    </Grid>
                )}

                {loading && (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Loading route data...
                        </Alert>
                    </Grid>
                )}

                {/* Routes Report */}
                <Grid item xs={12} lg={7}>
                    <MainCard title="Registered Routes">
                        <DynamicDatatables
                            tableTitle="School Route Directory"
                            rows={routes}
                            columns={routeColumns}
                            options={{
                                selectableRows: 'none',
                                filter: true,
                                search: true,
                                responsive: 'standard',
                                onRowClick: (rowData, rowMeta) => {
                                    const route = routes?.[rowMeta?.dataIndex];
                                    if (!route?.id) return;
                                    setSelectedRoute(route.id);
                                    loadStops(route.id);
                                }
                            }}
                        />
                    </MainCard>
                </Grid>

                {/* Map Shortcut/Stops */}
                <Grid item xs={12} lg={5}>
                    <MainCard
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="h5">Bus Stops Inventory</Typography>
                                {selectedRouteObj?.name && <Chip size="small" color="primary" label={selectedRouteObj.name} />}
                            </Box>
                        }
                        secondary={
                            <Button size="small" startIcon={<AddLocationIcon />} onClick={() => setOpenStop(true)} disabled={!selectedRoute}>
                                Add Stop
                            </Button>
                        }
                    >
                        <DynamicDatatables
                            tableTitle="Stops on Selected Route"
                            rows={stops}
                            columns={stopColumns}
                            options={{ selectableRows: 'none', filter: false, search: true, pagination: false }}
                        />
                        
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
                        initialValues={{ name: '', description: '', status: 'active' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(routeFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                               debugger
                            setError('');
                            setLoading(true);
                            SchoolBusService.createRoute(values)
                                .then(() => SchoolBusService.getRoutes())
                                .then((res) => {
                                    debugger
                                    const list = Array.isArray(res?.data?.data) ? res.data?.data : [];
                                    setRoutes(list);
                                    if (list.length > 0) setSelectedRoute(list[0]?.id);
                                    resetForm();
                                    setOpenRoute(false);
                                })
                                .catch((e) => {
                                    setError(e?.message || 'Failed to create route');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={routeFields(t).name} formik={formik} />
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

            {/* Edit Route Dialog */}
            <Dialog open={openEditRoute} onClose={() => { setOpenEditRoute(false); setEditingRoute(null); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Edit Bus Route</Typography>
                    <IconButton onClick={() => { setOpenEditRoute(false); setEditingRoute(null); }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            name: editingRoute?.name || '',
                            description: editingRoute?.description || '',
                            status: editingRoute?.status || 'active'
                        }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(routeFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values, { setSubmitting }) => {
                          
                            if (!editingRoute?.id) {
                                setSubmitting(false);
                                return;
                            }
                            setError('');
                            setLoading(true);
                         
                            SchoolBusService.updateRoute(editingRoute.id, values)
                            
                                .then(() => SchoolBusService.getRoutes())
                                .then((res) => {
                                    setRoutes(Array.isArray(res?.data) ? res.data : []);
                                    setOpenEditRoute(false);
                                    setEditingRoute(null);
                                })
                                .catch((e) => {
                                    setError(e?.message || 'Failed to update route');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={routeFields(t).name} formik={formik} />
                                <FormField fieldConfig={routeFields(t).description} formik={formik} />
                                <FormField fieldConfig={routeFields(t).status} formik={formik} />
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button fullWidth variant="outlined" onClick={() => { setOpenEditRoute(false); setEditingRoute(null); }} disabled={loading || formik.isSubmitting}>Cancel</Button>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="success" type="submit" disabled={loading || formik.isSubmitting}>Save</Button>
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
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            if (!selectedRoute) {
                                setError('Please select a route first');
                                setSubmitting(false);
                                return;
                            }

                            setError('');
                            setLoading(true);
                            SchoolBusService.addStop(selectedRoute, values)
                                .then(() => SchoolBusService.getStops(selectedRoute))
                                .then((res) => {
                                    setStops(Array.isArray(res?.data) ? res.data : []);
                                    resetForm();
                                    setOpenStop(false);
                                })
                                .catch((e) => {
                                    setError(e?.message || 'Failed to add stop');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
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

            {/* Edit Stop Dialog */}
            <Dialog open={openEditStop} onClose={() => { setOpenEditStop(false); setEditingStop(null); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Edit Bus Stop</Typography>
                    <IconButton onClick={() => { setOpenEditStop(false); setEditingStop(null); }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            stopName: editingStop?.stopName || '',
                            latitude: editingStop?.latitude || '',
                            longitude: editingStop?.longitude || '',
                            timing: editingStop?.timing || ''
                        }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(busStopFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values, { setSubmitting }) => {
                            if (!editingStop?.id) {
                                setSubmitting(false);
                                return;
                            }
                            setError('');
                            setLoading(true);
                            SchoolBusService.updateStop(editingStop.id, values)
                                .then(() => SchoolBusService.getStops(selectedRoute))
                                .then((res) => {
                                    setStops(Array.isArray(res?.data) ? res.data : []);
                                    return SchoolBusService.getRoutes();
                                })
                                .then((rr) => {
                                    setRoutes(Array.isArray(rr?.data) ? rr.data : []);
                                    setOpenEditStop(false);
                                    setEditingStop(null);
                                })
                                .catch((e) => {
                                    setError(e?.message || 'Failed to update stop');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
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
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    <Button fullWidth variant="outlined" onClick={() => { setOpenEditStop(false); setEditingStop(null); }} disabled={loading || formik.isSubmitting}>Cancel</Button>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading || formik.isSubmitting}>Save</Button>
                                    </AnimateButton>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">{confirmConfig.title}</Typography>
                    <IconButton onClick={() => setOpenConfirm(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1">{confirmConfig.message}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button fullWidth variant="outlined" onClick={() => setOpenConfirm(false)} disabled={loading}>Cancel</Button>
                        <AnimateButton>
                            <Button
                                fullWidth
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    const fn = confirmConfig.onConfirm;
                                    if (!fn) return;
                                    Promise.resolve(fn())
                                        .catch((e) => {
                                            setError(e?.message || 'Action failed');
                                        })
                                        .finally(() => {
                                            setLoading(false);
                                        });
                                }}
                                disabled={loading}
                            >
                                Confirm
                            </Button>
                        </AnimateButton>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default RouteManagement;
