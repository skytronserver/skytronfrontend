import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';


function MapPolicy() {
  const { t } = useTranslation();
  return (
    <>
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">

          <Typography
          variant="h2"
        component="h1"
             gutterBottom
         sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}
>
    {t('common.mapPolicyHeading')}
         </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        1. {t('common.purpose')}
       </Typography>
      </AccordionSummary>
           <AccordionDetails>
  <Typography paragraph>
    {t('common.purposeLine1')}
  </Typography>
          </AccordionDetails>
          <AccordionDetails>
  <Typography paragraph>
    {t('common.purposeLine2')}
  </Typography>
          </AccordionDetails>
         
          </Accordion>
       <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        2. {t('common.mapUsage')}
       </Typography>

      </AccordionSummary>
    
      
            
   <AccordionDetails>

  <ul> 
           <h4>{t('common.mapUsageHeading')}</h4>
    <li>{t('common.mapUsagePoint1')}</li>
    <li>{t('common.mapUsagePoint2')}</li>
    <li>{t('common.mapUsagePoint3')}</li>
    <li>{t('common.mapUsagePoint4')}</li>
    <li>{t('common.mapUsagePoint5')}</li>
    <h4>{t('common.mapUsageHeading2')}</h4>
  </ul>

  
</AccordionDetails>

            
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        3. {t('common.mapDataUpdates')}
       </Typography>

      </AccordionSummary>

<AccordionDetails> 
<ul> 
           <h4>{t('common.mapDataUpdatesHeading1')}</h4>
    <li>{t('common.mapDataUpdatesPoint1')}</li>
    <li>{t('common.mapDataUpdatesPoint2')}</li>
    <li>{t('common.mapDataUpdatesPoint3')}</li>
    <h4>{t('common.mapDataUpdatesHeading2')}</h4>
    <h4>{t('common.mapDataUpdatesHeading3')}</h4>
    
  </ul>



</AccordionDetails>


          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        4. {t('common.compliance$Governance')}
       </Typography>

      </AccordionSummary>
            <AccordionDetails>
             <ul> 
           <h4>{t('common.compliance$GovernanceHeading1')}</h4>
    <li>{t('common.compliance$GovernancePoint1')}</li>
    <li>{t('common.compliance$GovernancePoint2')}</li>
    <li>{t('common.compliance$GovernancePoint3')}</li>
    
  </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        5. {t('common.policyReveiw')}
       </Typography>
        </AccordionSummary>
            <AccordionDetails>
             <ul> 
           <h4>{t('common.policyReveiwHeading')}</h4>
    <li>{t('common.policyReveiwPoint1')}</li>
    <li>{t('common.policyReveiwPoint2')}</li>
    <li>{t('common.policyReveiwPoint3')}</li>
  </ul>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </>
  );
}

export default MapPolicy;
