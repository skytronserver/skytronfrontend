import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  TextField,
  MenuItem,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MainCard from "ui-component/cards/MainCard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { gridSpacing } from "../../store/constant";
import HelpDeskService from "../../services/helpDeskServices";
import {
  STATUS_CONFIG,
  ESCALATION_CONFIG,
  SOURCE_LABELS,
  getRoleFromCookie,
  formatDateTime,
} from "./complaintUtils";

const PAGE_SIZE = 20;

// Which escalated_to filter value shows the "Escalated to me" table for each role
const ESCALATED_TO_ME = {
  teamlead: "teamlead",
  stateadmin: "sosadmin",
  superadmin: "sosadmin",
};

const TicketTable = ({ title, escalatedToFilter, navigate, detail: detailPath }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [filters, setFilters] = useState({ status: "", source: "", search: "" });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = { page: paginationModel.page + 1, page_size: paginationModel.pageSize };
    if (escalatedToFilter) params.escalated_to = escalatedToFilter;
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.search) params.search = filters.search;
    const response = await HelpDeskService.getComplaints(params);
    if (response.success) {
      setRows(response.data.results || []);
      setTotal(response.data.total || 0);
    }
    setLoading(false);
  }, [paginationModel, filters, escalatedToFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

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
        return <Chip label={cfg.label} color={cfg.color} size="small" />;
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
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="View">
          <IconButton size="small" onClick={() => navigate(`/helpdesk/tickets/${row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <MainCard
      title={title}
      secondary={
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={fetchTickets}><RefreshIcon /></IconButton>
        </Tooltip>
      }
    >
      {/* Filter bar — only shown on main table */}
      {!escalatedToFilter && (
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
            select
            label="Escalated To"
            value={filters.escalated_to || ""}
            onChange={(e) => { setFilters((p) => ({ ...p, escalated_to: e.target.value })); setPaginationModel((p) => ({ ...p, page: 0 })); }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="none">Not Escalated</MenuItem>
            {Object.entries(ESCALATION_CONFIG).map(([v, c]) => (
              <MenuItem key={v} value={v}>{c.label}</MenuItem>
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
        </Stack>
      )}

      <Box sx={{ height: escalatedToFilter ? 350 : 520 }}>
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
  );
};

const StaffTicketList = () => {
  const navigate = useNavigate();
  const userRole = getRoleFromCookie();
  const escalatedToMeFilter = ESCALATED_TO_ME[userRole] || null;

  return (
    <Grid container spacing={gridSpacing}>
      {/* Escalated-to-me queue at top if applicable */}
      {escalatedToMeFilter && (
        <Grid item xs={12}>
          <TicketTable
            title={`Tickets Escalated to Me (${ESCALATION_CONFIG[escalatedToMeFilter]?.label || escalatedToMeFilter})`}
            escalatedToFilter={escalatedToMeFilter}
            navigate={navigate}
          />
        </Grid>
      )}

      {/* Full ticket list */}
      <Grid item xs={12}>
        <TicketTable
          title="All Complaint Tickets"
          escalatedToFilter={null}
          navigate={navigate}
        />
      </Grid>
    </Grid>
  );
};

export default StaffTicketList;
