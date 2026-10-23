import React, { useEffect, useState } from "react";
// project imports
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { gridSpacing } from "../../store/constant";
import SOSManagement from "../../services/SOSManagement";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
//Datatables
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { emTeamColumns } from "../../datatables/rowsColumn";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ListEmTeam = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [emTeamList, setEmTeamList] = useState([]);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error'
  });

  useEffect(() => {
    const fetchEmTeams = async () => {
      try {
        const response = await SOSManagement.listEmTeam();
        setEmTeamList(response.data.teams.filter(team => team.status !== 'Removed'));
        setLoad(true);
      } catch (error) {
        console.log(t('emTeam.noDataFound'));
      }
    };
    fetchEmTeams();
  }, [refresh, t]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const openConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false, onConfirm: null }));
  };

  const handleConfirmOk = async () => {
    const fn = confirmDialog.onConfirm;
    closeConfirm();
    if (fn) await fn();
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDelete = (e, id) => {
    e.preventDefault();
    openConfirm(
      'Delete Team',
      'Are you sure you want to delete this team?',
      async () => {
        try {
          await SOSManagement.removeEmTeam({ team_id: id });
          showSnackbar(t('emTeam.teamDeleteSuccess') || 'Team deleted successfully.');
          setRefresh((prev) => !prev);
        } catch {
          showSnackbar(t('emTeam.teamDeleteError') || 'Failed to delete team.', 'error');
        }
      }
    );
  };

  const handleActivate = (e, id) => {
    e.preventDefault();
    openConfirm(
      'Activate Team',
      'Are you sure you want to activate this team?',
      async () => {
        try {
          await SOSManagement.activateEmTeam({ team_id: id });
          showSnackbar(t('emTeam.teamActivateSuccess') || 'Team activated successfully.');
          setRefresh((prev) => !prev);
        } catch {
          showSnackbar(t('emTeam.teamActivateError') || 'Failed to activate team.', 'error');
        }
      }
    );
  };

  const handleDeactivate = (e, id) => {
    e.preventDefault();
    openConfirm(
      'Deactivate Team',
      'Are you sure you want to deactivate this team?',
      async () => {
        try {
          await SOSManagement.deactivateEmTeam({ team_id: id });
          showSnackbar('Team deactivated successfully.');
          setRefresh((prev) => !prev);
        } catch {
          showSnackbar('Failed to deactivate team.', 'error');
        }
      }
    );
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    navigate(`/new/em-team/${id}`);
  };

  // ── Action Column ──────────────────────────────────────────────────────────

  const actionColumn = [
    {
      name: "Action",
      label: t('emTeam.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps in UTC).
          const status = tableMeta.rowData[6];
          const teamId = tableMeta.rowData[0];
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Button
                color="primary"
                onClick={(e) => handleEdit(e, teamId)}
                title="Edit Team"
              >
                <EditIcon />
              </Button>

              {status === 'Active' && (
                <Button
                  color="warning"
                  onClick={(e) => handleDeactivate(e, teamId)}
                  title="Deactivate Team"
                >
                  <CheckIcon style={{ color: 'orange' }} />
                </Button>
              )}

              {status !== 'Active' && status !== 'Removed' && (
                <Button
                  color="primary"
                  onClick={(e) => handleActivate(e, teamId)}
                  title="Activate Team"
                >
                  <CheckIcon />
                </Button>
              )}

              {status !== 'Removed' && (
                <Button
                  color="primary"
                  onClick={(e) => handleDelete(e, teamId)}
                  title="Delete Team"
                >
                  <DeleteIcon />
                </Button>
              )}
            </div>
          );
        },
      },
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <DynamicDatatables
            tableTitle="EM Teams"
            rows={emTeamList}
            columns={emTeamColumns.concat(actionColumn)}
          />
        )}
      </Grid>

      {/* ── Confirm Dialog ── */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmOk} variant="contained" color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default ListEmTeam;
