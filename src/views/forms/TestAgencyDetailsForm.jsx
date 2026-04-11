import { Grid, Button, CircularProgress } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../ui-component/CustomTextField';
import DialogComponent from '../../ui-component/DialogComponent';
import { useState } from 'react';
import TestAgencyServices from '../../services/TestAgencyServices';

const TestAgencyDetailsForm = () => {
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState({
        error: false,
        message: '',
        errorList: [],
    });
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleAlert = (message) => {
        setAlert((prev) => ({ ...prev, message }));
        setOpen(true);
    };

    const initialValues = {
        name: '',
        address: '',
        pincode: '',
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Agency name is required'),
        address: Yup.string().required('Address is required'),
        pincode: Yup.string().required('Pincode is required'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setSubmitting(true);
        setLoading(true);

        try {
            await TestAgencyServices.createAgencyDetails(values);
            handleAlert('Test Agency details created successfully');
            resetForm();
        } catch (error) {
            handleAlert(error?.response?.data?.message || 'Failed to create details');
        } finally {
            setSubmitting(false);
            setLoading(false);
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
                <Grid item xs={12}>
                    <MainCard title="Create Test Agency Details">
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {(formik) => (
                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid item md={6} xs={12}>
                                            <FormField
                                                fieldConfig={{
                                                    name: 'name',
                                                    type: 'text',
                                                    label: 'Agency Name',
                                                }}
                                                formik={formik}
                                            />
                                        </Grid>
                                        <Grid item md={6} xs={12}>
                                            <FormField
                                                fieldConfig={{
                                                    name: 'pincode',
                                                    type: 'text',
                                                    label: 'Pincode',
                                                }}
                                                formik={formik}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormField
                                                fieldConfig={{
                                                    name: 'address',
                                                    type: 'text',
                                                    label: 'Address',
                                                }}
                                                formik={formik}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={loading}
                                            >
                                                Submit
                                            </Button>
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

export default TestAgencyDetailsForm;
