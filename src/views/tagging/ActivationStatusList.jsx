import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { gridSpacing } from "../../store/constant";
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { useTranslation } from 'react-i18next';
import AutoHideAlert from "../../ui-component/AutoHideAlert";

const dummyDevices = [
  {
    device_id: "DEV-1001",
    imei: "11000000000001",
    vehicle_number: "AS01TMP101",
    status: "Activated",
    tag_date: "2026-07-10 10:30:00"
  },
  {
    device_id: "DEV-1002",
    imei: "11000000000002",
    vehicle_number: "AS01TMP102",
    status: "Skipped",
    tag_date: "2026-07-11 11:45:00"
  },
  {
    device_id: "DEV-1003",
    imei: "11000000000003",
    vehicle_number: "AS01TMP103",
    status: "Skipped",
    tag_date: "2026-07-12 09:15:00"
  },
  {
    device_id: "DEV-1004",
    imei: "11000000000004",
    vehicle_number: "AS01TMP104",
    status: "Activated",
    tag_date: "2026-07-13 14:20:00"
  },
  {
    device_id: "DEV-1005",
    imei: "11000000000005",
    vehicle_number: "AS01TMP105",
    status: "Not Activated",
    tag_date: "2026-07-14 08:00:00"
  }
];

const ActivationStatusList = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState(dummyDevices);
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, type: "success", message: "" });

  const handleSendActivationCommand = (deviceId) => {
    // Dummy API call
    console.log(`Sending activation command to device: ${deviceId}`);
    setAlertInfo({
      isOpen: true,
      message: `Activation command sent to device ${deviceId}! (Dummy API)`,
      type: "success"
    });
    
    // Update local state to reflect change (dummy behavior)
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.device_id === deviceId ? { ...device, status: "Activated" } : device
      )
    );
  };

  const handleCloseAlert = () => {
    setAlertInfo(prev => ({ ...prev, isOpen: false }));
  };

  const columns = [
    {
      name: "imei",
      label: "IMEI",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "vehicle_number",
      label: "Registration No",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "status",
      label: "Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          let color = "#555";
          if (value === "Activated") color = "green";
          if (value === "Skipped" || value === "Not Activated") color = "red";
          return <span style={{ color, fontWeight: "bold" }}>{value}</span>;
        }
      }
    },
    {
      name: "tag_date",
      label: "Tag Date",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const deviceId = devices[tableMeta.rowIndex].device_id;
          const status = devices[tableMeta.rowIndex].status;
          
          if (status === "Activated") {
            return <span>-</span>;
          }

          return (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleSendActivationCommand(deviceId)}
            >
              Send Activation Command
            </Button>
          );
        }
      }
    }
  ];

  return (
    <>
      <AutoHideAlert
        open={alertInfo.isOpen}
        onClose={handleCloseAlert}
        message={alertInfo.message}
        type={alertInfo.type}
      />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <DynamicDatatables 
            tableTitle="Device Activation Status" 
            rows={devices} 
            columns={columns}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default ActivationStatusList;
