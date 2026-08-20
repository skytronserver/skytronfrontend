import React from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, TextField, 
  Button, MenuItem, Divider, FormControlLabel, Checkbox 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const states = ["Assam", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat"];

const ManufacturerRegistration = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Typography variant="h3" gutterBottom>Manufacturer Registration</Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Create your organization account by providing the required legal and contact information.
      </Typography>

      <form>
        {/* Organization Details */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">Organization Details</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Company/Organization Name" required variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Company Identification Number (CIN)" required variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="GSTIN" required variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="PAN Number" required variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Registered Address" required variant="outlined" multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="State" defaultValue="Assam" required>
                  {states.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Pincode" required variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">Authorized Contact Person</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" required variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Designation" required variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" type="email" required variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Mobile Number" required variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">Document Uploads</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ py: 1.5 }}>
                  Upload Registration Certificate (PDF)
                  <input type="file" hidden accept=".pdf" />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ py: 1.5 }}>
                  Upload PAN Card Copy (PDF/JPG)
                  <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" />
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Declarations & Actions */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <FormControlLabel 
              control={<Checkbox required />} 
              label="I declare that the information provided above is true and correct to the best of my knowledge." 
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button variant="outlined" color="secondary" size="large">
                Save as Draft
              </Button>
              <Button variant="contained" color="primary" size="large">
                Submit Registration
              </Button>
            </Box>
          </CardContent>
        </Card>
      </form>
    </Box>
  );
};

export default ManufacturerRegistration;
