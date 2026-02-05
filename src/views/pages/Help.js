import React from 'react';
import {
  Typography,
  Box,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
const Help = () => {
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
              {t('common.helpHeading')}
                   </Typography>

          <Typography
                    variant="h6"
                  component="h6"
                       gutterBottom
                   sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}
          >
              {t('common.helpIntro')}
                   </Typography>

          <Accordion defaultExpanded>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      1. {t('common.searchingByTimePeriods')}
    </Typography>
  </AccordionSummary>

  <AccordionDetails>
            <Typography paragraph>
              {t('common.searchingByTimePeriodsDescription')}
            </Typography>

            <ul>
              <li><Typography>{t('common.searchingByTimePeriodsPoint1')}</Typography></li>
              <li><Typography>{t('common.searchingByTimePeriodsPoint2')}</Typography></li>
              <li><Typography>{t('common.searchingByTimePeriodsPoint3')}</Typography></li>
            </ul>

            <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('common.searchingByTimePeriodsDescription2')}
            </Typography>

            <ol>
              <li><Typography>{t('common.searchingByTimePeriodsStep1')}</Typography></li>
              <li><Typography>{t('common.searchingByTimePeriodsStep2')}</Typography></li>
              <li><Typography>{t('common.searchingByTimePeriodsStep3')}</Typography></li>
            </ol>
          </AccordionDetails>
        </Accordion>
         <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      2.{t('common.filteringByOtherCriteria')}
    </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AccordionDetails>
  <Typography variant="body2" paragraph>
    {t('common.filteringByOtherCriteriaDescription')}
  </Typography>

  <ul>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaPoint1')}</Typography></li>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaPoint2')}</Typography></li>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaPoint3')}</Typography></li>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaPoint4')}</Typography></li>
  </ul>

  <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
    {t('common.filteringByOtherCriteriaStepsHeading')}
  </Typography>

  <ol>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaStep1')}</Typography></li>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaStep2')}</Typography></li>
    <li><Typography variant="body2">{t('common.filteringByOtherCriteriaStep3')}</Typography></li>
  </ol>
</AccordionDetails>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      3. {t('common.usingAdvancedFilters')}
    </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Accordion>
  

  <AccordionDetails>
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      {t('common.advancedFiltersDescription')}
    </Typography>

    <ul>
      <li>
        <Typography variant="body2">
          {t('common.advancedFiltersPoint1')}
        </Typography>
      </li>
      <li>
        <Typography variant="body2">
          {t('common.advancedFiltersPoint2')}
        </Typography>
      </li>
    </ul>

    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      {t('common.advancedFiltersInstruction')}
    </Typography>
  </AccordionDetails>
</Accordion>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                4. {t('common.interpretingResults')}</Typography>
            </AccordionSummary>
            
              <Accordion>
  

  <AccordionDetails>
    <Typography variant="body2" paragraph>
      {t('common.interpretingResultsDescription')}
    </Typography>

    <ul>
      <li>
        <Typography variant="body2">
          {t('common.interpretingResultsTable')}
        </Typography>
      </li>

      <li>
        <Typography variant="body2">
          {t('common.interpretingResultsMap')}
        </Typography>
      </li>
    </ul>
  </AccordionDetails>
</Accordion>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}></Typography>
                5. {t('common.tipsForEffectiveSearching')}
              
            </AccordionSummary>
          
              <Accordion>
  
  

  <AccordionDetails>
    <ul>
      <li>
        <Typography variant="body2">
          {t('common.searchTipsPoint1')}
        </Typography>
      </li>

      <li>
        <Typography variant="body2">
          {t('common.searchTipsPoint2')}
        </Typography>
      </li>

      <li>
        <Typography variant="body2">
          {t('common.searchTipsPoint3')}
        </Typography>
      </li>
    </ul>
  </AccordionDetails>
</Accordion>
          </Accordion>
          

        <Box sx={{ mt: 4 }}>
  <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
    {t('common.needMoreHelpHeading')}
  </Typography>

  <Typography variant="body2" paragraph>
    {t('common.needMoreHelpDescription')}
  </Typography>
</Box>
        </Container>
      </Box>
    </>
  );
};

export default Help;
