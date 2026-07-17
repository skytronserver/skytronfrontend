import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { gridSpacing } from "../../store/constant";
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { useTranslation } from 'react-i18next';
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import TaggingService from '../../services/TaggingService';

const ActivationStatusList = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState([]);
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, type: "success", message: "" });
  const [loading, setLoading] = useState(false);

  const fetchPendingActivations = async () => {
    try {
      setLoading(true);
      const response = await TaggingService.getPendingActivations({ page: 1, page_size: 100 });
      const rawData = response?.data?.data || [];
      const formatted = rawData.map(item => ({
        device_id: item.device_tag || item.id,
        imei: item.imei,
        vehicle_number: item.device_tag_info?.vehicle_reg_no || "N/A",
        status: item.send_status === "queued" ? "Pending" : item.send_status,
        tag_date: item.sent_at ? new Date(item.sent_at).toLocaleString() : "-"
      }));
      setDevices(formatted);
    } catch (err) {
      console.error(err);
      setAlertInfo({ isOpen: true, message: "Failed to fetch pending activations.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingActivations();
  }, []);

  const handleSendActivationCommand = async (deviceId) => {
    try {
      setLoading(true);
      await TaggingService.sendActivationCommand({ device_tag_id: deviceId });
      setAlertInfo({
        isOpen: true,
        message: `Activation command queued successfully!`,
        type: "success"
      });
      fetchPendingActivations(); // Refresh list
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Failed to send activation command.";
      setAlertInfo({
        isOpen: true,
        message: errorMsg,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (deviceId) => {
    try {
      setLoading(true);
      const response = await TaggingService.checkActivationStatus({ device_tag_id: deviceId });
      if (response?.data?.reply_received) {
        setAlertInfo({
          isOpen: true,
          message: `Device has successfully replied to the activation command!`,
          type: "success"
        });
        fetchPendingActivations(); // Refresh list to update status
      } else {
        setAlertInfo({
          isOpen: true,
          message: `Device has not replied yet. Still pending.`,
          type: "info"
        });
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Failed to check activation status.";
      setAlertInfo({
        isOpen: true,
        message: errorMsg,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
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
          if (value === "Pending") color = "orange";
          if (value === "Skipped" || value === "Not Activated" || value === "queued") color = "red";
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleSendActivationCommand(deviceId)}
              >
                Send Command
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleCheckStatus(deviceId)}
              >
                Check Status
              </Button>
            </div>
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
