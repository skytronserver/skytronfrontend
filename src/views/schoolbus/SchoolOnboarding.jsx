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
    IconButton,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import SchoolBusService from '../../services/SchoolBusService';

const SchoolOnboarding = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [openReview, setOpenReview] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const t = (key) => key;

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        SchoolBusService.getSchoolApplications()
            .then((res) => {
                if (!mounted) return;
                setApps(Array.isArray(res?.data) ? res.data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load applications');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const refresh = () =>
        SchoolBusService.getSchoolApplications()
            .then((res) => setApps(Array.isArray(res?.data) ? res.data : []))
            .catch(() => {});

    const columns = [
        { name: 'schoolName', label: 'School' },
        { name: 'contactPerson', label: 'Contact Person' },
        { name: 'mobile', label: 'Mobile' },
        { name: 'email', label: 'Email' },
        {
            name: 'status',
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        size="small"
                        color={value === 'Approved' ? 'success' : value === 'Rejected' ? 'error' : 'warning'}
                    />
                )
            }
        },
        {
            name: 'id',
            label: 'Actions',
            options: {
                customBodyRender: (value, tableMeta) => (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            setSelectedApp(apps?.[tableMeta?.rowIndex] || null);
                            setOpenReview(true);
                        }}
                    >
                        Review
                    </Button>
                )
            }
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>School Onboarding</Typography>
                                <Typography variant="body2" color="text.secondary">Application, OTP validation, KYC, and State Admin review</Typography>
                            </Box>
                        </Box>
                    </MainCard>
                </Grid>

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                    </Grid>
                )}

                {loading && (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>Loading applications...</Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                <Tab label="School Application" />
                                <Tab label="State Admin Review" />
                            </Tabs>
                        </Box>

                        {tabValue === 0 && (
                            <Box>
                                <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                                    Submit an onboarding application with OTP verification and KYC documents.
                                </Alert>
                                <Formik
                                    initialValues={{
                                        schoolName: '',
                                        contactPerson: '',
                                        mobile: '',
                                        email: '',
                                        address: '',
                                        latitude: '',
                                        longitude: '',
                                        otp: '',
                                        principalRequestLetter: null,
                                        representativeKycDocument: null
                                    }}
                                    validationSchema={Yup.object().shape({
                                        schoolName: Yup.string().required('School name is required'),
                                        contactPerson: Yup.string().required('Contact person is required'),
                                        mobile: Yup.string().required('Mobile is required'),
                                        email: Yup.string().email('Invalid email').required('Email is required'),
                                        address: Yup.string().required('Address is required'),
                                        latitude: Yup.string().required('Latitude is required'),
                                        longitude: Yup.string().required('Longitude is required'),
                                        otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
                                        principalRequestLetter: Yup.mixed().required('Request letter is required'),
                                        representativeKycDocument: Yup.mixed().required('KYC document is required')
                                    })}
                                    onSubmit={(values, { setSubmitting, resetForm }) => {
                                        setError('');
                                        setLoading(true);

                                        const formData = new FormData();
                                        formData.append('schoolName', values.schoolName);
                                        formData.append('contactPerson', values.contactPerson);
                                        formData.append('mobile', values.mobile);
                                        formData.append('email', values.email);
                                        formData.append('address', values.address);
                                        formData.append('latitude', values.latitude);
                                        formData.append('longitude', values.longitude);
                                        formData.append('otp', values.otp);
                                        formData.append('principalRequestLetter', values.principalRequestLetter);
                                        formData.append('representativeKycDocument', values.representativeKycDocument);

                                        SchoolBusService.submitSchoolApplication(formData)
                                            .then(() => refresh())
                                            .then(() => {
                                                resetForm();
                                            })
                                            .catch((e) => {
                                                setError(e?.message || 'Failed to submit application');
                                            })
                                            .finally(() => {
                                                setLoading(false);
                                                setSubmitting(false);
                                            });
                                    }}
                                >
                                    {(formik) => (
                                        <form onSubmit={formik.handleSubmit}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'schoolName', type: 'text', label: 'Name of School' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'contactPerson', type: 'text', label: 'Name of Contact Person' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'mobile', type: 'tel', label: 'Mobile Number' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'email', type: 'email', label: 'Email ID' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormField fieldConfig={{ name: 'address', type: 'text', label: 'School Address' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'latitude', type: 'text', label: 'School Latitude' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'longitude', type: 'text', label: 'School Longitude' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'otp', type: 'tel', label: 'OTP' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'principalRequestLetter', type: 'file', label: 'Request letter from Principal' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormField fieldConfig={{ name: 'representativeKycDocument', type: 'file', label: 'KYC document of representative' }} formik={formik} />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <AnimateButton>
                                                        <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading || formik.isSubmitting} sx={{ color: '#FFFFFF !important', '&.Mui-disabled': { color: 'rgba(255,255,255,0.9) !important' } }}>
                                                            Submit Application
                                                        </Button>
                                                    </AnimateButton>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    )}
                                </Formik>
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box>
                                <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                                    State Admin reviews applications, approves/rejects with remarks, and triggers credential issuance.
                                </Alert>
                                <DynamicDatatables
                                    tableTitle="Submitted Applications"
                                    rows={apps}
                                    columns={columns}
                                    options={{ selectableRows: 'none', filter: true, search: true }}
                                />
                            </Box>
                        )}
                    </MainCard>
                </Grid>
            </Grid>

            <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Review Application</Typography>
                    <IconButton onClick={() => setOpenReview(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            status: selectedApp?.status || 'Pending',
                            remarks: selectedApp?.remarks || ''
                        }}
                        validationSchema={Yup.object().shape({
                            status: Yup.string().required('Status is required'),
                            remarks: Yup.string().required('Remarks are required')
                        })}
                        onSubmit={(values, { setSubmitting }) => {
                            if (!selectedApp?.id) {
                                setSubmitting(false);
                                return;
                            }

                            setError('');
                            setLoading(true);
                            SchoolBusService.reviewSchoolApplication(selectedApp.id, values)
                                .then(() => SchoolBusService.getSchoolApplications())
                                .then((res) => {
                                    setApps(Array.isArray(res?.data) ? res.data : []);
                                    setOpenReview(false);
                                })
                                .catch((e) => {
                                    setError(e?.message || 'Failed to review application');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField
                                    fieldConfig={{
                                        name: 'status',
                                        type: 'select',
                                        label: 'Decision',
                                        options: [
                                            { label: 'Approve', value: 'Approved' },
                                            { label: 'Reject', value: 'Rejected' },
                                            { label: 'Keep Pending', value: 'Pending' }
                                        ]
                                    }}
                                    formik={formik}
                                />
                                <FormField fieldConfig={{ name: 'remarks', type: 'text', label: 'Remarks' }} formik={formik} />
                                <Box sx={{ mt: 2 }}>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading || formik.isSubmitting}>
                                            Save Decision
                                        </Button>
                                    </AnimateButton>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        disabled={loading || !selectedApp?.id}
                                        onClick={() => {
                                            if (!selectedApp?.id) return;
                                            setError('');
                                            setLoading(true);
                                            SchoolBusService.issueCredentials(selectedApp.id)
                                                .then(() => refresh())
                                                .catch((e) => setError(e?.message || 'Failed to issue credentials'))
                                                .finally(() => setLoading(false));
                                        }}
                                    >
                                        Send Credential Link
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default SchoolOnboarding;
