import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  TextField,
} from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";

const defaultAlertState = {
  error: false,
  message: "",
  errorList: [],
};

const getDefaultArchiveDate = () => {
  const archiveDate = new Date();
  archiveDate.setFullYear(archiveDate.getFullYear() - 2);
  archiveDate.setDate(archiveDate.getDate() - 1);
  return archiveDate.toISOString().slice(0, 10);
};

const ArchiveRestore = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alert, setAlert] = useState(defaultAlertState);
  const [gpsArchives, setGpsArchives] = useState([]);
  const [gpsArchivesLoading, setGpsArchivesLoading] = useState(false);
  const [gpsRestoreLoading, setGpsRestoreLoading] = useState(false);
  const [gpsArchiveCreateLoading, setGpsArchiveCreateLoading] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
  const [archiveDate, setArchiveDate] = useState(getDefaultArchiveDate());

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const openDialog = (message, isError = false, errorList = []) => {
    setAlert({
      error: isError,
      message,
      errorList,
    });
    setDialogOpen(true);
  };

  const fetchGpsArchives = async () => {
    setGpsArchivesLoading(true);
    try {
      const response = await SettingService.getGpsArchivesList();
      const data = Array.isArray(response?.data?.results)
        ? response.data.results
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setGpsArchives(data);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load GPS archives list.";
      openDialog(message, true);
    } finally {
      setGpsArchivesLoading(false);
    }
  };

  useEffect(() => {
    fetchGpsArchives();
  }, []);

  const handleCreateGpsArchive = async () => {
    setGpsArchiveCreateLoading(true);
    try {
      if (!archiveDate) {
        openDialog("Please select an archive date.", true);
        return;
      }
      const payload = { archive_date: archiveDate };
      const response = await SettingService.archiveGpsData(payload);
      const message =
        response?.data?.message ||
        "GPS data archive request has been sent successfully.";

      openDialog(message);
      await fetchGpsArchives();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to create GPS data archive.";
      const errorList =
        Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors
          : [];
      openDialog(message, true, errorList);
    } finally {
      setGpsArchiveCreateLoading(false);
    }
  };

  const handleRestoreGpsArchive = async () => {
    if (!selectedArchive) {
      openDialog("Please select a GPS data archive before restoring.", true);
      return;
    }

    setGpsRestoreLoading(true);
    try {
      const payload = { archive_file: selectedArchive };
      const response = await SettingService.restoreGpsArchive(payload);
      const message =
        response?.data?.message ||
        "GPS data restore request has been sent successfully.";

      openDialog(message);
      setSelectedArchive("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to restore GPS data archive.";
      const errorList =
        Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors
          : [];
      openDialog(message, true, errorList);
    } finally {
      setGpsRestoreLoading(false);
    }
  };

  return (
    <>
      <DialogComponent
        open={dialogOpen}
        handleClose={handleDialogClose}
        message={alert.message}
        errorList={alert.error ? alert.errorList : []}
      />

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard
            title="Create GPS Data Archive"
            secondary={
              gpsArchiveCreateLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : null
            }
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Create a new GPS data archive that can be restored later from the
              list of GPS archives.
            </Typography>

            <Box sx={{ mb: 2, maxWidth: 260 }}>
              <TextField
                fullWidth
                type="date"
                label="Archive data before"
                value={archiveDate}
                onChange={(event) => setArchiveDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: getDefaultArchiveDate() }}
                size="small"
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateGpsArchive}
              disabled={gpsArchiveCreateLoading}
            >
              Create GPS Archive
            </Button>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard
            title="Restore GPS Data Archive"
            secondary={
              gpsArchivesLoading || gpsRestoreLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : null
            }
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Restore historical GPS data from an existing GPS data archive file.
            </Typography>

            {gpsArchivesLoading ? (
              <Typography variant="body2" color="textSecondary">
                Loading available GPS archives...
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <select
                  value={selectedArchive}
                  onChange={(event) => setSelectedArchive(event.target.value)}
                  disabled={gpsRestoreLoading || gpsArchives.length === 0}
                  style={{ padding: "8px", minWidth: 260 }}
                >
                  <option value="">
                    {gpsArchives.length === 0
                      ? "No GPS archives available"
                      : "Select GPS archive"}
                  </option>
                  {gpsArchives.map((archive, index) => {
                    const value =
                      typeof archive === "string"
                        ? archive
                        : archive?.archive_file ||
                          archive?.filename ||
                          archive?.name ||
                          "";
                    if (!value) return null;
                    return (
                      <option key={index} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleRestoreGpsArchive}
              disabled={
                gpsRestoreLoading || !selectedArchive || gpsArchives.length === 0
              }
            >
              Restore GPS Archive
            </Button>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ArchiveRestore;
