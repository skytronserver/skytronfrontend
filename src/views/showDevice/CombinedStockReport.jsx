import React, { useEffect, useState } from 'react';
import { Grid, Chip } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import StockServices from '../../services/StockServices';
import CustomLoader from '../../ui-component/CustomLoader';
import DynamicDatatables from '../../datatables/DynamicDatatables';

const CombinedStockReport = () => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available_for_fitting':
        return 'warning';
      case 'assigned':
        return 'success';
      case 'defective':
        return 'error';
      case 'esim_active_confirmed':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns = [
    { 
      name: "id", 
      label: "ID", 
      options: { 
        filter: false, 
        sort: true,
        display: false 
      } 
    },
    { 
      name: "device_esn", 
      label: "Device ESN", 
      options: { 
        filter: true, 
        sort: true 
      } 
    },
    { 
      name: "imei", 
      label: "IMEI", 
      options: { 
        filter: true, 
        sort: true 
      } 
    },
    {
      name: "model",
      label: "Model Name",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.model?.model_name || '-';
        },
      },
      csvExportKey: 'model_name'
    },
    {
      name: "dealer",
      label: "Dealer",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.dealer?.company_name || 'Not Assigned';
        }
      },
      csvExportKey: 'company_name'
    },
    {
      name: "model",
      label: "TAC No",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.model?.tac_no || '-';
        }
      },
      csvExportKey: 'tac_no'
    },
    {
      name: "model",
      label: "Hardware Version",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.model?.hardware_version || '-';
        }
      },
      csvExportKey: 'hardware_version'
    },
    {
      name: "stock_status",
      label: "Stock Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <Chip 
            label={value?.replace(/_/g, ' ') || 'Unknown'} 
            color={getStatusColor(value)}
            size="small"
          />
        )
      }
    },
    {
      name: "esim_status",
      label: "M2M Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <Chip 
            label={value?.replace(/_/g, ' ') || 'Unknown'} 
            color={getStatusColor(value)}
            size="small"
          />
        )
      }
    },
    {
      name: "iccid",
      label: "ICCID",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "telecom_provider1",
      label: "Provider 1",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "msisdn1",
      label: "MSISDN 1",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "telecom_provider2",
      label: "Provider 2",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "msisdn2",
      label: "MSISDN 2",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "created_by",
      label: "Created By",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.created_by?.name || '-';
        }
      },
      csvExportKey: 'name'
    },  
    {
      name: "created",
      label: "Created Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatDate(value)
      }
    },
    {
      name: "esim_validity",
      label: "M2M Validity",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => formatDate(value)
      }
    }
  ];

  const options = {
    filterType: 'checkbox',
    responsive: 'standard',
    selectableRows: 'none',
    download: true,
    print: false,
    viewColumns: true,
    filter: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 25, 50],
    elevation: 1,
    textLabels: {
      body: {
        noMatch: 'No device records found',
      }
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await StockServices.getCombinedStocks();
      if (response.data) {
        const combinedData = [
          ...(response.data.filtered_devices || []),
          // ...(response.data.available_devices || [])
        ];
        setStockData(combinedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching combined stock data:', error);
      setLoading(false);
    }
  };

  return (
    <MainCard title="Device Report">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading ? (
            <CustomLoader />
          ) : (
            <DynamicDatatables
              columns={columns}
              rows={stockData}
              options={options}
              tableTitle=""
            />
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default CombinedStockReport;
