import { useEffect, useState } from 'react';
// material-ui
import { Grid } from '@mui/material';

import Widget from './Widget';
import { gridSpacing } from '../../../store/constant';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={3} md={6} sm={6} xs={12}>
          <Widget isLoading={isLoading} cardColor="#5e35b1"/>
          </Grid>
          <Grid item lg={3} md={6} sm={6} xs={12}>
            <Widget isLoading={isLoading} cardColor="#1e88e5"/>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
