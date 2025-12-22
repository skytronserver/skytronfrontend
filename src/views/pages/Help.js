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

const Help = () => {
  return (
    <>
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 4 }}
          >
            Help &amp; Data Exploration Guide
          </Typography>

          <Typography variant="body1" paragraph>
            This application is designed to help you quickly drill down and search through large amounts of
            tracking and reporting data. You can filter information by time periods and other criteria that you
            define, so you always see only the data that is relevant to you.
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>1. Searching by Time Periods</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Most data pages let you narrow results using date and time filters. Typical options include:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">Selecting a single date (e.g. "Today", "Yesterday").</Typography>
                </li>
                <li>
                  <Typography variant="body2">Selecting a date range (e.g. "From" and "To" dates).</Typography>
                </li>
                <li>
                  <Typography variant="body2">In some cases, choosing a specific time window within a day.</Typography>
                </li>
              </ul>
              <Typography variant="body2" paragraph>
                To drill down by time:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body2">Open the relevant page (for example, Live Tracking or the desired Report).</Typography>
                </li>
                <li>
                  <Typography variant="body2">Use the date / time controls to choose the period you are interested in.</Typography>
                </li>
                <li>
                  <Typography variant="body2">Click the search or apply button to refresh the data for that time range.</Typography>
                </li>
              </ol>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>2. Filtering by Other Criteria</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                In addition to time, you can filter data using other fields depending on the page, such as:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">Vehicle registration number or IMEI.</Typography>
                </li>
                <li>
                  <Typography variant="body2">Vehicle owner or category.</Typography>
                </li>
                <li>
                  <Typography variant="body2">POI (Point of Interest), roads, or polygon/area selections.</Typography>
                </li>
                <li>
                  <Typography variant="body2">Alert types or status (e.g. moving, idle, offline).</Typography>
                </li>
              </ul>
              <Typography variant="body2" paragraph>
                To refine results:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body2">Enter one or more filter values in the search fields (for example, vehicle number or owner name).</Typography>
                </li>
                <li>
                  <Typography variant="body2">Combine filters with the time period to focus on a very specific subset of data.</Typography>
                </li>
                <li>
                  <Typography variant="body2">Apply the filters and review the updated table or map view.</Typography>
                </li>
              </ol>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>3. Using Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Some pages provide additional "Advanced" filters that can be shown or hidden. Use these when you
                need to:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">Search within a particular POI, road, or custom polygon area.</Typography>
                </li>
                <li>
                  <Typography variant="body2">Limit results to certain alert conditions or operational states.</Typography>
                </li>
              </ul>
              <Typography variant="body2" paragraph>
                If available, click the filter icon or toggle button to reveal more fields, then fill them as needed
                before running your search.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>4. Interpreting Results</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                After you search or filter, results are usually shown in one or more of the following views:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    <strong>Tables</strong>: Each row represents a record (for example, a vehicle, data packet, or alert).
                    You can scroll vertically to review all results.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Maps</strong>: Markers and shapes represent vehicles, POIs, or regions. Zoom and pan to
                    explore specific areas, and click on markers for detailed information.
                  </Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>5. Tips for Effective Searching</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ul>
                <li>
                  <Typography variant="body2">Start with a broader time range, then narrow it down if there are too many results.</Typography>
                </li>
                <li>
                  <Typography variant="body2">Use a combination of fields (e.g. date range + vehicle number) to focus on the data you need.</Typography>
                </li>
                <li>
                  <Typography variant="body2">If you see no results, clear some filters or extend the time period and try again.</Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              Need More Help?
            </Typography>
            <Typography variant="body2" paragraph>
              If you still have questions about how to search, filter, or interpret the data, please contact our
              system administrator or support team for further assistance.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Help;
