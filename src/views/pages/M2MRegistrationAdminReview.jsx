import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { serviceProviderCol } from "../../datatables/rowsColumn";
import UserServices from "../../services/UserServices";
import tableTheme from "../../ui-component/customTableUi";
import { ThemeProvider } from "@mui/material/styles";

const M2MRegistrationAdminReview = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptedId, setAcceptedId] = useState(null);
  const [tableState, setTableState] = useState({ page: 0, rowsPerPage: 10 });
  const statusOverrides = {};

  const paperStyle = useMemo(
    () => ({
      p: 3,
      borderRadius: "16px",
      background: "#ffffff",
      boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    }),
    []
  );

  const loadRows = useCallback(async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await UserServices.fetchSimProvider({});
      let data = Array.isArray(response?.data) ? response.data : [];
      data.sort((a, b) => new Date(b.created) - new Date(a.created));
      setRows(data);
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load M2M registration requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setInfoMessage("");
      await loadRows();
    })();
    return () => {
      // no-op
    };
  }, [loadRows]);

  const tableOptions = useMemo(
    () => ({
      responsive: "standard",
      selectableRows: "none",
      download: true,
      print: false,
      viewColumns: true,
      filter: true,
      page: tableState.page,
      rowsPerPage: tableState.rowsPerPage,
      onChangePage: (page) =>
        setTableState((prev) => ({ ...prev, page })),
      onChangeRowsPerPage: (rowsPerPage) =>
        setTableState((prev) => ({ ...prev, rowsPerPage, page: 0 })),
    }),
    [tableState.page, tableState.rowsPerPage]
  );

  const handleActionClick = useCallback((action, id) => {
    setErrorMessage("");
    setInfoMessage(`${action} clicked for ID: ${id}`);
  }, []);

  const handleAccept = useCallback(
    async (id, row) => {
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await UserServices.updateSimProvider({
          esimprovider_id: id,
          status: "Accept",
        });

        const userId = row?.users?.[0]?.id;
        if (userId) {
          await UserServices.resendUserCreationOtp({ user_id: userId });
        }

        setAcceptedId(id);
        setRows((prevRows) =>
          (Array.isArray(prevRows) ? prevRows : []).map((r) => {
            if (r?.id !== id) return r;
            return { ...r, status: "Accept" };
          })
        );
        setInfoMessage(`Accepted ID: ${id}`);
      } catch (e) {
        setErrorMessage(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to accept request."
        );
      } finally {
        setLoading(false);
      }
    },
    [loadRows]
  );

  const handleResend = useCallback(
    async (id, row) => {
      if (!id) return;
      const userId = row?.users?.[0]?.id;
      if (!userId) {
        setErrorMessage("User ID not found for this row.");
        return;
      }
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await UserServices.resendUserCreationOtp({ user_id: userId });
        setInfoMessage(`OTP resent successfully for ID: ${id}`);
      } catch (e) {
        setErrorMessage(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to resend OTP."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleReject = useCallback(
    async (id) => {
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await UserServices.updateSimProvider({
          esimprovider_id: id,
          status: "Reject",
        });
        setRows((prevRows) =>
          (Array.isArray(prevRows) ? prevRows : []).map((r) => {
            if (r?.id !== id) return r;
            return { ...r, status: "Reject" };
          })
        );
        setInfoMessage(`Rejected ID: ${id}`);
      } catch (e) {
        setErrorMessage(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to reject request."
        );
      } finally {
        setLoading(false);
      }
    },
    [loadRows]
  );

  const actionColumn = useMemo(
    () => [
      {
        name: "Action",
        label: "Action",
        options: {
          filter: false,
          sort: false,
          download: false,
          customBodyRender: (value, tableMeta) => {
            const id = tableMeta?.rowData?.[0];
            const currentRow = rows?.[tableMeta?.rowIndex];

            const requestStatusRaw = statusOverrides?.[id] ?? currentRow?.status ?? "";
            const requestStatus = String(requestStatusRaw).trim().toLowerCase();

            const applicantStatusRaw = currentRow?.users?.[0]?.status ?? "";
            const applicantStatus = String(applicantStatusRaw).trim().toLowerCase();
            const isApplicantActive = applicantStatus === "active";

            const isRequestPending =
              requestStatus === "pending" || requestStatus === "created" || requestStatus === "";
            const canResendOtp =
              acceptedId === id || isApplicantActive || requestStatus === "accept";
            return (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  flexWrap: "nowrap",
                  whiteSpace: "nowrap",
                }}
              >
                <IconButton
                  size="small"
                  component={Link}
                  to={`/user/detail/serviceProvider/${id}`}
                  sx={{
                    color: "#6366f1", // indigo
                    backgroundColor: "#eef2ff",
                    "&:hover": {
                      backgroundColor: "#e0e7ff",
                    },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                {canResendOtp ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleResend(id, rows?.[tableMeta?.rowIndex])}
                    sx={{
                      borderRadius: "6px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#f59e0b",
                      color: "#f59e0b",
                      px: 2,
                      "&:hover": {
                        backgroundColor: "#fff7ed",
                        borderColor: "#d97706",
                        color: "#d97706",
                      },
                    }}
                  >
                    Resend OTP
                  </Button>
                ) : null}
                {isRequestPending ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(id)}
                      sx={{
                        borderRadius: "6px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        px: 2,
                        "&:hover": {
                          backgroundColor: "#fee2e2",
                          borderColor: "#dc2626",
                          color: "#dc2626",
                        },
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleAccept(id, rows?.[tableMeta?.rowIndex])}
                      sx={{
                        backgroundColor: "#2563eb",
                        "&:hover": { backgroundColor: "#1d4ed8" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      Accept
                    </Button>
                  </>
                ) : null}
              </Stack>
            );
          },
        },
      },
    ],
    [acceptedId, handleAccept, handleActionClick, handleReject, handleResend, rows]
  );

  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, px: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={paperStyle}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#800080" }}>
                  M2M Service Provider Registration Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approve or reject requests submitted from the public registration form.
                </Typography>
              </Box>
            </Stack>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {infoMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {infoMessage}
              </Alert>
            )}

            {loading && rows.length === 0 ? (
              <Alert severity="info">Loading...</Alert>
            ) : rows.length === 0 ? (
              <Alert severity="info">No M2M registration requests found.</Alert>
            ) : (
              <ThemeProvider theme={tableTheme}>
                <DynamicDatatables
                  tableTitle="M2M Service Provider Registration Requests"
                  rows={rows}
                  columns={serviceProviderCol.concat(actionColumn)}
                  options={tableOptions}
                />
              </ThemeProvider >
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default M2MRegistrationAdminReview;
