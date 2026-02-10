import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  ButtonGroup,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";

function DetailCard({
  call,
  handleBroadcast,
  handleCloseCall,
  broadcastDisabled,
  showDetails,
  sosType,
  onSosTypeChange,
  caseOutcome,
  onCaseOutcomeChange
}) {

  const isClosed = String(call?.call?.status || '').toLowerCase() === 'closed';

  const sosTypeOptions = [
    { value: 'device', label: 'SOS from Device' },
    { value: 'app_unreg', label: 'SOS from App (Unreg)' },
    { value: 'app_reg', label: 'SOS from App (Reg)' },
    { value: 'app_trip', label: 'SOS from App (Trip)' }
  ];

  const caseOutcomeOptions = [
    { value: 'genuine', label: 'Genuine' },
    { value: 'fake', label: 'Fake' }
  ];


  return (
    <>
      {showDetails && (
       <Grid
       item
       xs={12}
       md={3}
       sx={{
         position: "fixed",
         bottom: "2rem",
         right: "2rem",
         width: "100%",
         maxWidth: "100%",
         zIndex: 1300,
         backgroundColor: "white",
         padding: "0 !important", // Remove any padding for this grid item
         m: "0 !important", // Remove margin for this grid item
       }}
     >
       <Card sx={{ boxShadow: 3 }}>
         <CardContent>
           <Typography variant="h5">Call Details</Typography>
           <Typography variant="body1">Emergency Call ID: {call?.id}</Typography>
           <Typography variant="body1">IMEI: {call?.call?.device?.device?.imei || "N/A"}</Typography>
           <Typography variant="body1">Vehicle RegNo: {call?.call?.device?.vehicle_reg_no || "N/A"}</Typography>
           <Typography variant="body1">
             Owner Name: {call?.call?.device?.vehicle_owner?.users?.[0]?.name || "N/A"}
           </Typography>
           <Typography variant="body1">Call Status: {call?.call?.status || "N/A"}</Typography>
         </CardContent>
 
         <CardContent>
           <Box display="flex" flexDirection="column" gap={2}>
             <FormControl size="small" fullWidth>
               <Select
                 value={sosType || ''}
                 onChange={(e) => onSosTypeChange?.(e.target.value)}
                 disabled={isClosed}
                 displayEmpty
               >
                 <MenuItem value="">SOS Type</MenuItem>
                 {sosTypeOptions.map((opt) => (
                   <MenuItem key={opt.value} value={opt.value}>
                     {opt.label}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>

             <FormControl size="small" fullWidth>
               <Select
                 value={caseOutcome || ''}
                 onChange={(e) => onCaseOutcomeChange?.(e.target.value)}
                 disabled={!isClosed}
                 displayEmpty
               >
                 <MenuItem value="">{isClosed ? 'Case Outcome' : 'Case Outcome (after close)'}</MenuItem>
                 {caseOutcomeOptions.map((opt) => (
                   <MenuItem key={opt.value} value={opt.value}>
                     {opt.label}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>

             <ButtonGroup variant="contained" color="primary" fullWidth>
               <Button onClick={() => handleBroadcast("police_ex")} disabled={broadcastDisabled}>
                 Police
               </Button>
               <Button onClick={() => handleBroadcast("ambulance_ex")} disabled={broadcastDisabled}>
                 Ambulance
               </Button>
               <Button onClick={() => handleBroadcast("both")} disabled={broadcastDisabled}>
                 Both
               </Button>
             </ButtonGroup>
             <Button
               variant="contained"
               color="error"
               onClick={handleCloseCall}
               fullWidth
             >
               Close Call
             </Button>
           </Box>
         </CardContent>
       </Card>
     </Grid>
      )}
    </>
  );
}

export default DetailCard;
