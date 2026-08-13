import React, { useState, useEffect, useRef } from "react";
import { Grid, Button, Box, Paper, Typography, CircularProgress } from "@mui/material";
import { Download, Print } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import TaggingService from "../../services/TaggingService";

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

// ─────────────────────────────────────────────
// Shared style constants – Times New Roman like the original
// ─────────────────────────────────────────────
const F = "'Times New Roman', Times, serif";
const FS = "14px";
const LH = 1.8;

const T = ({ children, sx = {}, bold = false }) => (
  <Typography
    component="p"
    sx={{ fontFamily: F, fontSize: FS, lineHeight: LH, fontWeight: bold ? 700 : 400, color: "#000", ...sx }}
  >
    {children}
  </Typography>
);

const buildRows = (d) => [
  { label: "VLTD Serial No", value: `;${d.deviceSerialNo}` },
  { label: "VLTD IMEI No", value: d.vltdImei },
  { label: "VLTD/E-SIM ICCID", value: formatICCID(d.iccid) },
  { label: "Primary MSISDN/E-SIM Primary Mobile Number", value: d.primaryMsisdn },
  { label: "Fallback MSISDN/E-SIM Secondery Mobile Number", value: d.fallbackMsisdn },
  { label: "ICCID/E-SIM Valid Upto", value: d.esimValidUpto },
  { label: "No of EMG Button Installed", value: d.noOfEmgButtons },
];

