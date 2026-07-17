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
                 setHolidays(
      Array.isArray(res?.data?.data)
        ? res.data.data
        : []
    );
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
        { name: 'title', label: 'Holiday' },
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
                        initialValues={{
    date: '',
    title: '',
    type: ''
}}
                        validationSchema={Yup.object().shape({
                            date: Yup.string().required('Date is required'),
                            title: Yup.string().required('Holiday title is required'),
                            type: Yup.string().required('Holiday type is required')
                        })}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setError('');
                            setLoading(true);
const payload = {
        date: values.date,
        title: values.title,
        type: values.type
    };
                            SchoolBusService.createHoliday(payload)
                                .then(() => SchoolBusService.getHolidays())
                                .then((res) => {
setHolidays(
      Array.isArray(res?.data?.data)
        ? res.data.data
        : []
    );                                    resetForm();
                                    setOpenAdd(false);
                                })
                                .catch((e) => {
setError(
                e?.response?.data?.message ||
                e?.message ||
                'Failed to add holiday'
            );                                })
                                .finally(() => {
                                    setLoading(false);
                                    setSubmitting(false);
                                });
                        }}
                    >
                        {(formik) => (
                            <form onSubmit={formik.handleSubmit}>
                                <FormField fieldConfig={{ name: 'date', type: 'date', label: 'Date' }} formik={formik} />
                                <FormField fieldConfig={{ name: 'title', type: 'text', label: 'Holiday Title' }} formik={formik} />
                                <FormField
                                    fieldConfig={{
                                        name: 'type',
                                        type: 'select',
                                        label: 'Holiday Type',
                                        options: [
            { label: 'National', value: 'national' },
            { label: 'Festival', value: 'festival' },
            { label: 'Local', value: 'local' },
            { label: 'Emergency', value: 'emergency' }
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
