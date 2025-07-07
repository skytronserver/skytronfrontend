import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import StockServices from '../../services/StockServices';
import MUIDataTable from 'mui-datatables';
import CustomLoader from '../../ui-component/CustomLoader';

const CombinedStockReport = () => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);

  const columns = [
    { 
      name: "id", 
      label: "ID", 
      options: { 
        filter: false, 
        sort: false, 
        display: false 
      } 
    },
    { 
      name: "model_name", 
      label: "Model", 
      options: { 
        filter: true, 
        sort: true 
      } 
    },
    { 
      name: "total_stock", 
      label: "Total Stock", 
      options: { 
        filter: false, 
        sort: true 
      } 
    },
    { 
      name: "assigned_stock", 
      label: "Assigned Stock", 
      options: { 
        filter: false, 
        sort: true 
      } 
    },
    { 
      name: "available_stock", 
      label: "Available Stock", 
      options: { 
        filter: false, 
        sort: true 
      } 
    },
    { 
      name: "defective_stock", 
      label: "Defective Stock", 
      options: { 
        filter: false, 
        sort: true 
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
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await StockServices.getCombinedStocks();
      if (response.data) {
        setStockData(response.data);
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
    <MainCard title="Combined Stock Report">
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
