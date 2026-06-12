import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  TextField,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MainCard from "ui-component/cards/MainCard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { gridSpacing } from "../../store/constant";
import HelpDeskService from "../../services/helpDeskServices";
import { STATUS_CONFIG, formatDateTime } from "./complaintUtils";

const PAGE_SIZE = 20;

const ManufacturerTickets = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = { page: paginationModel.page + 1, page_size: paginationModel.pageSize };
    if (search) params.search = search;
    const response = await HelpDeskService.getComplaints(params);
    if (response.success) {
      setRows(response.data.results || []);
      setTotal(response.data.total || 0);
    }
    setLoading(false);
  }, [paginationModel, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const columns = [
    { field: "ticket_ref", headerName: "Ref No.", width: 150 },
    { field: "applicant_name", headerName: "Applicant", width: 150 },
    { field: "title", headerName: "Title", flex: 1, minWidth: 180 },
    {
      field: "device_stock",
      headerName: "Device IMEI",
      width: 180,
      valueGetter: ({ value }) => value?.imei || "—",
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
      field: "created_at",
      headerName: "Created",
      width: 160,
      valueFormatter: ({ value }) => formatDateTime(value),
    },
    {
      field: "updated_at",
      headerName: "Last Updated",
      width: 160,
      valueFormatter: ({ value }) => formatDateTime(value),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
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
          title="Tickets Escalated to Your Company"
          secondary={
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchTickets}><RefreshIcon /></IconButton>
            </Tooltip>
          }
        >
          <Typography variant="body2" color="text.secondary" mb={2}>
            These are complaint tickets that have been escalated to your manufacturer account for resolution.
          </Typography>

          <Box mb={2} maxWidth={300}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPaginationModel((p) => ({ ...p, page: 0 })); }}
              placeholder="Ref, applicant, title, IMEI…"
            />
          </Box>

          <Box sx={{ height: 500 }}>
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

export default ManufacturerTickets;
