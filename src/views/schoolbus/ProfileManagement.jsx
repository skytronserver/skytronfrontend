import React, { useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Alert,
    Avatar,
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

const ProfileManagement = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [openParent, setOpenParent] = useState(false);
    const [openStudent, setOpenStudent] = useState(false);

    const t = (key) => key;

    // Mock data
    const [parents] = useState([
        { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', mobile: '9876543210', address: 'Delhi Sector 5', lat: '28.6139', lon: '77.2090' },
    ]);

    const [students] = useState([
        { id: '1', name: 'Aarav Kumar', class: '5th', section: 'A', rollNo: '15', parentName: 'Rajesh Kumar', busStop: 'Sector 5 Gate' },
    ]);

    const parentColumns = [
        { name: 'name', label: 'Parent Name' },
        { name: 'email', label: 'Email' },
        { name: 'mobile', label: 'Mobile' },
        { name: 'address', label: 'Address' },
        { name: 'lat', label: 'Lat' },
        { name: 'lon', label: 'Lon' },
    ];

    const studentColumns = [
        { name: 'name', label: 'Student Name' },
        { name: 'class', label: 'Class' },
        { name: 'section', label: 'Section' },
        { name: 'rollNo', label: 'Roll No' },
        { name: 'parentName', label: 'Linked Parent' },
        { name: 'busStop', label: 'Designated Stop' },
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
                        initialValues={{ name: '', email: '', mobile: '', address: '', lat: '', lon: '' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(parentProfileFields(t)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values) => { console.log(values); setOpenParent(false); }}
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
                        initialValues={{ name: '', class: '', section: '', rollNo: '', parentId: '', busStop: '' }}
                        validationSchema={Yup.object().shape(Object.fromEntries(Object.entries(studentProfileFields(t, parents)).map(([k, v]) => [k, v.validation])))}
                        onSubmit={(values) => { console.log(values); setOpenStudent(false); }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={1}>
                                    {Object.values(studentProfileFields(t, parents)).map(field => (
                                        <Grid item xs={12} key={field.name}>
                                            <FormField fieldConfig={field} formik={formik} />
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
        </Box>
    );
};

export default ProfileManagement;
