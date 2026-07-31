/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Grid, Typography, Chip, Tooltip, Box, useTheme, Button } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import TestAgencyServices from '../../services/TestAgencyServices';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { useTranslation } from 'react-i18next';
import { openFile } from '../../helper';

const AgencyDeviceModelList = () => {
    const { t } = useTranslation();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await TestAgencyServices.getAgencyDeviceModels();
                const allModels = response.data || [];
                // Filter: Test Agency should only see approved device models
                const approvedModels = allModels.filter(m => m.status === 'StateAdminApproved');
                setModels(approvedModels);
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
            label: 'Device Model Name',
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
                customBodyRender: (value, tableMeta) => {
                    const row = models[tableMeta.rowIndex];
                    return (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">{value}</Typography>
                            {row?.tac_doc_path && (
                                <Button 
                                    size="small" 
                                    sx={{ minWidth: 'auto', p: '2px 8px', fontSize: '0.75rem' }} 
                                    variant="outlined" 
                                    onClick={(e) => openFile(e, row.tac_doc_path)}
                                >
                                    View
                                </Button>
                            )}
                        </Box>
                    );
                }
            }
        },
        {
            name: 'tac_validity',
            label: 'TAC Expiry',
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
            label: 'COP No & Validity',
            options: {
                filter: false,
                customBodyRender: (value) => {
                    if (!value) return '—';
                    return (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box flex={1}>
                                <Typography variant="body2" fontWeight={600}>{value.cop_no}</Typography>
                                {value.cop_validity && (
                                    <Typography variant="caption" color="text.secondary">
                                        Exp: {value.cop_validity}
                                    </Typography>
                                )}
                            </Box>
                            {value.cop_file && (
                                <Button 
                                    size="small" 
                                    sx={{ minWidth: 'auto', p: '2px 8px', fontSize: '0.75rem' }} 
                                    variant="outlined" 
                                    onClick={(e) => openFile(e, value.cop_file)}
                                >
                                    View
                                </Button>
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
            label: 'Manufacturer Name',
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
