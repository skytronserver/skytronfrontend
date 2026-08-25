/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Grid, Button, Typography, CircularProgress, Paper, Box,
} from '@mui/material';
import {
  CheckCircleOutline, DirectionsCar, SimCard, Person,
} from '@mui/icons-material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../../ui-component/CustomTextField';
import { newTaggingFields, newTaggingInitials } from '../../../formjson/newTagging';
import NewTaggingService from '../../../services/NewTaggingService';

// ─── tiny read-only field ────────────────────────────────────────────────────
const InfoRow = ({ label, value, mono = false }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', color: '#1a1a2e', wordBreak: 'break-all' }}>
      {value || '—'}
    </Typography>
  </Box>
);

const SectionCard = ({ title, icon: Icon, color, children }) => (
  <Paper
    elevation={0}
    sx={{
      border: `1.5px solid ${color}30`,
      borderRadius: 3,
      p: 2.5,
      background: `linear-gradient(135deg, ${color}08 0%, #fff 100%)`,
      mb: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{title}</Typography>
    </Box>
    <Grid container spacing={2}>{children}</Grid>
  </Paper>
);

// ─── Vahan data display ──────────────────────────────────────────────────────
const VahanSummary = ({ vahan }) => {
  if (!vahan) return null;
  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 22 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#16a34a' }}>
          Vahan Data Retrieved
        </Typography>
      </Box>

      <SectionCard title="Vehicle Details" icon={DirectionsCar} color="#7c3aed">
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Reg No" value={vahan.regNo} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Date of Registration" value={vahan.dateOfRegistration} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Vehicle Class" value={vahan.vehClass} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Maker" value={vahan.makerName} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Model" value={vahan.modelName} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Chassis No" value={vahan.chassisNo} mono /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Engine No" value={vahan.engineNo} mono /></Grid>
      </SectionCard>

      <SectionCard title="Device Details" icon={SimCard} color="#0891b2">
        <Grid item xs={12} sm={6} md={4}><InfoRow label="IMEI" value={vahan.imeiNo} mono /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="ICCID" value={vahan.iccId} mono /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Device Serial No" value={vahan.deviceSerialno} mono /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Activation Status" value={vahan.deviceActivationStatus} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="GNSS Constellation" value={vahan.gnssConstellationCode} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Fitment Centre" value={vahan.fitmentCentreName} /></Grid>
      </SectionCard>

      <SectionCard title="Owner & TAC" icon={Person} color="#b45309">
        <Grid item xs={12} sm={6} md={4}><InfoRow label="Owner Name" value={vahan.ownerName} /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="TAC No" value={vahan.tacNo} mono /></Grid>
        <Grid item xs={12} sm={6} md={4}><InfoRow label="TAC Valid Upto" value={vahan.tacValidUpto} /></Grid>
      </SectionCard>
    </Box>
  );
};

// ─── main component ──────────────────────────────────────────────────────────
export default function Step1CreateEntry({ onSuccess, setAlert }) {
  const [manufacturerTree, setManufacturerTree] = useState([]);
  const [treeLoading, setTreeLoading] = useState(true);

  const [updatedFormFields, setUpdatedFormFields] = useState(newTaggingFields);
  const [vahanData, setVahanData] = useState(null);
  const [deviceModels, setDeviceModels] = useState([]);
  const [selectedModelProviders, setSelectedModelProviders] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await NewTaggingService.getManufacturerTree();

        const data = res?.data?.data;

        const manufacturer = data?.manufacturer;
        const models = data?.device_models || [];

        setDeviceModels(models);

        const manufacturerOptions = manufacturer
          ? [
            {
              label: manufacturer.company_name,
              value: String(manufacturer.id),
            },
          ]
          : [];

        setUpdatedFormFields((prev) => ({
          ...prev,

          manufacturer_id: {
            ...prev.manufacturer_id,
            options: manufacturerOptions,
            disabled: false,
          },

          model_id: {
            ...prev.model_id,
            options: [],
            disabled: true,
          },

          esim_provider_id: {
            ...prev.esim_provider_id,
            options: [],
            disabled: true,
          },
        }));
      } catch (error) {
        console.error("Manufacturer API Error:", error);

        setAlert({
          open: true,
          type: "error",
          message: "Failed to load manufacturer list.",
        });
      } finally {
        setTreeLoading(false);
      }
    })();
  }, [setAlert]);

  const validationSchema = Yup.object().shape(
    Object.keys(newTaggingFields).reduce((acc, key) => {
      acc[key] = newTaggingFields[key].validation;
      return acc;
    }, {})
  );

  const handleFieldChange = (field, event, formik) => {
    const value = event?.target?.value;

    console.log("FIELD:", field);
    console.log("VALUE:", value);

    formik.setFieldValue(field, value);

    // ============================================================
    // MANUFACTURER
    // ============================================================
    if (field === "manufacturer_id") {
      formik.setFieldValue("model_id", "");
      formik.setFieldValue("esim_provider_id", "");

      // Models are already available from manufacturer API
      const modelOptions = deviceModels.map((model) => ({
        label: model.model_name,
        value: String(model.id),
      }));

      console.log("MODEL OPTIONS:", modelOptions);

      setUpdatedFormFields((prev) => ({
        ...prev,

        model_id: {
          ...prev.model_id,
          options: modelOptions,
          disabled: false,
        },

        esim_provider_id: {
          ...prev.esim_provider_id,
          options: [],
          disabled: true,
        },
      }));

      return;
    }

    // ============================================================
    // MODEL
    // ============================================================
    if (field === "model_id") {
      formik.setFieldValue("esim_provider_id", "");

      const selectedModel = deviceModels.find(
        (model) => String(model.id) === String(value)
      );

      console.log("SELECTED MODEL:", selectedModel);

      const providers = selectedModel?.esim_providers || [];

      const providerOptions = providers.map((provider) => ({
        label: provider.company_name,
        value: String(provider.id),
      }));

      console.log("ESIM PROVIDER OPTIONS:", providerOptions);

      setSelectedModelProviders(providers);

      setUpdatedFormFields((prev) => ({
        ...prev,

        esim_provider_id: {
          ...prev.esim_provider_id,
          options: providerOptions,
          disabled: providerOptions.length === 0,
        },
      }));

      return;
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();

      formData.append("manufacturer_id", String(values.manufacturer_id));
      formData.append("model_id", String(values.model_id));
      formData.append("esim_provider_id", String(values.esim_provider_id));
      formData.append("imei", String(values.imei));
      formData.append("iccid", String(values.iccid));
      formData.append("owner_phone_number", String(values.owner_no));
      if (values.rc_file) {
        formData.append("rc_file", values.rc_file);
      }

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const res = await NewTaggingService.createEntry(formData);

      const data = res?.data?.data;

      setVahanData(data?.vahan || null);

      setAlert({
        open: true,
        type: "success",
        message: "Entry created successfully. Vahan data retrieved.",
      });

      onSuccess({
        id: data?.id,
        vahan: data?.vahan,
      });
    } catch (err) {
      console.error("Step 1 API Error:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        Object.values(err?.response?.data || {})
          .flat()
          .join(" ") ||
        "Something went wrong. Please try again.";

      setAlert({
        open: true,
        type: "error",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>
          Device Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details below. We'll verify via Vahan before saving.
        </Typography>
      </Box>

      {treeLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#7c3aed' }} />
        </Box>
      ) : (
        <Formik
          initialValues={newTaggingInitials}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {Object.keys(updatedFormFields).map((field) => (
                  <Grid key={field} item xs={12} sm={6} md={4}>
                    <FormField
                      fieldConfig={{
                        ...updatedFormFields[field],
                        label: updatedFormFields[field].label,
                      }}
                      formik={formik}
                      onChange={(e) => handleFieldChange(field, e, formik)}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={formik.isSubmitting}
                    sx={{
                      px: 5, py: 1.4, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                      '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' },
                      mt: 2,
                    }}
                  >
                    {formik.isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} /> : null}
                    {formik.isSubmitting ? 'Verifying with Vahan…' : 'Verify & Save'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}

      {vahanData && <VahanSummary vahan={vahanData} />}
    </Box>
  );
}
