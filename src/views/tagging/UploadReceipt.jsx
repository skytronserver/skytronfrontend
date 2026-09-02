/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Grid, Button, Box, Paper, Typography } from "@mui/material";
import { Download, Print, Visibility } from "@mui/icons-material";
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import { uploadReceiptInitials, uploadReceiptFormFields } from "../../formjson/uploadReceipt";
import TaggingService from "../../services/TaggingService";
import { fetchTaggedList } from "../../helper";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useLocation } from "react-router-dom";

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

// ─────────────────────────────────────────────
const buildRows = (d) => [
  { label: "VLTD Serial No", value: `;${d.deviceSerialNo}` },
  { label: "VLTD IMEI No", value: d.vltdImei },
  { label: "VLTD/E-SIM ICCID", value: formatICCID(d.iccid) },
  { label: "Primary MSISDN/E-SIM Primary Mobile Number", value: d.primaryMsisdn },
  { label: "Fallback MSISDN/E-SIM Secondery Mobile Number", value: d.fallbackMsisdn },
  { label: "ICCID/E-SIM Valid Upto", value: d.esimValidUpto },
  { label: "No of EMG Button Installed", value: d.noOfEmgButtons },
];

// ─────────────────────────────────────────────
const UploadReceipt = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(uploadReceiptFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const qrCanvasRef = useRef(null);

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
      const activationDate = formatDate(apiData.tagged_at || new Date());
      // QR encodes all key certificate fields — unique per device
      const qrData = `Sr No:${serialNo}\nIMEI:${imeiData}\nChassis No:${chassisNo}\nCertificate No:${certNo || ""}\nActivation Date:${activationDate}`;

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

    // Header
    Sz(16); B(true);
    L("VLTD ACTIVATION CERTIFICATE", pw / 2, y, { align: "center" }); y += 6;
    Sz(9); B(false);
    L("(Generated Online in https://vlts.rajasthan.gov.in)", pw / 2, y, { align: "center" }); y += 3;

    // QR from canvas ref
    try {
      const canvas = qrCanvasRef.current?.querySelector("canvas");
      if (canvas) {
        const qrDataUrl = canvas.toDataURL("image/png");
        pdf.addImage(qrDataUrl, "PNG", pw - margin - 35, y + 2, 35, 35);
      }
    } catch (_) { }

    y += 14;
    // To
    Sz(11); B(false);
    L("To,", margin, y); y += 5;
    L("The Registering Authority", margin, y); y += 5;
    L("State Transport Department, Govt. of Rajasthan", margin, y); y += 24;

    // Cert No & Date
    Sz(10);
    L("VLTD Certificate No: ", margin, y);
    B(true); L(d.certNo, margin + pdf.getTextWidth("VLTD Certificate No: "), y); B(false);
    const dl = "VLTD Activation Date (In https://vlts.rajasthan.gov.in): ";
    const dx = pw / 2;
    L(dl, dx, y);
    B(true); L(d.activationDate, dx + pdf.getTextWidth(dl), y); B(false);
    y += 12;

    // Subject
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

  // ─── Print ───────────────────────────────────────────────────
  const handlePrintCertificate = () => {
    if (!certificateData) { alert("Please view the certificate first."); return; }
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
                <Grid item xs={12} sx={{ mt: 2.5, display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Button variant="outlined" color="primary" startIcon={<Visibility />}
                    disabled={loading || !formik.values.device_id}
                    onClick={() => loadCertificatePreview(formik.values)}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    View Certificate
                  </Button>
                  <Button variant="outlined" color="secondary" startIcon={<Print />}
                    disabled={loading || !certificateData} onClick={handlePrintCertificate}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    Print
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<Download />}
                    disabled={loading || !certificateData} onClick={handleDownloadPdf}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    {t("common.download", { defaultValue: "Download PDF" })}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}

      {/* ─── Certificate Preview ─── */}
      {certificateData && (
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <Grid item xs={12} md={10} lg={9}>
            <Paper elevation={2} sx={{ background: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}>

              {/* Printable area */}
              <Box sx={{ p: "52px 58px", fontFamily: F, fontSize: FS, lineHeight: LH, color: "#000" }}>

                {/* ── HEADER ── */}
                <Box sx={{ textAlign: "center", mb: "36px" }}>
                  <Typography sx={{ fontFamily: F, fontSize: "20px", fontWeight: 700, letterSpacing: ".5px", color: "#000" }}>
                    VLTD ACTIVATION CERTIFICATE
                  </Typography>
                  <Typography sx={{ fontFamily: F, fontSize: "12px", color: "#000" }}>
                    (Generated Online in https://vlts.rajasthan.gov.in)
                  </Typography>
                </Box>

                {/* ── TO + QR ── */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "36px" }}>
                  <Box>
                    <T>To,</T>
                    <T>The Registering Authority</T>
                    <T>State Transport Department, Govt. of Rajasthan</T>
                  </Box>
                  <Box sx={{ flexShrink: 0, ml: 2 }}>
                    {/* Visible QR */}
                    <QRCodeSVG
                      value={certificateData.qrData || "VLTD-CERTIFICATE"}
                      size={148}
                      level="M"
                      includeMargin={false}
                    />
                    {/* Hidden canvas QR — used only for PDF extraction */}
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

                {/* ── CERT NO & DATE ── */}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: "20px" }}>
                  <Typography sx={{ fontFamily: F, fontSize: FS, color: "#000" }}>
                    VLTD Certificate No: <strong>{certificateData.certNo}</strong>
                  </Typography>
                  <Typography sx={{ fontFamily: F, fontSize: FS, color: "#000" }}>
                    VLTD Activation Date (In https://vlts.rajasthan.gov.in):{" "}
                    <strong>{certificateData.activationDate}</strong>
                  </Typography>
                </Box>

                {/* ── SUBJECT ── */}
                <Box sx={{ mb: "12px" }}>
                  <Typography component="p" sx={{ fontFamily: F, fontSize: FS, lineHeight: LH, color: "#000" }}>
                    <strong>Subject:</strong>&nbsp;&nbsp; VLTD Serial No:{" "}
                    <strong>{certificateData.deviceSerialNo}</strong> in the vehicle having chassis no:{" "}
                    <strong>{certificateData.chassisNo}</strong> in the portal (https://vlts.rajasthan.gov.in),
                    State Transport Department, Govt. of Rajasthan.
                  </Typography>
                </Box>

                {/* ── DEAR SIR ── */}
                <T sx={{ mb: "12px" }}>Dear Sir,</T>

                {/* ── BODY ── */}
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

                {/* ── DETAILS LIST ── */}
                <T sx={{ mb: "14px" }}>The details of VLTD shown blow:</T>
                <Box sx={{ mb: "32px" }}>
                  {buildRows(certificateData).map(({ label, value }) => (
                    <Typography key={label} component="p"
                      sx={{ fontFamily: F, fontSize: FS, lineHeight: LH, mb: "4px", color: "#000" }}>
                      {label}: <strong>{value || ""}</strong>
                    </Typography>
                  ))}
                </Box>

                {/* ── THANKING YOU ── */}
                <T bold sx={{ mb: "32px" }}>Thanking You</T>

                {/* ── FITMENT CENTER ── */}
                <Box sx={{ mt: "8px" }}>
                  <T bold>(Name &amp; Address of Retro Fitment Center)</T>
                  <T bold>{certificateData.fitmentCenterName}</T>
                  {certificateData.fitmentCenterAddress && (
                    <T bold>{certificateData.fitmentCenterAddress}</T>
                  )}
                </Box>

                {/* ── REGISTERING OFFICE ── */}
                <Box sx={{ mt: "16px" }}>
                  <T bold>Registering Office: {certificateData.registeringOffice}</T>
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
