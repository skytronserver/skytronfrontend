import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Button,
    Stepper,
    Step,
    StepLabel,
    Alert,
    Divider,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { busTaggingFields } from '../../formjson/schoolbus';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { gridSpacing } from '../../store/constant';
import SchoolBusService from '../../services/SchoolBusService';

















const SchoolBusTagging = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Request Tag', 'OTP Validation', 'Upload Documents', 'Approval'];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [taggedVehicles, setTaggedVehicles] = useState([]);
    const [activatedVehicles, setActivatedVehicles] = useState([]);
    const [tagContext, setTagContext] = useState({ requestId: null, vehicleRegNo: '' });


    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);
                //  debugger
       
        Promise.all([SchoolBusService.getTaggedVehicles(), SchoolBusService.getBuses()])
            .then(([tagRes, busRes]) => {
                // debugger
                if (!mounted) return;
                setTaggedVehicles(Array.isArray(tagRes?.data?.data) ? tagRes.data.data : []);
                setActivatedVehicles(Array.isArray(busRes?.data?.data) ? busRes.data.data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load vehicle list');
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
        { name: 'vehicle_reg_no', label: 'Vehicle Reg No', options: { filter: true, sort: true } },
        { name: 'school_name', label: 'School Name', options: { filter: true, sort: true } },
        { name: 'status_display', label: 'Status', options: { filter: true, sort: true } },
        { name: 'requested_at', label: 'Requested Date', options: { filter: true, sort: true } },
    ];

    const t = (key) => key; // Mock translation function
    const fieldConfig = busTaggingFields(t);
    const activatedVehicleOptions = activatedVehicles.map((b) => ({
        label: b?.vehicle_reg_no || '',
        value: b?.vehicle_reg_no || ''
    }));
    fieldConfig.vehicleRegNo = {
        ...fieldConfig.vehicleRegNo,
        type: 'select',
        options: activatedVehicleOptions
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const initialValues = {
        vehicleRegNo: '',
        otp: '',
        schoolBusPermit: null,
        requestLetter: null,
        rcCertificate: null,
        authLetter: null,
        fitmentReceipt: null,
    };

    const validationSchema = [
        Yup.object().shape({ vehicleRegNo: fieldConfig.vehicleRegNo.validation }),
        Yup.object().shape({ otp: fieldConfig.otp.validation }),
        Yup.object().shape({
            schoolBusPermit: fieldConfig.schoolBusPermit.validation,
            requestLetter: fieldConfig.requestLetter.validation,
            rcCertificate: fieldConfig.rcCertificate.validation,
            authLetter: fieldConfig.authLetter.validation,
            fitmentReceipt: fieldConfig.fitmentReceipt.validation,
        }),
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                {/* Header */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: theme.palette.primary.light, borderRadius: 2 }}>
                                <VerifiedIcon fontSize="large" color="primary" />
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>School Bus Tagging</Typography>
                                <Typography variant="body2" color="text.secondary">Professional vehicle-to-school tagging workflow</Typography>
                            </Box>
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

                {/* Stepper Card */}
                <Grid item xs={12} md={8}>
                    <MainCard title="Tagging Workflow">
                        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema[activeStep]}
                            onSubmit={(values, { setSubmitting }) => {
                                setError('');

                                const run = async () => {
                                    if (activeStep === 0) {
                                        // debugger
                                        const selectedVehicle = activatedVehicles.find(
                                            (v) => v.vehicle_reg_no === values.vehicleRegNo
                                            );

                                            const vehicleId = selectedVehicle?.id;
                                        setLoading(true);
                                        // debugger
                                        const res = await SchoolBusService.requestTagVehicle({  id: vehicleId, vehicle_reg_no: values.vehicleRegNo });
                                        setTagContext({ requestId: res?.data?.data?.tag_id  || null, vehicleRegNo: values.vehicleRegNo });
                                        handleNext();
                                    } else if (activeStep === 1) {
                                        setLoading(true);
                                        // debugger
                                        await SchoolBusService.validateTagOtp({ requestId: tagContext.requestId, otp: values.otp });
                                        handleNext();
                                    } else if (activeStep === 2) {
                                        setLoading(true);
                                        const formData = new FormData();
                                        // formData.append('requestId', tagContext.requestId || '');
                                        // formData.append('vehicleRegNo', tagContext.vehicleRegNo || values.vehicleRegNo || '');
                                        // formData.append('schoolBusPermit', values.schoolBusPermit);
                                        // formData.append('requestLetter', values.requestLetter);
                                        // formData.append('rcCertificate', values.rcCertificate);
                                        // formData.append('authLetter', values.authLetter);
                                        // formData.append('fitmentReceipt', values.fitmentReceipt);


                                        // ✅ ONLY these keys (match curl exactly)
                                        // debugger
                                        formData.append("RC", values.rcCertificate);
                                        formData.append("PERMIT", values.schoolBusPermit);
                                        formData.append("REQUEST_LETTER", values.requestLetter);
                                        formData.append("AUTH_LETTER", values.authLetter);
                                        formData.append("VLTD_RECEIPT", values.fitmentReceipt);


                                        await SchoolBusService.uploadTagDocuments( tagContext.requestId,formData);
                                        handleNext();

                                        const list = await SchoolBusService.getTaggedVehicles();
                                        setTaggedVehicles(Array.isArray(list?.data?.data) ? list.data?.data : []);
                                    }
                                };

                                run()
                                    .catch((e) => {
                                        setError(e?.response?.data?.message || 'Request failed');
                                    })
                                    .finally(() => {
                                        setLoading(false);
                                        setSubmitting(false);
                                    });
                            }}
                        >
                            {(formik) => (
                                <form onSubmit={formik.handleSubmit}>
                                    <Box sx={{ mt: 2, minHeight: 400 }}>
                                        {loading && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'absolute', width: '100%', top: 0, left: 0, zIndex: 1, bgcolor: 'rgba(255,255,255,0.7)' }}>
                                                <CircularProgress />
                                            </Box>
                                        )}

                                        {activeStep === 0 && (
                                            <Box>
                                                <Alert severity="info" sx={{ mb: 3 }}>
                                                    Step 1: Initiation. Enter the vehicle registration number to start the process.
                                                </Alert>
                                                <FormField fieldConfig={fieldConfig.vehicleRegNo} formik={formik} />
                                            </Box>
                                        )}

                                        {activeStep === 1 && (
                                            <Box>
                                                <Alert severity="success" sx={{ mb: 3 }}>
                                                    Step 2: Verification. Enter the OTP sent to the vehicle owner.
                                                </Alert>
                                                <FormField fieldConfig={fieldConfig.otp} formik={formik} />
                                            </Box>
                                        )}

                                        {activeStep === 2 && (
                                            <Box>
                                                <Alert severity="warning" sx={{ mb: 3 }}>
                                                    Step 3: Documentation. Please upload all mandatory scanned documents.
                                                </Alert>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <FormField fieldConfig={fieldConfig.schoolBusPermit} formik={formik} />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormField fieldConfig={fieldConfig.requestLetter} formik={formik} />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormField fieldConfig={fieldConfig.rcCertificate} formik={formik} />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormField fieldConfig={fieldConfig.authLetter} formik={formik} />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <FormField fieldConfig={fieldConfig.fitmentReceipt} formik={formik} />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}

                                        {activeStep === 3 && (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <CheckCircleIcon sx={{ fontSize: 100, color: theme.palette.success.main, mb: 2 }} />
                                                <Typography variant="h2" gutterBottom>Success!</Typography>
                                                <Typography variant="h4" color="text.secondary" gutterBottom>
                                                    Tagging request for {tagContext.vehicleRegNo || formik.values.vehicleRegNo} submitted.
                                                </Typography>
                                                <Typography variant="body1" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                                                    The request is now pending with the Super Admin for review. You can track the status in the table below.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Divider sx={{ my: 3 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        {activeStep > 0 && activeStep < 3 && (
                                            <Button onClick={handleBack} variant="outlined" disabled={loading}>Back</Button>
                                        )}
                                        {activeStep < 3 && (
                                            <AnimateButton>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={loading || formik.isSubmitting}
                                                >
                                                    {activeStep === 2 ? 'Submit Request' : 'Next'}
                                                </Button>
                                            </AnimateButton>
                                        )}
                                        {activeStep === 3 && (
                                            <Button variant="contained" color="primary" onClick={() => { setActiveStep(0); setTagContext({ requestId: null, vehicleRegNo: '' }); formik.resetForm(); }}>Generate New Request</Button>
                                        )}
                                    </Box>
                                </form>
                            )}
                        </Formik>
                    </MainCard>
                </Grid>

                {/* Info Cards */}
                <Grid item xs={12} md={4}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <MainCard title="System Restrictions">
                                <Typography variant="body2" component="div">
                                    <ul style={{ paddingLeft: 20 }}>
                                        <li>Mandatory VLTD activation check</li>
                                        <li>Pre-registered vehicles identification</li>
                                        <li>SMS-based owner consent (OTP)</li>
                                        <li>KYC validation for school admins</li>
                                    </ul>
                                </Typography>
                            </MainCard>
                        </Grid>
                        <Grid item xs={12}>
                            <MainCard title="Approval Process">
                                <Typography variant="body2">
                                    Once submitted, the Super Admin verifies the documents. Upon approval:
                                </Typography>
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    Auto-generated credentials link will be sent to the school email and mobile.
                                </Alert>
                            </MainCard>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Reports Table */}
                <Grid item xs={12}>
                    <MainCard title="Tagging History & Status">
                        <DynamicDatatables
                            tableTitle="Vehicle Tagging Logs"
                            rows={taggedVehicles}
                            columns={columns}
                            options={{ selectableRows: 'none', filter: true, search: true }}
                        />
                    </MainCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SchoolBusTagging;
