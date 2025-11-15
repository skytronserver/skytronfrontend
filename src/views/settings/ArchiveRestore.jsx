import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
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

const ArchiveRestore = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alert, setAlert] = useState(defaultAlertState);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);

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

  const extractFilename = (contentDisposition, fallback = "backup.zip") => {
    if (!contentDisposition) return fallback;

    const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
      contentDisposition
    );

    const encodedName = filenameMatch?.[1] || filenameMatch?.[2];
    if (!encodedName) return fallback;

    try {
      return decodeURIComponent(encodedName).replace(/['"]/g, "");
    } catch (error) {
      return encodedName;
    }
  };

  const handleArchiveDatabase = async () => {
    setArchiveLoading(true);
    try {
      const response = await SettingService.archiveDatabase();
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/zip",
      });

      const filename = extractFilename(
        response.headers["content-disposition"],
        `skytron-backup-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, "-")}.zip`
      );

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      openDialog(
        "Database archive completed successfully. Backup download has started."
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to archive the database.";
      openDialog(message, true);
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleRestoreDatabase = async () => {
    if (!restoreFile) {
      openDialog("Please choose a backup file before restoring.", true);
      return;
    }

    setRestoreLoading(true);
    try {
      const formData = new FormData();
      formData.append("backup_file", restoreFile);

      const response = await SettingService.restoreDatabase(formData);
      const message =
        response?.data?.message ||
        "Database restore request has been sent successfully.";

      openDialog(message);
      setRestoreFile(null);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to restore the database.";
      const errorList =
        Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors
          : [];
      openDialog(message, true, errorList);
    } finally {
      setRestoreLoading(false);
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
            title="Archive Database"
            secondary={
              archiveLoading ? <CircularProgress size={22} color="inherit" /> : null
            }
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Generate a full system backup. The archive will be downloaded as a
              compressed file once ready. This action is safe to perform during
              business hours.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleArchiveDatabase}
              disabled={archiveLoading}
            >
              Archive & Download
            </Button>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard
            title="Restore Database"
            secondary={
              restoreLoading ? <CircularProgress size={22} color="inherit" /> : null
            }
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Restore the database from a previously generated backup. This will
              overwrite the existing data. Ensure you have scheduled downtime and
              confirmed the backup before proceeding.
            </Typography>

            <Box
              sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}
            >
              <Button
                variant="outlined"
                component="label"
                disabled={restoreLoading}
              >
                {restoreFile ? "Change Backup File" : "Choose Backup File"}
                <input
                  hidden
                  type="file"
                  accept=".zip,.tar,.gz,.tgz,.tar.gz,.tar.tgz"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setRestoreFile(file);
                  }}
                />
              </Button>

              {restoreFile && (
                <Typography variant="body2" color="textPrimary">
                  Selected: {restoreFile.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="error"
              sx={{ mt: 3 }}
              onClick={handleRestoreDatabase}
              disabled={restoreLoading}
            >
              Restore Database
            </Button>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ArchiveRestore;
