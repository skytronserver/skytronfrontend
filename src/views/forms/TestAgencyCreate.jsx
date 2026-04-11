import { Grid, Button, CircularProgress } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../ui-component/CustomTextField';
import DialogComponent from '../../ui-component/DialogComponent';
import { useState, useEffect } from 'react';
import TestAgencyServices from '../../services/TestAgencyServices';
import { testAgencyInitialValues, testAgencyFormFields } from '../../formjson/testAgency';

const TestAgencyCreate = () => {
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState({
        error: false,
        message: '',
        errorList: [],
    });
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [agencies, setAgencies] = useState([]);
    const [selectedAgencyId, setSelectedAgencyId] = useState('');

    const handleClose = () => {
        setOpen(false);
    };

    const handleAlert = (message) => {
        setAlert((prev) => ({ ...prev, message }));
        setOpen(true);
    };

    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                const res = await TestAgencyServices.getNameList();
                setAgencies(res.data || []);
            } catch (error) {
                console.error('Failed to fetch agencies', error);
            }
        };
        fetchAgencies();
    }, []);

    const validationSchema = Yup.object(
        Object.keys(testAgencyFormFields).reduce((acc, field) => {
            acc[field] = testAgencyFormFields[field].validation;
            return acc;
        }, {})
    );

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setSubmitting(true);
        setLoading(true);

        const fd = new FormData();
        fd.append('agency_name', values.agency_name || '');
        fd.append('company_address', values.company_address || '');
        fd.append('company_pin', values.company_pin || '');
        fd.append('idProofno', values.idProofno || '');
        fd.append('status', values.status || 'Created');
        fd.append('name', values.name || '');
        fd.append('email', values.email || '');
        fd.append('mobile', values.mobile || '');
        fd.append('dob', values.dob || '');
        if (values.file_authLetter) fd.append('file_authLetter', values.file_authLetter);
        if (values.file_idProof) fd.append('file_idProof', values.file_idProof);

        try {
            await TestAgencyServices.createTestAgency(fd);
            setAlert((prev) => ({ ...prev, error: false, errorList: [] }));
            handleAlert('Test Agency user created successfully');
            setShowResend(true);
        } catch (error) {
            const data = error?.response?.data;
            const msg =
                (typeof data === 'string' ? data : null) ||
                data?.message ||
                data?.detail ||
                (data && typeof data === 'object'
                    ? Object.entries(data)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                        .join(' | ')
                    : null) ||
                error?.message ||
                'Failed to create test agency';
            setAlert((prev) => ({
                ...prev,
                error: true,
                errorList: { code: '400', message: msg, errors: data },
            }));
            handleAlert(msg);
            setShowResend(false);
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    const handleResend = (resetForm) => {
        setShowResend(false);
        setSelectedAgencyId('');
        resetForm(testAgencyInitialValues);
    };

    const handleAgencySelect = (event, formik) => {
        const agencyId = event.target.value;
        setSelectedAgencyId(agencyId);
        const agency = agencies.find((a) => a.id === agencyId || a.agency_name === agencyId);
        if (agency) {
            formik.setFieldValue('agency_name', agency.agency_name || agency.name || '');
            formik.setFieldValue('company_address', agency.address || '');
            formik.setFieldValue('company_pin', agency.pincode || '');
        }
    };

    return (
        <>
            <DialogComponent
                open={open}
                handleClose={handleClose}
                message={alert.message}
                errorList={alert.errorList}
            />

            <Grid container spacing={gridSpacing}>
                {loading && (
                    <div
                        style={{
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 9999,
                            background: 'rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        <CircularProgress
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                            size={50}
                        />
                    </div>
                )}
                <Grid
                    item
                    xs={12}
                    style={{
                        opacity: loading ? 0.5 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                    }}
                >
                    <MainCard title="Test agency user creation">
                        <Formik
                            initialValues={testAgencyInitialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {(formik) => (
                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={2} className="form-controller">
                                        <Grid item md={12} sm={12} xs={12}>
                                            <FormField
                                                fieldConfig={{
                                                    name: 'select_agency',
                                                    type: 'select',
                                                    label: 'Select Test Agency',
                                                    options: agencies.map((a) => ({
                                                        value: a.id || a.agency_name,
                                                        label: a.agency_name || a.name,
                                                    })),
                                                }}
                                                formik={formik}
                                                handleOptionChange={(e) => handleAgencySelect(e, formik)}
                                            />
                                        </Grid>
                                        {Object.keys(testAgencyFormFields).map((field) => {
                                            return (
                                                <Grid key={field} item md={6} sm={12} xs={12}>
                                                    <FormField
                                                        fieldConfig={testAgencyFormFields[field]}
                                                        formik={formik}
                                                    />
                                                </Grid>
                                            );
                                        })}
                                        <Grid item xs={12} style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={loading}
                                            >
                                                Submit
                                            </Button>
                                            {showResend && (
                                                <Button
                                                    type="button"
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => handleResend(formik.resetForm)}
                                                    disabled={loading}
                                                >
                                                    Create Another
                                                </Button>
                                            )}
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Formik>
                    </MainCard>
                </Grid>
            </Grid>
        </>
    );
};

export default TestAgencyCreate;
