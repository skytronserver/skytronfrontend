import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import amtronlogo from "../../assets/images/amtron-logo.png";

function HomeFooter() {
  const { t } = useTranslation();
  
  return (
    <footer style={{ position: 'fixed', bottom: 0, width: '100%', textAlign: 'center', color: 'rgb(163, 255, 214)', padding: '10px 0' }}>
      <img
        src={amtronlogo}
        alt={t('common.logo')}
        style={{ height: 'auto', width: '36px' }}
      /><br />
      <Typography variant="body1" sx={{ fontSize: '16px',color: "#0010FF" }}>
        {t('common.implementedBy')} <br />© {t('common.allRights')}
      </Typography>
    </footer>
  );
}

export default HomeFooter;
