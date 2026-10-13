import React, { useState, useEffect, useRef } from "react";
import { Grid, Button, Box, Paper, Typography, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import { Download, Print } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import TaggingService from "../../services/TaggingService";
import { withStyleNonce } from "../../utils/cspNonce";

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
const cleanDisplayValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/^[\s;']+/, "")
    .trim();
};

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


const buildRows = (d) => [
  { label: "VLTD Serial No.", value: cleanDisplayValue(d.deviceSerialNo) },
  { label: "VLTD IMEI No.", value: cleanDisplayValue(d.vltdImei) },
  { label: "VLTD/E-SIM ICCID", value: formatICCID(d.iccid) },
  { label: "Primary MSISDN/E-SIM Primary Mobile Number", value: cleanDisplayValue(d.primaryMsisdn) },
  { label: "Fallback MSISDN/E-SIM Secondary Mobile Number", value: cleanDisplayValue(d.fallbackMsisdn) },
  { label: "ICCID/E-SIM Valid Upto", value: d.esimValidUpto },
  { label: "No. of EMG Buttons Installed", value: d.noOfEmgButtons },
];

const ActivationCertificatePreview = ({ deviceId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const qrSize = isMobile ? 96 : isTablet ? 126 : 148;

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const qrCanvasRef = useRef(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    if (deviceId) {
      loadCertificatePreview(deviceId);
    }
  }, [deviceId]);

  const loadCertificatePreview = async (deviceId) => {
    try {
      setLoading(true);
      const response = await TaggingService.vahanVerificationApi({ device_id: deviceId });

      const device = response?.data?.Skytrack_data?.device || response?.Skytrack_data?.device;
      const owner = response?.data?.Skytrack_data?.vehicle_owner?.users?.[0] || response?.Skytrack_data?.vehicle_owner?.users?.[0];
      const vehicle = response?.data?.Skytrack_data || response?.Skytrack_data;
      const rawVahan = response?.data?.vahan_data ?? response?.vahan_data;

      let vahanPayload = rawVahan;
      if (rawVahan && typeof rawVahan === "string") {
        try { vahanPayload = JSON.parse(rawVahan); } catch (e) { console.error(e); }
      }
      const vd = vahanPayload?.VltdDetailsDobj || response?.data?.VltdDetailsDobj || response?.VltdDetailsDobj;

      const certNo = vd?.certNo || device?.cert_no || "";
      const imei = device?.imei || vd?.imeiNo || "";
      const serialNo = device?.serial_no || vd?.deviceSerialno || "";
      const vehicleRegNo = vehicle?.vehicle_reg_no || vd?.regnNo || "";
      const qrData = `https://skytron.in/activationcertificate/${vehicleRegNo}/${imei}/`;

      setCertificateData({
        certNo: certNo || "",
        activationDate: formatDate(vd?.activationDate || vehicle?.activation_date || new Date()),
        vehicleOwnerName: vd?.ownerName || owner?.name || "",
        vehicleRegNo: vehicle?.vehicle_reg_no || vd?.regnNo || "",
        engineNo: vehicle?.engine_no || vd?.engineNo || "",
        chassisNo: vehicle?.chassis_no || vd?.chassisNo || "",
        vehicleClass: vehicle?.vehicle_class || vd?.vehClass || "",
        vehicleModel: vehicle?.vehicle_model || vd?.modelName || "",
        deviceSerialNo: serialNo,
        vltdMake: vehicle?.device_manufacturer_name || vd?.makerName || "",
        vltdModel: device?.model || vd?.modelName || "",
        vltdImei: imei,
        iccid: device?.iccid || vd?.iccId || "",
        primaryMsisdn: device?.primary_msisdn || vd?.primaryMsisdn || "",
        fallbackMsisdn: device?.fallback_msisdn || vd?.fallbackMsisdn || "",
        esimValidUpto: formatDate(device?.esim_validity || vd?.esimValidUpto || ""),
        noOfEmgButtons: vd?.noOfEmgButtons || device?.no_of_emg_buttons || "",
        fitmentCenterName: response?.data?.fitment_center_name || vd?.fitmentCenterName || "",
        fitmentCenterAddress: response?.data?.fitment_center_address || vd?.fitmentCenterAddress || "",
        registeringOffice: vehicle?.rto_name || vd?.registeringOffice || "",
        qrData,
      });
    } catch (err) {
      console.error("Certificate load error", err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!certificateData || !certificateRef.current) return;

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

  const handlePrintCertificate = async () => {
    if (!certificateData || !certificateRef.current) return;

    // Pre-open print window synchronously to prevent popup blocker on async completion
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!deviceId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 2 }}>
        <Typography color="textSecondary">Certificate cannot be generated because Device ID is missing. Did you skip the tagging step?</Typography>
      </Box>
    );
  }

  if (!certificateData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 2 }}>
        <Typography color="textSecondary">Unable to fetch certificate data from the backend. The API might be down or data is incomplete.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: { xs: 2.5, sm: 3, md: 4 }, width: '100%' }}>
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1.5, sm: 2 },
          justifyContent: "center",
          flexDirection: { xs: "column", sm: "row" },
          mb: { xs: 2.5, sm: 3 },
          px: { xs: 1, sm: 0 }
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          startIcon={printing ? <CircularProgress size={18} color="inherit" /> : <Print />}
          disabled={printing || downloading}
          onClick={handlePrintCertificate}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            width: { xs: "100%", sm: "auto" }
          }}
        >
          {printing ? "Preparing Print..." : "Print Certificate"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <Download />}
          disabled={downloading}
          onClick={handleDownloadPdf}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            width: { xs: "100%", sm: "auto" }
          }}
        >
          {downloading ? "Generating PDF..." : "Download PDF"}
        </Button>
      </Box>

      <Grid container justifyContent="center">
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
            <Box
              ref={certificateRef}
              id="certificate-print-node-preview"
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

              <T sx={{ mb: { xs: "12px", sm: "14px", md: "16px" } }}>Dear Sir,</T>

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

              <T bold sx={{ mb: { xs: "18px", sm: "22px", md: "26px" } }}>Thanking You,</T>

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
    </Box>
  );
};

export default ActivationCertificatePreview;
