import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CHECKPOINTS = [
  "Document Verification",
  "Device Functional Test",
  "Protocol Compliance",
  "Data Health Check",
  "Final Review"
];

const DeviceModelTechnicalOnboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Fallback mock data structure
        const mockData = {
          id: id,
          status: "Rejected", 
          model_name: "Model X1",
          submission_date: "2023-10-15T10:00:00Z",
          public_remarks: "Device failed protocol compliance at checkpoint 3. Firmware needs update.",
          final_report_url: "/dummy/report.pdf",
          devices: [
            { imei: "123456789012345", receipt_state: "Received", test_result: "Pass" },
            { imei: "223456789012345", receipt_state: "Received", test_result: "Pass" },
            { imei: "323456789012345", receipt_state: "Received", test_result: "Fail" },
            { imei: "423456789012345", receipt_state: "Received", test_result: "Pass" },
            { imei: "523456789012345", receipt_state: "Received", test_result: "Pass" },
          ],
          checkpoint_progress: 2,
          return_dispatch: {
            courier: "BlueDart",
            awb: "BD123456789",
            date: "2023-10-25"
          }
        };

        setTimeout(() => {
          setRequestData(mockData);
          setLoading(false);
        }, 500);

      } catch (err) {
        setError("Failed to load details");
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !requestData) {
    return (
      <Alert severity="error">{error || "Data not found"}</Alert>
    );
  }

  const isFailed = requestData.status.toLowerCase() === 'rejected' || requestData.status.toLowerCase() === 'failed';

  return (
    <MainCard
      title="Onboarding Status / Detail"
      secondary={
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {isFailed ? (
            <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />}
                   sx={{ '& .MuiAlert-message': { width: '100%' } }}>
              <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Onboarding Failed
              </AlertTitle>
              <Typography variant="body1">
                The technical onboarding process has failed. <strong>New request required.</strong>
              </Typography>
            </Alert>
          ) : requestData.status.toLowerCase() === 'approved' ? (
            <Alert severity="success">
              <AlertTitle>Onboarding Approved</AlertTitle>
              The technical onboarding process was completed successfully.
            </Alert>
          ) : (
            <Alert severity="info">
              <AlertTitle>Onboarding in Progress</AlertTitle>
              Status: {requestData.status}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Request Info</Typography>
              <Stack spacing={1}>
                <Typography variant="body2"><strong>ID:</strong> {requestData.id}</Typography>
                <Typography variant="body2"><strong>Model:</strong> {requestData.model_name}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(requestData.submission_date).toLocaleDateString()}</Typography>
              </Stack>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Group / Checkpoint Progress</Typography>
              <Stepper activeStep={requestData.checkpoint_progress} orientation="vertical">
                {CHECKPOINTS.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentTurnedInIcon color="primary" /> Five-Device Receipt & Testing State
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Device IMEI</TableCell>
                      <TableCell>Receipt State</TableCell>
                      <TableCell>Test Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requestData.devices?.map((dev, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{dev.imei}</TableCell>
                        <TableCell>
                          <Chip label={dev.receipt_state} size="small" color={dev.receipt_state === 'Received' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell>
                          {dev.test_result === 'Pass' && <Chip label="Pass" size="small" color="success" variant="outlined"/>}
                          {dev.test_result === 'Fail' && <Chip label="Fail" size="small" color="error" variant="outlined"/>}
                          {!dev.test_result && <Chip label="Pending" size="small" variant="outlined" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>Public Remarks</Typography>
              {requestData.public_remarks ? (
                <Typography variant="body2" color="text.secondary">
                  {requestData.public_remarks}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.disabled">No remarks available.</Typography>
              )}
            </Paper>

            <Grid container spacing={2}>
              {requestData.return_dispatch && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingIcon color="action" /> Return Dispatch Tracking
                    </Typography>
                    <Typography variant="body2"><strong>Courier:</strong> {requestData.return_dispatch.courier}</Typography>
                    <Typography variant="body2"><strong>AWB:</strong> {requestData.return_dispatch.awb}</Typography>
                    <Typography variant="body2"><strong>Date:</strong> {requestData.return_dispatch.date}</Typography>
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6} display="flex" alignItems="center">
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />} 
                  disabled={!requestData.final_report_url}
                  onClick={() => window.open(requestData.final_report_url, '_blank')}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Download Final Report
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default DeviceModelTechnicalOnboardingDetail;
