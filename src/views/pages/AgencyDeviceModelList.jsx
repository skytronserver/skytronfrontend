import React, { useEffect, useState } from 'react';
import { Grid, Typography, Chip, Tooltip, Box, useTheme } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import TestAgencyServices from '../../services/TestAgencyServices';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { useTranslation } from 'react-i18next';

const AgencyDeviceModelList = () => {
    const { t } = useTranslation();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await TestAgencyServices.getAgencyDeviceModels();
                setModels(response.data || []);
            } catch (error) {
                console.error('Error fetching agency device models:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const columns = [
        {
            name: 'model_name',
            label: 'Model Name',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'vendor_id',
            label: 'Vendor ID',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'tac_no',
            label: 'TAC No',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'tac_validity',
            label: 'TAC Validity',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'hardware_version',
            label: 'Hardware Version',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'created',
            label: 'Created Date',
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : '—'
            }
        },
        {
            name: 'eSimProviders',
            label: 'eSIM Providers',
            options: {
                filter: false,
                customBodyRender: (value) => {
                    if (!value || value.length === 0) return '—';
                    return (
                        <Tooltip title={value.map((e) => e.company_name).join(', ')}>
                            <Typography variant="body2">
                                {value[0].company_name} {value.length > 1 ? `(+${value.length - 1})` : ''}
                            </Typography>
                        </Tooltip>
                    );
                }
            }
        },
        {
            name: 'cop_info',
            label: 'COP Info',
            options: {
                filter: false,
                customBodyRender: (value) => {
                    if (!value) return '—';
                    return (
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{value.cop_no}</Typography>
                            {value.cop_validity && (
                                <Typography variant="caption" color="text.secondary">
                                    Exp: {value.cop_validity}
                                </Typography>
                            )}
                        </Box>
                    );
                }
            }
        },
        {
            name: 'status',
            label: 'Status',
            options: {
                filter: true,
                customBodyRender: (value) => {
                    const color = value === 'StateAdminApproved' ? 'success' : 'warning';
                    return <Chip label={value} color={color} size="small" variant="outlined" />;
                }
            }
        },
        {
            name: 'manufacturer_info',
            label: 'Manufacturers',
            options: {
                filter: false,
                customBodyRender: (value, tableMeta) => {
                    if (value && value.length > 0) {
                        return (
                            <Tooltip title={value.map((m) => m.company_name).join(', ')}>
                                <Typography variant="body2">
                                    {value[0].company_name} {value.length > 1 ? `(+${value.length - 1})` : ''}
                                </Typography>
                            </Tooltip>
                        );
                    }
                    // Fallback to creator if they are a manufacturer
                    const row = models[tableMeta.rowIndex];
                    if (row?.created_by?.role === 'devicemanufacture') {
                        return <Typography variant="body2">{row.created_by.name}</Typography>;
                    }
                    return '—';
                }
            }
        },
    ];

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <MainCard title="Assigned Device Models">
                    <DynamicDatatables
                        rows={models}
                        columns={columns}
                        options={{
                            print: false,
                            download: true,
                            selectableRows: 'none',
                        }}
                    />
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default AgencyDeviceModelList;
