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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import { busAssignmentFields } from '../../formjson/schoolbus';

const BusAssignment = () => {
    const theme = useTheme();
    const [openAssign, setOpenAssign] = useState(false);

    const t = (key) => key;

    // Mock data
    const [buses] = useState([
        { id: '1', regNo: 'DL 1PC 1234', driverName: 'Suresh Kumar' },
        { id: '2', regNo: 'DL 1PB 5678', driverName: 'Amit Singh' },
    ]);

    const [routes] = useState([
        { id: '1', name: 'Route A - North' },
        { id: '2', name: 'Route B - South' },
    ]);

    const [assignments] = useState([
        { id: '1', busRegNo: 'DL 1PC 1234', driverName: 'Suresh Kumar', routeName: 'Route A - North', assignmentDate: '2025-01-10', status: 'Active' },
    ]);

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
                customBodyRender: () => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="text" color="primary">Re-assign</Button>
                        <Button size="small" variant="text" color="error">Untag</Button>
                    </Box>
                )
            }
        }
    ];

    const fieldConfig = busAssignmentFields(t, buses, routes);

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
                                <Button variant="contained" color="warning" startIcon={<DirectionsBusIcon />} onClick={() => setOpenAssign(true)}>New Assignment</Button>
                            </AnimateButton>
                        </Box>
                    </MainCard>
                </Grid>

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
            <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Assign Bus to Route</Typography>
                    <IconButton onClick={() => setOpenAssign(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{ busId: '', routeId: '' }}
                        validationSchema={Yup.object().shape({
                            busId: fieldConfig.busId.validation,
                            routeId: fieldConfig.routeId.validation
                        })}
                        onSubmit={(values) => { console.log(values); setOpenAssign(false); }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={fieldConfig.busId} formik={formik} />
                                <FormField fieldConfig={fieldConfig.routeId} formik={formik} />
                                <Box sx={{ mt: 3 }}>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="warning" type="submit">Complete Assignment</Button>
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

export default BusAssignment;
