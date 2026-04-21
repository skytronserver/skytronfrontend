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
import { manufacturerColumns } from "../../datatables/rowsColumn";
import ManufacturerServices from "../../services/ManufacturerServices";
import UserServices from "../../services/UserServices";
import { getRole } from "../../helper";

const VehicleManufacturerRegistrationAdminReview = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allowLoginId, setAllowLoginId] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [tableState, setTableState] = useState({ page: 0, rowsPerPage: 10 });

  const paperStyle = useMemo(
    () => ({
      p: 3,
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    }),
    []
  );

  const loadRows = useCallback(async (overridesArg) => {
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await ManufacturerServices.findManufacturer({});
      let data = Array.isArray(response?.data) ? response.data : [];
      // Filter for vehicle manufacturers only
      data = data.filter(item => item.manufacturer_type === "Vehicle manufacturer");
      data.sort((a, b) => new Date(b.created) - new Date(a.created));
      const merged = data.map((row) => {
        const overrides = overridesArg ?? statusOverrides;
        const overrideStatus = overrides?.[row?.id];
        
        // Ensure tac and model name are mapped correctly for the datatable
        const correctedRow = {
          ...row,
          tac_no: row.tac_no || row.tac || "",
          model_name: row.model_name || row.device_model_details || "",
          esim_provider: row.esim_provider || row.eSimProviders || row.esimProvider || []
        };

        if (!overrideStatus) return correctedRow;

        const users = Array.isArray(row?.users) ? [...row.users] : row?.users;
        if (Array.isArray(users) && users[0]) {
          users[0] = { ...users[0], status: overrideStatus };
        }

        return { ...correctedRow, status: overrideStatus, users };
      });
      setRows(merged);
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load vehicle manufacturer registration requests."
      );
    } finally {
      setLoading(false);
    }
  }, [statusOverrides]);

  useEffect(() => {
    (async () => {
      setInfoMessage("");
      await loadRows();
    })();
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

  const handleAllowLogin = useCallback(
    async (id, row) => {
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await ManufacturerServices.updateManufacturer({
          manufacturer_id: id,
          status: "Allow to login",
        });

        const userId = row?.users?.[0]?.id;
        if (userId) {
          await UserServices.resendUserCreationOtp({ user_id: userId });
        }

        setAllowLoginId(id);
        setStatusOverrides((prev) => ({ ...prev, [id]: "Allow to login" }));
        setRows((prevRows) =>
          (Array.isArray(prevRows) ? prevRows : []).map((r) => {
            if (r?.id !== id) return r;
            return { ...r, status: "Allow to login" };
          })
        );
        setInfoMessage(`Allow to login successful for ID: ${id}`);
      } catch (e) {
        setErrorMessage(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to allow login."
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

  const handleAllowAddDealer = useCallback(
    async (id, row) => {
      if (!id) return;
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await ManufacturerServices.updateManufacturer({
          manufacturer_id: id,
          status: "Allow to add dealer",
        });

        const userId = row?.users?.[0]?.id;
        if (userId) {
          await UserServices.resendUserCreationOtp({ user_id: userId });
        }

        setInfoMessage(`Allow to add dealer successful for ID: ${id}`);
        setStatusOverrides((prev) => ({ ...prev, [id]: "Allow to add dealer" }));
        setRows((prevRows) =>
          (Array.isArray(prevRows) ? prevRows : []).map((r) => {
            if (r?.id !== id) return r;
            return { ...r, status: "Allow to add dealer" };
          })
        );
      } catch (e) {
        setErrorMessage(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to allow add dealer."
        );
      } finally {
        setLoading(false);
      }
    },
    [loadRows]
  );

  const handleReject = useCallback(
    async (id) => {
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await ManufacturerServices.updateManufacturer({
          manufacturer_id: id,
          status: "Reject",
        });

        const nextOverrides = { ...statusOverrides, [id]: "Reject" };
        setStatusOverrides(nextOverrides);
        setAllowLoginId((prev) => (prev === id ? null : prev));
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
    [loadRows, statusOverrides]
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
              allowLoginId === id ||
              isApplicantActive ||
              requestStatus === "allow to login" ||
              requestStatus === "allow to add dealer";
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
                  to={`/user/detail/manufacturer/${id}`}
                  sx={{ color: "#800080" }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                {getRole() !== "stateadmin" && canResendOtp ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleResend(id, rows?.[tableMeta?.rowIndex])}
                    sx={{
                      borderColor: "#800080",
                      color: "#800080",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: "#660066",
                        color: "#660066",
                      },
                    }}
                  >
                    Resend OTP
                  </Button>
                ) : null}
                {getRole() !== "stateadmin" && (allowLoginId === id || isApplicantActive || requestStatus === "allow to login") ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAllowAddDealer(id, rows?.[tableMeta?.rowIndex])}
                    sx={{
                      borderColor: "#800080",
                      color: "#800080",
                      "&:hover": {
                        borderColor: "#660066",
                        color: "#660066",
                      },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Allow to add dealer
                  </Button>
                ) : isRequestPending ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(id)}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleAllowLogin(id, rows?.[tableMeta?.rowIndex])}
                      sx={{
                        backgroundColor: "#800080",
                        "&:hover": { backgroundColor: "#660066" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      Allow to login
                    </Button>
                  </>
                ) : null}
              </Stack>
            );
          },
        },
      },
    ],
    [allowLoginId, handleAllowAddDealer, handleAllowLogin, handleReject, handleResend, rows]
  );

  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, px: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={paperStyle}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#800080" }}>
                  Vehicle Manufacturer Registration Requests
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
              <Alert severity="info">No vehicle manufacturer requests found.</Alert>
            ) : (
              <DynamicDatatables
                tableTitle="Vehicle Manufacturer Registration Requests"
                rows={rows}
                columns={manufacturerColumns.concat(actionColumn)}
                options={tableOptions}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VehicleManufacturerRegistrationAdminReview;
