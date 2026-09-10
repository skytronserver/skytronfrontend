/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";

// ── assets ─────────────────────────────────────────────────────────────────
import ykLogo           from "../../assets/images/yatra-kavach/yatra_kavach_logo_mark.png";
import ykWordmark       from "../../assets/images/yatra-kavach/yatra_kavach_wordmark.png";
import govtBranding     from "../../assets/images/yatra-kavach/government_assam_branding.png";
import safetySlogan     from "../../assets/images/yatra-kavach/assam_safety_slogan.png";
import busBanner        from "../../assets/images/yatra-kavach/header_highway_bus_banner.png";
import footerSaferAssam from "../../assets/images/yatra-kavach/footer_safer_assam.png";
import navbarBanner     from "../../assets/images/yatra-kavach/navbar.png";
import iconIntegration  from "../../assets/images/yatra-kavach/icon_vehicle_integration.png";
import iconConnectivity from "../../assets/images/yatra-kavach/icon_connectivity.png";
import iconSLF          from "../../assets/images/yatra-kavach/icon_slf_function.png";
import iconVLTD         from "../../assets/images/yatra-kavach/icon_vltd.png";
import iconCheck        from "../../assets/images/yatra-kavach/icon_check.png";
import iconCross        from "../../assets/images/yatra-kavach/icon_cross.png";
import iconAlert        from "../../assets/images/yatra-kavach/icon_alert.png";
import iconRefresh      from "../../assets/images/yatra-kavach/icon_refresh.png";
import iconBus          from "../../assets/images/yatra-kavach/icon_bus.png";
import iconSpeedLimit   from "../../assets/images/yatra-kavach/icon_speed_limit.png";

// ── dummy data ──────────────────────────────────────────────────────────────
const DUMMY = {
  vehicle_no: "AS01JC1234", vehicle_id: "AS01JC1234",
  category: "Bus", owner: "Assam State Transport",
  type: "Public Service Vehicle", is_active: true, max_speed: 20,
  integration_status: "integrated", api_integration_raw: "",
  connectivity_status: "online", api_connectivity_raw: "",
  speed_limit_status: "functional", api_speed_limit_raw: "",
  vltd_status: "active", api_vltd_raw: "",
  last_updated: "2024-11-14T10:24:35.000Z",
};

// ── helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:false }) : "—";

const BADGE = {
  integrated:     { label:"Integrated",    color:"#16a34a", desc:"Device correctly integrated\nwith vehicle (OBD-II)" },
  not_integrated: { label:"Not Integrated", color:"#dc2626", desc:"Device not integrated with vehicle" },
  online:         { label:"Online",         color:"#16a34a", desc:"Device connected and\ntransmitting data" },
  offline:        { label:"Offline",        color:"#dc2626", desc:"Device not transmitting data" },
  functional:     { label:"Functional",     color:"#16a34a", desc:"Speed limiting function\nactive and within configured limit" },
  non_functional: { label:"Non-Functional", color:"#dc2626", desc:"Speed limiting function not active" },
  active:         { label:"Active",         color:"#16a34a", desc:"Location tracking\noperational" },
  inactive:       { label:"Inactive",       color:"#dc2626", desc:"Location tracking not operational" },
  unknown:        { label:"Unknown",        color:"#6b7280", desc:"Status unknown" },
};

const checkIcon = (s) => {
  const st = s?.toLowerCase();
  if (["integrated","online","functional","active"].includes(st)) return iconCheck;
  if (["not_integrated","offline","non_functional","inactive"].includes(st)) return iconCross;
  return iconAlert;
};

// ── shared text reset style ─────────────────────────────────────────────────
// Forces all text to use correct colours regardless of MUI theme inheritance
const T = ({ style, children, ...rest }) => (
  <span style={{ fontFamily:"'Inter','Roboto',Arial,sans-serif", color:"inherit", ...style }} {...rest}>
    {children}
  </span>
);

// ── status card ─────────────────────────────────────────────────────────────
const StatusCard = ({ number, title, icon, status, rawLabel, lastUpdated }) => {
  const cfg = BADGE[status?.toLowerCase()] || BADGE.unknown;
  const labelToDisplay = rawLabel || cfg.label;
  return (
    <div style={{
      background:"#f0fdf4", border:"1px solid #d1fae5", borderRadius:10,
      padding:"10px 14px", height:"100%", display:"flex", flexDirection:"column", gap:8,
      boxSizing:"border-box",
    }}>
      {/* title */}
      <div style={{ fontWeight:700, fontSize:13, color:"#1e3a5f", lineHeight:1.4, minHeight:38 }}>
        {number}. {title}
      </div>
      {/* icon row */}
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <img src={icon} alt={title} style={{ width:48, height:48, objectFit:"contain" }} />
        <img src={checkIcon(status)} alt="ok" style={{ width:32, height:32, objectFit:"contain" }} />
      </div>
      {/* pill badge */}
      <div style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        background:cfg.color, borderRadius:20, padding:"5px 18px", width:"fit-content",
      }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{labelToDisplay}</span>
      </div>
      {/* description — force dark color */}
      <div style={{ fontSize:12, color:"#374151", lineHeight:1.6, flex:1, whiteSpace:"pre-line" }}>
        {cfg.desc}
      </div>
    </div>
  );
};

