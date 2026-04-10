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

const StateAdminAIS140RegistrationReview = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const response = await ManufacturerServices.filterTechOnboardManufacturers({});
      const data = Array.isArray(response?.data) ? response.data : [];

      const flattenedRows = [];
      data.forEach((manufacturer) => {
        if (manufacturer.manufacturer_type === "Device manufacturer") {
          const models = Array.isArray(manufacturer.tech_onboarded_models)
            ? manufacturer.tech_onboarded_models
            : [];

          // Only show the manufacturer if they have at least one technical onboarding request
          if (models.length > 0) {
            const firstModel = models[0];
            const overrides = overridesArg ?? statusOverrides;
            const rowId = manufacturer.id;
            const overrideStatus = overrides?.[rowId];

            flattenedRows.push({
              ...manufacturer,
              ...firstModel,
              manufacturer_id: manufacturer.id,
              model_id: firstModel.id,
              status: overrideStatus || manufacturer.status,
              users: manufacturer.users,
              id: manufacturer.id // Use manufacturer ID as the unique row ID
            });
          }
        }
      });

      flattenedRows.sort((a, b) => new Date(b.created) - new Date(a.created));
      setRows(flattenedRows);
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load AIS-140 device manufacturer registration requests."
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

  const handleApprove = useCallback(
    async (row) => {
      const id = row?.manufacturer_id;
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await ManufacturerServices.approveTechOnboarding({
          manufacturer_id: id,
          action: "approve",
        });

        setStatusOverrides((prev) => ({ ...prev, [id]: "Approved" }));
        setRows((prevRows) =>
          (Array.isArray(prevRows) ? prevRows : []).map((r) => {
            if (r?.manufacturer_id !== id) return r;
            return { ...r, status: "Approved" };
          })
        );
        setInfoMessage(`Technical Onboarding approved successfully for ID: ${id}`);
      } catch (e) {
        setErrorMessage(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to approve technical onboarding."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleReject = useCallback(
    async (row) => {
      const id = row?.manufacturer_id;
      setErrorMessage("");
      setInfoMessage("");
      setLoading(true);
      try {
        await ManufacturerServices.approveTechOnboarding({
          manufacturer_id: id,
          action: "reject",
        });

        const nextOverrides = { ...statusOverrides, [id]: "Rejected" };
        setStatusOverrides(nextOverrides);
        setRows((prevRows) =>
          (Array.isArray(prevRows) ? prevRows : []).map((r) => {
            if (r?.manufacturer_id !== id) return r;
            return { ...r, status: "Rejected" };
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
    [statusOverrides]
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
            const currentRow = rows?.[tableMeta?.rowIndex];
            const id = currentRow?.manufacturer_id || tableMeta?.rowData?.[0];
            const requestStatusRaw = statusOverrides?.[id] ?? currentRow?.status ?? "";
            const requestStatus = String(requestStatusRaw).trim().toLowerCase();
            const applicantStatus = String(currentRow?.users?.[0]?.status ?? "").trim().toLowerCase();
            const isManufacturerActive = applicantStatus === "active";

            const isRequestPending = 
              !isManufacturerActive && (
                requestStatus === "allow to login" || 
                requestStatus === "technicalonboardingapproved"
              );

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
                {isRequestPending ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(currentRow)}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleApprove(currentRow)}
                      sx={{
                        backgroundColor: "#800080",
                        "&:hover": { backgroundColor: "#660066" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      Approve
                    </Button>
                  </>
                ) : isManufacturerActive ? (
                  <Typography variant="caption" sx={{ color: "green", fontWeight: "bold" }}>
                    Manufacturer Active
                  </Typography>
                ) : null}
              </Stack>
            );
          },
        },
      },
    ],
    [handleApprove, handleReject, rows, statusOverrides]
  );

  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4, px: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={paperStyle}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#800080" }}>
                  AIS-140 Device Manufacturer Final approval and rejection of the technical onboard
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
              <Alert severity="info">No AIS-140 device manufacturer requests found for technical onboarding.</Alert>
            ) : (
              <DynamicDatatables
                tableTitle="AIS-140 Device Manufacturer Final approval and rejection of the technical onboard"
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

export default StateAdminAIS140RegistrationReview;

