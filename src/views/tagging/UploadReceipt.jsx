/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Grid, Button, Box, Paper, Typography, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import { Download, Print, Visibility } from "@mui/icons-material";
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import { uploadReceiptInitials, uploadReceiptFormFields } from "../../formjson/uploadReceipt";
import TaggingService from "../../services/TaggingService";
import { fetchTaggedList } from "../../helper";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { withStyleNonce } from "../../utils/cspNonce";

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
const formatICCID = (val) => {
  if (!val) return "";
  const str = String(val);
  if (str.toLowerCase().includes("e")) {
    try { return Number(val).toLocaleString("en-US", { useGrouping: false }); }
    catch (e) { return str; }
  }
  return str;
};

const formatDate = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
  } catch (e) { return val; }
};


const cleanDisplayValue = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/^[\s;']+/, "")
    .trim();
};


// ─────────────────────────────────────────────
// Shared style constants – Times New Roman like the original
// ─────────────────────────────────────────────
const F = "'Times New Roman', Times, serif";
const FS = "15px";
const LH = 1.85;

const T = ({ children, sx = {}, bold = false }) => (
  <Typography
    component="p"
    sx={{
      fontFamily: F,
      fontSize: { xs: "13px", sm: "14px", md: FS },
      lineHeight: { xs: 1.6, sm: 1.7, md: LH },
      fontWeight: bold ? 700 : 400,
      color: "#000",
      ...sx
    }}
  >
    {children}
  </Typography>
);


// ─────────────────────────────────────────────
const buildRows = (d) => [
  { label: "VLTD Serial No.", value: cleanDisplayValue(d.deviceSerialNo) },
  { label: "VLTD IMEI No.", value: cleanDisplayValue(d.vltdImei) },
  { label: "VLTD/E-SIM ICCID", value: formatICCID(d.iccid) },
  { label: "Primary MSISDN/E-SIM Primary Mobile Number", value: cleanDisplayValue(d.primaryMsisdn) },
  { label: "Fallback MSISDN/E-SIM Secondary Mobile Number", value: cleanDisplayValue(d.fallbackMsisdn) },
  { label: "ICCID/E-SIM Valid Upto", value: d.esimValidUpto },
  { label: "No. of EMG Buttons Installed", value: d.noOfEmgButtons },
];