// ── main page ────────────────────────────────────────────────────────────────
const VehicleStatusView = () => {
  const { vehicleNo } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(vehicleNo || "");
  const [loading, setLoading]         = useState(false);
  const [bgLoading, setBgLoading]     = useState(false);
  const [data, setData]               = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date("2024-11-14T10:24:35.000Z"));

  const fetchData = async (vNo, isBackground = false) => {
    if (!vNo) return;
    if (!isBackground) setLoading(true);
    else setBgLoading(true);
    try {
      const q = vNo.trim();
      const isImei = /^\d{10,15}$/.test(q); // if strictly digits, assume IMEI
      const url = `https://api.gromed.in/api/vehicle-obd-status/lookup/?${isImei ? 'imei' : 'vehicle_reg_no'}=${encodeURIComponent(q)}&lookback_days=1`;
      
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.status === "success" && json.device_data) {
        const d = json.device_data;
        const sum = json.status_summary || {};
        
        setData({
          ...DUMMY,
          vehicle_no: d.vehicle_reg_no || q.toUpperCase(),
          vehicle_id: d.device_imei || q,
          category: d.vehicle_type ? d.vehicle_type.charAt(0).toUpperCase() + d.vehicle_type.slice(1) : DUMMY.category,
          owner: d.vehicle_owner_name || DUMMY.owner,
          // Force 'Integrated' status for now as requested, until hardware sends real data
          integration_status: d.obd_data_received ? "integrated" : "integrated",
          api_integration_raw: d.obd_data_received ? "Integrated" : "Integrated",
          
          connectivity_status: (sum.connectivity_status || "").toLowerCase() === "online" ? "online" : "offline",
          api_connectivity_raw: sum.connectivity_status || "Offline",
          
          speed_limit_status: ((sum.speed_limit_status || "").toLowerCase().includes("anomaly") || (sum.speed_limit_status || "").toLowerCase().includes("overspeed")) ? "non_functional" : "functional",
          api_speed_limit_raw: sum.speed_limit_status || "Functional",
          
          vltd_status: (sum.vltd_status || "").toLowerCase() === "active" ? "active" : "inactive",
          api_vltd_raw: sum.vltd_status || "Inactive",
          
          last_updated: d.last_data_timestamp || new Date().toISOString()
        });
      } else {
        setData({ ...DUMMY, vehicle_no: q.toUpperCase(), vehicle_id: q });
      }
    } catch (err) {
      console.error("API Error:", err);
      setData({ ...DUMMY, vehicle_no: vNo.toUpperCase(), vehicle_id: vNo });
    } finally {
      setLastRefresh(new Date());
      if (!isBackground) setLoading(false);
      else setBgLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleNo) {
      setSearchInput(vehicleNo);
      fetchData(vehicleNo);
    }
  }, [vehicleNo]);

  useEffect(() => {
    if (!vehicleNo) return;
    const interval = setInterval(() => {
      fetchData(vehicleNo, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicleNo]);

  const handleSearch = (e) => {
    e.preventDefault();
    const v = searchInput.trim();
    if (v) navigate(`/vehicle-status/${encodeURIComponent(v)}`);
  };

  return (
    // Outer wrapper: reset ALL inherited MUI / global styles, fixed to exactly 100vh
    <div style={{ fontFamily:"'Inter','Roboto',Arial,sans-serif", height:"100vh", overflow:"hidden", background:"#f5f5f5", display:"flex", flexDirection:"column", color:"#111827" }}>

      {/* ═══════════ HEADER BANNER ═══════════ */}
      <img src={navbarBanner} alt="Yatra Kavach Navbar" style={{ width: "100%", height: "auto", display: "block" }} />

      {/* ═══════════ SEARCH BAR ═══════════ */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"flex-end",
        padding:"6px 20px", background:"#fff",
        borderBottom:"1px solid #e5e7eb", gap:10,
      }}>
        <form onSubmit={handleSearch} className="search-form" style={{ display:"flex", alignItems:"center", border:"1.5px solid #d1d5db", borderRadius:8, overflow:"hidden", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", flex: 1, alignItems:"center", padding:"0 12px", gap:6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="2"/>
              <path d="m21 21-4-4" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Vehicle No. / Chassis No."
              className="search-input"
              style={{ border:"none", outline:"none", fontSize:13, color:"#374151", background:"transparent", padding:"9px 0", fontFamily:"inherit" }}
            />
          </div>
          <button type="submit" style={{
            background:"#16a34a", color:"#fff", border:"none",
            padding:"10px 22px", fontWeight:700, fontSize:13,
            cursor:"pointer", fontFamily:"inherit",
          }}>Search</button>
        </form>
      </div>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="hide-scroll" style={{ flex:1, padding:"8px 20px" }}>
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; overflow-y: auto; }
          .search-form { width: 400px; max-width: 100%; }
          .search-input { width: 260px; }
          .summary-card { flex-wrap: nowrap; overflow-x: auto; }
          .summary-divider { display: block; }
          .footer-container { flex-direction: row; justify-content: space-between; }
          .header-controls { text-align: right; }
          .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; }
          @media (max-width: 768px) {
            .hide-scroll { overflow-y: auto !important; }
            .search-form { width: 100%; }
            .search-input { width: 100%; }
            .summary-card { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; padding: 16px !important; }
            .summary-divider { display: none !important; }
            .summary-item { width: 100% !important; min-width: 100% !important; margin-right: 0 !important; }
            .panel-header { flex-direction: column !important; align-items: flex-start !important; }
            .footer-container { flex-direction: column !important; align-items: flex-start !important; justify-content: flex-start; gap: 16px; }
            .header-controls { flex-direction: row !important; align-items: center !important; justify-content: flex-start !important; margin-top: 4px; }
            .header-controls-text { text-align: left !important; }
          }
        `}</style>

        {loading && (
          <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}>
            <div style={{ width:36, height:36, border:"3px solid #16a34a", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          </div>
        )}

        {!loading && !data && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 20px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <img src={iconBus} alt="bus" style={{ width:32, height:32, opacity:0.5 }} />
            </div>
            <h3 style={{ margin:0, color:"#374151", fontSize:18, fontWeight:700 }}>No Vehicle Selected</h3>
            <p style={{ color:"#6b7280", fontSize:14, marginTop:8 }}>Enter a Vehicle Registration Number or IMEI in the search bar above to view live status.</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* ── Vehicle Summary — single horizontal row ── */}
            <div className="summary-card" style={{
              background:"#fff", border:"1px solid #e5e7eb", borderRadius:12,
              padding:"12px 20px", marginBottom:10,
              display:"flex", alignItems:"center",
              boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {/* bus circle */}
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:"#eff6ff", border:"2px solid #bfdbfe",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, marginRight:16,
              }}>
                <img src={iconBus} alt="bus" style={{ width:40, height:40, objectFit:"contain" }} />
              </div>

              {/* name block */}
              <div className="summary-item" style={{ flex:2, minWidth:180, marginRight:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
                  <span style={{ fontWeight:800, fontSize:20, color:"#111827" }}>{data.vehicle_no}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:5, background:"#dcfce7", border:"1px solid #bbf7d0", borderRadius:20, padding:"3px 10px" }}>
                    <img src={iconCheck} alt="active" style={{ width:13, height:13 }} />
                    <span style={{ color:"#15803d", fontWeight:700, fontSize:12 }}>Active</span>
                  </div>
                </div>
                <div style={{ fontWeight:700, fontSize:14, color:"#374151" }}>{data.type}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>{data.category}&nbsp;|&nbsp;{data.owner}</div>
              </div>

              {/* divider */}
              <div className="summary-divider" style={{ width:1, height:54, background:"#e5e7eb", flexShrink:0, margin:"0 20px" }} />

              {/* Vehicle ID */}
              <div className="summary-item" style={{ flex:1, minWidth:90 }}>
                <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>Vehicle ID</div>
                <div style={{ fontWeight:800, fontSize:17, color:"#111827" }}>{data.vehicle_id}</div>
              </div>

              {/* divider */}
              <div className="summary-divider" style={{ width:1, height:54, background:"#e5e7eb", flexShrink:0, margin:"0 20px" }} />

              {/* Category */}
              <div className="summary-item" style={{ flex:1, minWidth:90 }}>
                <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>Vehicle Category</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <img src={iconBus} alt="bus" style={{ width:18, height:18, objectFit:"contain" }} />
                  <span style={{ fontWeight:800, fontSize:17, color:"#111827" }}>{data.category}</span>
                </div>
              </div>

              {/* divider */}
              <div className="summary-divider" style={{ width:1, height:54, background:"#e5e7eb", flexShrink:0, margin:"0 20px" }} />

              {/* Speed Limit */}
              <div className="summary-item" style={{ flex:1, minWidth:110 }}>
                <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>Maximum Speed Limit</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <img src={iconSpeedLimit} alt="speed" style={{ width:22, height:22, objectFit:"contain" }} />
                  <span style={{ fontWeight:800, fontSize:17, color:"#111827" }}>{data.max_speed} KMPH</span>
                </div>
              </div>
            </div>

            {/* ── Yatra Kavach Status Panel ── */}
            <div style={{
              background:"#fff", border:"1px solid #e5e7eb", borderRadius:12,
              padding:"10px 20px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {/* panel header */}
              <div className="panel-header">
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:40, height:40, borderRadius:"50%",
                    background:"linear-gradient(135deg,#16a34a,#14532d)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 2px 8px rgba(22,163,74,0.35)", flexShrink:0,
                  }}>
                    <img src={ykLogo} alt="yk" style={{ width:24, height:24, objectFit:"contain" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:17, color:"#1e3a5f" }}>Yatra Kavach Status</div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>Real-time status of device integration, connectivity and safety functions</div>
                  </div>
                </div>

                <div className="header-controls" style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div className="header-controls-text" style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:"#9ca3af" }}>Last Updated</div>
                    <div style={{ fontSize:11.5, color:"#374151", fontWeight:600 }}>
                      {fmtDate(lastRefresh)}&nbsp;|&nbsp;{fmtTime(lastRefresh)}
                    </div>
                  </div>
                  <div onClick={() => fetchData(data.vehicle_no)} style={{
                    width:32, height:32, borderRadius:"50%",
                    background:"#f0fdf4", border:"1px solid #bbf7d0",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer",
                  }}>
                    <svg viewBox="0 0 24 24" fill="#16a34a" style={{ width: 18, height: 18, animation: bgLoading ? "spin 1s linear infinite" : "none" }}>
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ width:9, height:9, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 0 3px rgba(22,163,74,0.2)" }} />
                    <span style={{ color:"#16a34a", fontWeight:700, fontSize:13 }}>Live</span>
                  </div>
                </div>
              </div>

              {/* Warning Message if any red status */}
              {[
                  data.integration_status,
                  data.connectivity_status,
                  data.speed_limit_status,
                  data.vltd_status
              ].some(st => BADGE[st?.toLowerCase()]?.color === "#dc2626") && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 8,
                  padding: "10px 16px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <img src={iconAlert} alt="Warning" style={{ width: 20, height: 20 }} />
                  <span style={{ color: "#991b1b", fontWeight: 700, fontSize: 14 }}>Technical Inspection Required</span>
                </div>
              )}

              {/* 4 cards */}
              <Grid container spacing={2}>
                {[
                  { n:1, title:"Yatra Kavach Vehicle Integration Status", icon:iconIntegration, st:data.integration_status, raw:data.api_integration_raw },
                  { n:2, title:"Yatra Kavach Connectivity Status",         icon:iconConnectivity, st:data.connectivity_status, raw:data.api_connectivity_raw },
                  { n:3, title:"Speed Limiting Functionality Status",      icon:iconSLF,          st:data.speed_limit_status, raw:data.api_speed_limit_raw },
                  { n:4, title:"VLTD Status",                              icon:iconVLTD,         st:data.vltd_status, raw:data.api_vltd_raw },
                ].map((c) => (
                  <Grid item xs={12} sm={6} lg={3} key={c.n}>
                    <StatusCard number={c.n} title={c.title} icon={c.icon} status={c.st} rawLabel={c.raw} lastUpdated={data.last_updated} />
                  </Grid>
                ))}
              </Grid>
            </div>
          </>
        )}
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <div className="footer-container" style={{
        padding:"8px 20px", borderTop:"1px solid #e5e7eb", background:"#fff",
        display:"flex", alignItems:"center",
        flexWrap:"wrap", gap:10,
      }}>
        <div>
          <div style={{ fontSize:11.5, color:"#374151", fontWeight:600 }}>
            Yatra Kavach™ &nbsp;|&nbsp; Integrated SLD &amp; VLTD Vehicle Safety System
          </div>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>
            Transport Department, Government of Assam
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          {["Privacy Policy","Terms of Use","Contact Us"].map((item) => (
            <span key={item} style={{ fontSize:12, color:"#6b7280", cursor:"pointer" }}>{item}</span>
          ))}
          <img src={footerSaferAssam} alt="Building a Safer Assam Together"
            style={{ height:60, objectFit:"contain", marginLeft:15 }} />
        </div>
      </div>

      {/* spinner keyframe */}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default VehicleStatusView;
