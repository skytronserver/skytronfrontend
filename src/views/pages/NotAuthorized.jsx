import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// ==============================|| NOT AUTHORIZED PAGE ||============================== //

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <MainCard title="Not Authorized">
      <Typography variant="body1" gutterBottom>
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoBack}>
        Go Back
      </Button>
    </MainCard>
  );
};

export default NotAuthorized;
