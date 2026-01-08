/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState, useRef } from 'react';
import { Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { gridSpacing } from '../../store/constant';
import HomePageService from '../../services/HomePage';
import { getAllSOSCall } from '../../actions/commonDataActions';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { useNavigate } from 'react-router-dom';

const audio = new Audio(`${process.env.REACT_APP_BASE_URL}static/bell.wav`);
const GetAllCall = () => {
  const { t } = useTranslation();
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

  let buzzerTimeout;
const playBuzzer = () => {
  audio.currentTime = 0;
  audio.play();
  clearTimeout(buzzerTimeout);
  buzzerTimeout = setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 10000); // 10 seconds
};

  const handleAccept = async (id) => {
    const response = await HomePageService.acceptEMCall({ assignment_id: id, accept: true });
    const acceptedCall=response.data;
    setNewPendingCall(null); // Close the popup after accepting
    audio.pause();
    audio.currentTime = 0;
    clearTimeout(buzzerTimeout);
    handleNavigate(acceptedCall)
  };

  const handleNavigate = (call) => {
    navigate('/emcall', { state: { call } });
  };

  const formattedData = callList.map((call) => ({
    emergencyCallId: call?.id || t('sosCallList.notAvailable'),
    assignmentId: call?.ex?.id || t('sosCallList.notAvailable'),
    deviceIMEI: call?.call?.device?.device?.imei || t('sosCallList.notAvailable'),
    vehicleRegNo: call?.call?.device?.vehicle_reg_no || t('sosCallList.notAvailable'),
    ownerName: call?.call?.device?.vehicle_owner?.users?.[0]?.name || t('sosCallList.notAvailable'),
    callStatus: call?.call?.status || t('sosCallList.notAvailable'),
    rawCallData: call,
  }));

  const columns = [
    { name: 'emergencyCallId', label: t('sosCallList.columns.emergencyCallId') },
    { name: 'assignmentId', label: t('sosCallList.columns.assignmentId') },
    { name: 'deviceIMEI', label: t('sosCallList.columns.deviceIMEI') },
    { name: 'vehicleRegNo', label: t('sosCallList.columns.vehicleRegNo') },
    { name: 'ownerName', label: t('sosCallList.columns.ownerName') },
    { name: 'callStatus', label: t('sosCallList.columns.callStatus') },
    {
      name: 'action',
      label: t('sosCallList.columns.action'),
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
              {t('sosCallList.buttons.goToEmcall')}
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
            tableTitle={t('sosCallList.title')}
            rows={formattedData}
            columns={columns}
          />
        )}
      </Grid>

      {/* Popup Dialog for New Pending Call */}
      <Dialog open={!!newPendingCall} onClose={() => setNewPendingCall(null)}>
        <DialogTitle>{t('sosCallList.dialog.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('sosCallList.dialog.message', { id: newPendingCall?.id })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAccept(newPendingCall?.id)} color="primary" variant="contained">
            {t('sosCallList.dialog.accept')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default GetAllCall;
