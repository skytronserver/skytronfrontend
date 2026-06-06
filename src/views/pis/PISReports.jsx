import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, CardHeader, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Typography
} from '@mui/material';
import PISService from '../../services/PISServices';

const PISReports = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);

  const fetchData = async () => {
    try {
      const [schedRes, routeRes, busRes] = await Promise.all([
        PISService.getBusSchedules(),
        PISService.getActiveBusRoutes(),
        PISService.getAvailableBuses()
      ]);
      if (schedRes.success) setSchedules(schedRes.data);
      if (routeRes.success) setRoutes(routeRes.data);
      if (busRes.success) setBuses(busRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : routeId;
  };

  const getBusName = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.name : busId;
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Passenger Information System - Trip Report"
          subheader="View the status of all scheduled and ongoing trips"
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Schedule ID</TableCell>
                  <TableCell>Service Type</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Bus Assigned</TableCell>
                  <TableCell>Scheduled Start</TableCell>
                  <TableCell>Actual Start</TableCell>
                  <TableCell>Actual End</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((sched) => (
                  <TableRow key={sched.id}>
                    <TableCell>{sched.id}</TableCell>
                    <TableCell>{sched.serviceType}</TableCell>
                    <TableCell>{getRouteName(sched.routeId)}</TableCell>
                    <TableCell>{getBusName(sched.busId)}</TableCell>
                    <TableCell>{new Date(sched.startDatetime).toLocaleString()}</TableCell>
                    <TableCell>
                      {sched.actualStartTime ? new Date(sched.actualStartTime).toLocaleString() : (
                        <Typography variant="body2" color="textSecondary">Not Started</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {sched.actualEndTime ? new Date(sched.actualEndTime).toLocaleString() : (
                         <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={
                          sched.status === 'completed' ? 'success.main' :
                          sched.status === 'started' ? 'primary.main' :
                          sched.status === 'canceled' ? 'error.main' : 'textSecondary'
                        }
                      >
                        {sched.status.toUpperCase()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No trip data available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PISReports;
