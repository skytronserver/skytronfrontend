import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import HomeIcon from '@mui/icons-material/Home';
import PinIcon from '@mui/icons-material/Pin';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';

import MainCard from '../../ui-component/cards/MainCard';
import AutoHideAlert from '../../ui-component/AutoHideAlert';
import { gridSpacing } from '../../store/constant';
import TestAgencyServices from '../../services/TestAgencyServices';

/* ─── reusable PDF upload card ─── */
const PdfUploadCard = ({ label, file, onChange, error }) => (
    <Paper
        variant="outlined"
        component="label"
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            cursor: 'pointer',
            borderRadius: 2,
            borderStyle: 'dashed',
            borderColor: error ? 'error.main' : file ? 'primary.main' : 'divider',
            bgcolor: file ? 'primary.50' : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
        }}
    >
        <input type="file" hidden accept="application/pdf" onChange={onChange} />
        <Box
            sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: file ? 'primary.main' : 'grey.100',
                color: file ? 'white' : 'text.secondary',
                flexShrink: 0,
                transition: 'all 0.2s ease',
            }}
        >
            {file ? <CheckCircleIcon /> : <UploadFileIcon />}
        </Box>
        <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
                {label}
            </Typography>
            <Typography
                variant="caption"
                color={file ? 'primary.main' : error ? 'error' : 'text.secondary'}
                noWrap
                display="block"
            >
                {file ? file.name : error ? error : 'Click to upload PDF'}
            </Typography>
        </Box>
        <UploadFileIcon sx={{ color: file ? 'primary.main' : 'text.disabled', flexShrink: 0 }} />
    </Paper>
);

/* ─── section wrapper ─── */
const Section = ({ title, children }) => (
    <Box>
        <Typography variant="h5" fontWeight={700} mb={2} color="primary">
            {title}
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        {children}
    </Box>
);

/* ════════════════════════════════════════════════════════ */

const INITIAL_FORM = {
    agency_name: '',
    company_address: '',
    company_pin: '',
    idProofno: '',
    status: 'Created',
    name: '',
    email: '',
    mobile: '',
    dob: '',
};

const STATUS_OPTIONS = ['Created', 'Accept', 'Reject'];

