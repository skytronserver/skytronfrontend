import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

function PrivacyPolicy() {
  const { t } = useTranslation('pages');

  return (
    <>
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center", fontWeight: 400, marginBottom: 4 }}
          >
            {t('privacyPolicy.title')}
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.introduction.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {t('privacyPolicy.sections.introduction.content')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.informationWeCollect.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                {t('privacyPolicy.sections.informationWeCollect.intro')}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                {t('privacyPolicy.sections.informationWeCollect.personalInfo.title')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.informationWeCollect.personalInfo.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                {t('privacyPolicy.sections.informationWeCollect.vehicleInfo.title')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.informationWeCollect.vehicleInfo.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                {t('privacyPolicy.sections.informationWeCollect.deviceInfo.title')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.informationWeCollect.deviceInfo.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.howWeUse.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {t('privacyPolicy.sections.howWeUse.intro')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.howWeUse.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.dataSharing.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                {t('privacyPolicy.sections.dataSharing.intro')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.dataSharing.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>
                    <strong>{item.title}</strong> {item.content}
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.dataSecurity.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                {t('privacyPolicy.sections.dataSecurity.intro')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.dataSecurity.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.userRights.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                {t('privacyPolicy.sections.userRights.intro')}
              </Typography>
              <ul>
                {t('privacyPolicy.sections.userRights.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>
                    <strong>{item.title}</strong> {item.content}
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.dataRetention.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {t('privacyPolicy.sections.dataRetention.content')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.thirdParty.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {t('privacyPolicy.sections.thirdParty.content')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.childrenPrivacy.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {t('privacyPolicy.sections.childrenPrivacy.content')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.changes.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {t('privacyPolicy.sections.changes.content')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('privacyPolicy.sections.contact.title')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                {t('privacyPolicy.sections.contact.intro')}
              </Typography>
              <Typography variant="body1">
                Email: contact@skytrack.tech
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </>
  );
}

export default PrivacyPolicy;
