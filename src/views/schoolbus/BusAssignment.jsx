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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import { busAssignmentFields } from '../../formjson/schoolbus';
import SchoolBusService from '../../services/SchoolBusService';

const BusAssignment = () => {
    const theme = useTheme();
    const [openAssign, setOpenAssign] = useState(false);
    const [mode, setMode] = useState('assign');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const t = (key) => key;

    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const resolveBusId = (busRegNo) => buses.find((b) => String(b.regNo) === String(busRegNo))?.id || '';
    const resolveRouteId = (routeName) => routes.find((r) => String(r.name) === String(routeName))?.id || '';

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        Promise.all([SchoolBusService.getBuses(), SchoolBusService.getRouteOptions(), SchoolBusService.getAssignments()])
            .then(([bRes, rRes, aRes]) => {
                if (!mounted) return;
                setBuses(Array.isArray(bRes?.data) ? bRes.data : []);
                setRoutes(Array.isArray(rRes?.data) ? rRes.data : []);
                setAssignments(Array.isArray(aRes?.data) ? aRes.data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load assignment data');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const columns = [
        { name: 'busRegNo', label: 'Vehicle Reg No' },
        { name: 'driverName', label: 'Driver' },
        { name: 'routeName', label: 'Assigned Route' },
        { name: 'assignmentDate', label: 'Assigned Date' },
        {
            name: 'status',
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip label={value} color={value === 'Active' ? 'success' : 'default'} size="small" />
                )
            }
        },
        {
            name: 'id',
            label: 'Actions',
            options: {
                customBodyRender: (value, tableMeta) => {
                    const rowIndex = tableMeta?.rowIndex;
                    const assignment = typeof rowIndex === 'number' ? assignments?.[rowIndex] : null;
                    const busId = assignment ? resolveBusId(assignment.busRegNo) : '';

                    return (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Re-assign">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            if (!assignment) return;
                                            setSelectedAssignment(assignment);
                                            setMode('reassign');
                                            setOpenAssign(true);
                                        }}
                                        disabled={!assignment}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Untag">
                                <span>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                            if (!assignment || !busId) return;
                                            setConfirmConfig({
                                                title: 'Untag Bus',
                                                message: 'Are you sure you want to untag this bus from its route?',
                                                onConfirm: async () => {
                                                    setOpenConfirm(false);
                                                    setError('');
                                                    setLoading(true);
                                                    await SchoolBusService.untagBus(busId);
                                                    const aRes = await SchoolBusService.getAssignments();
                                                    setAssignments(Array.isArray(aRes?.data) ? aRes.data : []);
                                                }
                                            });
                                            setOpenConfirm(true);
                                        }}
                                        disabled={!assignment || !busId}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    );
                }
            }
        }
    ];

    const fieldConfig = busAssignmentFields(t, buses, routes);

    const initialFormValues =
        mode === 'reassign' && selectedAssignment
            ? {
                  busId: resolveBusId(selectedAssignment.busRegNo),
                  routeId: resolveRouteId(selectedAssignment.routeName)
              }
            : { busId: '', routeId: '' };

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                {/* Header */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, bgcolor: theme.palette.warning.light, borderRadius: 2 }}>
                                    <SwapHorizIcon fontSize="large" color="warning" />
                                </Box>
                                <Box>
                                    <Typography variant="h3" fontWeight={700}>Bus-to-Route Assignment</Typography>
                                    <Typography variant="body2" color="text.secondary">Link tagged vehicles to specific school routes</Typography>
                                </Box>
                            </Box>
                            <AnimateButton>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<DirectionsBusIcon />}
                                    onClick={() => {
                                        setMode('assign');
                                        setSelectedAssignment(null);
                                        setOpenAssign(true);
                                    }}
                                >
                                    New Assignment
                                </Button>
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
                            Loading assignment data...
                        </Alert>
                    </Grid>
                )}

                {/* Info Column */}
                <Grid item xs={12}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        <strong>Constraint:</strong> You can only assign vehicles that have been successfully tagged and approved by the State Admin.
                    </Alert>
                </Grid>

                {/* Reports Table */}
                <Grid item xs={12}>
                    <MainCard title="Active Assignments">
                        <DynamicDatatables
                            tableTitle="Current Bus Deployment"
                            rows={assignments}
                            columns={columns}
                            options={{ selectableRows: 'none', filter: true, search: true }}
                        />
                    </MainCard>
                </Grid>
            </Grid>

            {/* Assign Bus Dialog */}
            <Dialog
                open={openAssign}
                onClose={() => {
                    setOpenAssign(false);
                    setSelectedAssignment(null);
                    setMode('assign');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">{mode === 'reassign' ? 'Re-assign Bus' : 'Assign Bus to Route'}</Typography>
                    <IconButton
                        onClick={() => {
                            setOpenAssign(false);
                            setSelectedAssignment(null);
                            setMode('assign');
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        enableReinitialize
                        initialValues={initialFormValues}
                        validationSchema={Yup.object().shape({
                            busId: fieldConfig.busId.validation,
                            routeId: fieldConfig.routeId.validation
                        })}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setError('');
                            setLoading(true);

                            const run = async () => {
                                if (mode === 'reassign') {
                                    await SchoolBusService.reassignBus(values.busId, { routeId: values.routeId });
                                } else {
                                    await SchoolBusService.assignBus(values);
                                }
                                const aRes = await SchoolBusService.getAssignments();
                                setAssignments(Array.isArray(aRes?.data) ? aRes.data : []);
                                resetForm();
                                setOpenAssign(false);
                                setSelectedAssignment(null);
                                setMode('assign');
                            };

                            Promise.resolve(run())
                                .catch((e) => {
                                    setError(e?.message || 'Assignment failed');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={fieldConfig.busId} formik={formik} />
                                <FormField fieldConfig={fieldConfig.routeId} formik={formik} />
                                <Box sx={{ mt: 3 }}>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="warning" type="submit">{mode === 'reassign' ? 'Save Changes' : 'Complete Assignment'}</Button>
                                    </AnimateButton>
                                </Box>
                                {error && (
                                    <Box sx={{ mt: 2 }}>
                                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                                            {error}
                                        </Alert>
                                    </Box>
                                )}
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

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

export default BusAssignment;
