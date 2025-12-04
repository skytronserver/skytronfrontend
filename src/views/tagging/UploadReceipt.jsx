import React from "react";
import * as Yup from "yup";
import { Grid, Button, Box, Paper, Typography, Chip, Divider, CircularProgress } from "@mui/material";
import { Download, Print, Visibility, CheckCircle, LocalShipping, Phone, CalendarToday, Person, Settings } from "@mui/icons-material";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import {uploadReceiptInitials,uploadReceiptFormFields} from "../../formjson/uploadReceipt";
import { useState, useEffect, useRef } from "react";
import TaggingService from "../../services/TaggingService";
import {fetchTaggedList} from "../../helper";
import { useTranslation } from 'react-i18next';
import { jsPDF } from "jspdf";
import skytronLogo from "../../assets/images/skytron-logo4.png";

const UploadReceipt = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(uploadReceiptFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const certificateRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      const filter={
        is_tagged: "True",
      }
        const tagged_list = await fetchTaggedList(filter);
        setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            device_id: {
              ...prevConfig.device_id,
              options: tagged_list,
            },
          }));
          setIsFormLoaded(true);
      })();
  }, []);

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };
 
  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleDownloadPdf = async () => {
    if (!certificateData) {
      alert("Please view the certificate first by clicking 'View Certificate'.");
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const img = new Image();
    img.src = skytronLogo;

    const generatePdf = () => {
      try {
        const margin = 10;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (img.height * imgWidth) / img.width;

        try {
          pdf.addImage(img, "PNG", margin, (pageHeight - imgHeight) / 2, imgWidth, imgHeight, undefined, "FAST");
        } catch (e) {
        }

        pdf.setFontSize(18);
        pdf.text("ASSAM STATE VLTD BACKEND", pageWidth / 2, 30, { align: "center" });
        pdf.setFontSize(14);
        pdf.text("VLTD TAGGING & ACTIVATION CERTIFICATE", pageWidth / 2, 42, { align: "center" });

        pdf.setFontSize(12);
        let y = 60;
        const fields = [
          { label: "VLTD Tagging & Activation Date", value: certificateData.taggingActivationDate },
          { label: "Vehicle Owner Name", value: certificateData.vehicleOwnerName },
          { label: "Vehicle Registration Number", value: certificateData.vehicleRegNo },
          { label: "Engine Number", value: certificateData.engineNo },
          { label: "Chassis Number", value: certificateData.chassisNo },
          { label: "Vehicle Model", value: certificateData.vehicleModel },
          { label: "Vehicle Category", value: certificateData.vehicleCategory },
          { label: "VLTD Make", value: certificateData.vltdMake },
          { label: "VLTD Model", value: certificateData.vltdModel },
          { label: "VLTD IMEI Number", value: certificateData.vltdImei },
          { label: "eSIM ICCID Number", value: certificateData.esimIccid },
          { label: "eSIM ICCID Number 2", value: certificateData.esimIccid2 },
          { label: "eSIM Validity", value: certificateData.esimValidity },
        ];

        fields.forEach((field) => {
          pdf.text(`${field.label}: ${field.value || "__________"}`, 20, y);
          y += 10;
        });

        y += 10;
        pdf.setFontSize(10);
        pdf.text("Note:", 20, y);
        y += 8;
        const note = "This certificate is system-generated from the SkyTron platform and does not require any physical signature or stamp.";
        const lines = pdf.splitTextToSize(note, pageWidth - 40);
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 6;
        });

        y += 12;
        pdf.text("**********************", pageWidth / 2, y, { align: "center" });

        pdf.save("VLTD_Tagging_Activation_Certificate.pdf");
      } catch (error) {
        pdf.save("VLTD_Tagging_Activation_Certificate.pdf");
      }
    };

    if (img.complete) {
      generatePdf();
    } else {
      img.onload = generatePdf;
      img.onerror = generatePdf;
    }
  };

