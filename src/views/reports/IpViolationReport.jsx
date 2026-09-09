import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";

import SettingService from "../../services/SettingService";

const IPViolationReport = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = [
    "IMEI",
    "Manufacturer Name",
    "Manufacturer Address",
    "Manufacturer Mobile No",
    "Model",
    "ICCID ID",
    "Owner Name",
    "Owner Mobile No",
    "Owner Address",
    "Vehicle Reg No",
    "Valid IP Range",
    "Received IP",
    "Session Start Time",
    "Session End Time",
  ];

  // Fetch IP Violation Report
  const fetchIPViolationReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await SettingService.get_ip_violations();

      console.log("IP Violation API Response:", response);

      const devices = response?.data?.devices || [];

      setReportData(devices);
    } catch (err) {
      console.error("Error fetching IP violation report:", err);

      setReportData([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch IP violation report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPViolationReport();
  }, []);

  // Search
  const filteredData = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return reportData;
    }

    return reportData.filter((row) =>
      Object.values(row).some((item) =>
        String(item ?? "")
          .toLowerCase()
          .includes(value)
      )
    );
  }, [search, reportData]);

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Refresh
  const handleRefresh = () => {
    setSearch("");
    setPage(0);
    fetchIPViolationReport();
  };

  // Format API date
  const formatDateTime = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
      });
    } catch {
      return date;
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = columns.join(",");

    const rows = filteredData.map((row) =>
      [
        row["IMEI"],
        row["Manufacturer Name"],
        row["Manufacturer Address"],
        row["Manufacturer Mobile No"],
        row["Model"],
        row["ICCID ID"],
        row["Owner Name"],
        row["Owner No"],
        row["Owner Address"],
        row["Vehicle Reg No"],
        row["Valid IP Range"],
        row["Received IP"],
        row["Session Start Time"],
        row["Session End Time"],
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `ip_violation_report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            IP Violation Report
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            View IP violation and session details
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={
              loading ? <CircularProgress size={18} /> : <RefreshIcon />
            }
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={loading || filteredData.length === 0}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Search Report"
                placeholder="Search IMEI, owner, vehicle, IP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "flex-start",
                    md: "flex-end",
                  },
                  gap: 1,
                }}
              >
                <Chip
                  label={`Total Records: ${filteredData.length}`}
                  color="primary"
                  variant="outlined"
                />

                {search && (
                  <Chip
                    label={`Search: ${search}`}
                    onDelete={() => {
                      setSearch("");
                      setPage(0);
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography color="error">
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{
            maxHeight: "calc(100vh - 300px)",
            overflowX: "auto",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 2300,
            }}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Loading */}
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <CircularProgress />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Loading IP violation report...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                /* No Data */
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography color="text.secondary">
                      No IP violation records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                /* Data */
                filteredData
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((row, index) => (
                    <TableRow
                      hover
                      key={`${row["IMEI"]}-${index}`}
                    >
                      {/* IMEI */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["IMEI"] || "-"}
                      </TableCell>

                      {/* Manufacturer Name */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["Manufacturer Name"] || "-"}
                      </TableCell>

                      {/* Manufacturer Address */}
                      <TableCell sx={{ minWidth: 250 }}>
                        {row["Manufacturer Address"] || "-"}
                      </TableCell>

                      {/* Manufacturer Mobile */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["Manufacturer Mobile No"] || "-"}
                      </TableCell>

                      {/* Model */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["Model"] || "-"}
                      </TableCell>

                      {/* ICCID */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["ICCID ID"] || "-"}
                      </TableCell>

                      {/* Owner Name */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["Owner Name"] || "-"}
                      </TableCell>

                      {/* Owner No */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["Owner No"] || "-"}
                      </TableCell>

                      {/* Owner Address */}
                      <TableCell sx={{ minWidth: 220 }}>
                        {row["Owner Address"] || "-"}
                      </TableCell>

                      {/* Vehicle Registration */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          label={row["Vehicle Reg No"] || "-"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      {/* Valid IP */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row["Valid IP Range"] || "-"}
                      </TableCell>

                      {/* Received IP */}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {row["Received IP"] || "-"}
                      </TableCell>

                      {/* Session Start */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(
                          row["Session Start Time"]
                        )}
                      </TableCell>

                      {/* Session End */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(
                          row["Session End Time"]
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default IPViolationReport;