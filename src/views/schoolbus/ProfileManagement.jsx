import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SchoolIcon from '@mui/icons-material/School';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import { parentProfileFields, studentProfileFields } from '../../formjson/schoolprofiles';
import SchoolBusService from '../../services/SchoolBusService';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const ProfileManagement = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [openParent, setOpenParent] = useState(false);
    const [openStudent, setOpenStudent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const t = (key) => key;

    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [routeStops, setRouteStops] = useState([]);
    const [buses, setbuses] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };


    const loadStops = async (routeId) => {
        if (!routeId) {
            setRouteStops([]);
            setbuses([]);

            return;
        }
        try {
            // debugger;

            const busRes = await SchoolBusService.getBuses_P_Manage(routeId);
            //  console.log(busRes);
            setbuses(
                Array.isArray(busRes?.data?.data)
                    ? busRes.data.data
                    : []
            );

            const res = await SchoolBusService.getStops(routeId);

            setRouteStops(
                Array.isArray(res?.data?.data?.[0]?.stops)
                    ? res.data.data[0].stops
                    : []
            );
        } catch (error) {
            console.error("Error loading stops/buses:", error);
            setbuses([]);
            setRouteStops([]);
        }
    };

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);
        // debugger
        Promise.all([SchoolBusService.getParents(), SchoolBusService.getStudents(), SchoolBusService.getRoutes()])
            .then(([pRes, sRes, rRes]) => {
                if (!mounted) return;
                // debugger
                setParents(Array.isArray(pRes?.data?.data) ? pRes.data?.data : []);
                setStudents(Array.isArray(sRes?.data?.data) ? sRes.data?.data : []);
                setRoutes(Array.isArray(rRes?.data?.data) ? rRes.data?.data : []);


            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load profiles');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const parentColumns = [
        { name: 'name', label: 'Parent Name' },
        { name: 'email', label: 'Email' },
        { name: 'mobile', label: 'Mobile' },
        { name: 'address', label: 'Address' },
        { name: 'latitude', label: 'Lat' },
        { name: 'longitude', label: 'Lon' },
    ];

    const studentColumns = [
        { name: 'name', label: 'Student Name' },
        { name: 'class', label: 'Class' },
        { name: 'section', label: 'Section' },
        { name: 'rollNo', label: 'Roll No' },
        { name: 'parentName', label: 'Linked Parent' },
        { name: 'routeName', label: 'Assigned Route' },
        { name: 'pickupStopName', label: 'Pickup Stop' },
        { name: 'dropStopName', label: 'Drop Stop' },
    ];

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                {/* Header */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, bgcolor: theme.palette.secondary.light, borderRadius: 2 }}>
                                    <FamilyRestroomIcon fontSize="large" color="secondary" />
                                </Box>
                                <Box>
                                    <Typography variant="h3" fontWeight={700}>Profile Management</Typography>
                                    <Typography variant="body2" color="text.secondary">Create and manage Parent and Student profiles</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <AnimateButton>
                                    <Button variant="contained" color="primary" startIcon={<PersonAddIcon />} onClick={() => setOpenParent(true)}>Add Parent</Button>
                                </AnimateButton>
                                <AnimateButton>
                                    <Button variant="contained" color="secondary" startIcon={<SchoolIcon />} onClick={() => setOpenStudent(true)}>Add Student</Button>
                                </AnimateButton>
                            </Box>
                        </Box>
                    </MainCard>
                </Grid>

                {/* Info Alert */}
                <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        School Admins can create Parent profiles with geo-location for geofence alerts. Multiple students can be linked to a single parent account.
                    </Alert>
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
                            Loading profiles...
                        </Alert>
                    </Grid>
                )}

                {/* Tabs & Tables */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                                <Tab label="Parent Directory" icon={<FamilyRestroomIcon />} iconPosition="start" />
                                <Tab label="Student Directory" icon={<SchoolIcon />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        {tabValue === 0 && (
                            <DynamicDatatables
                                tableTitle="Registered Parents"
                                rows={parents}
                                columns={parentColumns}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {tabValue === 1 && (
                            <DynamicDatatables
                                tableTitle="Student Records"
                                rows={students}
                                columns={studentColumns}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}
                    </MainCard>
                </Grid>
            </Grid>

            {/* Add Parent Dialog */}
            <Dialog open={openParent} onClose={() => setOpenParent(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Create Parent Profile</Typography>
                    <IconButton onClick={() => setOpenParent(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{ name: '', email: '', mobile: '', address: '', lat: '', lon: '', dob: '' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(parentProfileFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setError('');
                            setLoading(true);
                            const apiPayload = {

                                name: values.name, email: values.email, mobile: values.mobile, address: values.address, dob: values.dob,
                                latitude: values.lat,
                                longitude: values.lon
                            };

                            let successMessage = "";
                            SchoolBusService.createParent(apiPayload)
                                .then(async (createRes) => {
                                    successMessage =
                                        createRes?.data?.message ||
                                        "Parent profile created successfully";
                                    // Parent created response
                                    const parentData = createRes?.data?.data;

                                    // Call OTP API using created parent id
                                    if (parentData?.id) {
                                        await SchoolBusService.resendParentCreationOtp({
                                            user_id: parentData.id
                                        });
                                    }

                                    // Reload parents list
                                    return SchoolBusService.getParents();
                                })
                                .then((pRes) => {
                                    setParents(
                                        Array.isArray(pRes?.data?.data)
                                            ? pRes.data?.data
                                            : []
                                    );

                                    setSnackbar({
                                        open: true,
                                        message: successMessage,
                                        severity: "success",
                                    });

                                    resetForm();
                                    setOpenParent(false);
                                })
                                .catch((e) => {
                                    console.error(e);

                                    const errorMsg =
                                        e?.response?.data?.message ||
                                        e?.response?.data?.error ||
                                        e?.message ||
                                        "Failed to create parent profile";

                                    setSnackbar({
                                        open: true,
                                        message: errorMsg,
                                        severity: "error",
                                    });
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={1}>
                                    {Object.values(parentProfileFields(t)).map(field => (
                                        <Grid item xs={12} md={field.name === 'lat' || field.name === 'lon' ? 12 : 12} key={field.name}>
                                            <FormField fieldConfig={field} formik={formik} />
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <AnimateButton>
                                            <Button fullWidth variant="contained" color="primary" type="submit">Save Parent Profile</Button>
                                        </AnimateButton>
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

            {/* Add Student Dialog */}
            <Dialog open={openStudent} onClose={() => setOpenStudent(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Create Student Profile</Typography>
                    <IconButton onClick={() => setOpenStudent(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{ name: '', class: '', section: '', rollNo: '', parentId: '', bus: '', routeId: '', pickupStopId: '', dropStopId: '', start_date: '' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(studentProfileFields(t, parents, routes, routeStops, buses)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setError('');
                            setLoading(true);
                            SchoolBusService.createStudent(values)
                                .then(() => SchoolBusService.getStudents())
                                .then((sRes) => {
                                    setStudents(
                                        Array.isArray(sRes?.data?.data)
                                            ? sRes.data.data
                                            : []
                                    );

                                    setSnackbar({
                                        open: true,
                                        message:
                                            sRes?.data?.message ||
                                            "Student profile created successfully",
                                        severity: "success",
                                    });

                                    resetForm();
                                    setOpenStudent(false);
                                    setRouteStops([]);
                                })
                                .catch((e) => {
                                    const errorMsg =
                                        e?.response?.data?.message ||
                                        e?.response?.data?.error ||
                                        e?.message ||
                                        "Failed to create student profile";

                                    setSnackbar({
                                        open: true,
                                        message: errorMsg,
                                        severity: "error",
                                    });
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={1}>
                                    {Object.values(studentProfileFields(t, parents, routes, routeStops, buses)).map((field) => (
                                        <Grid item xs={12} key={field.name}>
                                            <FormField
                                                fieldConfig={field}
                                                formik={formik}
                                                handleOptionChange={async (event) => {
                                                    if (field.name !== 'routeId') return;
                                                    const routeId = event?.target?.value;
                                                    formik.setFieldValue('pickupStopId', '');
                                                    formik.setFieldValue('dropStopId', '');
                                                    formik.setFieldValue('bus', '');

                                                    try {
                                                        await loadStops(routeId);
                                                    } catch (e) {
                                                        setError(e?.message || 'Failed to load stops');
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <AnimateButton>
                                            <Button fullWidth variant="contained" color="secondary" type="submit">Save Student Profile</Button>
                                        </AnimateButton>
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
};

export default ProfileManagement;
