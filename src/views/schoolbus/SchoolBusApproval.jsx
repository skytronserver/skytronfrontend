import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import MainCard from "../../ui-component/cards/MainCard";
import SchoolBusService from "../../services/SchoolBusService";

const SchoolBusApproval = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [remarks, setRemarks] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await SchoolBusService.getTaggedVehicles();
      const data = res?.data?.data || [];
      setRows(
        data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          vehicle_reg_no:
            item.vehicle_reg_no || item.regNo,
          school_name:
            item.school_name || item.school,
          requested_at:
            item.requested_at || item.date,
          status: item.status
        }))
      );
    } catch (error) {
      showSnackbar("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleApprove = async (tagId) => {
    try {
      await SchoolBusService.approveBusTag(tagId);

      showSnackbar(
        "Bus approved successfully",
        "success"
      );

      fetchData();
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message ||
        "Approval failed",
        "error"
      );
    }
  };

  const openRejectDialog = (tagId) => {
    setSelectedTagId(tagId);
    setRejectOpen(true);
  };

  const handleReject = async () => {
    try {
      await SchoolBusService.rejectBusTag(
        selectedTagId,
        remarks
      );

      showSnackbar(
        "Bus rejected successfully",
        "success"
      );

      setRejectOpen(false);
      setRemarks("");

      fetchData();
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message ||
        "Rejection failed",
        "error"
      );
    }
  };

  const columns = [
    {
      field: "slNo",
      headerName: "Sl No",
      width: 90
    },
    {
      field: "vehicle_reg_no",
      headerName: "Vehicle Number",
      flex: 1
    },
    {
      field: "school_name",
      headerName: "School Name",
      flex: 1.5
    },
    {
      field: "requested_at",
      headerName: "Requested Date",
      flex: 1.2,
      renderCell: (params) => {
        if (!params.value) return "-";

        return new Date(
          params.value
        ).toLocaleString();
      }
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status =
          params.value?.toUpperCase();

        return (
          <Chip
            label={status}
            color={
              status === "APPROVED"
                ? "success"
                : status === "REJECTED"
                  ? "error"
                  : "warning"
            }
            size="small"
          />
        );
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      renderCell: (params) => {
        const status =
          params.row.status?.toUpperCase();

        if (
          status === "APPROVED" ||
          status === "REJECTED"
        ) {
          return "-";
        }

        return (
          <>
            <Button
              variant="contained"
              color="success"
              size="small"
              sx={{ mr: 1 }}
              onClick={() =>
                handleApprove(params.row.id)
              }
            >
              Approve
            </Button>

            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() =>
                openRejectDialog(
                  params.row.id
                )
              }
            >
              Reject
            </Button>
          </>
        );
      }
    }
  ];

  return (
    <>
      <MainCard>
        <Typography
          variant="h3"
          sx={{ mb: 2 }}
        >
          School Bus Approval
        </Typography>

        <Box sx={{ height: 650 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </MainCard>

      <Dialog
        open={rejectOpen}
        onClose={() =>
          setRejectOpen(false)
        }
      >
        <DialogTitle>
          Reject Bus Request
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Remarks"
            value={remarks}
            onChange={(e) =>
              setRemarks(e.target.value)
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setRejectOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false
          })
        }
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SchoolBusApproval;