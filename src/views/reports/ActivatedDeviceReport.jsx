import React, { useEffect, useState } from 'react'
import showDeviceApi from '../../services/showDeviceApi'
import MainCard from '../../ui-component/cards/MainCard';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import CustomLoader from '../../ui-component/CustomLoader';

const ActivatedDeviceReport = () => {
  const [activatedDevices, setActivatedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(100); // Default to 100 rows
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const columns = [
    { 
      field: 'device_esn', 
      headerName: 'Device ESN', 
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'imei', 
      headerName: 'IMEI', 
      minWidth: 150,
      flex: 1 
    },
    { 
        field: 'vehicle_reg_no', 
        headerName: 'Vehicle Reg No', 
        minWidth: 120,
        flex: 1 
      },
    { 
      field: 'iccid', 
      headerName: 'ICCID', 
      minWidth: 200,
      flex: 1 
    },
    { 
      field: 'msisdn1', 
      headerName: 'MSISDN 1', 
      minWidth: 120,
      flex: 1 
    },
    { 
      field: 'msisdn2', 
      headerName: 'MSISDN 2', 
      minWidth: 120,
      flex: 1 
    },
    { 
      field: 'fitment_date', 
      headerName: 'Fitment Date', 
      minWidth: 180,
      flex: 1,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'fitment_status', 
      headerName: 'Fitment Status', 
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal', 
          wordBreak: 'break-word',
          color: params.value === 'Owner_Final_OTP_Verified' ? 'green' : 'inherit'
        }}>
          {params.value?.replace(/_/g, ' ')}
        </div>
      )
    },
    { 
      field: 'esim_validity', 
      headerName: 'ESIM Validity', 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'telecom_provider1', 
      headerName: 'Telecom Provider 1', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'telecom_provider2', 
      headerName: 'Telecom Provider 2', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'stock_status', 
      headerName: 'Stock Status', 
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          color: params.value === 'Fitted' ? 'green' : 'inherit'
        }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'esim_status', 
      headerName: 'ESIM Status', 
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          color: params.value === 'ESIM_Active_Confirmed' ? 'green' : 'inherit'
        }}>
          {params.value?.replace(/_/g, ' ')}
        </div>
      )
    },
    { 
      field: 'engine_no', 
      headerName: 'Engine No', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'chassis_no', 
      headerName: 'Chassis No', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'vehicle_make', 
      headerName: 'Vehicle Make', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'vehicle_model', 
      headerName: 'Vehicle Model', 
      minWidth: 120,
      flex: 1 
    },
    { 
      field: 'vehicle_category', 
      headerName: 'Vehicle Type', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'dto_district_code', 
      headerName: 'DTO District Code', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'district_name', 
      headerName: 'District Name', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'state_name', 
      headerName: 'State Name', 
      minWidth: 120,
      flex: 1 
    },
    { 
      field: 'vehicle_owner_name', 
      headerName: 'Vehicle Owner Name', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'device_model_name', 
      headerName: 'Device Model Name', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'hardware_version', 
      headerName: 'Hardware Version', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'vendor_id', 
      headerName: 'Vendor ID', 
      minWidth: 120,
      flex: 1 
    },
    { 
      field: 'tac_no', 
      headerName: 'TAC No', 
      minWidth: 120,
      flex: 1 
    },
    { 
      field: 'manufacturer_name', 
      headerName: 'Manufacturer Name', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'manufacturer_user_name', 
      headerName: 'Manufacturer User Name', 
      minWidth: 200,
      flex: 1 
    },
    { 
      field: 'manufacturer_state', 
      headerName: 'Manufacturer State', 
      minWidth: 150,
      flex: 1 
    },
    { 
      field: 'dealer_name', 
      headerName: 'Dealer Name', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'dealer_user_name', 
      headerName: 'Dealer User Name', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'tagged_by_name', 
      headerName: 'Tagged By Name', 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'tagged_by_email', 
      headerName: 'Tagged By Email', 
      minWidth: 200,
      flex: 1 
    },
    { 
      field: 'created_date', 
      headerName: 'Created Date', 
      minWidth: 180,
      flex: 1,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'device_assigned_date', 
      headerName: 'Device Assigned Date', 
      minWidth: 180,
      flex: 1,
      valueFormatter: (params) => formatDate(params.value)
    }
  ];

  useEffect(() => {
    fetchActivatedDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const fetchActivatedDevices = async () => {
    try {
      const response = await showDeviceApi.getActivatedDeviceList({
        page: page + 1,
        page_size: pageSize
      });
      if (response.data.status === 'success') {
        const devices = response.data.data.devices.map(device => ({
          ...device,
          id: device.id
        }));
        setActivatedDevices(devices);
        setTotalRows(response.data.data.total_count);
      }
    } catch (error) {
      console.error('Error fetching activated devices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Activated Device Report">
      {loading ? (
        <CustomLoader />
      ) : (
        <Box sx={{ 
          width: '100%', 
          height: 'calc(100vh - 200px)',
          '& .MuiDataGrid-root': {
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0'
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: '#fff'
            }
          }
        }}>
          <DataGrid
            rows={activatedDevices}
            columns={columns}
            pageSize={pageSize}
            page={page}
            rowCount={totalRows}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 25, 50, 100]}
            pagination
            paginationMode="server"
            disableSelectionOnClick
            getRowHeight={() => 'auto'}
            sx={{
              '& .MuiDataGrid-cell': {
                padding: '8px',
                alignItems: 'center'
              },
              '& .MuiDataGrid-columnHeader': {
                padding: '8px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
      )}
    </MainCard>
  );
};

export default ActivatedDeviceReport;