// ─────────────────────────────────────────────
const UploadReceipt = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const qrSize = isMobile ? 96 : isTablet ? 126 : 148;

  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(uploadReceiptFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const qrCanvasRef = useRef(null);
  const certificateRef = useRef(null);

  const location = useLocation();
  const preselectedDeviceId = location.state?.deviceId;

  useEffect(() => {
    (async () => {
      const tagged_list = await fetchTaggedList({ is_tagged: "True" });
      setUpdatedFormField((p) => ({ ...p, device_id: { ...p.device_id, options: tagged_list } }));
      setIsFormLoaded(true);

      if (preselectedDeviceId) {
        // Automatically load certificate for the preselected device
        loadCertificatePreview({ device_id: preselectedDeviceId }, tagged_list);
      }
    })();
  }, [preselectedDeviceId]);

  const handleFileChange = (event, formik) => {
    const f = event.target.files[0];
    if (f) formik.setFieldValue(event.target.name, f);
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const loadCertificatePreview = async (values, overrideOptions = null) => {
    try {
      setLoading(true);
      
      let imei = "";
      const optionsToUse = overrideOptions || updatedFormFields?.device_id?.options;
      if (optionsToUse) {
         const selectedOption = optionsToUse.find(opt => String(opt.value) === String(values.device_id));
         if (selectedOption) imei = selectedOption.label;
      }
      
      const response = await TaggingService.getCertificateList({ imei });
      const apiData = response?.data?.data?.[0] || response?.data?.[0] || response?.data;

      if (!apiData || Object.keys(apiData).length === 0) {
         console.warn("Certificate data not found.");
         return;
      }

      const certNo = apiData.cert_no || "";
      const imeiData = apiData.imei || imei || "";
      const serialNo = apiData.serial_no || ""; 
      const chassisNo = apiData.chassis_no || "";
      const vehicleRegNo = apiData.vehicle_reg_no || "";
      const activationDate = formatDate(apiData.tagged_at || new Date());
      // QR encodes the activation certificate link
      const qrData = `https://skytron.in/activationcertificate/${vehicleRegNo}/${imeiData}/`;

      setCertificateData({
        certNo: certNo,
        activationDate: activationDate,
        vehicleOwnerName: apiData.owner_name || "",
        vehicleRegNo: apiData.vehicle_reg_no || "",
        engineNo: apiData.engine_no || "",
        chassisNo: chassisNo,
        vehicleClass: apiData.category || "",
        vehicleModel: apiData.vehicle_model || "",
        deviceSerialNo: serialNo,
        vltdMake: apiData.vehicle_make || "",
        vltdModel: apiData.device_model || "",
        vltdImei: imeiData,
        iccid: apiData.iccid || "",
        primaryMsisdn: apiData.primary_msisdn || "",
        fallbackMsisdn: apiData.fallback_msisdn || "",
        esimValidUpto: formatDate(apiData.esim_valid_upto || apiData.esim_validity || ""),
        noOfEmgButtons: apiData.no_of_emg_buttons || "",
        fitmentCenterName: apiData.fitment_center_name || "",
        fitmentCenterAddress: apiData.fitment_center_address || "",
        registeringOffice: apiData.rto_name || "",
        qrData,
      });
    } catch (err) {
      console.error("Certificate load error", err?.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── PDF ─────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!certificateData) { alert("Please view the certificate first."); return; }
    if (!certificateRef.current) return;

    try {
      setDownloading(true);
      const element = certificateRef.current;
      const scrollWidth = element.scrollWidth || element.offsetWidth;
      const scrollHeight = element.scrollHeight || element.offsetHeight;

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: scrollWidth,
        height: scrollHeight,
        windowWidth: Math.max(1280, scrollWidth),
        windowHeight: scrollHeight + 400,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297

      // Generous side and vertical margins
      const marginX = 8;
      const marginY = 12;
      const usableWidth = pageWidth - marginX * 2; // 194mm
      const usableHeight = pageHeight - marginY * 2; // 273mm

      let imgWidth = usableWidth;
      let imgHeight = (canvas.height * usableWidth) / canvas.width;

      if (imgHeight > usableHeight) {
        const ratio = usableHeight / imgHeight;
        imgHeight = usableHeight;
        imgWidth = imgWidth * ratio;
      }

      // Position slightly upward from center for optimal document optical balance
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = Math.max(marginY, ((pageHeight - imgHeight) / 2) - 10);

      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight, undefined, "FAST");
      pdf.save("VLTD_Activation_Certificate.pdf");
    } catch (err) {
      console.error("Certificate PDF generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  // ─── Print ───────────────────────────────────────────────────
  const handlePrintCertificate = async () => {
    if (!certificateData) { alert("Please view the certificate first."); return; }
    if (!certificateRef.current) return;

    // Pre-open print window synchronously so popup blockers never block it
    const w = window.open("", "_blank", "width=900,height=1200");
    if (w) {
      w.document.open();
      w.document.write("<!DOCTYPE html><html><head><title></title></head><body style='margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:serif;color:#555;'><p>Preparing Certificate for Print...</p></body></html>");
      w.document.close();
    }

    try {
      setPrinting(true);
      const element = certificateRef.current;
      const scrollWidth = element.scrollWidth || element.offsetWidth;
      const scrollHeight = element.scrollHeight || element.offsetHeight;

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: scrollWidth,
        height: scrollHeight,
        windowWidth: Math.max(1280, scrollWidth),
        windowHeight: scrollHeight + 400,
      });

      const imgData = canvas.toDataURL("image/png");

      const pageWidth = 210; // mm
      const pageHeight = 297; // mm
      const marginX = 8; // mm
      const marginY = 12; // mm
      const usableWidth = pageWidth - marginX * 2; // 194mm
      const usableHeight = pageHeight - marginY * 2; // 273mm

      let imgWidth = usableWidth;
      let imgHeight = (canvas.height * usableWidth) / canvas.width;

      if (imgHeight > usableHeight) {
        const ratio = usableHeight / imgHeight;
        imgHeight = usableHeight;
        imgWidth = imgWidth * ratio;
      }

      // Position slightly upward matching download PDF
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = Math.max(marginY, ((pageHeight - imgHeight) / 2) - 10);

      const html = `<!DOCTYPE html>
<html>
<head>
<title></title>
<style>
  @page {
    size: A4 portrait;
    margin: 0 !important;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    max-height: 297mm !important;
    background: #fff !important;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-page {
    position: relative;
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    overflow: hidden;
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
  .cert-img {
    position: absolute;
    left: ${xOffset.toFixed(2)}mm;
    top: ${yOffset.toFixed(2)}mm;
    width: ${imgWidth.toFixed(2)}mm;
    height: ${imgHeight.toFixed(2)}mm;
    display: block;
  }
  @media print {
    @page {
      size: A4 portrait;
      margin: 0 !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
    }
    .print-page {
      width: 210mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
  }
</style>
</head>
<body>
  <div class="print-page">
    <img class="cert-img" src="${imgData}" alt="" />
  </div>
</body>
</html>`;

      if (w && !w.closed) {
        w.document.open();
        w.document.write(withStyleNonce(html));
        w.document.close();
        w.focus();
        setTimeout(() => {
          w.print();
          w.close();
        }, 300);
      } else {
        let frame = document.getElementById("certificate-print-frame");
        if (!frame) {
          frame = document.createElement("iframe");
          frame.id = "certificate-print-frame";
          frame.style.position = "fixed";
          frame.style.top = "-9999px";
          frame.style.left = "-9999px";
          frame.style.width = "210mm";
          frame.style.height = "297mm";
          frame.style.border = "none";
          document.body.appendChild(frame);
        }
        const frameDoc = frame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(withStyleNonce(html));
        frameDoc.close();
        setTimeout(() => {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        }, 300);
      }
    } catch (err) {
      console.error("Certificate print error:", err);
      if (w && !w.closed) w.close();
    } finally {
      setPrinting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <MainCard title={t("uploadReceipt.title")}>
      {isFormLoaded && (
        <Formik initialValues={uploadReceiptInitials} validationSchema={validationSchema} onSubmit={() => { }} enableReinitialize>
          {(formik) => (
            <form onSubmit={(e) => e.preventDefault()}>
              <Grid container spacing={2} className="form-controller">
                {Object.keys(updatedFormFields).map((field) => (
                  <Grid key={field} item md={4} sm={12} xs={12}>
                    <FormField fieldConfig={updatedFormFields[field]} formik={formik} handleFileChange={handleFileChange} />
                  </Grid>
                ))}
                <Grid
                  item
                  xs={12}
                  sx={{
                    mt: 2.5,
                    display: "flex",
                    gap: { xs: 1.5, sm: "12px" },
                    flexWrap: "wrap",
                    flexDirection: { xs: "column", sm: "row" }
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Visibility />}
                    disabled={loading || !formik.values.device_id}
                    onClick={() => loadCertificatePreview(formik.values)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      width: { xs: "100%", sm: "auto" }
                    }}
                  >
                    View Certificate
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={printing ? <CircularProgress size={18} color="inherit" /> : <Print />}
                    disabled={loading || printing || downloading || !certificateData}
                    onClick={handlePrintCertificate}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      width: { xs: "100%", sm: "auto" }
                    }}
                  >
                    {printing ? "Preparing Print..." : "Print"}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <Download />}
                    disabled={loading || downloading || !certificateData}
                    onClick={handleDownloadPdf}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      width: { xs: "100%", sm: "auto" }
                    }}
                  >
                    {downloading ? "Generating PDF..." : t("common.download", { defaultValue: "Download PDF" })}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}

      {/* ─── Certificate Preview ─── */}
      {certificateData && (
        <Grid container justifyContent="center" sx={{ mt: { xs: 2.5, sm: 3.5, md: 4 } }}>
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                background: "#fff",
                border: "1px solid #d4d4d4",
                borderRadius: "4px",
                width: "100%",
                maxWidth: "860px",
                mx: "auto",
                overflow: "hidden",
                boxShadow: "0 3px 14px rgba(0,0,0,0.08)"
              }}
            >

              {/* Printable area */}
              <Box
                ref={certificateRef}
                id="certificate-print-node"
                sx={{
                  pt: { xs: "18px", sm: "24px", md: "34px" },
                  pb: { xs: "24px", sm: "36px", md: "52px" },
                  px: { xs: "20px", sm: "44px", md: "76px" },
                  fontFamily: F,
                  fontSize: { xs: "13px", sm: "14px", md: FS },
                  lineHeight: { xs: 1.6, sm: 1.7, md: LH },
                  color: "#000",
                  backgroundColor: "#ffffff",
                  wordBreak: "break-word",
                  overflowWrap: "break-word"
                }}
              >

                {/* ── HEADER ── */}
                <Box sx={{ textAlign: "center", mb: { xs: "26px", sm: "36px", md: "52px" } }}>
                  <Typography
                    sx={{
                      fontFamily: F,
                      fontSize: { xs: "17px", sm: "19px", md: "21px" },
                      fontWeight: 700,
                      letterSpacing: ".6px",
                      color: "#000",
                      lineHeight: 1.3
                    }}
                  >
                    VLTD ACTIVATION CERTIFICATE
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: F,
                      fontSize: { xs: "11.5px", sm: "12px", md: "12.5px" },
                      color: "#000",
                      mt: 0.8
                    }}
                  >
                    (Generated Online in https://skytron.in)
                  </Typography>
                </Box>

                {/* ── TO + QR ── */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: { xs: 1.5, sm: 2 },
                    mb: { xs: "20px", sm: "26px", md: "32px" }
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <T>To,</T>
                    <T>The Registering Authority,</T>
                    <T>State Transport Department, Govt. of Assam.</T>
                  </Box>
                  <Box
                    ref={qrCanvasRef}
                    sx={{
                      flexShrink: 0,
                      ml: { xs: 1, sm: 2 },
                      p: 0.5,
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      bgcolor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <QRCodeCanvas
                      value={certificateData.qrData || "VLTD-CERTIFICATE"}
                      size={qrSize}
                      level="M"
                      includeMargin={false}
                    />
                  </Box>
                </Box>

                {/* ── CERT NO & DATE ── */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: { xs: 0.8, sm: 1.5 },
                    mb: { xs: "16px", sm: "20px", md: "24px" }
                  }}
                >
                  <Typography sx={{ fontFamily: F, fontSize: { xs: "13px", sm: FS }, color: "#000" }}>
                    VLTD Certificate No.: <strong>{certificateData.certNo}</strong>
                  </Typography>
                  <Typography sx={{ fontFamily: F, fontSize: { xs: "13px", sm: FS }, color: "#000" }}>
                    VLTD Activation Date (in https://skytron.in):{" "}
                    <strong>{certificateData.activationDate}</strong>
                  </Typography>
                </Box>

                {/* ── SUBJECT ── */}
                <Box sx={{ mb: { xs: "12px", sm: "16px", md: "20px" } }}>
                  <Typography
                    component="p"
                    sx={{
                      fontFamily: F,
                      fontSize: { xs: "13px", sm: FS },
                      lineHeight: { xs: 1.6, sm: LH },
                      color: "#000"
                    }}
                  >
                    <strong>Subject:</strong>&nbsp;&nbsp;VLTD Serial No.:{" "}
                    <strong>{cleanDisplayValue(certificateData.deviceSerialNo)}</strong> in vehicle having Chassis No.:{" "}
                    <strong>{certificateData.chassisNo}</strong> in the portal (https://skytron.in),
                    State Transport Department, Govt. of Assam.
                  </Typography>
                </Box>

                {/* ── DEAR SIR ── */}
                <T sx={{ mb: { xs: "12px", sm: "14px", md: "16px" } }}>Dear Sir,</T>

                {/* ── BODY ── */}
                <Box sx={{ mb: { xs: "22px", sm: "26px", md: "32px" } }}>
                  <Typography
                    component="p"
                    sx={{
                      fontFamily: F,
                      fontSize: { xs: "13px", sm: FS },
                      lineHeight: { xs: 1.6, sm: LH },
                      color: "#000",
                      textAlign: "justify"
                    }}
                  >
                    This is to inform you that Serial Number:{" "}
                    <strong>{cleanDisplayValue(certificateData.deviceSerialNo)}</strong>, Model:{" "}
                    <strong>{certificateData.vltdModel}</strong> of VLTD Manufacturer{" "}
                    <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                      <strong>{certificateData.vltdMake}</strong>,
                    </Box>{" "}
                    has been activated on vehicle having Chassis Number:{" "}
                    <strong>{certificateData.chassisNo}</strong>, Engine Number:{" "}
                    <strong>{certificateData.engineNo}</strong>, Vehicle Registration Number:{" "}
                    <strong>{certificateData.vehicleRegNo}</strong>, and Vehicle Class:{" "}
                    <strong>{certificateData.vehicleClass}</strong>.
                  </Typography>
                </Box>

                {/* ── DETAILS LIST ── */}
                <T sx={{ mb: { xs: "14px", sm: "16px", md: "20px" } }}>The details of the VLTD are shown below:</T>
                <Box sx={{ pl: { xs: "16px", sm: "24px" }, mb: { xs: "24px", sm: "28px", md: "34px" } }}>
                  {buildRows(certificateData).map(({ label, value }) => (
                    <Typography
                      key={label}
                      component="p"
                      sx={{
                        fontFamily: F,
                        fontSize: { xs: "13px", sm: FS },
                        lineHeight: { xs: 1.6, sm: LH },
                        mb: { xs: "14px", sm: "16px", md: "18px" },
                        color: "#000"
                      }}
                    >
                      {label}: <strong>{value || ""}</strong>
                    </Typography>
                  ))}
                </Box>

                {/* ── THANKING YOU ── */}
                <T bold sx={{ mb: { xs: "18px", sm: "22px", md: "26px" } }}>Thanking You,</T>

                {/* ── FITMENT CENTER ── */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <T sx={{ mb: { xs: "4px", sm: "6px" } }}>Retro Fitment Center</T>
                  {certificateData.fitmentCenterName && (
                    <T sx={{ lineHeight: 1.5 }}>
                      <strong>
                        {certificateData.fitmentCenterName.trim().replace(/,+$/, "")}
                        {certificateData.fitmentCenterAddress ? "," : ""}
                      </strong>
                    </T>
                  )}
                  {certificateData.fitmentCenterAddress && (
                    <T sx={{ lineHeight: 1.5 }}>
                      <strong>{certificateData.fitmentCenterAddress.trim()}</strong>
                    </T>
                  )}
                  <Box sx={{ mt: { xs: "12px", sm: "16px" } }}>
                    <T>Registered Office: <strong>{certificateData.registeringOffice}</strong></T>
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
