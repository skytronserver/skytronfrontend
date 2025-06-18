import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

function TermsAndConditions() {
  const { t } = useTranslation('pages');

  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: 400, marginBottom: 4 }}
        >
          {t('termsAndConditions.title')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ textAlign: "center", marginBottom: 4 }}
        >
          {t('termsAndConditions.lastUpdated')}
        </Typography>

        <Typography variant="body1" paragraph>
          <span dangerouslySetInnerHTML={{ __html: t('termsAndConditions.welcome') }} />
        </Typography>

        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          {t('termsAndConditions.agreement')}
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.acceptance.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              {t('termsAndConditions.sections.acceptance.content')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.eligibility.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              {t('termsAndConditions.sections.eligibility.content')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.useOfApp.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul>
              {t('termsAndConditions.sections.useOfApp.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.permissions.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.intro')}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.camera.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.camera.content')}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.location.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.location.content')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.permissions.location.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.storage.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.storage.content')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.permissions.storage.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.network.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.network.content')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.permissions.network.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.bluetooth.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.bluetooth.content')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.permissions.bluetooth.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.foregroundServices.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.foregroundServices.content')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.permissions.foregroundServices.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.notifications.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.permissions.notifications.content')}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              {t('termsAndConditions.sections.permissions.deviceAccess.title')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.permissions.deviceAccess.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <Typography variant="body1" sx={{ mt: 2 }}>
              {t('termsAndConditions.sections.permissions.footer')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.userRoles.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              {t('termsAndConditions.sections.userRoles.intro')}
            </Typography>
            <ul>
              {t('termsAndConditions.sections.userRoles.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.privacyPolicy.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              {t('termsAndConditions.sections.privacyPolicy.content')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('termsAndConditions.sections.intellectualProperty.title')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              {t('termsAndConditions.sections.intellectualProperty.content')}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Container>
    </Box>
  );
}

export default TermsAndConditions; 