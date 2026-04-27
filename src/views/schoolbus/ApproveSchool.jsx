import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import SchoolBusService from '../../services/SchoolBusService';
import { Chip } from '@mui/material';

const ApproveSchool = () => {

    const [taggedVehicles, setTaggedVehicles] = useState([]);

    useEffect(() => {

        SchoolBusService.getSchoolApplications()
            .then((res) => {

                const data =
                    res?.data?.data ??
                    res?.data ??
                    [];

                const formatted = data.map(item => ({
                    id: item.id,
                    school_name: item.school_name,
                    school_address: item.school_address,
                    school_pin: item.school_pin,
                    school_email: item.school_email,
                    school_phone: item.school_phone,
                    state_name: item.state_name,
                    district_name: item.district_name,
                    applicant_name: item.applicant_name,
                    applicant_email: item.applicant_email,
                    applicant_mobile: item.applicant_mobile,
                    status: item.status,
                    remarks: item.remarks,
                    application_date: item.created_at,
                    decision_date: item.updated_at
                }));

                setTaggedVehicles(formatted);
            })
            .catch((e) => {
                console.error(e);
            });

    }, []);

    const handleApprove = async (row) => {
    try {
        const res = await SchoolBusService.approveSchool(row.id);

        console.log(res.data);

        // 🔥 update UI instantly (no reload)
        setTaggedVehicles(prev =>
            prev.map(item =>
                item.id === row.id
                    ? { ...item, status: 'APPROVED' }
                    : item
            )
        );

    } catch (e) {
        console.error('Approve failed:', e);
    }
};

    const handleReject = async (row) => {
    try {
        const res = await SchoolBusService.rejectSchool(row.id);

        console.log(res.data);

        setTaggedVehicles(prev =>
            prev.map(item =>
                item.id === row.id
                    ? { ...item, status: 'REJECTED' }
                    : item
            )
        );

    } catch (e) {
        console.error('Reject failed:', e);
    }
};

    const columns = [
        { name: 'id', label: 'ID' },
        { name: 'school_name', label: 'School Name' },
        { name: 'school_address', label: 'Address' },
        { name: 'school_pin', label: 'PIN' },
        { name: 'school_email', label: 'Email' },
        { name: 'school_phone', label: 'Phone' },
        { name: 'state_name', label: 'State' },
        { name: 'district_name', label: 'District' },
        { name: 'applicant_name', label: 'Applicant Name' },
        { name: 'applicant_email', label: 'Applicant Email' },
        { name: 'applicant_mobile', label: 'Applicant Mobile' },
       {
    name: 'status',
    label: 'Status',
    options: {
        customBodyRender: (value) => {

            let color = 'default';

            if (value === 'APPROVED') color = 'success';
            else if (value === 'REJECTED') color = 'error';
            else if (value === 'SUBMITTED') color = 'warning';

            return <Chip label={value} color={color} size="small" />;
        }
    }
},
        { name: 'remarks', label: 'Remarks' },
        { name: 'application_date', label: 'Application Date' },
        { name: 'decision_date', label: 'Approval/Rejection Date' },

        {
            name: 'actions',
            label: 'Actions',
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {

                   const row = taggedVehicles[tableMeta.rowIndex];

    const isSubmitted = row?.status === 'SUBMITTED';

                    return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                  disabled={!isSubmitted}
                                onClick={() => handleApprove(row)}
                            >
                                Approve
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disabled={!isSubmitted}
                                onClick={() => handleReject(row)}
                            >
                                Reject
                            </Button>
                        </Box>
                    );
                }
            }
        }
    ];

    return (
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <MainCard title="Display And Approve School">
                <DynamicDatatables
                    // tableTitle="School Logs"
                    rows={taggedVehicles}
                    columns={columns}
                    options={{
                        selectableRows: 'none',
                        filter: true,
                        search: true,
                        responsive: 'standard',
                        tableBodyHeight: 'auto',
                        tableBodyMaxHeight: '600px'
                    }}
                />
            </MainCard>
        </Box>
    );
};

export default ApproveSchool;