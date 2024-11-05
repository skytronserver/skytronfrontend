/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState, useRef } from 'react';
import { Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { gridSpacing } from '../../store/constant';
import HomePageService from '../../services/HomePage';
import { getAllSOSCall } from '../../actions/commonDataActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { useNavigate } from 'react-router-dom';

const audio = new Audio('https://skytrack.tech:2000/static/bell.wav');
const GetAllCall = () => {
  const [load, setLoad] = useState(false);
  const [newPendingCall, setNewPendingCall] = useState(null); // Track new pending assignment
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const previousCallsRef = useRef([]); // Keep track of previous calls for comparison

  useEffect(() => {
    const fetchCallList = async () => {
      try {
        const response = await HomePageService.getPendingSOSCall();
        const calls = response?.data?.calls || [];
        dispatch(getAllSOSCall(calls));
        checkForNewPendingCall(calls); // Check for new "pending" assignments
      } catch (error) {
        console.error('Error fetching call list:', error);
        dispatch(getAllSOSCall([]));
      }
      setLoad(true);
    };

    // Fetch data every 10 seconds
    fetchCallList();
    const interval = setInterval(fetchCallList, 10000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [dispatch]);

  const callList = useSelector((state) => state.userData?.callList || []);

  const checkForNewPendingCall = (calls) => {
    const newPendingCall = calls.find(
      (call) =>
        call.call?.status === 'pending' &&
        call?.status === 'pending' &&
        !previousCallsRef.current.some((prevCall) => prevCall.id === call.id)
    );
    if (newPendingCall) {
      setNewPendingCall(newPendingCall);
      playBuzzer(); // Play the buzzer sound
    }
    previousCallsRef.current = calls;
  };

  const playBuzzer = () => {
    audio.play();
  };

  const handleAccept = async (id) => {
    const response = await HomePageService.acceptEMCall({ assignment_id: id, accept: true });
    const acceptedCall=response.data;
    setNewPendingCall(null); // Close the popup after accepting
    audio.pause();
    handleNavigate(acceptedCall)
  };

  const handleNavigate = (call) => {
    navigate('/emcall', { state: { call } });
  };

  const formattedData = callList.map((call) => ({
    emergencyCallId: call?.id || 'N/A',
    assignmentId: call?.ex?.id || 'N/A',
    deviceIMEI: call?.call?.device?.device?.imei || 'N/A',
    vehicleRegNo: call?.call?.device?.vehicle_reg_no || 'N/A',
    ownerName: call?.call?.device?.vehicle_owner?.users?.[0]?.name || 'N/A',
    callStatus: call?.call?.status || 'N/A',
    rawCallData: call,
  }));

  const columns = [
    { name: 'emergencyCallId', label: 'Emergency Call ID' },
    { name: 'assignmentId', label: 'Assignment ID' },
    { name: 'deviceIMEI', label: 'Device IMEI' },
    { name: 'vehicleRegNo', label: 'Vehicle Registration No.' },
    { name: 'ownerName', label: 'Owner Name' },
    { name: 'callStatus', label: 'Call Status' },
    {
      name: 'action',
      label: 'Action',
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rawCallData = formattedData[tableMeta.rowIndex]?.rawCallData;
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleNavigate(rawCallData)}
            >
              Go to Emcall
            </Button>
          );
        },
      },
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <DynamicDatatables
            tableTitle="SOS Call List"
            rows={formattedData}
            columns={columns}
          />
        )}
      </Grid>

      {/* Popup Dialog for New Pending Call */}
      <Dialog open={!!newPendingCall} onClose={() => setNewPendingCall(null)}>
        <DialogTitle>New Pending Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            A new assignment with ID {newPendingCall?.id} is pending. Do you want to accept it?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAccept(newPendingCall?.id)} color="primary" variant="contained">
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default GetAllCall;
