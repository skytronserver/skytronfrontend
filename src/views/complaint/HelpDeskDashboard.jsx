import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Chip,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MainCard from "ui-component/cards/MainCard";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { gridSpacing } from "../../store/constant";
import HelpDeskService from "../../services/helpDeskServices";
import {
  STATUS_CONFIG,
  ESCALATION_CONFIG,
  SOURCE_LABELS,
  formatDateTime,
} from "./complaintUtils";

const PAGE_SIZE = 20;

const StatCard = ({ label, count, color, onClick, active }) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: active ? `${color}.light` : "background.paper",
      border: "1px solid",
      borderColor: active ? `${color}.main` : "divider",
      cursor: "pointer",
      textAlign: "center",
      minWidth: 90,
      "&:hover": { bgcolor: `${color}.light` },
    }}
  >
    <Typography variant="h5" fontWeight={700} color={`${color}.main`}>
      {count}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const HelpDeskDashboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [filters, setFilters] = useState({ status: "", source: "", search: "" });
  const [stats, setStats] = useState({ created: 0, in_review: 0, pending: 0, closed: 0, canceled: 0, total: 0 });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = {
      page: paginationModel.page + 1,
      page_size: paginationModel.pageSize,
    };
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.search) params.search = filters.search;

    const response = await HelpDeskService.getComplaints(params);
    if (response.success) {
      setRows(response.data.results || []);
      setTotal(response.data.total || 0);
    }
    setLoading(false);
  }, [paginationModel, filters]);

  const fetchStats = useCallback(async () => {
    const statuses = ["created", "in_review", "pending", "closed", "canceled"];
    const counts = { total: 0 };
    const all = await HelpDeskService.getComplaints({ page: 1, page_size: 1 });
    if (all.success) counts.total = all.data.total || 0;
    await Promise.all(
      statuses.map(async (s) => {
        const r = await HelpDeskService.getComplaints({ status: s, page: 1, page_size: 1 });
        counts[s] = r.success ? (r.data.total || 0) : 0;
      })
    );
    setStats(counts);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterStatus = (status) => {
    setFilters((prev) => ({ ...prev, status: prev.status === status ? "" : status }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const columns = [
    { field: "ticket_ref", headerName: "Ref No.", width: 150 },
    { field: "applicant_name", headerName: "Applicant", width: 150 },
    { field: "applicant_phone", headerName: "Phone", width: 130 },
    { field: "title", headerName: "Title", flex: 1, minWidth: 180 },
    {
      field: "source",
      headerName: "Source",
      width: 140,
      renderCell: ({ value }) => (
        <Chip label={SOURCE_LABELS[value] || value} size="small" variant="outlined" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ value }) => {
        const cfg = STATUS_CONFIG[value] || { label: value, color: "default" };
        return <Chip label={cfg.label} color={cfg.color} size="small" />;
      },
    },
    {
      field: "escalated_to",
      headerName: "Escalated",
      width: 130,
      renderCell: ({ value }) => {
        if (!value) return <Typography variant="caption" color="text.disabled">—</Typography>;
        const cfg = ESCALATION_CONFIG[value] || { label: value, color: "default" };
        return <Chip label={cfg.label} color={cfg.color} size="small" icon={<span>↑</span>} />;
      },
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 160,
      valueFormatter: ({ value }) => formatDateTime(value),
    },
    {
      field: "updated_at",
      headerName: "Updated",
      width: 160,
      valueFormatter: ({ value }) => formatDateTime(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="View Ticket">
          <IconButton size="small" onClick={() => navigate(`/helpdesk/tickets/${row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <MainCard
          title="Complaint Tickets"
          secondary={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/helpdesk/tickets/new")}
              size="small"
            >
              New Ticket
            </Button>
          }
        >
          {/* Stats bar */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={3} useFlexGap>
            <StatCard label="Total" count={stats.total} color="primary" onClick={() => handleFilterStatus("")} active={!filters.status} />
            <StatCard label="Created" count={stats.created} color="grey" onClick={() => handleFilterStatus("created")} active={filters.status === "created"} />
            <StatCard label="In Review" count={stats.in_review} color="info" onClick={() => handleFilterStatus("in_review")} active={filters.status === "in_review"} />
            <StatCard label="Pending" count={stats.pending} color="warning" onClick={() => handleFilterStatus("pending")} active={filters.status === "pending"} />
            <StatCard label="Closed" count={stats.closed} color="success" onClick={() => handleFilterStatus("closed")} active={filters.status === "closed"} />
            <StatCard label="Canceled" count={stats.canceled} color="error" onClick={() => handleFilterStatus("canceled")} active={filters.status === "canceled"} />
          </Stack>

          {/* Filter bar */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems="flex-start">
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => { setFilters((p) => ({ ...p, status: e.target.value })); setPaginationModel((p) => ({ ...p, page: 0 })); }}
              size="small"
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="">All</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                <MenuItem key={v} value={v}>{c.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Source"
              value={filters.source}
              onChange={(e) => { setFilters((p) => ({ ...p, source: e.target.value })); setPaginationModel((p) => ({ ...p, page: 0 })); }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Sources</MenuItem>
              {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Search"
              value={filters.search}
              onChange={(e) => { setFilters((p) => ({ ...p, search: e.target.value })); setPaginationModel((p) => ({ ...p, page: 0 })); }}
              size="small"
              placeholder="Ref, name, phone, title…"
              sx={{ flex: 1, minWidth: 200 }}
            />

            <Tooltip title="Refresh">
              <IconButton onClick={() => { fetchTickets(); fetchStats(); }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ height: 520 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              paginationMode="server"
              rowCount={total}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50]}
              loading={loading}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              sx={{
                "& .MuiDataGrid-columnHeaders": { bgcolor: "#f5f5f5", fontWeight: 600 },
              }}
            />
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default HelpDeskDashboard;
