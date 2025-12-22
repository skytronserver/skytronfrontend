import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function MapPolicy() {
  return (
    <>
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ textAlign: 'center', fontWeight: 400, marginBottom: 4 ,fontWeight: 'bold' }}
          >
            Map Data &amp; Update Policy
          </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>1. Purpose</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                This Map Data &amp; Update Policy defines the governance, usage, and update mechanism for GIS map data used within the SkyTron AIS-140 Vehicle Location Tracking Platform, in compliance with applicable AIS-140 Functional Requirements and Survey of India guidelines.
              </Typography>
              <Typography variant="body1" paragraph>
                All map services and datasets are hosted and accessed within India on Government infrastructure and are available for audit by notified agencies.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>2. Map Usage</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                Map services within SkyTron are used exclusively for:
              </Typography>
              <ul>
                <li>Real-time and historical vehicle location tracking</li>
                <li>Fleet and operational monitoring</li>
                <li>Incident and emergency response</li>
                <li>Geofencing, alerts, and spatial analytics</li>
                <li>Regulatory reporting and monitoring under AIS-140</li>
              </ul>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Map data is used strictly within the SkyTron platform and is not extracted, redistributed, or used for unauthorised purposes.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>3. Map Data Update Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                Map data updates within SkyTron follow this policy:
              </Typography>
              <ul>
                <li>Survey of India vector datasets are updated as and when revised versions are released by Survey of India or authorised Government agencies.</li>
                <li>State-specific GIS layers received from the State Data Centre / line departments are updated periodically based on official notifications.</li>
                <li>Bhuvan base maps and satellite imagery are maintained and updated by NRSC as per Government of India policy.</li>
              </ul>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                As a policy, map datasets are reviewed and refreshed at least once every six (6) months, or earlier if updated datasets are officially made available.
              </Typography>
              <Typography variant="body1" paragraph>
                All updates are version-controlled and logged within the SkyTron GIS platform.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>4. Compliance &amp; Governance</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The following compliance and governance principles apply:
              </Typography>
              <ul>
                <li>The map platform complies with Survey of India guidelines and applicable Ministry of Defence geospatial regulations.</li>
                <li>No foreign or unauthorised map services are used.</li>
                <li>Map services are integrated as part of the backend-controlled GIS architecture and are subject to access control and audit.</li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>5. Policy Review</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                This policy is reviewed periodically and may be updated to reflect:
              </Typography>
              <ul>
                <li>Changes in AIS-140 requirements</li>
                <li>Updates in Government GIS data policies</li>
                <li>Enhancements to the SkyTron platform</li>
              </ul>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Last Updated: December 2025
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </>
  );
}

export default MapPolicy;
