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
    Alert
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

const SchoolHolidays = () => {
    const theme = useTheme();
    const [openAdd, setOpenAdd] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        SchoolBusService.getHolidays()
            .then((res) => {
                if (!mounted) return;
                setHolidays(Array.isArray(res?.data) ? res.data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load holidays');
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
        { name: 'date', label: 'Date' },
        { name: 'name', label: 'Holiday' },
        { name: 'type', label: 'Type' }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>School Holidays</Typography>
                                <Typography variant="body2" color="text.secondary">Trips on holidays will be treated as unscheduled</Typography>
                            </Box>
                            <AnimateButton>
                                <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)}>Add Holiday</Button>
                            </AnimateButton>
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
                        <Alert severity="info" sx={{ borderRadius: 2 }}>Loading holidays...</Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <MainCard title="Holiday Calendar">
                        <DynamicDatatables
                            tableTitle="Holidays"
                            rows={holidays}
                            columns={columns}
                            options={{ selectableRows: 'none', filter: true, search: true }}
                        />
                    </MainCard>
                </Grid>
            </Grid>

            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">Add Holiday</Typography>
                    <IconButton onClick={() => setOpenAdd(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{ date: '', name: '', type: 'Holiday' }}
                        validationSchema={Yup.object().shape({
                            date: Yup.string().required('Date is required'),
                            name: Yup.string().required('Name is required'),
                            type: Yup.string().required('Type is required')
                        })}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setError('');
                            setLoading(true);

                            SchoolBusService.createHoliday(values)
                                .then(() => SchoolBusService.getHolidays())
                                .then((res) => {
                                    setHolidays(Array.isArray(res?.data) ? res.data : []);
                                    resetForm();
                                    setOpenAdd(false);
                                })
                                .catch((e) => {
                                    setError(e?.message || 'Failed to add holiday');
                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={{ name: 'date', type: 'date', label: 'Date' }} formik={formik} />
                                <FormField fieldConfig={{ name: 'name', type: 'text', label: 'Holiday Name' }} formik={formik} />
                                <FormField
                                    fieldConfig={{
                                        name: 'type',
                                        type: 'select',
                                        label: 'Type',
                                        options: [
                                            { label: 'Holiday', value: 'Holiday' },
                                            { label: 'Exam', value: 'Exam' },
                                            { label: 'Event', value: 'Event' }
                                        ]
                                    }}
                                    formik={formik}
                                />
                                <Box sx={{ mt: 2 }}>
                                    <AnimateButton>
                                        <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading || formik.isSubmitting}>
                                            Save
                                        </Button>
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

export default SchoolHolidays;
