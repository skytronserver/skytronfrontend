import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function MapPolicy() {
  return (
    <>
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: 'center', fontWeight: 400, marginBottom: 4 }}
          >
            Map Usage Policy
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">1. Introduction</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                This Map Usage Policy governs your use of mapping services within the SkyTron<sup>®</sup> portal. 
                Our platform integrates multiple mapping services to provide comprehensive location-based features 
                while ensuring compliance with all applicable terms of service and data usage policies.
              </Typography>
              <Typography variant="body1">
                By accessing or using any map features in SkyTron<sup>®</sup>, you acknowledge and agree to comply 
                with this policy and the terms of our third-party map providers, including but not limited to 
                NRSC/ISRO's Bhuvan Maps, OpenStreetMap, and ESRI.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">2. Map Data Sources &amp; Attribution</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                SkyTron<sup>®</sup> integrates the following mapping services, each with its own data sources and attribution requirements:
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>A. Bhuvan Maps by NRSC/ISRO</Typography>
              <Typography variant="body1" paragraph>
                Primary mapping service providing detailed geographic data of India. Includes multiple layers:
              </Typography>
              <ul>
                <li>Base Map Layer (india3)</li>
                <li>Administrative Boundaries (admin_group)</li>
                <li>Road Network (mmi_india)</li>
              </ul>
              <Typography variant="body2" color="text.secondary" paragraph>
                © National Remote Sensing Centre (NRSC), Indian Space Research Organisation (ISRO)
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3 }}>B. OpenStreetMap (OSM)</Typography>
              <Typography variant="body1" paragraph>
                Used as a supplementary data source for global coverage and additional map features.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                © OpenStreetMap contributors, licensed under Open Data Commons Open Database License (ODbL)
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3 }}>C. ESRI World Imagery</Typography>
              <Typography variant="body1" paragraph>
                High-resolution satellite and aerial imagery used in satellite view mode.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community
              </Typography>

              <Typography variant="body1" paragraph>
                All intellectual property rights in the underlying map data, imagery, and services remain with the respective owners and licensors.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">3. Permitted Use</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                You may use the map features in SkyTron<sup>®</sup> solely for the following purposes:
              </Typography>
              <ul>
                <li><strong>Vehicle Tracking:</strong> View real-time and historical locations of authorized vehicles with appropriate permissions.</li>
                <li><strong>Operational Monitoring:</strong> Monitor fleet movements, routes, and operational activities within your authorized scope.</li>
                <li><strong>Incident Response:</strong> Access location data for emergency response and incident management.</li>
                <li><strong>Reporting:</strong> Generate internal reports and analytics for legitimate business or governance purposes.</li>
                <li><strong>Asset Management:</strong> Track and manage assets, including vehicles and equipment, within the authorized geographic areas.</li>
              </ul>
              <Typography variant="body2" color="text.secondary" paragraph>
                Note: All usage is subject to the specific terms of service of each map provider and may be restricted based on your subscription level and user permissions.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">4. Prohibited Use</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The following activities are strictly prohibited when using SkyTron<sup>®</sup> mapping services:
              </Typography>
              <ul>
                <li><strong>Unauthorized Data Extraction:</strong> Copying, scraping, downloading, or redistributing map tiles, imagery, or geospatial data outside the SkyTron<sup>®</sup> platform.</li>
                <li><strong>Illegal Activities:</strong> Using map data for any unlawful purposes or in violation of local, national, or international laws and regulations.</li>
                <li><strong>Security Violations:</strong> Attempting to reverse-engineer, decompile, or modify the map services, APIs, or underlying technologies.</li>
                <li><strong>Attribution Removal:</strong> Removing, obscuring, or altering any copyright notices, watermarks, or attribution labels displayed on the maps.</li>
                <li><strong>Commercial Exploitation:</strong> Using the mapping services for commercial purposes not explicitly authorized by Skytrack Technologies Pvt Ltd and the respective map providers.</li>
                <li><strong>Data Misrepresentation:</strong> Presenting map data in a misleading or inaccurate manner that could cause confusion or harm.</li>
                <li><strong>Excessive Requests:</strong> Making excessive or automated requests that may degrade the performance of map services for other users.</li>
              </ul>
              <Typography variant="body2" color="error" paragraph>
                Violation of these terms may result in immediate suspension of your access to the mapping services and potential legal action.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">5. Data Accuracy &amp; Limitations</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                While we strive to provide the most accurate and up-to-date mapping information, please be aware of the following limitations:
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>A. Data Currency</Typography>
              <Typography variant="body2" paragraph>
                - Map data is updated at varying frequencies depending on the source and location
                - Some areas may show outdated information due to the update cycles of our providers
                - Real-time conditions (traffic, road closures, etc.) may not be reflected immediately
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>B. Positional Accuracy</Typography>
              <Typography variant="body2" paragraph>
                - GPS and device-based location data may have inherent inaccuracies
                - Urban canyons, buildings, and atmospheric conditions can affect GPS accuracy
                - Typical accuracy ranges from 5-50 meters depending on conditions and device capabilities
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>C. Coverage Areas</Typography>
              <Typography variant="body2" paragraph>
                - Bhuvan Maps provides the most detailed coverage for India
                - International coverage is provided by OpenStreetMap and may have varying levels of detail
                - Remote or restricted areas may have limited or no coverage
              </Typography>

              <Typography variant="body2" color="error" paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
                Important: The maps are intended for monitoring and situational awareness purposes only and should not be used as the sole basis for navigation or decision-making in safety-critical applications.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">6. Third-Party Terms &amp; Attributions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                Your use of mapping services in SkyTron<sup>®</sup> is subject to the following third-party terms and conditions:
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>A. Bhuvan Maps (NRSC/ISRO)</Typography>
              <Typography variant="body2" paragraph>
                - Data provided by National Remote Sensing Centre (NRSC), Indian Space Research Organisation (ISRO)
                - For detailed terms, visit: <Link href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener">https://bhuvan.nrsc.gov.in</Link>
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>B. OpenStreetMap</Typography>
              <Typography variant="body2" paragraph>
                - © OpenStreetMap contributors
                - Licensed under Open Data Commons Open Database License (ODbL)
                - More information: <Link href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">https://www.openstreetmap.org/copyright</Link>
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>C. ESRI World Imagery</Typography>
              <Typography variant="body2" paragraph>
                - Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community
                - Terms of use: <Link href="https://www.esri.com/en-us/legal/terms/full-master-agreement" target="_blank" rel="noopener">https://www.esri.com/legal/terms</Link>
              </Typography>

              <Typography variant="body1" sx={{ mt: 3, fontWeight: 'medium' }}>
                You are responsible for reviewing and complying with all applicable third-party terms and conditions.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">7. Policy Updates &amp; Modifications</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                Skytrack Technologies Pvt Ltd reserves the right to modify this Map Usage Policy at any time to reflect:
              </Typography>
              <ul>
                <li>Changes in applicable laws or regulations</li>
                <li>Updates to third-party provider terms and conditions</li>
                <li>New features or functionality in the SkyTron<sup>®</sup> platform</li>
                <li>Changes in our business practices or service offerings</li>
              </ul>
              
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                We will notify users of any material changes to this policy through one or more of the following methods:
              </Typography>
              <ul>
                <li>In-app notifications within the SkyTron<sup>®</sup> portal</li>
                <li>Email communication to registered users</li>
                <li>Posting a notice on our website</li>
              </ul>

              <Typography variant="body1" paragraph sx={{ mt: 2, fontWeight: 'medium' }}>
                Your continued use of the mapping services after any such changes constitutes your acceptance of the new Map Usage Policy. If you do not agree to the updated policy, you must immediately discontinue using the mapping features.
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Last Updated: December 16, 2025
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">8. Contact &amp; Support</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                For questions, clarifications, or to report any issues regarding this Map Usage Policy or the mapping services, please contact our support team:
              </Typography>
              
              <Box sx={{ mt: 2, pl: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Technical Support</Typography>
                <Typography>Email: <Link href="mailto:support@skytrack.tech">support@skytrack.tech</Link></Typography>
                <Typography>Phone: +91-XXXXXXXXXX</Typography>
                <Typography>Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</Typography>
              </Box>

              <Box sx={{ mt: 3, pl: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Business Inquiries</Typography>
                <Typography>Email: <Link href="mailto:contact@skytrack.tech">contact@skytrack.tech</Link></Typography>
              </Box>

              <Box sx={{ mt: 3, pl: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Registered Office</Typography>
                <Typography>Skytrack Technologies Pvt. Ltd.</Typography>
                <Typography>123 Tech Park, Sector 18</Typography>
                <Typography>Gurugram, Haryana 122015</Typography>
                <Typography>India</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: 'italic' }}>
                For urgent matters outside business hours, please contact your account manager or use the emergency support line provided in your service agreement.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </>
  );
}

export default MapPolicy;