const loadCertificatePreview = async (values) => {
    try {
      setLoading(true);
      const deviceData = { device_id: values.device_id };
      const response = await TaggingService.vahanVerificationApi(deviceData);

      const device = response?.data?.Skytrack_data?.device || response?.Skytrack_data?.device;
      const owner = response?.data?.Skytrack_data?.vehicle_owner?.users?.[0] || response?.Skytrack_data?.vehicle_owner?.users?.[0];
      const vehicle = response?.data?.Skytrack_data || response?.Skytrack_data;
      const rawVahanData = response?.data?.vahan_data ?? response?.vahan_data;

      let vahanPayload = rawVahanData;
      if (rawVahanData && typeof rawVahanData === "string") {
        try {
          vahanPayload = JSON.parse(rawVahanData);
        } catch (e) {
          console.error("Failed to parse vahan_data string", e);
        }
      }

      const vahanData = vahanPayload?.VltdDetailsDobj || response?.data?.VltdDetailsDobj || response?.VltdDetailsDobj;

      setCertificateData({
        taggingActivationDate: vahanData?.dateOfRegistration || "",
        vehicleOwnerName: vahanData?.ownerName || owner?.name || "",
        vehicleRegNo: vehicle?.vehicle_reg_no || vahanData?.regnNo || "",
        engineNo: vehicle?.engine_no || vahanData?.engineNo || "",
        chassisNo: vehicle?.chassis_no || vahanData?.chassisNo || "",
        vehicleModel: vehicle?.vehicle_model || vahanData?.modelName || "",
        vehicleCategory: vehicle?.category || vahanData?.vehClass || "",
        vltdMake: vehicle?.vehicle_make || vahanData?.makerName || "",
        vltdModel: device?.model || vahanData?.deviceSerialno || "",
        vltdImei: device?.imei || vahanData?.imeiNo || "",
        esimIccid: device?.iccid || vahanData?.iccId || "",
        esimIccid2: device?.iccid2 || "",
        esimValidity: device?.esim_validity || "",
      });
    } catch (error) {
      console.error("Error loading certificate preview", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCertificate = () => {
    if (!certificateData) {
      alert("Please view the certificate first by clicking 'View Certificate'.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    if (!printWindow) return;

    const fields = [
      { label: "VLTD Tagging & Activation Date", value: certificateData.taggingActivationDate },
      { label: "Vehicle Owner Name", value: certificateData.vehicleOwnerName },
      { label: "Vehicle Registration Number", value: certificateData.vehicleRegNo },
      { label: "Engine Number", value: certificateData.engineNo },
      { label: "Chassis Number", value: certificateData.chassisNo },
      { label: "Vehicle Model", value: certificateData.vehicleModel },
      { label: "Vehicle Category", value: certificateData.vehicleCategory },
      { label: "VLTD Make", value: certificateData.vltdMake },
      { label: "VLTD Model", value: certificateData.vltdModel },
      { label: "VLTD IMEI Number", value: certificateData.vltdImei },
      { label: "eSIM ICCID Number", value: certificateData.esimIccid },
      { label: "eSIM Validity", value: certificateData.esimValidity },
    ];

    const fieldRows = fields.map(f => `<div style="margin-bottom:8px;font-size:14px;">${f.label}: ${f.value || "__________"}</div>`).join("");

    const logoUrl = window.location.origin + skytronLogo;

    const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Certificate</title>
  <style>
    @media print {
      @page { margin: 20px; }
      body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        background-image: url('${logoUrl}');
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      }
    }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      background-image: url('${logoUrl}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    .certificate-container { max-width: 800px; margin: 0 auto; }
    .certificate-title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    .certificate-subtitle { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 32px; }
    .certificate-field { margin-bottom: 8px; font-size: 14px; }
    .certificate-note { margin-top: 32px; font-size: 12px; }
    .certificate-footer { margin-top: 40px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="certificate-container">
    <h2 class="certificate-title">ASSAM STATE VLTD BACKEND</h2>
    <h3 class="certificate-subtitle">VLTD TAGGING &amp; ACTIVATION CERTIFICATE</h3>
    <div>
      ${fieldRows}
      <div class="certificate-note" style="margin-top:32px;">Note:</div>
      <div class="certificate-note" style="margin-top:8px;">
        This certificate is system-generated from the SkyTron platform and does not require any physical signature or stamp.
      </div>
      <div class="certificate-footer" style="margin-top:40px;text-align:center;">**********************</div>
    </div>
  </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <MainCard title={t('uploadReceipt.title')}>
      {isFormLoaded && (
        <Formik
          initialValues={uploadReceiptInitials}
          validationSchema={validationSchema}
          onSubmit={() => {}}
          enableReinitialize
        >
          {(formik) => (
            <form onSubmit={(e) => e.preventDefault()}>
              <Grid container spacing={2} className="form-controller">
                {Object.keys(updatedFormFields).map((field) => (
                  <Grid key={field} item md={4} sm={12} xs={12}>
                    <FormField
                      fieldConfig={updatedFormFields[field]}
                      formik={formik}
                      handleFileChange={handleFileChange}
                    />
                  </Grid>
                ))}
                <Grid item xs={12} style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    startIcon={<Visibility />}
                    disabled={loading || !formik.values.device_id}
                    onClick={() => loadCertificatePreview(formik.values)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    View Certificate
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Print />}
                    disabled={loading || !certificateData}
                    onClick={handlePrintCertificate}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Print
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    disabled={loading || !certificateData}
                    onClick={handleDownloadPdf}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('common.download', { defaultValue: 'Download PDF' })}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}
      {certificateData && (
        <Grid container justifyContent="center" style={{ marginTop: "32px" }}>
          <Grid item xs={12} md={11} lg={9}>
            <Paper 
              elevation={8}
              sx={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '8px',
                  background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)',
                }
              }}
            >
              <Box sx={{ p: 4, position: 'relative' }}>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <CheckCircle sx={{ color: '#1976d2', fontSize: 32, mr: 1 }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#1565c0',
                      letterSpacing: 1,
                      textTransform: 'uppercase'
                    }}>
                      Assam State VLTD Backend
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2, bgcolor: '#1976d2' }} />
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: '#424242',
                    letterSpacing: 0.5
                  }}>
                    VLTD Tagging & Activation Certificate
                  </Typography>
                  <Chip 
                    label="Official Document" 
                    color="primary" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </Box>

                {/* Certificate Content */}
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 3,
                  p: 3,
                  mb: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            TAGGING & ACTIVATION DATE
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.taggingActivationDate || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VEHICLE OWNER NAME
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vehicleOwnerName || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalShipping sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VEHICLE REGISTRATION NUMBER
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vehicleRegNo || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Settings sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            ENGINE NUMBER
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.engineNo || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalShipping sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            CHASSIS NUMBER
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.chassisNo || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Settings sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VEHICLE MODEL
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vehicleModel || "__________"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalShipping sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VEHICLE CATEGORY
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vehicleCategory || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Settings sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VLTD MAKE
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vltdMake || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Settings sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VLTD MODEL
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vltdModel || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Settings sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            VLTD IMEI NUMBER
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.vltdImei || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Phone sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            ESIM ICCID NUMBER
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.esimIccid || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Phone sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            ESIM ICCID NUMBER 2
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.esimIccid2 || "__________"}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ color: '#1976d2', fontSize: 20, mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                            ESIM VALIDITY
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                          {certificateData.esimValidity || "__________"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Footer Section */}
                <Box sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                    Note:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                    This certificate is system-generated from the SkyTron platform and does not require any physical signature or stamp.
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      letterSpacing: 2, 
                      color: '#1976d2',
                      fontWeight: 600
                    }}>
                      **********************
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </MainCard>
  );
};

export default UploadReceipt;