const ActivationCertificatePreview = ({ deviceId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const qrCanvasRef = useRef(null);

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
      const chassisNo = vehicle?.chassis_no || vd?.chassisNo || "";
      const activationDate = formatDate(vd?.activationDate || vehicle?.activation_date || new Date());
      const qrData = `Sr No:${serialNo}\nIMEI:${imei}\nChassis No:${chassisNo}\nCertificate No:${certNo || ""}\nActivation Date:${activationDate}`;

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
    if (!certificateData) return;
    const d = certificateData;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const margin = 18;
    const usable = pw - margin * 2;
    let y = 16;

    const B = (on) => pdf.setFont("times", on ? "bold" : "normal");
    const Sz = (n) => pdf.setFontSize(n);
    const L = (txt, x, yy, opts = {}) => pdf.text(txt, x, yy, opts);
    const Wrap = (txt, x, yy, w) => {
      const lines = pdf.splitTextToSize(txt, w);
      lines.forEach((l) => { pdf.text(l, x, yy); yy += 6; });
      return yy;
    };

    Sz(16); B(true);
    L("VLTD ACTIVATION CERTIFICATE", pw / 2, y, { align: "center" }); y += 6;
    Sz(9); B(false);
    L("(Generated Online in https://vlts.rajasthan.gov.in)", pw / 2, y, { align: "center" }); y += 3;

    try {
      const canvas = qrCanvasRef.current?.querySelector("canvas");
      if (canvas) {
        const qrDataUrl = canvas.toDataURL("image/png");
        pdf.addImage(qrDataUrl, "PNG", pw - margin - 35, y + 2, 35, 35);
      }
    } catch (_) { }

    y += 14;
    Sz(11); B(false);
    L("To,", margin, y); y += 5;
    L("The Registering Authority", margin, y); y += 5;
    L("State Transport Department, Govt. of Rajasthan", margin, y); y += 24;

    Sz(10);
    L("VLTD Certificate No: ", margin, y);
    B(true); L(d.certNo, margin + pdf.getTextWidth("VLTD Certificate No: "), y); B(false);
    const dl = "VLTD Activation Date (In https://vlts.rajasthan.gov.in): ";
    const dx = pw / 2;
    L(dl, dx, y);
    B(true); L(d.activationDate, dx + pdf.getTextWidth(dl), y); B(false);
    y += 12;

    Sz(11); B(true);
    y = Wrap(`Subject:   VLTD Serial No: ${d.deviceSerialNo} in the vehicle having chassis no: ${d.chassisNo} in the portal (https://vlts.rajasthan.gov.in), State Transport Department, Govt. of Rajasthan.`, margin, y, usable);
    B(false); y += 5;
    L("Dear Sir,", margin, y); y += 10;

    y = Wrap(`This is to inform you that VLTD serial number: ${d.deviceSerialNo}, model number: ${d.vltdModel} of VLTD manufacturer ${d.vltdMake}, has been activated on vehicle having chasis number: ${d.chassisNo} , engine number: ${d.engineNo} ,vehicle registration number: ${d.vehicleRegNo} and vehicle class: ${d.vehicleClass}`, margin, y, usable);
    y += 14;

    L("The details of VLTD shown blow:", margin, y); y += 8;
    buildRows(d).forEach(({ label, value }) => {
      B(false); L(`${label}: `, margin, y);
      B(true); L(value || "", margin + pdf.getTextWidth(`${label}: `), y);
      y += 6;
    });
    y += 14;

    B(true); L("Thanking You", margin, y); y += 16;
    L("(Name & Address of Retro Fitment Center)", margin, y); y += 6;
    L(d.fitmentCenterName, margin, y); y += 6;
    B(false);
    if (d.fitmentCenterAddress) { y = Wrap(d.fitmentCenterAddress, margin, y, usable); }
    y += 6;
    B(true); L(`Registering Office: ${d.registeringOffice}`, margin, y);

    pdf.save("VLTD_Activation_Certificate.pdf");
  };

  const handlePrintCertificate = () => {
    if (!certificateData) return;
    const d = certificateData;
    const rows = buildRows(d).map((r) => `<p class="dr">${r.label}: <strong>${r.value || ""}</strong></p>`).join("");
    const qrDataUrl = (() => {
      try {
        const canvas = qrCanvasRef.current?.querySelector("canvas");
        if (canvas) return canvas.toDataURL("image/png");
      } catch (_) { }
      return "";
    })();

    const html = `<!DOCTYPE html>
<html><head><title>VLTD Activation Certificate</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Times New Roman',Times,serif;padding:52px 58px;color:#000;font-size:14px;line-height:1.8}
  .hdr{text-align:center;margin-bottom:36px}
  .hdr h1{font-size:20px;font-weight:bold;letter-spacing:.5px}
  .hdr sub{font-size:12px;font-style:normal}
  .top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px}
  .meta{display:flex;justify-content:space-between;margin-bottom:20px}
  p{margin-bottom:12px}
  .dr{margin-bottom:5px}
  .gap{margin-top:24px;margin-bottom:12px}
  .gap2{margin-top:32px}
  @media print{@page{margin:18px}body{padding:20px}}
</style></head><body>
<div class="hdr"><h1>VLTD ACTIVATION CERTIFICATE</h1><p><sub>(Generated Online in https://vlts.rajasthan.gov.in)</sub></p></div>
<div class="top-row">
  <div>
    <p>To,<br/>The Registering Authority<br/>State Transport Department, Govt. of Rajasthan</p>
  </div>
  ${qrDataUrl ? `<div><img src="${qrDataUrl}" width="148" height="148" alt="QR"/></div>` : ""}
</div>
<div class="meta">
  <span>VLTD Certificate No: <strong>${d.certNo}</strong></span>
  <span>VLTD Activation Date (In https://vlts.rajasthan.gov.in): <strong>${d.activationDate}</strong></span>
</div>
<p><strong>Subject:</strong>&nbsp;&nbsp; VLTD Serial No: <strong>${d.deviceSerialNo}</strong> in the vehicle having chassis no: <strong>${d.chassisNo}</strong> in the portal (https://vlts.rajasthan.gov.in), State Transport Department, Govt. of Rajasthan.</p>
<p>Dear Sir,</p>
<p>This is to inform you that VLTD serial number: <strong>${d.deviceSerialNo}</strong>, model number: <strong>${d.vltdModel}</strong> of VLTD manufacturer <strong>${d.vltdMake}</strong>, has been activated on vehicle having chasis number: <strong>${d.chassisNo}</strong> , engine number: <strong>${d.engineNo}</strong> ,vehicle registration number: <strong>${d.vehicleRegNo}</strong> and vehicle class: <strong>${d.vehicleClass}</strong></p>
<p class="gap">The details of VLTD shown blow:</p>
<br/>
${rows}
<p class="gap2"><strong>Thanking You</strong></p>
<br/><br/>
<p><strong>(Name &amp; Address of Retro Fitment Center)</strong><br/><strong>${d.fitmentCenterName}</strong><br/><strong>${d.fitmentCenterAddress || ""}</strong></p>
<p><strong>Registering Office: ${d.registeringOffice}</strong></p>
</body></html>`;
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.open(); w.document.write(html); w.document.close();
    w.focus(); setTimeout(() => { w.print(); w.close(); }, 300);
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
    <Box sx={{ mt: 4, width: '100%' }}>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}>
        <Button variant="outlined" color="secondary" startIcon={<Print />}
          onClick={handlePrintCertificate}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
          Print Certificate
        </Button>
        <Button variant="contained" color="primary" startIcon={<Download />}
          onClick={handleDownloadPdf}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
          Download PDF
        </Button>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={12}>
          <Paper elevation={2} sx={{ background: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}>
            <Box sx={{ p: { xs: "20px", sm: "40px", md: "52px 58px" }, fontFamily: F, fontSize: FS, lineHeight: LH, color: "#000" }}>
              <Box sx={{ textAlign: "center", mb: "36px" }}>
                <Typography sx={{ fontFamily: F, fontSize: "20px", fontWeight: 700, letterSpacing: ".5px", color: "#000" }}>
                  VLTD ACTIVATION CERTIFICATE
                </Typography>
                <Typography sx={{ fontFamily: F, fontSize: "12px", color: "#000" }}>
                  (Generated Online in https://vlts.rajasthan.gov.in)
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "36px" }}>
                <Box>
                  <T>To,</T>
                  <T>The Registering Authority</T>
                  <T>State Transport Department, Govt. of Rajasthan</T>
                </Box>
                <Box sx={{ flexShrink: 0, ml: 2 }}>
                  <QRCodeSVG
                    value={certificateData.qrData || "VLTD-CERTIFICATE"}
                    size={148}
                    level="M"
                    includeMargin={false}
                  />
                  <Box ref={qrCanvasRef} sx={{ display: "none" }}>
                    <QRCodeCanvas
                      value={certificateData.qrData || "VLTD-CERTIFICATE"}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: "20px" }}>
                <Typography sx={{ fontFamily: F, fontSize: FS, color: "#000" }}>
                  VLTD Certificate No: <strong>{certificateData.certNo}</strong>
                </Typography>
                <Typography sx={{ fontFamily: F, fontSize: FS, color: "#000" }}>
                  VLTD Activation Date (In https://vlts.rajasthan.gov.in):{" "}
                  <strong>{certificateData.activationDate}</strong>
                </Typography>
              </Box>

              <Box sx={{ mb: "12px" }}>
                <Typography component="p" sx={{ fontFamily: F, fontSize: FS, lineHeight: LH, color: "#000" }}>
                  <strong>Subject:</strong>&nbsp;&nbsp; VLTD Serial No:{" "}
                  <strong>{certificateData.deviceSerialNo}</strong> in the vehicle having chassis no:{" "}
                  <strong>{certificateData.chassisNo}</strong> in the portal (https://vlts.rajasthan.gov.in),
                  State Transport Department, Govt. of Rajasthan.
                </Typography>
              </Box>

              <T sx={{ mb: "12px" }}>Dear Sir,</T>

              <Box sx={{ mb: "32px" }}>
                <Typography component="p" sx={{ fontFamily: F, fontSize: FS, lineHeight: LH, color: "#000" }}>
                  This is to inform you that VLTD serial number:{" "}
                  <strong>{certificateData.deviceSerialNo}</strong>, model number:{" "}
                  <strong>{certificateData.vltdModel}</strong> of VLTD manufacturer{" "}
                  <strong>{certificateData.vltdMake}</strong>, has been activated on vehicle having chasis number:{" "}
                  <strong>{certificateData.chassisNo}</strong> , engine number:{" "}
                  <strong>{certificateData.engineNo}</strong> ,vehicle registration number:{" "}
                  <strong>{certificateData.vehicleRegNo}</strong> and vehicle class:{" "}
                  <strong>{certificateData.vehicleClass}</strong>
                </Typography>
              </Box>

              <T sx={{ mb: "14px" }}>The details of VLTD shown blow:</T>
              <Box sx={{ mb: "32px" }}>
                {buildRows(certificateData).map(({ label, value }) => (
                  <Typography key={label} component="p"
                    sx={{ fontFamily: F, fontSize: FS, lineHeight: LH, mb: "4px", color: "#000" }}>
                    {label}: <strong>{value || ""}</strong>
                  </Typography>
                ))}
              </Box>

              <T bold sx={{ mb: "32px" }}>Thanking You</T>

              <Box sx={{ mt: "8px" }}>
                <T bold>(Name &amp; Address of Retro Fitment Center)</T>
                <T bold>{certificateData.fitmentCenterName}</T>
                {certificateData.fitmentCenterAddress && (
                  <T bold>{certificateData.fitmentCenterAddress}</T>
                )}
              </Box>

              <Box sx={{ mt: "16px" }}>
                <T bold>Registering Office: {certificateData.registeringOffice}</T>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivationCertificatePreview;
