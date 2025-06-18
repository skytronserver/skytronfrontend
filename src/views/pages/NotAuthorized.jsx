import React from 'react';
// project imports
import MainCard from '../../ui-component/cards/MainCard';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ==============================|| NOT AUTHORIZED PAGE ||============================== //

const NotAuthorized = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('pages');

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <MainCard title={t('notAuthorized.title')}>
      <Typography variant="body1" gutterBottom>
        {t('notAuthorized.message')}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoBack}>
        {t('notAuthorized.goBack')}
      </Button>
    </MainCard>
  );
};

export default NotAuthorized;