const TestAgencyCreate = () => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [authLetterFile, setAuthLetterFile] = useState(null);
    const [idProofFile, setIdProofFile] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMsg, setAlertMsg] = useState('');

    const showAlert = (type, msg) => {
        setAlertType(type);
        setAlertMsg(msg);
        setOpenAlert(true);
    };

    /* ── field change ── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });
    };

    /* ── validation ── */
    const validate = () => {
        const errors = {};

        if (!form.agency_name.trim()) errors.agency_name = 'Agency name is required.';
        if (!form.name.trim()) errors.name = 'Contact person name is required.';
        if (!form.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errors.email = 'Enter a valid email address.';
        }
        if (!form.mobile.trim()) {
            errors.mobile = 'Mobile number is required.';
        } else if (!/^\d{10,15}$/.test(form.mobile.trim())) {
            errors.mobile = 'Mobile must be 10–15 digits.';
        }
        if (!form.dob.trim()) errors.dob = 'Date of birth is required.';
        if (!authLetterFile) errors.file_authLetter = 'Authorisation letter PDF is required.';
        if (!idProofFile) errors.file_idProof = 'ID proof PDF is required.';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ── reset ── */
    const handleReset = () => {
        setForm(INITIAL_FORM);
        setAuthLetterFile(null);
        setIdProofFile(null);
        setFieldErrors({});
    };

    /* ── submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showAlert('error', 'Please fix all errors before submitting.');
            return;
        }

        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
            if (val !== '') formData.append(key, val);
        });
        formData.append('file_authLetter', authLetterFile);
        formData.append('file_idProof', idProofFile);

        setSubmitting(true);
        try {
            await TestAgencyServices.createTestAgency(formData);
            showAlert('success', 'Test Agency created successfully!');
            handleReset();
        } catch (err) {
            const data = err?.response?.data;
            const msg =
                (typeof data === 'string' ? data : null) ||
                data?.message ||
                data?.detail ||
                (data && typeof data === 'object'
                    ? Object.entries(data)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                        .join(' | ')
                    : null) ||
                err?.message ||
                'Failed to create test agency.';
            showAlert('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── render ── */
    return (
        <Grid container spacing={gridSpacing}>
            <AutoHideAlert
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                message={alertMsg}
                type={alertType}
            />

            <Grid item xs={12}>
                <MainCard
                    title={
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <BusinessIcon color="primary" />
                            <Typography variant="h4" fontWeight={700}>
                                Create Test Agency
                            </Typography>
                        </Stack>
                    }
                >
                    <Typography variant="body2" color="text.secondary" mb={4}>
                        Register a new test agency. A login user will be created automatically using the
                        contact person's details.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={4}>
                            {/* ── Agency Information ── */}
                            <Section title="Agency Information">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="agency_name"
                                            name="agency_name"
                                            label="Agency Name"
                                            placeholder="e.g. National Testing Lab"
                                            value={form.agency_name}
                                            onChange={handleChange}
                                            error={!!fieldErrors.agency_name}
                                            helperText={fieldErrors.agency_name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <BusinessIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                labelId="status-label"
                                                id="status"
                                                name="status"
                                                value={form.status}
                                                label="Status"
                                                onChange={handleChange}
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <MenuItem key={s} value={s}>
                                                        {s}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            fullWidth
                                            id="company_address"
                                            name="company_address"
                                            label="Company Address"
                                            placeholder="e.g. 123 Testing Road, New Delhi"
                                            value={form.company_address}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <HomeIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            id="company_pin"
                                            name="company_pin"
                                            label="PIN / Postal Code"
                                            placeholder="e.g. 110001"
                                            value={form.company_pin}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PinIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            id="idProofno"
                                            name="idProofno"
                                            label="ID Proof Number"
                                            placeholder="e.g. ABCD1234"
                                            value={form.idProofno}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AssignmentIndIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Section>

                            {/* ── Contact Person (Login User) ── */}
                            <Section title="Contact Person (Login User)">
                                <Alert severity="info" sx={{ mb: 2.5 }}>
                                    A login account will be created for the test agency using the details below.
                                </Alert>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="name"
                                            name="name"
                                            label="Full Name"
                                            placeholder="e.g. Rajesh Kumar"
                                            value={form.name}
                                            onChange={handleChange}
                                            error={!!fieldErrors.name}
                                            helperText={fieldErrors.name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="email"
                                            name="email"
                                            label="Email"
                                            type="email"
                                            placeholder="e.g. rajesh@nationaltesting.in"
                                            value={form.email}
                                            onChange={handleChange}
                                            error={!!fieldErrors.email}
                                            helperText={fieldErrors.email}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="mobile"
                                            name="mobile"
                                            label="Mobile Number"
                                            placeholder="10–15 digits"
                                            value={form.mobile}
                                            onChange={handleChange}
                                            error={!!fieldErrors.mobile}
                                            helperText={fieldErrors.mobile}
                                            inputProps={{ maxLength: 15 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PhoneIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="dob"
                                            name="dob"
                                            label="Date of Birth"
                                            type="date"
                                            value={form.dob}
                                            onChange={handleChange}
                                            error={!!fieldErrors.dob}
                                            helperText={fieldErrors.dob}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CakeIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Section>

                            {/* ── Document Uploads ── */}
                            <Section title="Required Documents (PDF only)">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <PdfUploadCard
                                            label="Authorisation Letter *"
                                            file={authLetterFile}
                                            error={fieldErrors.file_authLetter}
                                            onChange={(e) => {
                                                setAuthLetterFile(e.target.files?.[0] || null);
                                                setFieldErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.file_authLetter;
                                                    return c;
                                                });
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <PdfUploadCard
                                            label="ID Proof *"
                                            file={idProofFile}
                                            error={fieldErrors.file_idProof}
                                            onChange={(e) => {
                                                setIdProofFile(e.target.files?.[0] || null);
                                                setFieldErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.file_idProof;
                                                    return c;
                                                });
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Section>

                            {/* ── Action Buttons ── */}
                            <Divider />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                    disabled={submitting}
                                    sx={{ minWidth: 110 }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={submitting}
                                    sx={{ minWidth: 180 }}
                                    startIcon={
                                        submitting ? <CircularProgress size={16} color="inherit" /> : null
                                    }
                                >
                                    {submitting ? 'Creating…' : 'Create Test Agency'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default TestAgencyCreate;
