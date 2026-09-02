import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, IconButton } from "@mui/material";
import MainCard from "../../../ui-component/cards/MainCard";
import { gridSpacing } from "../../../store/constant";
import DynamicDatatables from "../../../datatables/DynamicDatatables";
import { Formik } from "formik";
import FormField from "../../../ui-component/CustomTextField";
import * as Yup from "yup";
import EsimIpRangeService from "../../../services/EsimIpRangeService";
import DialogComponent from "../../../ui-component/DialogComponent";
import AutoHideAlert from "../../../ui-component/AutoHideAlert";
import { esimIpRangeInitials, esimIpRangeField } from "../../../formjson/esimIpRange";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { convertErrorObjectToArray } from "../../../helper";
import { useTranslation } from "react-i18next";

const EsimIpRanges = () => {
  const { t } = useTranslation();
  const [ipRanges, setIpRanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [initialValues, setInitialValues] = useState(esimIpRangeInitials);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [alert, setAlert] = useState({ error: false, message: "", errorList: [] });
  const [alertOpen, setAlertOpen] = useState(false);
  
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const fetchIpRanges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await EsimIpRangeService.listIpRanges();
      if (response.data && response.data.status === "success") {
        setIpRanges(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch IP ranges:", error);
      handleAlert("Failed to load IP ranges.", true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIpRanges();
  }, [fetchIpRanges]);

  const handleAlert = (message, isError = false, errorList = []) => {
    setAlert({ error: isError, message, errorList });
    setAlertOpen(true);
  };

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const handleOpenForm = (rowData = null) => {
    if (rowData) {
      setIsEditMode(true);
      setCurrentId(rowData.id);
      setInitialValues({
        ip_range: rowData.ip_range || "",
        certificate_file: null, // Keep null for edit, only update if new file is selected
        isp_name: rowData.isp_name || "",
        remarks: rowData.remarks || "",
      });
    } else {
      setIsEditMode(false);
      setCurrentId(null);
      setInitialValues(esimIpRangeInitials);
    }
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    
    try {
      const payload = new FormData();
      if (isEditMode) {
        payload.append("id", currentId);
        // Only send fields that changed, but for simplicity we can send all non-empty
        if (values.ip_range) payload.append("ip_range", values.ip_range);
        if (values.certificate_file) payload.append("certificate_file", values.certificate_file);
        payload.append("isp_name", values.isp_name || "");
        payload.append("remarks", values.remarks || "");
        
        const response = await EsimIpRangeService.updateIpRange(payload);
        if (response.data && response.data.status === "success") {
          showToast(response.data.message || "IP Range updated successfully");
          handleCloseForm();
          fetchIpRanges();
        }
      } else {
        payload.append("ip_range", values.ip_range);
        payload.append("certificate_file", values.certificate_file);
        if (values.isp_name) payload.append("isp_name", values.isp_name);
        if (values.remarks) payload.append("remarks", values.remarks);
        
        const response = await EsimIpRangeService.addIpRange(payload);
        if (response.data && response.data.status === "success") {
          showToast(response.data.message || "IP Range added successfully");
          handleCloseForm();
          fetchIpRanges();
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorData = error?.response?.data;
      if (errorData?.errors) {
         handleAlert("Validation failed", true, convertErrorObjectToArray(errorData.errors));
      } else {
         handleAlert(errorData?.error || errorData?.message || "Operation failed", true);
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const response = await EsimIpRangeService.deleteIpRange(deleteId);
      if (response.data && response.data.status === "success") {
        showToast(response.data.message || "IP range deleted successfully");
        fetchIpRanges();
      }
    } catch (error) {
      console.error("Delete error:", error);
      handleAlert(error?.response?.data?.error || "Failed to delete IP range", true);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const columns = [
    { name: "id", label: "ID", options: { display: false } },
    { name: "ip_range", label: "IP Range" },
    { name: "isp_name", label: "ISP Name" },
    { name: "certificate_file", label: "Certificate", options: {
        customBodyRender: (value) => {
          if (!value) return "None";
          return <a href={`${process.env.REACT_APP_BASE_URL}${value}`} target="_blank" rel="noopener noreferrer">View</a>;
        }
    }},
    { name: "remarks", label: "Remarks" },
    { name: "created_at", label: "Created At", options: {
        customBodyRender: (value) => new Date(value).toLocaleString()
    }},
    {
      name: "Actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const rowData = ipRanges[tableMeta.rowIndex];
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <IconButton color="primary" onClick={() => handleOpenForm(rowData)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => { setDeleteId(rowData.id); setDeleteConfirmOpen(true); }}>
                <DeleteIcon />
              </IconButton>
            </div>
          );
        },
      },
    },
  ];

  // Modify validation schema for edit mode (certificate_file is not required on edit)
  const validationSchema = Yup.object(
    Object.keys(esimIpRangeField).reduce((acc, field) => {
      if (field === 'certificate_file' && isEditMode) {
        acc[field] = Yup.mixed()
          .test("fileSize", "File size is too large (max 1MB)", (value) => {
            if (!value) return true; // Optional in edit mode
            return value.size <= 1024 * 1024;
          })
          .test("fileFormat", "Unsupported format (must be PDF, JPG, PNG)", (value) => {
            if (!value) return true; // Optional in edit mode
            return ["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(value.type);
          });
      } else {
        acc[field] = esimIpRangeField[field].validation;
      }
      return acc;
    }, {})
  );

  return (
    <>
      <AutoHideAlert open={toastOpen} onClose={() => setToastOpen(false)} message={toastMessage} type={toastType} />
      <DialogComponent
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alert.message}
        errorList={alert.errorList}
      />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "rgba(255, 255, 255, 0.5)" }}>
            <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} size={50} />
          </div>
        )}

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={() => handleOpenForm()}>
            Add IP Range
          </Button>
        </Grid>

        <Grid item xs={12}>
          <DynamicDatatables tableTitle="eSIM Provider IP Ranges" rows={ipRanges} columns={columns} />
        </Grid>
      </Grid>

      {/* Form Dialog */}
      <Dialog open={formModalOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? "Edit IP Range" : "Add IP Range"}</DialogTitle>
        <DialogContent dividers>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  {Object.keys(esimIpRangeField).map((field) => (
                    <Grid key={field} item xs={12} md={field === 'remarks' ? 12 : 6}>
                      <FormField
                        fieldConfig={esimIpRangeField[field]}
                        formik={formik}
                        handleFileChange={handleFileChange}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', mt: 2 }}>
                    <Button variant="outlined" onClick={handleCloseForm} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                      {isEditMode ? "Update" : "Save"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this IP range?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EsimIpRanges;
