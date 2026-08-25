import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { gridSpacing } from "../../../store/constant";
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import AutoHideAlert from '../../../ui-component/AutoHideAlert';

// Mock data and API call for now since backend is not ready
const mockData = [
  { id: 1, imei: "352345678901234", iccid: "89910009000000001234", requestedMonths: 12, requester: "Dealer A", requestDate: "2024-06-01" },
  { id: 2, imei: "352345678901235", iccid: "89910009000000001235", requestedMonths: 24, requester: "Manufacturer B", requestDate: "2024-06-10" },
];

const EsimValidityExtensionRequests = () => {
  const [load, setLoad] = useState(false);
  const [list, setList] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setList(mockData);
      setLoad(true);
    }, 500);
  }, []);

  const handleAction = (rowData, action) => {
    console.log(`Action: ${action} on IMEI: ${rowData[0]}`);
    setAlertType("success");
    setAlertMessage(`Request successfully ${action}ed.`);
    setOpenAlert(true);
    // Remove the row from the mock list
    setList(prevList => prevList.filter(item => item.imei !== rowData[0]));
  };

  const columns = [
    { name: "imei", label: "Device IMEI", options: { filter: true, sort: true } },
    { name: "iccid", label: "ICCID", options: { filter: true, sort: true } },
    { name: "requestedMonths", label: "Requested Months", options: { filter: true, sort: true } },
    { name: "requester", label: "Requester", options: { filter: true, sort: true } },
    { name: "requestDate", label: "Request Date", options: { filter: true, sort: true } },
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={() => handleAction(tableMeta.rowData, "Approve")}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleAction(tableMeta.rowData, "Reject")}
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      <AutoHideAlert
        open={openAlert}
        onClose={handleCloseAlert}
        message={alertMessage}
        type={alertType}
      />

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {load && (
            <DynamicDatatables
              tableTitle="eSIM Validity Extension Requests"
              rows={list}
              columns={columns}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EsimValidityExtensionRequests;
