import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SmsIcon from "@mui/icons-material/Sms";

import ServerHealthService from "../../services/ServerHealthService";

const initialFilters = {
  dateFrom: "",
  dateTo: "",
  senderNo: "",
  receiverNo: "",
  search: "",
};

const getSmsRows = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const getSmsTotal = (response, rows) => {
  const payload = response?.data;

  return (
    payload?.pagination?.total ??
    payload?.count ??
    payload?.total ??
    rows.length
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
};

const AirtelSms = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const loadSms = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await ServerHealthService.getAirtelSmsList({
        page: page + 1,
        pageSize,
        ordering: "-received_at",
        dateFrom: appliedFilters.dateFrom,
        dateTo: appliedFilters.dateTo,
        senderNo: appliedFilters.senderNo,
        receiverNo: appliedFilters.receiverNo,
        search: appliedFilters.search,
      });

      const smsRows = getSmsRows(response);

      if (!Array.isArray(smsRows)) {
        throw new Error("Unexpected API response format.");
      }

      setRows(smsRows);
      setTotalCount(Number(getSmsTotal(response, smsRows)) || 0);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load Airtel SMS records.";

      setRows([]);
      setTotalCount(0);
      setError(
        typeof message === "string"
          ? message
          : "Failed to load Airtel SMS records."
      );
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, pageSize]);

  useEffect(() => {
    loadSms();
  }, [loadSms]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (
      filters.dateFrom &&
      filters.dateTo &&
      filters.dateFrom > filters.dateTo
    ) {
      setError("Start date cannot be after the end date.");
      setSnackbarOpen(true);
      return;
    }

    setPage(0);
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const emptyFilters = {
      dateFrom: "",
      dateTo: "",
      senderNo: "",
      receiverNo: "",
      search: "",
    };

    setFilters(emptyFilters);
    setPage(0);
    setAppliedFilters(emptyFilters);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Page header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SmsIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight={600}>
              Airtel SMS Management
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            View and search received Airtel SMS records.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSms}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* Filters */}
      <Paper
        component="form"
        onSubmit={handleSearch}
        elevation={1}
        sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Search Filters
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date From"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date To"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Sender Number"
              name="senderNo"
              value={filters.senderNo}
              onChange={handleFilterChange}
              placeholder="Enter sender number"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Receiver Number"
              name="receiverNo"
              value={filters.receiverNo}
              onChange={handleFilterChange}
              placeholder="Enter receiver number"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search SMS"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search message content..."
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} sx={{ height: "100%" }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading}
              >
                Search
              </Button>

              <Button
                fullWidth
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* SMS table */}
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="h6">SMS Records</Typography>

          <Chip
            label={`${totalCount} record${totalCount === 1 ? "" : "s"}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
  <TableRow>
    {[
      "SMS ID",
      "Sender Number",
      "Receiver Number",
      "SMS Message",
      "Characters",
      "SMS Timestamp",
      "Received At",
      "Source IP",
    ].map((heading) => (
      <TableCell key={heading} sx={{ fontWeight: 700 }}>
        {heading}
      </TableCell>
    ))}
  </TableRow>
</TableHead>

<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>
          Loading SMS records...
        </Typography>
      </TableCell>
    </TableRow>
  ) : rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
        No SMS records found.
      </TableCell>
    </TableRow>
  ) : (
    rows.map((sms, index) => (
      <TableRow hover key={sms.id}>
        <TableCell>{sms.id ?? "—"}</TableCell>
        <TableCell>{sms.sender_no ?? "—"}</TableCell>
        <TableCell>{sms.receiver_no ?? "—"}</TableCell>
        <TableCell sx={{ minWidth: 280, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {sms.sms_text ?? "—"}
        </TableCell>
        <TableCell>{sms.char_length ?? "—"}</TableCell>
        <TableCell>{formatDate(sms.sms_timestamp)}</TableCell>
        <TableCell>{formatDate(sms.received_at)}</TableCell>
        <TableCell>{sms.source_ip ?? "—"}</TableCell>
      </TableRow>
    ))
  )}
</TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
          disabled={loading}
        />
      </Paper>

      {/* Error notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setSnackbarOpen(false);
          }
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AirtelSms;
