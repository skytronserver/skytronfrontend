import React, { useEffect, useState } from 'react';
import { Grid, Chip } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import StockServices from '../../services/StockServices';
import MUIDataTable from 'mui-datatables';
import CustomLoader from '../../ui-component/CustomLoader';

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
      case 'notassigned':
        return 'warning';
      case 'assigned':
        return 'success';
      case 'defective':
        return 'error';
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
      name: "model.model_name",
      label: "Model Name",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          // Show model name if available, else show '-'
          return rowData?.model?.model_name || '-';
        },
      }
    },
    {
      name: "dealer.dealer_name",
      label: "Dealer",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          // Show dealer name if available, else show '-'
          return rowData?.dealer || 'not assigned';
        }
      }
    },
    {
      name: "model.tac_no",
      label: "TAC No",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.model?.tac_no || '-';
        }
      }
    },
    {
      name: "model.hardware_version",
      label: "Hardware Version",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.model?.hardware_version || '-';
        }
      }
    },
    {
      name: "stock_status",
      label: "Stock Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <Chip 
            label={value || 'Unknown'} 
            color={getStatusColor(value)}
            size="small"
          />
        )
      }
    },
    {
      name: "esim_status",
      label: "eSIM Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <Chip 
            label={value || 'Unknown'} 
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
      name: "created_by.name",
      label: "Created By",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.created_by?.name || '-';
        }
      }
    },
    {
      name: "created_by.role",
      label: "Creator Role",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = stockData[tableMeta.rowIndex];
          return rowData?.created_by?.role || '-';
        }
      }
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
      label: "eSIM Validity",
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
          ...(response.data.available_devices || [])
        ];
        setStockData(combinedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching combined stock data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <MainCard title="Device Stock Report">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MUIDataTable
            title=""
            data={stockData}
            columns={columns}
            options={options}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default CombinedStockReport;
