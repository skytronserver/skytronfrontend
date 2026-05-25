# Skytron Frontend — Pages & API Reference

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Pages / Routes** | **151** |
| **Total Unique API Endpoints** | **272** |
| **Total Forms** | **57** |
| **Total Form Fields** | **~488** |

### API Endpoints by Base URL

| Base URL | Env Variable | Endpoint Count | Purpose |
|----------|-------------|---------------|---------|
| `https://api.gromed.in/` | `REACT_APP_BASE_URL` | **270** | Main backend |
| &nbsp;&nbsp;&nbsp;↳ `/api/` prefix | | **262** | Core platform APIs |
| &nbsp;&nbsp;&nbsp;↳ `/school/api/` prefix | | **8** | School bus sub-application APIs |
| `https://map-geocoding.gromed.in` | `REACT_APP_GEOCODING_URL` | **2** | Address search & reverse geocoding |
| **Total** | | **272** | |

> **Map / Tile sources** (used directly in the map renderer, not called via fetch/axios — not counted above):
> - `https://map2.gromed.in/tile/{z}/{x}/{y}.png` — `REACT_APP_TILE_SERVER_URL` (vector map tiles)
> - `https://map.gromed.in/geoserver` — `REACT_APP_GEOSERVER_URL` (WMS/WFS geo layers)
> - `https://bhuvan-vec1.nrsc.gov.in`, `bhuvan-vec2`, `bhuvan-vec3`, `bhuvan-ras2` — `REACT_APP_BHUVAN_*` (NRSC Bhuvan tiles)
> - `https://server.arcgisonline.com/...` — `REACT_APP_SATELLITE_TILE_URL` (satellite imagery tiles)

> **Auth:** Bearer token from `/api/user_login/`, stored in `sessionStorage` / `localStorage` as `oAuthToken`

---

## Deployment Stack (docker-compose)

### Container Architecture

| Stage | Base Image | Role |
|-------|-----------|------|
| Build (discarded) | `node:18-alpine` | Compiles the React app (`npm ci` + `npm run build`) |
| Runtime | `nginx:alpine` | Serves the compiled static bundle |

| Config | Value |
|--------|-------|
| Docker Compose version | `3.3` |
| Host port → Container port | `5003 → 80` |
| Restart policy | `unless-stopped` |
| Volume mounts | `.:/app`, `/app/node_modules` (anonymous) |

### Nginx (Runtime Server)

| Property | Value |
|----------|-------|
| Image | `nginx:alpine` (latest stable Alpine-based nginx) |
| Listen port | `80` |
| SPA routing | `try_files $uri $uri/ /index.html` |
| Static paths | `/templates/*` and `/docs/*` served as real files |
| Gzip | Enabled — level 6, covers JS / CSS / JSON / SVG / XML |

### Build-time Runtime — Node.js

| Tool | Version |
|------|---------|
| Node.js | `18.x` (Alpine) |
| npm | `9.x` (bundled with Node 18) |
| npm lockfile | version 3 |
| Build command | `npm ci && npm run build` |

### Core Framework

| Package | Exact Version |
|---------|--------------|
| React | `18.2.0` |
| React DOM | `18.2.0` |
| React Scripts (CRA) | `5.0.1` |
| React Router DOM | `6.3.0` |
| TypeScript | `4.9.5` |
| Webpack | `5.97.1` |
| Babel Core | `7.28.4` |

### UI & Styling

| Package | Exact Version |
|---------|--------------|
| `@mui/material` | `5.16.7` |
| `@mui/icons-material` | `5.8.4` |
| `@mui/x-data-grid` | `6.18.7` |
| `@mui/lab` | `5.0.0-alpha.88` |
| `@emotion/react` | `11.13.3` |
| `@emotion/styled` | `11.13.0` |
| `framer-motion` | `6.3.16` |
| `sass` | `1.87.0` |
| `@tabler/icons` | `1.72.0` |
| `mui-datatables` | `4.3.0` |

### State Management

| Package | Exact Version |
|---------|--------------|
| `redux` | `4.2.1` |
| `react-redux` | `8.0.2` |
| `redux-thunk` | `2.4.0` |

### Mapping & GIS

| Package | Exact Version |
|---------|--------------|
| `leaflet` | `1.9.4` |
| `react-leaflet` | `4.2.1` |
| `ol` (OpenLayers) | `10.5.0` |
| `mappls-web-maps` | `3.8.0` |
| `proj4` | `2.15.0` |

### Charts & Reporting

| Package | Exact Version |
|---------|--------------|
| `chart.js` | `4.5.1` |
| `react-chartjs-2` | `5.3.1` |
| `recharts` | `2.15.0` |
| `jspdf` | `3.0.4` |
| `html2canvas` | `1.4.1` |

### HTTP & Forms

| Package | Exact Version |
|---------|--------------|
| `axios` | `1.15.2` |
| `formik` | `2.4.6` |
| `yup` | `0.32.11` |
| `http-proxy-middleware` | `3.0.5` |

### Internationalisation & Misc

| Package | Exact Version |
|---------|--------------|
| `i18next` | `21.10.0` |
| `react-i18next` | `11.18.6` |
| `react-slick` | `0.30.3` |
| `react-device-detect` | `2.2.2` |
| `immutable` | `4.3.0` |

### Linting & Code Quality

| Package | Exact Version |
|---------|--------------|
| `eslint` | `8.57.0` |
| `prettier` | `2.8.7` |
| `eslint-config-react-app` | `7.0.1` |
| `eslint-plugin-react` | `7.32.2` |
| `eslint-plugin-react-hooks` | `4.6.0` |

---

## Forms & Form Fields

> **Form library:** Formik + Yup validation throughout. MUI components (`TextField`, `Select`, `Autocomplete`, etc.) wrapped in a shared `CustomTextField` component. File uploads use `FormData` / multipart.

### Field Type Breakdown

| Field Type | Count |
|------------|-------|
| Text inputs | 150+ |
| Select dropdowns | 80+ |
| Date pickers | 50+ |
| File upload inputs | 45+ |
| Multi-select fields | 35+ |
| Email fields | 25+ |
| Phone / Tel fields | 20+ |
| Number fields | 20+ |
| Textarea / Description | 20+ |
| Autocomplete (MUI) | 13+ |
| Checkbox / Toggle | 10+ |
| Radio buttons | 5+ |
| **Total** | **~488** |

### Forms by Group

#### User Creation Forms (22 forms — 251+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 1 | Accessory | `AccessoryForm.jsx` | 9 | serial_no, model, test_agency, tac_no, tac_validity, cop_no, cop_validity, quantity, remarks |
| 2 | Assign Device | `AssignDevice.jsx` | 4 | dealer, device (multiselect), device_text, shipping_remark |
| 3 | Bulk Device Assign | `BulkDeviceAssign.jsx` | 2 | dealer_id, excel_file (file) |
| 4 | Bulk Upload | `BulkUpload.jsx` | 2 | model_id, esim_provider (multiselect) |
| 5 | Dealer Account | `DealerAccount.jsx` | 18 | manufacturer, name, mobile, email, dob, company_name, gstnnumber, state, districts, idProofno, expirydate, file_authLetter, file_companRegCertificate, file_GSTCertificate, file_idProof, lat, lon |
| 6 | Device | `DeviceForm.jsx` | 23 | imei, model, test_agency, tac_no, tac_validity, cop_no, cop_validity, device_esn, iccid × 2, telecom_provider × 2, msisdn × 2, imsi × 2, esim_validity, esim_provider, remarks |
| 7 | Device Model | `DeviceModelForm.jsx` | 12 | eSimProviders, model_name, test_agency, tac_no, tac_validity, vendor_id, hardware_version, tac_doc (file), cop_no, cop_validity, cop_file (file), agency_address, agency_pincode |
| 8 | DTO / RTO | `DtoRto.jsx` | 14 | name, email, mobile, state, district, idProofno, dob, expirydate, dto_rto, lat, lon, file_idProof (file), file_authorisation_letter (file) |
| 9 | Dynamic Form | `DynamicForm.jsx` | variable | Generic — field count driven by `fieldConfig` prop |
| 10 | M2M User | `M2MUser.jsx` | 17 | name, mobile, email, dob, expirydate, company_name, gstnnumber, idProofno, stateId, lat, lon, telecomProviders, file_authLetter, file_companRegCertificate, file_GSTCertificate, file_idProof |
| 11 | Manufacturer | `Manufacturer.jsx` | 22 | name, mobile, email, dob, expirydate, company_name, gstnnumber, idProofno, state, tac, device_model_details, lat, lon, assam_office address/pin/phone/lat/lon, esimProvider, 4× doc files, file_affidavitNda |
| 12 | Model Extension (COP) | `ModelExtension.jsx` | 6 | device_model, cop_no, cop_validity, cop_file (file), testAgency (auto), tacNo (auto) |
| 13 | Notice | `NoticeForm.jsx` | 4 | title, detail, file (file), status |
| 14 | SOS Admin | `SOSAdmin.jsx` | 8 | name, email, mobile, dob, state, districts, idProofno, file_idProof (file) |
| 15 | SOS User | `SOSUser.jsx` | 10 | name, email, mobile, dob, state, address, idProofno, expirydate, file_idProof (file) |
| 16 | School Holiday | `SchoolHolidayForm.jsx` | 6 | holidayName, startDate, endDate, description, status, holidayType |
| 17 | State Admin | `StateAdmin.jsx` | 12 | name, email, mobile, dob, state, districts, idProofno, expirydate, file_idProof (file), file_authLetter (file) |
| 18 | System Admin | `SystemAdmin.jsx` | 6 | name, email, mobile, dob, lat, lon |
| 19 | Test Agency | `TestAgencyCreate.jsx` | 9 | select_agency, agency_name, company_address, company_pin, idProofno, status, name, email, mobile, dob, file_authLetter (file), file_idProof (file) |
| 20 | Test Agency Details | `TestAgencyDetailsForm.jsx` | 4 | name, address, pincode, state |
| 21 | Update Form | `UpdateForm.jsx` | variable | Generic — field count driven by `fieldConfig` prop |
| 22 | Vehicle Owner | `VehicleOwner.jsx` | 8 | name, mobile, email, dob, address, expirydate, idProofno, file_idProof (file) |

#### Authentication (1 form — 2 fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 23 | Login | `AuthLogin.js` | 2 | email, password |

#### Tagging Forms (4 forms — 22+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 24 | Tag Device to Vehicle | `TagDeviceToVehicle.jsx` | 7+ | district, district_code, vehicle_no, device_id, OTP fields (multi-step) |
| 25 | Configure Device | `ConfigureDevice.jsx` | 6+ | ip, port, sms_gateway, sos_gateway, esim config |
| 26 | Upload Receipt | `UploadReceipt.jsx` | 4+ | vehicle_no, receipt_file (file), date, remarks |
| 27 | Vahan Verification | `VahanVerification.jsx` | 5+ | registration_no, state, district, chassis, engine |

#### School Bus Forms (6 forms — 60+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 28 | Create School | `CreateSchool.jsx` | 17 | school_name, address, pin, email, phone, lat, lon, state, district, admin name/email/mobile/dob/address/pin, file_idProof (file), file_authorisation_letter (file) |
| 29 | School Onboarding | `SchoolOnboarding.jsx` | 12+ | school details + OTP |
| 30 | Profile Management | `ProfileManagement.jsx` | 10+ | student and parent profile fields |
| 31 | Route Management | `RouteManagement.jsx` | 8+ | route name, stops, distance, timing |
| 32 | Bus Assignment | `BusAssignment.jsx` | 6+ | bus_id, route, schedule |
| 33 | School Bus Tagging | `SchoolBusTagging.jsx` | 7+ | bus registration, OTP verification, document upload |

#### Settings Forms (7 forms — 31+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 34 | Vehicle Category | `VehicleCategory.jsx` | 4+ | category_name, description, icon, status |
| 35 | State & District | `StateDistrict.jsx` | 6 | state_name, state_code (state form); district_name, address, pincode, state (district form) |
| 36 | Frequency & Firmware | `FrequencyFirmware.jsx` | 5+ | frequency, firmware version, OTA fields |
| 37 | IP Settings | `IPSetting.jsx` | 4+ | primary_ip, primary_port, secondary_ip, secondary_port |
| 38 | Notification Preferences | `NotificationPreferences.jsx` | 6+ | alert type toggles, email/SMS preferences |
| 39 | Login Settings | `LoginSettings.jsx` | 3+ | session_timeout, max_attempts, otp_enabled |
| 40 | Send Command | `SendCommand.jsx` | 5+ | vehicle (Autocomplete), command_type, parameters |

#### Registration / Homepage Forms (4 forms — 50+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 41 | User Registration Request | `UserRegistrationRequest.jsx` | 8+ | role, name, email, mobile, organisation, state, reason |
| 42 | User Registration Form | `UserRegistrationForm.jsx` | 20+ | role-dependent: M2M, Manufacturer, School admin fields + file uploads |
| 43 | School Registration | `SchoolRegistration.jsx` | 15+ | school-specific registration fields |
| 44 | Home | `Home.jsx` | 10+ | search/filter fields on home page |

#### Device / SIM Forms (3 forms — 26+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 45 | Create New Device | `CreateNew.jsx` | 12+ | imei, model, sim details, esim config |
| 46 | SIM Activation | `SimActivation.jsx` | 8+ | iccid, msisdn, telecom_provider, esim_provider, activation_date |
| 47 | Bulk SIM Activation | `ListSimActivation.jsx` | 6+ | filter fields for activation request list |

#### Report Filter Forms (9 forms — 37+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 48 | GPS Data Log | `GpsDataLog.jsx` | 4+ | date_from, date_to, imei, vehicle_no |
| 49 | Activation Log | `ActivationLogReport.jsx` | 4+ | date_from, date_to, device, status |
| 50 | Emergency Data Logs | `EmergencyDataLogs.jsx` | 4+ | date_from, date_to, vehicle_no, alert_type |
| 51 | API Data Log | `ApiDataLog.jsx` | 4+ | query, date_from, date_to, page |
| 52 | Alert Log | `AlertLog.jsx` | 5+ | date_from, date_to, vehicle_no, alert_type, status |
| 53 | Activated Device Report | `ActivatedDeviceReport.jsx` | 4+ | date_from, date_to, model, state |
| 54 | Alert Report | `AlertReport.jsx` | 5+ | date_from, date_to, vehicle, severity, type |
| 55 | Device Health Report | `DeviceHealthReport.jsx` | 4+ | date_from, date_to, imei, health_status |
| 56 | User Statistics Report | `UserStatisticsReport.jsx` | 4+ | date_from, date_to, user_type, state |

#### SOS / EM Management Forms (1 form — 8+ fields)

| # | Form | File | Fields | Key Fields |
|---|------|------|--------|-----------|
| 57 | Create EM Team | `CreateEMTeam.jsx` | 8+ | team_name, team_lead, members (multiselect), state, district, contact_no, description |

---

## Pages by Route Group

---

### 1. Home Routes (Public / No Auth Required)

| # | Route | Page |
|---|-------|------|
| 1 | `/` | Home Page |
| 2 | `/camera-feeds` | Camera Feeds (public) |
| 3 | `/privacy-policy` | Privacy Policy |
| 4 | `/user-registration-request` | User Registration Request |
| 5 | `/user-registration-request/:role` | User Registration Form |
| 6 | `/registration-status` | Registration Status Tracker |
| 7 | `/registration-admin-review` | Registration Admin Review |
| 8 | `/device-stats` | Device Stats (public) |
| 9 | `/inauguration-photos` | Inauguration Photos |
| 10 | `/superadmin-dashboard/vehicle-monitoring` | Vehicle Monitoring (public) |
| 11 | `/superadmin-dashboard/erss-vehicles` | ERSS Vehicles Dashboard (public) |
| 12 | `/superadmin-dashboard/sos` | SOS Monitoring Dashboard (public) |
| 13 | `/superadmin-dashboard/sos-analytics` | SOS Analytics Dashboard (public) |

#### API Calls

**`/` — Home Page**
- `GET /api/Statistics/manufacturer_model_stock_statistics/` — on mount (public stats)
- `GET /api/public/device_onboarding_dashboard/` — on mount (public dashboard data)

**`/device-stats` — Device Stats**
- `GET /api/Statistics/manufacturer_model_stock_statistics/` — on mount
- `GET /api/public/device_onboarding_dashboard/` — on mount

**`/user-registration-request` & `/user-registration-request/:role` — Registration**
- `POST /api/public/user_registration/` — on form submit (no auth required)

**`/superadmin-dashboard/vehicle-monitoring` — Vehicle Monitoring**
- `GET /api/vehicle_status_metrics/` — on mount / on refresh

**`/superadmin-dashboard/sos` — SOS Monitoring**
- `GET /api/SOS/monthly_metrics/?year={year}` — on mount, on year change
- `GET /api/ambulance_fleet_metrics/` — on mount
- `GET /api/police_fleet_metrics/` — on mount

**`/superadmin-dashboard/sos-analytics` — SOS Analytics**
- `GET /api/SOS/monthly_metrics/?year={year}` — on mount / year filter change
- `GET /api/SOS/SOS_Admin_report/` — on mount (admin role)
- `GET /api/SOS/SOS_TL_report/` — on mount (team lead role)
- `GET /api/SOS/SOS_EX_report/` — on mount (executive role)

**`/camera-feeds` (public) — Camera Feeds**
- No backend API calls (uses external camera feed URLs)

**`/inauguration-photos` — Inauguration Photos**
- No backend API calls (static gallery)

---

### 2. Landing Routes

| # | Route | Page |
|---|-------|------|
| 14 | `/landing` | Landing Page |
| 15 | `/landing/home-page` | Landing Home Page |
| 16 | `/landing/notice-view-all` | View All Notices |

#### API Calls

**`/landing/home-page` — Landing Home Page**
- `POST /api/notice/list/` — on mount (public notices)

**`/landing/notice-view-all` — View All Notices**
- `POST /api/notice/filter/` — on mount, on filter change

---

### 3. Authentication Routes

| # | Route | Page |
|---|-------|------|
| 17 | `/login` | Login |
| 18 | `/otp-login` | OTP Login |
| 19 | `/new/:reset_token` | Reset Password |
| 20 | `/forgot-password` | Forgot Password |
| 21 | `/reset-password/:reset_token` | Set Password |

#### API Calls

**`/login` — Login**
- `GET /api/generate-captcha/` — on mount (load captcha image)
- `POST /api/generate-captcha/` — on captcha refresh
- `POST /api/user_login/` — on form submit (standard login)
- `POST /api/user_login_sosexecutive_direct/` — on form submit (SOS Executive direct login)

**`/otp-login` — OTP Login**
- `POST /api/user_login/` — on initial credential submit
- `POST /api/validate_otp/` — on OTP entry submit
- `POST /api/send_sms_otp/` — on "Resend OTP" button click

**`/forgot-password` — Forgot Password**
- `POST /api/send_sms_otp/` — on form submit

**`/new/:reset_token` & `/reset-password/:reset_token` — Reset/Set Password**
- `POST /api/user_login/` — on password reset submit (token-based)

---

### 4. Dashboard & Admin Pages

| # | Route | Page |
|---|-------|------|
| 22 | `/dashboard` | Default Dashboard |
| 23 | `/superadmin-dashboard` | SuperAdmin Dashboard |
| 24 | `/superadmin-dashboard/transport` | Transport Dashboard |
| 25 | `/superadmin-dashboard/public-safety` | Public Safety Dashboard |
| 26 | `/superadmin-dashboard/m2m-registration-requests` | M2M Registration Review |
| 27 | `/superadmin-dashboard/vehicle-manufacturer-registration-requests` | Vehicle Manufacturer Registration |
| 28 | `/superadmin-dashboard/ais-140-device-manufacturer-registration-requests` | AIS-140 Device Manufacturer Registration |
| 29 | `/stateadmin-dashboard/technical-onboarding-requests` | Technical Onboarding (StateAdmin) |
| 30 | `/morth-dashboard` | MORTH Dashboard |

#### API Calls

**`/dashboard` — Default Dashboard** (role-based data)
- `POST /api/homepageandstat/homepage/` — on mount (general dashboard)
- `POST /api/homepageandstat/homepage_state/` — on mount (state stats)
- `POST /api/homepageandstat/homepage_alart/` — on mount (alert stats)
- `POST /api/homepageandstat/homepage_device1/` — on mount (device stats)
- `POST /api/homepageandstat/homepage_device2/` — on mount (tagged devices)
- `POST /api/homepageandstat/homepage_user1/` — on mount (user data)
- `POST /api/homepageandstat/homepage_stateAdmin/` — if StateAdmin role
- `POST /api/homepageandstat/homepage_Dealer/` — if Dealer role
- `POST /api/homepageandstat/homepage_Manufacturer/` — if Manufacturer role
- `POST /api/homepageandstat/homepage_VehicleOwner/` — if VehicleOwner role
- `POST /api/homepageandstat/homepage_DTO/` — if DTO role
- `POST /api/homepageandstat/homepage_esimProvider/` — if eSIM Provider role
- `GET /api/Statistics/vehicle_alert_statistics/` — on mount

**`/superadmin-dashboard` — SuperAdmin Dashboard**
- `POST /api/homepageandstat/homepage/` — on mount
- `POST /api/homepageandstat/homepage_state/` — on mount
- `GET /api/vehicle_status_metrics/` — on mount
- `GET /api/Statistics/vehicle_alert_statistics/` — on mount

**`/superadmin-dashboard/m2m-registration-requests` — M2M Registration**
- `POST /api/eSimProvider/filter_eSimProvider/?all_user=true` — on mount / filter change
- `POST /api/eSimProvider/update_eSimProvider/` — on approve/reject action

**`/superadmin-dashboard/vehicle-manufacturer-registration-requests` — Vehicle Manufacturer Registration**
- `POST /api/manufacturer/filter_manufacturers/?all_user=true` — on mount
- `POST /api/manufacturer/update_manufacturer/` — on approve/reject action

**`/superadmin-dashboard/ais-140-device-manufacturer-registration-requests` — AIS-140 Registration**
- `POST /api/devicemodel/technical-onboarding/superadmin/list/` — on mount
- `POST /api/devicemodel/technical-onboarding/superadmin/mark-ongoing/` — on "Mark Ongoing" action
- `POST /api/devicemodel/technical-onboarding/superadmin/finalize/` — on finalize with documents

**`/stateadmin-dashboard/technical-onboarding-requests` — Technical Onboarding (StateAdmin)**
- `POST /api/devicemodel/technical-onboarding/manufacturer/list/` — on mount
- `POST /api/manufacturer/filter_TechOnboardmanufacturers/` — on filter change
- `POST /api/manufacturer/approve_tech_onboarding/` — on approve action

**`/morth-dashboard` — MORTH Dashboard**
- `GET /api/central_api/` — on mount (central/Gromed data)

---

### 5. Live Tracking & SOS Pages

| # | Route | Page |
|---|-------|------|
| 31 | `/live-tracking` | Live Tracking |
| 32 | `/sos-alert` | SOS Alert |
| 33 | `/sos-lead-exp` | SOS User Experience |
| 34 | `/sos-exe` | SOS Executive |
| 35 | `/history-playback` | History Playback |
| 36 | `/route-fixing` | Route Fixing |
| 37 | `/route-eta` | Route ETA |
| 38 | `/trip-planning` | Trip Planning |
| 39 | `/sos-call-list` | SOS Call List |
| 40 | `/emcall` | EM Call |
| 41 | `/sos-call-details/:call_id` | SOS Call Details |

#### API Calls

**`/live-tracking` — Live Tracking**
- `GET /api/gps-data-map/` — on mount and polling (params: `imei`, `regno`)
- `GET /api/gps_track_data_api` — on filter apply (multiple filter params)
- `POST /api/get_live_vehicle_no/` — on search / vehicle number lookup
- `GET /api/emuser-locations/` — on mount (emergency user locations)
- `GET /api/geocode/` — on geocode lookup (legacy)
- `GET /api/reverse_geocode/` — on reverse geocode (legacy)
- `GET https://map-geocoding.gromed.in/search` — on address search (current)
- `GET https://map-geocoding.gromed.in/reverse` — on map click reverse geocode (current)
- `POST /api/cell_location/` — when cell tower location requested

**`/history-playback` — History Playback**
- `GET /api/gps_history_map/` — on vehicle/date filter apply
- `POST /api/get_live_vehicle_no/` — on vehicle search
- `GET https://map-geocoding.gromed.in/reverse` — on playback position hover

**`/route-fixing` — Route Fixing**
- `POST /api/getRoute/` — on mount / route search
- `POST /api/saveRoute/` — on save route action
- `POST /api/get_routePath/` — on route selection
- `POST /api/delRoute/` — on delete route action

**`/route-eta` — Route ETA**
- `POST /api/getRoute/` — on mount
- `GET /api/gps-data-map/` — on vehicle selection (live position)

**`/sos-alert` — SOS Alert**
- `GET /api/emergency-call-listener-admin/` — on mount if Admin role (polling)
- `GET /api/emergency-call-listener-team-lead/` — on mount if Team Lead role (polling)
- `GET /api/emergency-call-listener-deskexecutive/` — on mount if Desk Executive role (polling)
- `POST /api/EM/DEx/getLiveCallList/` — on mount (active SOS calls)
- `POST /api/EM/DEx/getPendingCallList/` — on mount (pending calls)
- `POST /api/EM/DEx/replyCall/` — on "Accept Call" button
- `POST /api/EM/DEx/closeCase/` — on "Close Case" action
- `POST /api/EM/DEx/updateCaseMeta/` — on metadata update
- `POST /api/submit_status/` — on status change
- `POST /api/broadcast-help/` — on broadcast action
- `GET /api/emuser-locations/` — on mount (EM responder locations)
- `GET https://map-geocoding.gromed.in/reverse` — on SOS location pin

**`/sos-exe` — SOS Executive**
- `POST /api/EM/DEx/getLiveCallList/` — on mount and polling
- `POST /api/EM/DEx/getPendingCallList/` — on mount
- `POST /api/EM/DEx/replyCall/` — on accept call
- `POST /api/EM/DEx/sendMsg/` — on send message
- `POST /api/EM/DEx/rcvMsg/` — on receive message poll
- `POST /api/EM/DEx/getCallAllLoc/` — on location refresh
- `POST /api/EM/DEx/get-media/` — on media fetch
- `POST /api/EM/DEx/closeCase/` — on close case
- `POST /api/EM/DEx/updateCaseMeta/` — on meta update
- `POST /api/submit_status/` — on status update
- `POST /api/EM/DEx/broadcast/` — on broadcast

**`/sos-lead-exp` — SOS Team Lead**
- `POST /api/EM/DEx/getLiveCallList/` — on mount
- `POST /api/EM/DEx/getPendingCallList/` — on mount
- `GET /api/emergency-call-listener-team-lead/` — on mount (polling)
- `POST /api/EM/DEx/closeCase/` — on close case
- `POST /api/EM/DEx/updateCaseMeta/` — on meta update

**`/sos-call-list` — SOS Call List**
- `POST /api/EM/DEx/getLiveCallList/` — on mount
- `POST /api/EM/DEx/getPendingCallList/` — on mount
- `GET /api/SOS/report/` — on report load

**`/sos-call-details/:call_id` — SOS Call Details**
- `GET /api/emergency-call-details/{id}/` — on mount (call detail by ID)
- `POST /api/EM/DEx/sendMsg/` — on send message
- `POST /api/EM/DEx/rcvMsg/` — on message poll
- `POST /api/EM/DEx/get-media/` — on media request
- `POST /api/submit_status/` — on status update

**`/emcall` — EM Call**
- `POST /api/EM/DEx/getLiveCallList/` — on mount
- `POST /api/EM/DEx/replyCall/` — on accept
- `POST /api/EM/DEx/sendMsg/` — on message send
- `POST /api/EM/DEx/rcvMsg/` — on message receive poll
- `POST /api/EM/DEx/closeCase/` — on close
- `POST /api/EM/DEx/broadcast/` — on broadcast

**`/trip-planning` — Trip Planning**
- `GET /api/trip/` — on mount
- `POST /api/trip/create/` — on create trip form submit
- `PUT /api/trip/{tripId}/update/` — on edit save
- `POST /api/trip/{tripId}/end/` — on end trip action
- `POST /api/trip/{tripId}/cancel/` — on cancel trip action

---

### 6. Reports

| # | Route | Page |
|---|-------|------|
| 42 | `/reports/gps-data-log` | GPS Data Log |
| 43 | `/reports/activation-log-report` | Activation Log Report |
| 44 | `/reports/emergency-data-logs` | Emergency Data Logs |
| 45 | `/reports/api-data-log` | API Data Log |
| 46 | `/reports/alert-log` | Alert Log Report |
| 47 | `/reports/activated-device-report` | Activated Device Report |
| 48 | `/reports/alert-report` | Alert Report |
| 49 | `/reports/device-health-report` | Device Health Report |
| 50 | `/reports/user-statistics-report` | User Statistics Report |
| 51 | `/reports/incident-report` | Incident Report |
| 52 | `/reports/health-packet-log` | Health Packet Log |
| 53 | `/reports/poi-report` | POI Report |

#### API Calls

**`/reports/gps-data-log` — GPS Data Log**
- `GET /api/gps-data-log-table/` — on mount and filter apply

**`/reports/emergency-data-logs` — Emergency Data Logs**
- `GET /api/gps-em-data-log-table/` — on mount and filter apply

**`/reports/api-data-log` — API Data Log**
- `POST /api/apiLog/?q={query}&page={page}&per_page={per_page}` — on mount, search, pagination

**`/reports/alert-log` — Alert Log Report**
- `POST /api/alertlog/filter/` — on mount and filter change

**`/reports/alert-report` — Alert Report**
- `POST /api/list-alerts/` — on mount and filter apply
- `POST /api/alertlog/filter/` — on advanced filter

**`/reports/activated-device-report` — Activated Device Report**
- `POST /api/device/activated_device_list/` — on mount and filter

**`/reports/device-health-report` — Device Health Report**
- `GET /api/device-health-status/` — on mount and filter

**`/reports/user-statistics-report` — User Statistics Report**
- `GET /api/Statistics/user_statistics/` — on mount

**`/reports/incident-report` — Incident Report**
- `POST /api/incident/filter/` — on mount and filter apply

**`/reports/poi-report` — POI Report**
- `GET /api/poi/list/` — on mount

**`/reports/activation-log-report` — Activation Log Report**
- `POST /api/devicestock/deviceStockFilter/` — on mount and filter
- `POST /api/esimActivateReq/filter/` — on filter change

**`/reports/health-packet-log` — Health Packet Log**
- `POST /api/Settings/filter_settings_hp_freq/` — on mount

---

### 7. Map & POI Pages

| # | Route | Page |
|---|-------|------|
| 54 | `/camera-feeds` | Camera Feeds (auth) |
| 55 | `/poi-viewer` | POI Viewer |
| 56 | `/trip-viewer` | Trip Viewer |
| 57 | `/map` | Map Viewer |
| 58 | `/map-policy` | Map Policy |
| 59 | `/alert-list` | Alert List |

#### API Calls

**`/poi-viewer` — POI Viewer**
- `GET /api/poi/list/` — on mount

**`/trip-viewer` — Trip Viewer**
- `GET /api/trip/` — on mount
- `GET /api/trip/{tripId}/` — on trip selection

**`/alert-list` — Alert List**
- `POST /api/list-alerts/` — on mount and filter
- `POST /api/device_tag_alerts/` — on device-specific filter
- `POST /api/alertlog/filter/` — on log filter

**`/map` — Map Viewer**
- `GET /api/gps-data-map/` — on mount / vehicle selection
- `GET https://map-geocoding.gromed.in/reverse` — on map click

---

### 8. User Management Pages

| # | Route | Page |
|---|-------|------|
| 60 | `/user/list` | User List |
| 61 | `/user/view/:userId` | Update User Form |
| 62 | `/user/detail/:userType/:userId` | User Details View |
| 63 | `/user/newStateAdmin/*` | Create State Admin |
| 64 | `/user/newM2MUser` | Create M2M User |
| 65 | `/user/newManufacturer` | Create Manufacturer |
| 66 | `/manufacturer/new` | Create Manufacturer (alt) |
| 67 | `/user/manufacturer-list` | Manufacturer List |
| 68 | `/user/dto-user-list` | DTO User List |
| 69 | `/user/newDto` | Create DTO/RTO |
| 70 | `/user/newDealerAccount` | Create Dealer Account |
| 71 | `/new/vehicleOwner/*` | Create Vehicle Owner |
| 72 | `/user/vehicle-owner-list` | Vehicle Owner List |
| 73 | `/new/otherUser` | Create Other Users |
| 74 | `/new/system-admin` | Create System Admin |
| 75 | `/new/sos-admin` | Create SOS Admin |
| 76 | `/new/sos-user` | Create SOS User |
| 77 | `/user/registeredUser` | Registered Users List |
| 78 | `/user/dealerList` | Dealer List |
| 79 | `/user/dummy` | Dummy User View |
| 80 | `/user/dynamic` | Dynamic User View |
| 81 | `/file` | File Upload Test |
| 82 | `/user/sos-user-list` | SOS User List |
| 83 | `/user/sos-other-list` | SOS Other List |
| 84 | `/sos-report` | SOS Report |
| 85 | `/notice/all-notice-list` | Notice List |
| 86 | `/user/m2m-provider-list` | M2M Provider List |
| 87 | `/user/state-admin-list` | State Admin List |
| 88 | `/new/em-team/*` | Create EM Team |
| 89 | `/list/em-team` | List EM Teams |
| 90 | `/sosTimestamp` | SOS Timestamp |

#### API Calls

**`/user/list` — User List**
- `GET /api/get_list/` — on mount (all users)
- `POST /api/deactivateUser/` — on deactivate action
- `POST /api/activateUser/` — on activate action

**`/user/view/:userId` — Update User Form**
- `GET /api/get_details/{userId}` — on mount
- `PUT /api/update_user/{id}/` — on form submit

**`/user/newStateAdmin/*` — Create State Admin**
- `POST /api/StateAdmin/create_StateAdmin/` — on form submit (multipart)
- `POST /api/resend_usercreation_otp/` — on OTP resend

**`/user/newM2MUser` — Create M2M User**
- `POST /api/eSimProvider/create_eSimProvider/` — on form submit (multipart)

**`/user/newManufacturer` & `/manufacturer/new` — Create Manufacturer**
- `POST /api/manufacturer/create_manufacturer/` — on form submit (multipart)

**`/user/manufacturer-list` — Manufacturer List**
- `POST /api/manufacturer/filter_manufacturers/?all_user=true` — on mount / filter
- `POST /api/deactivateUser/` — on deactivate
- `POST /api/activateUser/` — on activate

**`/user/dto-user-list` — DTO User List**
- `POST /api/DTO_RTO/filter_DTO_RTO/` — on mount / filter

**`/user/newDto` — Create DTO/RTO**
- `POST /api/DTO_RTO/create_DTO_RTO/` — on form submit (multipart)

**`/user/newDealerAccount` — Create Dealer Account**
- `POST /api/dealer/create_dealer/` — on form submit (multipart)

**`/new/vehicleOwner/*` — Create Vehicle Owner**
- `POST /api/VehicleOwner/create_VehicleOwner/` — on form submit (multipart)
- `POST /api/VehicleOwner/update_VehicleOwner/` — on update (multipart)
- `POST /api/update_vehicle_owner_expiry/` — on expiry update

**`/user/vehicle-owner-list` — Vehicle Owner List**
- `POST /api/VehicleOwner/filter_VehicleOwner/` — on mount / filter

**`/new/system-admin` — Create System Admin**
- `POST /api/create_systemadmin/` — on form submit

**`/new/sos-admin` — Create SOS Admin**
- `POST /api/SOSAdmin/create_SOSAdmin/` — on form submit (multipart)

**`/new/sos-user` — Create SOS User**
- `POST /api/SOSuser/create_SOSuser/` — on form submit (multipart)

**`/user/registeredUser` — Registered Users List**
- `GET /api/get_list/` — on mount
- `POST /api/activateUser/` — on activate
- `POST /api/deactivateUser/` — on deactivate

**`/user/dealerList` — Dealer List**
- `POST /api/dealer/filter_dealer/` — on mount / filter

**`/user/sos-user-list` — SOS User List**
- `POST /api/SOSuser/filter_SOSuser/` — on mount / filter

**`/user/sos-other-list` — SOS Other List**
- `POST /api/SOSAdmin/filter_SOSAdmin/` — on mount

**`/user/state-admin-list` — State Admin List**
- `POST /api/StateAdmin/filter_StateAdmin/` — on mount / filter

**`/user/m2m-provider-list` — M2M Provider List**
- `POST /api/eSimProvider/filter_eSimProvider/?all_user=true` — on mount / filter

**`/sos-report` — SOS Report**
- `GET /api/SOS/SOS_Admin_report/` — if Admin role
- `GET /api/SOS/SOS_TL_report/` — if Team Lead role
- `GET /api/SOS/SOS_EX_report/` — if Executive role
- `GET /api/SOS/report/` — general SOS report

**`/notice/all-notice-list` — Notice List**
- `POST /api/notice/list/` — on mount
- `POST /api/notice/filter/` — on filter
- `POST /api/notice/delete/` — on delete action

**`/sosTimestamp` — SOS Timestamp**
- `GET /api/SOS/monthly_metrics/?year={year}` — on mount / year change

**`/new/em-team/*` — Create EM Team**
- `POST /api/EM/create_EMteam/` — on form submit
- `POST /api/EM/activate_EMteam/` — on activate action

**`/list/em-team` — List EM Teams**
- `POST /api/EM/list_EMteam/` — on mount
- `POST /api/EM/get_EMteam/` — on team selection
- `POST /api/EM/edit_EMteam/` — on edit save
- `POST /api/EM/remove_EMteam/` — on remove action

**`/file` — File Upload Test**
- `POST /api/kyc_upload/` — on file upload action

---

### 9. Device Management Pages

| # | Route | Page |
|---|-------|------|
| 91 | `/manufacturer/onboarding` | Manufacturer Onboarding |
| 92 | `/manufacturer/technical-onboarding/create` | Create Technical Onboarding |
| 93 | `/manufacturer/technical-onboarding/list` | List Technical Onboarding |
| 94 | `/device/bulk-assign` | Bulk Device Assignment |
| 95 | `/device/new` | Create New Device |
| 96 | `/device/m2m-activation` | SIM Activation (M2M) |
| 97 | `/deviceModel/new` | Create Device Model |
| 98 | `/deviceModel/extension` | Model Extension |
| 99 | `/device/list` | Device Model List |
| 100 | `/deviceCOP/list` | Unapproved COP List |
| 101 | `/deviceModel/view/:deviceId` | Device Model Details |
| 102 | `/deviceCOPModel/view/:deviceId` | COP Model Details |
| 103 | `/device/bulkupload` | Bulk Upload |
| 104 | `/device/show-device` | Show Device |
| 105 | `/device/assign-device` | Assign Device |
| 106 | `/device/activation-request/:deviceStatus` | SIM Activation Requests |
| 107 | `/device/show-available-device` | Available for Sale |
| 108 | `/device/show-tagged-device` | Tagged Devices |
| 109 | `/device/combined-stock-report` | Combined Stock Report |
| 110 | `/device/fit-device` | Fit Device |
| 111 | `/device/all-tagged-devices` | All Tagged Devices |
| 112 | `/device/approved-models` | Approved Models |
| 113 | `/device/approved-cops` | Approved COPs |
| 114 | `/device/m2m-status` | M2M Status Report |
| 115 | `/device/esim-status` | eSIM Status (→ m2m-status) |
| 116 | `/device/eSimActivation` | eSIM Activation (→ m2m-activation) |

#### API Calls

**`/deviceModel/new` — Create Device Model**
- `POST /api/devicemodel/devicemodelCreate/` — on form submit (multipart)
- `POST /api/devicemodel/devicemodelManufacturerOtpVerify/` — on OTP verify (manufacturer)
- `POST /api/devicemodel/devicemodelSendStateAdminOtp/` — on send OTP to state admin
- `POST /api/devicemodel/devicemodleVerifyStateAdminOtp/` — on verify state admin OTP

**`/deviceModel/extension` — Model Extension (COP Upload)**
- `POST /api/devicemodel/COPUpload/` — on form submit (multipart)
- `POST /api/devicemodel/COPSendStateAdminOtp/` — on send OTP
- `POST /api/devicemodel/COPVerifyStateAdminOtp/` — on verify OTP
- `POST /api/devicemodel/COPManufacturerOtpVerify/` — on manufacturer OTP verify

**`/device/list` — Device Model List**
- `GET /api/devicemodel/devicemodelList/` — on mount
- `POST /api/devicemodel/devicemodelFilter/` — on filter apply

**`/deviceCOP/list` — Unapproved COP List**
- `GET /api/devicemodel/COPAwaitingStateApproval/` — on mount
- `GET /api/devicemodel/devicemodelAwaitingStateApproval/` — on mount

**`/deviceModel/view/:deviceId` — Device Model Details**
- `POST /api/devicemodel/devicemodelDetails/` — on mount
- `PUT /api/update_device_model/{id}` — on update action
- `DELETE /api/delete_device_model/{id}` — on delete action

**`/device/new` — Create New Device (Stock)**
- `POST /api/devicestock/deviceStockCreate/` — on single device submit (multipart)
- `GET /api/devicestock/deviceStockBulkSample/` — on download sample template

**`/device/bulkupload` — Bulk Upload**
- `GET /api/devicestock/deviceStockBulkSample/` — on download sample
- `POST /api/devicestock/deviceStockCreateBulk/` — on bulk file upload (multipart)

**`/device/show-device` — Show Device**
- `POST /api/devicestock/deviceStockFilter/` — on mount / filter
- `POST /api/device_tags_search/` — on device tag search
- `POST /api/Settings/filter_settings_State/` — on state dropdown load

**`/device/assign-device` — Assign Device**
- `POST /api/devicestock/deviceStockFilter/` — on mount
- `POST /api/devicestock/StockAssignToDealer/` — on assign action

**`/device/bulk-assign` — Bulk Device Assignment**
- `POST /api/devicestock/StockAssignToDealer/` — on bulk assign submit

**`/device/show-available-device` — Available for Sale**
- `GET /api/sell/SellListAvailableDeviceStock/` — on mount / filter
- `GET /api/devicestock/esim_provider_list/` — on eSIM provider dropdown

**`/device/show-tagged-device` — Tagged Devices**
- `POST /api/devicestock/deviceStockFilter/` — on mount / filter
- `POST /api/device_tags_search/` — on tag search
- `PATCH /api/sell/mark_device_defective/` — on mark defective
- `PATCH /api/sell/return_to_manufacturer/` — on return action

**`/device/fit-device` — Fit Device**
- `PATCH /api/sell/SellFitDevice/` — on fit action

**`/device/combined-stock-report` — Combined Stock Report**
- `POST /api/devicestock/combined/` — on mount / filter

**`/device/all-tagged-devices` — All Tagged Devices**
- `POST /api/tag/StateAdmin_view_all_tagging/` — on mount

**`/device/approved-models` — Approved Models**
- `POST /api/stateadmin/reports/approved-models/` — on mount / filter

**`/device/approved-cops` — Approved COPs**
- `POST /api/stateadmin/reports/approved-cops/` — on mount / filter

**`/device/m2m-activation` — M2M / SIM Activation**
- `POST /api/esimActivateReq/create/` — on create request
- `POST /api/esimActivateReq/filter/` — on filter / list
- `POST /api/esimActivateReq/update/` — on update request
- `PATCH /api/sell/confirm_esim_activation/` — on confirm activation
- `PATCH /api/sell/activate_esim_request/` — on activate

**`/device/activation-request/:deviceStatus` — SIM Activation Requests**
- `POST /api/esimActivateReq/filter/` — on mount with status param
- `POST /api/esimActivateReq/update/` — on status update
- `POST /api/dealer/check_esim_status/` — on status check

**`/device/m2m-status` — M2M Status Report**
- `POST /api/esimActivateReq/filter/` — on mount / filter
- `POST /api/dealer/check_esim_status/` — on check status action

**`/manufacturer/onboarding` — Manufacturer Onboarding**
- `POST /api/manufacturer/filter_manufacturers/?all_user=true` — on mount
- `POST /api/manufacturer/update_manufacturer/` — on update

**`/manufacturer/technical-onboarding/create` — Create Technical Onboarding**
- `POST /api/devicemodel/technical-onboarding/create/` — on submit (multipart)

**`/manufacturer/technical-onboarding/list` — List Technical Onboarding**
- `POST /api/devicemodel/technical-onboarding/manufacturer/list/` — on mount

---

### 10. Tagging Pages

| # | Route | Page |
|---|-------|------|
| 117 | `/tag/device-vehicle` | Tag Device to Vehicle |
| 118 | `/tag/unapproved-vehicle` | Unapproved Vehicle Tags |
| 119 | `/tag/download-receipt` | Download Receipt |
| 120 | `/tag/vahan-verification` | Vahan Verification |

#### API Calls

**`/tag/device-vehicle` — Tag Device to Vehicle**
- `POST /api/tag/TagDevice2Vehicle/` — on tag submit (multipart)
- `GET /api/tag/TagAwaitingOwnerApproval/` — on mount (pending approvals)
- `GET /api/tag/TagAwaitingActivateTag/` — on activation queue view
- `POST /api/tag/TagSendOwnerOtp/` — on send OTP to owner
- `POST /api/tag/TagVerifyOwnerOtp/` — on owner OTP verify
- `POST /api/tag/TagVerifyDealerOtp/` — on dealer OTP verify
- `POST /api/tag/TagResendDealerOtp/` — on resend dealer OTP
- `POST /api/tag/TagResendOwnerOtp/` — on resend owner OTP
- `POST /api/tag/TagSendOwnerOtpFinal/` — on final approval send OTP
- `POST /api/tag/TagVerifyOwnerOtpFinal/` — on final OTP verify
- `POST /api/tag/TagResendOwnerOtpFinal/` — on resend final OTP
- `GET /api/tag/TagAwaitingOwnerApprovalFinal/` — on final approval queue
- `POST /api/tag/ActivateTag/` — on activate tag action
- `POST /api/tag/tag_status/` — on status check
- `POST /api/tag/cancelTagDevice2Vehicle/` — on cancel action
- `POST /api/tag/untag/` — on untag action
- `POST /api/tag/retag/` — on retag action
- `POST /api/tag/update-temp-registration/` — on temp registration update (multipart)
- `PATCH /api/sell/configure_sms_gateway/` — on SMS gateway config
- `PATCH /api/sell/configure_sos_gateway/` — on SOS gateway config
- `PATCH /api/sell/configure_ip_port/` — on IP/Port config

**`/tag/unapproved-vehicle` — Unapproved Vehicle Tags**
- `GET /api/tag/TagAwaitingOwnerApproval/` — on mount
- `POST /api/tag/tag_ownerlist/` — on owner list load

**`/tag/download-receipt` — Download Receipt**
- `POST /api/tag/upload_receiptPDF/` — on upload
- `POST /api/tag/download_receiptPDF/` — on download (arraybuffer response)

**`/tag/vahan-verification` — Vahan Verification**
- `POST /api/tag/GetVahanAPIInfo/` — on registration number submit

---

### 11. Settings Pages

| # | Route | Page |
|---|-------|------|
| 121 | `/setting/vehicle-category` | Vehicle Category |
| 122 | `/setting/notification-preferences` | Notification Preferences |
| 123 | `/setting/state-district` | State & District Management |
| 124 | `/setting/frequency-firmware` | Frequency & Firmware |
| 125 | `/setting/archive-restore` | Archive & Restore |
| 126 | `/setting/notice/*` | Notice Management |
| 127 | `/setting/ip-settings` | IP Settings |
| 128 | `/setting/holiday/*` | Holiday Management |
| 129 | `/setting/login-settings` | Login Settings |
| 130 | `/holiday/all-holiday-list` | Holiday List |
| 131 | `/setting/send-command` | Send Command |

#### API Calls

**`/setting/vehicle-category` — Vehicle Category**
- `POST /api/Settings/filter_settings_VehicleCategory/` — on mount
- `POST /api/Settings/create_settings_VehicleCategory/` — on create
- `POST /api/download/` — on export

**`/setting/notification-preferences` — Notification Preferences**
- `GET /api/user/notification-preferences/` — on mount
- `POST /api/user/notification-preferences/` — on save

**`/setting/state-district` — State & District Management**
- `POST /api/Settings/filter_settings_State/` — on mount
- `POST /api/Settings/create_settings_State/` — on create state
- `POST /api/Settings/filter_settings_District/` — on district load
- `POST /api/Settings/create_settings_District/` — on create district
- `POST /api/download/` — on export

**`/setting/frequency-firmware` — Frequency & Firmware**
- `POST /api/Settings/filter_settings_hp_freq/` — on mount (frequency)
- `POST /api/Settings/create_settings_hp_freq/` — on create frequency
- `POST /api/Settings/filter_settings_firmware/` — on mount (firmware)
- `POST /api/Settings/create_settings_firmware/` — on create firmware
- `POST /api/ota/filter/` — on OTA list load
- `POST /api/ota/create/` — on OTA create

**`/setting/archive-restore` — Archive & Restore**
- `GET /api/Settings/archive_database/` — on archive action (blob response)
- `POST /api/Settings/restore_database/` — on restore file upload (multipart)
- `POST /api/gpsdata/archive/` — on GPS data archive
- `GET /api/gpsdata/archives/list/` — on mount (list archives)
- `POST /api/gpsdata/restore/` — on GPS archive restore

**`/setting/notice/*` — Notice Management**
- `POST /api/notice/list/` — on mount
- `POST /api/notice/create/` — on create (multipart)
- `POST /api/notice/update/` — on update (multipart)
- `POST /api/notice/delete/` — on delete action

**`/setting/ip-settings` — IP Settings**
- `POST /api/Settings/filter_settings_ip/` — on mount
- `POST /api/Settings/create_settings_ip/` — on create
- `PATCH /api/sell/configure_ip_port/` — on device IP config

**`/setting/holiday/*` & `/holiday/all-holiday-list` — Holiday Management**
- `GET /api/holiday/list/` — on mount
- `POST /api/holiday/create/` — on create
- `POST /api/holiday/update/{id}/` — on edit save
- `POST /api/holiday/delete/{id}/` — on delete action

**`/setting/login-settings` — Login Settings**
- `POST /api/set_login_settings/` — on form submit

**`/setting/send-command` — Send Command**
- `POST /api/mqtt/send_command/` — on command send

---

### 12. School Bus Management Pages

| # | Route | Page |
|---|-------|------|
| 132 | `/schoolbus` | School Bus Dashboard |
| 133 | `/schoolbus/parent-tracking` | Parent Tracking |
| 134 | `/schoolbus/bus-tagging` | Bus Tagging |
| 135 | `/schoolbus/route-management` | Route Management |
| 136 | `/schoolbus/bus-assignment` | Bus Assignment |
| 137 | `/schoolbus/profile-management` | Profile Management |
| 138 | `/schoolbus/holidays` | School Holidays |
| 139 | `/schoolbus/alerts` | Alerts Center |
| 140 | `/schoolbus/reports` | School Reports |
| 141 | `/schoolbus/Create-School` | Create School |
| 142 | `/schoolbus/Approve-School` | Approve School |
| 143 | `/schoolbus/onboarding` | School Onboarding |

#### API Calls

**`/schoolbus/onboarding` — School Onboarding**
- `POST /api/schoolbus/schools/applications/send-otp` — on OTP request
- `POST /school/api/schools/apply/` — on application submit (multipart)

**`/schoolbus/Approve-School` — Approve School**
- `GET /school/api/state-admin/schools/` — on mount (list applications)
- `PUT /api/schoolbus/schools/applications/{appId}/review` — on review action
- `POST /api/schoolbus/schools/applications/{appId}/issue-credentials` — on approve with credentials
- `POST /school/api/state-admin/schools/{applicationId}/decision/` — on approve/reject

**`/schoolbus/bus-tagging` — Bus Tagging**
- `GET /school/api/admin/buses/tag/history/` — on mount
- `POST /school/api/admin/buses/tag/initiate/` — on initiate tag
- `POST /school/api/admin/buses/tag/{tagId}/verify-otp/` — on OTP verify
- `POST /school/api/admin/buses/tag/{tagId}/documents/` — on document upload (multipart)

**`/schoolbus/route-management` — Route Management**
- `GET /api/schoolbus/routes` — on mount
- `POST /api/schoolbus/routes` — on create route
- `PUT /api/schoolbus/routes/{id}` — on update route
- `DELETE /api/schoolbus/routes/{id}` — on delete route
- `GET /api/schoolbus/routes/{routeId}/stops` — on route selection
- `POST /api/schoolbus/routes/{routeId}/stops` — on add stop
- `PUT /api/schoolbus/stops/{stopId}` — on update stop
- `DELETE /api/schoolbus/stops/{stopId}` — on delete stop

**`/schoolbus/bus-assignment` — Bus Assignment**
- `GET /school/api/admin/buses/available/` — on mount
- `GET /api/schoolbus/routes/options` — on route dropdown load
- `GET /api/schoolbus/assignments` — on mount (existing assignments)
- `POST /api/schoolbus/assign` — on assign submit
- `PUT /api/schoolbus/reassign/{busId}` — on reassign action
- `DELETE /api/schoolbus/untag/{busId}` — on untag action

**`/schoolbus/profile-management` — Profile Management**
- `GET /api/schoolbus/parents` — on mount
- `POST /api/schoolbus/parents` — on create parent
- `PUT /api/schoolbus/parents/{parentId}` — on update parent
- `DELETE /api/schoolbus/parents/{parentId}` — on delete parent
- `GET /api/schoolbus/students` — on mount
- `POST /api/schoolbus/students` — on create student
- `PUT /api/schoolbus/students/{studentId}` — on update student
- `DELETE /api/schoolbus/students/{studentId}` — on delete student

**`/schoolbus/parent-tracking` — Parent Tracking**
- `GET /api/schoolbus/tracking/{studentId}` — on student selection
- `GET /api/gps-data-map/` — on mount (bus live position)

**`/schoolbus/holidays` — School Holidays**
- `GET /api/schoolbus/holidays` — on mount
- `POST /api/schoolbus/holidays` — on create holiday

**`/schoolbus/alerts` — Alerts Center**
- `GET /api/schoolbus/alerts/feed` — on mount (polling)
- `GET /api/schoolbus/alerts/{parentId}` — on parent selection

**`/schoolbus/reports` — School Reports**
- `GET /api/schoolbus/reports/unplanned-usage` — on unplanned usage tab
- `GET /api/schoolbus/reports/attendance` — on attendance tab
- `GET /api/schoolbus/reports/trips` — on trips tab
- `GET /api/schoolbus/reports/traffic` — on traffic tab

---

### 13. Test Agency Pages

| # | Route | Page |
|---|-------|------|
| 144 | `/new/test-agency` | Create Test Agency |
| 145 | `/new/test-agency-details` | Create Test Agency Details |
| 146 | `/test-agency/list` | Test Agency List |
| 147 | `/test-agency/details-list` | Test Agency Details List |
| 148 | `/test-agency/assigned-models` | Assigned Device Models |

#### API Calls

**`/new/test-agency` — Create Test Agency**
- `POST /api/testAgency/create_testAgency/` — on form submit (multipart)

**`/new/test-agency-details` — Create Test Agency Details**
- `POST /api/testAgency/details/create/` — on form submit
- `POST /api/testAgency/name_list/` — on agency name dropdown

**`/test-agency/list` — Test Agency List**
- `POST /api/testAgency/list/` — on mount / filter
- `POST /api/testAgency/update_testAgency/` — on update (multipart)

**`/test-agency/details-list` — Test Agency Details List**
- `GET /api/testAgency/details/list/` — on mount
- `POST /api/testAgency/details/update/` — on update

**`/test-agency/assigned-models` — Assigned Device Models**
- `POST /api/testAgency/device_models/` — on mount (test agency role only)

---

### 14. Accessories & Help Pages

| # | Route | Page |
|---|-------|------|
| 149 | `/accessory/new` | Create New Accessory |
| 150 | `/help` | Help Page |
| 151 | `/sample-page` | Sample Page |

#### API Calls

**`/accessory/new` — Create New Accessory**
- (Specific endpoints depend on accessory type — no dedicated service file identified)

**`/help` & `/sample-page`**
- No API calls (static content pages)

---

## Complete Unique API Endpoint Index

Below is the deduplicated list of all ~250 unique API endpoints called across the application.

### Authentication
| # | Method | Endpoint |
|---|--------|---------|
| 1 | POST | `/api/user_login/` |
| 2 | POST | `/api/user_login_sosexecutive_direct/` |
| 3 | POST | `/api/validate_otp/` |
| 4 | POST | `/api/send_sms_otp/` |
| 5 | POST | `/api/user_logout/` |
| 6 | GET | `/api/generate-captcha/` |
| 7 | POST | `/api/generate-captcha/` |

### Dashboard / Homepage Stats
| # | Method | Endpoint |
|---|--------|---------|
| 8 | POST | `/api/homepageandstat/homepage/` |
| 9 | POST | `/api/homepageandstat/homepage_state/` |
| 10 | POST | `/api/homepageandstat/homepage_alart/` |
| 11 | POST | `/api/homepageandstat/homepage_device1/` |
| 12 | POST | `/api/homepageandstat/homepage_device2/` |
| 13 | POST | `/api/homepageandstat/homepage_user1/` |
| 14 | POST | `/api/homepageandstat/homepage_stateAdmin/` |
| 15 | POST | `/api/homepageandstat/homepage_Dealer/` |
| 16 | POST | `/api/homepageandstat/homepage_Manufacturer/` |
| 17 | POST | `/api/homepageandstat/homepage_VehicleOwner/` |
| 18 | POST | `/api/homepageandstat/homepage_DTO/` |
| 19 | POST | `/api/homepageandstat/homepage_esimProvider/` |
| 20 | GET | `/api/Statistics/vehicle_alert_statistics/` |
| 21 | GET | `/api/Statistics/user_statistics/` |
| 22 | GET | `/api/Statistics/manufacturer_model_stock_statistics/` |
| 23 | GET | `/api/public/device_onboarding_dashboard/` |
| 24 | GET | `/api/vehicle_status_metrics/` |
| 25 | GET | `/api/ambulance_fleet_metrics/` |
| 26 | GET | `/api/police_fleet_metrics/` |
| 27 | GET | `/api/central_api/` |

### User Management
| # | Method | Endpoint |
|---|--------|---------|
| 28 | GET | `/api/get_list/` |
| 29 | GET | `/api/get_details/{userId}` |
| 30 | POST | `/api/create_user/` |
| 31 | PUT | `/api/update_user/{id}/` |
| 32 | POST | `/api/deactivateUser/` |
| 33 | POST | `/api/activateUser/` |
| 34 | POST | `/api/resend_usercreation_otp/` |
| 35 | POST | `/api/create_systemadmin/` |
| 36 | POST | `/api/StateAdmin/create_StateAdmin/` |
| 37 | POST | `/api/StateAdmin/filter_StateAdmin/` |
| 38 | POST | `/api/DTO_RTO/create_DTO_RTO/` |
| 39 | POST | `/api/DTO_RTO/filter_DTO_RTO/` |
| 40 | POST | `/api/VehicleOwner/create_VehicleOwner/` |
| 41 | POST | `/api/VehicleOwner/update_VehicleOwner/` |
| 42 | POST | `/api/VehicleOwner/filter_VehicleOwner/` |
| 43 | POST | `/api/update_vehicle_owner_expiry/` |
| 44 | POST | `/api/SOSAdmin/create_SOSAdmin/` |
| 45 | POST | `/api/SOSAdmin/filter_SOSAdmin/` |
| 46 | POST | `/api/SOSuser/create_SOSuser/` |
| 47 | POST | `/api/SOSuser/filter_SOSuser/` |
| 48 | POST | `/api/eSimProvider/create_eSimProvider/` |
| 49 | POST | `/api/eSimProvider/filter_eSimProvider/` |
| 50 | POST | `/api/eSimProvider/update_eSimProvider/` |
| 51 | POST | `/api/public/user_registration/` |
| 52 | POST | `/api/set_login_settings/` |
| 53 | POST | `/api/kyc_upload/` |

### Manufacturer
| # | Method | Endpoint |
|---|--------|---------|
| 54 | GET | `/api/list_manufacturers/` |
| 55 | GET | `/api/manufacturer_details/{id}` |
| 56 | POST | `/api/create_manufacturer/` |
| 57 | PUT | `/api/update_manufacturer/{id}` |
| 58 | DELETE | `/api/delete_manufacturer/{id}` |
| 59 | POST | `/api/manufacturer/create_manufacturer/` |
| 60 | POST | `/api/manufacturer/filter_manufacturers/` |
| 61 | POST | `/api/manufacturer/update_manufacturer/` |
| 62 | POST | `/api/manufacturer/filter_TechOnboardmanufacturers/` |
| 63 | POST | `/api/manufacturer/approve_tech_onboarding/` |

### Dealer
| # | Method | Endpoint |
|---|--------|---------|
| 64 | POST | `/api/dealer/create_dealer/` |
| 65 | POST | `/api/dealer/filter_dealer/` |
| 66 | POST | `/api/dealer/check_esim_status/` |

### Device Model
| # | Method | Endpoint |
|---|--------|---------|
| 67 | GET | `/api/devicemodel/devicemodelList/` |
| 68 | POST | `/api/devicemodel/devicemodelFilter/` |
| 69 | GET | `/api/devicemodel/devicemodelAwaitingStateApproval/` |
| 70 | GET | `/api/devicemodel/COPAwaitingStateApproval/` |
| 71 | POST | `/api/devicemodel/devicemodelDetails/` |
| 72 | POST | `/api/devicemodel/devicemodelCreate/` |
| 73 | POST | `/api/devicemodel/COPUpload/` |
| 74 | PUT | `/api/update_device_model/{id}` |
| 75 | DELETE | `/api/delete_device_model/{id}` |
| 76 | POST | `/api/stateadmin/reports/approved-models/` |
| 77 | POST | `/api/stateadmin/reports/approved-cops/` |
| 78 | POST | `/api/devicemodel/technical-onboarding/create/` |
| 79 | POST | `/api/devicemodel/technical-onboarding/manufacturer/list/` |
| 80 | POST | `/api/devicemodel/technical-onboarding/superadmin/list/` |
| 81 | POST | `/api/devicemodel/technical-onboarding/superadmin/mark-ongoing/` |
| 82 | POST | `/api/devicemodel/technical-onboarding/superadmin/finalize/` |

### Device Model OTP
| # | Method | Endpoint |
|---|--------|---------|
| 83 | POST | `/api/devicemodel/devicemodelManufacturerOtpVerify/` |
| 84 | POST | `/api/devicemodel/devicemodelSendStateAdminOtp/` |
| 85 | POST | `/api/devicemodel/devicemodleVerifyStateAdminOtp/` |
| 86 | POST | `/api/devicemodel/COPSendStateAdminOtp/` |
| 87 | POST | `/api/devicemodel/COPVerifyStateAdminOtp/` |
| 88 | POST | `/api/devicemodel/COPManufacturerOtpVerify/` |

### Device Stock
| # | Method | Endpoint |
|---|--------|---------|
| 89 | POST | `/api/devicestock/deviceStockFilter/` |
| 90 | GET | `/api/devicestock/deviceStockBulkSample/` |
| 91 | POST | `/api/devicestock/StockAssignToDealer/` |
| 92 | POST | `/api/devicestock/deviceStockCreate/` |
| 93 | POST | `/api/devicestock/deviceStockCreateBulk/` |
| 94 | GET | `/api/devicestock/esim_provider_list/` |
| 95 | POST | `/api/devicestock/combined/` |
| 96 | GET | `/api/sell/SellListAvailableDeviceStock/` |
| 97 | PATCH | `/api/sell/mark_device_defective/` |
| 98 | PATCH | `/api/sell/return_to_manufacturer/` |
| 99 | PATCH | `/api/sell/SellFitDevice/` |
| 100 | PATCH | `/api/sell/configure_sms_gateway/` |
| 101 | PATCH | `/api/sell/configure_sos_gateway/` |
| 102 | PATCH | `/api/sell/configure_ip_port/` |
| 103 | PATCH | `/api/sell/confirm_esim_activation/` |
| 104 | PATCH | `/api/sell/activate_esim_request/` |
| 105 | POST | `/api/esimActivateReq/create/` |
| 106 | POST | `/api/esimActivateReq/filter/` |
| 107 | POST | `/api/esimActivateReq/update/` |
| 108 | POST | `/api/device/activated_device_list/` |
| 109 | GET | `/api/device-health-status/` |
| 110 | POST | `/api/device_tag_alerts/` |
| 111 | POST | `/api/device_tags_search/` |

### Tagging
| # | Method | Endpoint |
|---|--------|---------|
| 112 | POST | `/api/tag/TagDevice2Vehicle/` |
| 113 | GET | `/api/tag/TagAwaitingOwnerApproval/` |
| 114 | GET | `/api/tag/TagAwaitingActivateTag/` |
| 115 | POST | `/api/tag/TagSendOwnerOtp/` |
| 116 | POST | `/api/tag/TagVerifyOwnerOtp/` |
| 117 | POST | `/api/tag/TagVerifyDealerOtp/` |
| 118 | POST | `/api/tag/upload_receiptPDF/` |
| 119 | POST | `/api/tag/download_receiptPDF/` |
| 120 | POST | `/api/tag/GetVahanAPIInfo/` |
| 121 | POST | `/api/tag/ActivateTag/` |
| 122 | GET | `/api/tag/TagAwaitingOwnerApprovalFinal/` |
| 123 | POST | `/api/tag/TagSendOwnerOtpFinal/` |
| 124 | POST | `/api/tag/TagVerifyOwnerOtpFinal/` |
| 125 | POST | `/api/tag/tag_status/` |
| 126 | POST | `/api/tag/tag_ownerlist/` |
| 127 | POST | `/api/tag/untag/` |
| 128 | POST | `/api/tag/retag/` |
| 129 | POST | `/api/tag/update-temp-registration/` |
| 130 | POST | `/api/tag/cancelTagDevice2Vehicle/` |
| 131 | POST | `/api/tag/TagResendDealerOtp/` |
| 132 | POST | `/api/tag/TagResendOwnerOtp/` |
| 133 | POST | `/api/tag/TagResendOwnerOtpFinal/` |
| 134 | POST | `/api/tag/StateAdmin_view_all_tagging/` |

### GPS / Live Tracking
| # | Method | Endpoint |
|---|--------|---------|
| 135 | GET | `/api/gps-data-map/` |
| 136 | GET | `/api/gps_track_data_api` |
| 137 | GET | `/api/gps_history_map/` |
| 138 | POST | `/api/get_live_vehicle_no/` |
| 139 | GET | `/api/gps-data-log-table/` |
| 140 | GET | `/api/gps-em-data-log-table/` |
| 141 | POST | `/api/gpsdata/archive/` |
| 142 | GET | `/api/gpsdata/archives/list/` |
| 143 | POST | `/api/gpsdata/restore/` |

### Geocoding
| # | Method | Endpoint |
|---|--------|---------|
| 144 | GET | `/api/geocode/` |
| 145 | GET | `/api/reverse_geocode/` |
| 146 | GET | `https://map-geocoding.gromed.in/search` |
| 147 | GET | `https://map-geocoding.gromed.in/reverse` |

### Route Management
| # | Method | Endpoint |
|---|--------|---------|
| 148 | POST | `/api/getRoute/` |
| 149 | POST | `/api/saveRoute/` |
| 150 | POST | `/api/get_routePath/` |
| 151 | POST | `/api/delRoute/` |

### SOS / Emergency Management
| # | Method | Endpoint |
|---|--------|---------|
| 152 | GET | `/api/emergency-call-listener-admin/` |
| 153 | GET | `/api/emergency-call-listener-team-lead/` |
| 154 | GET | `/api/emergency-call-listener-deskexecutive/` |
| 155 | GET | `/api/emuser-locations/` |
| 156 | POST | `/api/EM/DEx/getLiveCallList/` |
| 157 | POST | `/api/EM/DEx/broadcast/` |
| 158 | POST | `/api/EM/DEx/closeCase/` |
| 159 | POST | `/api/EM/DEx/rcvMsg/` |
| 160 | POST | `/api/EM/DEx/sendMsg/` |
| 161 | POST | `/api/EM/DEx/getCallAllLoc/` |
| 162 | POST | `/api/EM/DEx/get-media/` |
| 163 | POST | `/api/EM/DEx/getPendingCallList/` |
| 164 | POST | `/api/EM/DEx/replyCall/` |
| 165 | POST | `/api/EM/DEx/updateCaseMeta/` |
| 166 | GET | `/api/emergency-call-details/{id}/` |
| 167 | POST | `/api/broadcast-help/` |
| 168 | POST | `/api/submit_status/` |
| 169 | POST | `/api/cell_location/` |
| 170 | GET | `/api/SOS/SOS_Admin_report/` |
| 171 | GET | `/api/SOS/SOS_TL_report/` |
| 172 | GET | `/api/SOS/SOS_EX_report/` |
| 173 | GET | `/api/SOS/report/` |
| 174 | GET | `/api/SOS/monthly_metrics/` |

### EM Teams
| # | Method | Endpoint |
|---|--------|---------|
| 175 | POST | `/api/EM/create_EMteam/` |
| 176 | POST | `/api/EM/activate_EMteam/` |
| 177 | POST | `/api/EM/remove_EMteam/` |
| 178 | POST | `/api/EM/get_EMteam/` |
| 179 | POST | `/api/EM/list_EMteam/` |
| 180 | POST | `/api/EM/edit_EMteam/` |

### Trip Management
| # | Method | Endpoint |
|---|--------|---------|
| 181 | GET | `/api/trip/` |
| 182 | GET | `/api/trip/{tripId}/` |
| 183 | POST | `/api/trip/create/` |
| 184 | PUT | `/api/trip/{tripId}/update/` |
| 185 | POST | `/api/trip/{tripId}/end/` |
| 186 | POST | `/api/trip/{tripId}/cancel/` |

### Alerts & Incidents
| # | Method | Endpoint |
|---|--------|---------|
| 187 | POST | `/api/list-alerts/` |
| 188 | POST | `/api/alertlog/filter/` |
| 189 | POST | `/api/incident/filter/` |
| 190 | POST | `/api/apiLog/` |

### POI
| # | Method | Endpoint |
|---|--------|---------|
| 191 | GET | `/api/poi/list/` |
| 192 | POST | `/api/poi/create/` |
| 193 | POST | `/api/poi/update/` |
| 194 | POST | `/api/poi/delete/` |

### Notices
| # | Method | Endpoint |
|---|--------|---------|
| 195 | POST | `/api/notice/create/` |
| 196 | POST | `/api/notice/update/` |
| 197 | POST | `/api/notice/list/` |
| 198 | POST | `/api/notice/filter/` |
| 199 | POST | `/api/notice/delete/` |

### Holidays
| # | Method | Endpoint |
|---|--------|---------|
| 200 | GET | `/api/holiday/list/` |
| 201 | POST | `/api/holiday/create/` |
| 202 | POST | `/api/holiday/update/{id}/` |
| 203 | POST | `/api/holiday/delete/{id}/` |

### Settings
| # | Method | Endpoint |
|---|--------|---------|
| 204 | POST | `/api/Settings/create_settings_hp_freq/` |
| 205 | POST | `/api/Settings/filter_settings_hp_freq/` |
| 206 | POST | `/api/ota/create/` |
| 207 | POST | `/api/ota/filter/` |
| 208 | POST | `/api/Settings/create_settings_VehicleCategory/` |
| 209 | POST | `/api/Settings/filter_settings_VehicleCategory/` |
| 210 | POST | `/api/Settings/create_settings_State/` |
| 211 | POST | `/api/Settings/filter_settings_State/` |
| 212 | POST | `/api/Settings/create_settings_District/` |
| 213 | POST | `/api/Settings/filter_settings_District/` |
| 214 | POST | `/api/Settings/create_settings_firmware/` |
| 215 | POST | `/api/Settings/filter_settings_firmware/` |
| 216 | POST | `/api/Settings/create_settings_ip/` |
| 217 | POST | `/api/Settings/filter_settings_ip/` |
| 218 | POST | `/api/download/` |
| 219 | GET | `/api/Settings/archive_database/` |
| 220 | POST | `/api/Settings/restore_database/` |
| 221 | GET | `/api/user/notification-preferences/` |
| 222 | POST | `/api/user/notification-preferences/` |
| 223 | POST | `/api/mqtt/send_command/` |

### Test Agency
| # | Method | Endpoint |
|---|--------|---------|
| 224 | POST | `/api/testAgency/create_testAgency/` |
| 225 | POST | `/api/testAgency/update_testAgency/` |
| 226 | POST | `/api/testAgency/list/` |
| 227 | POST | `/api/testAgency/name_list/` |
| 228 | POST | `/api/testAgency/details/create/` |
| 229 | POST | `/api/testAgency/details/update/` |
| 230 | GET | `/api/testAgency/details/list/` |
| 231 | POST | `/api/testAgency/device_models/` |

### School Bus
| # | Method | Endpoint |
|---|--------|---------|
| 232 | POST | `/api/schoolbus/schools/applications/send-otp` |
| 233 | GET | `/school/api/state-admin/schools/` |
| 234 | POST | `/school/api/schools/apply/` |
| 235 | PUT | `/api/schoolbus/schools/applications/{appId}/review` |
| 236 | POST | `/api/schoolbus/schools/applications/{appId}/issue-credentials` |
| 237 | POST | `/school/api/state-admin/schools/{applicationId}/decision/` |
| 238 | GET | `/api/schoolbus/holidays` |
| 239 | POST | `/api/schoolbus/holidays` |
| 240 | GET | `/api/schoolbus/reports/unplanned-usage` |
| 241 | GET | `/api/schoolbus/reports/attendance` |
| 242 | GET | `/api/schoolbus/reports/trips` |
| 243 | GET | `/api/schoolbus/reports/traffic` |
| 244 | GET | `/api/schoolbus/alerts/feed` |
| 245 | GET | `/api/schoolbus/alerts/{parentId}` |
| 246 | GET | `/school/api/admin/buses/tag/history/` |
| 247 | POST | `/school/api/admin/buses/tag/initiate/` |
| 248 | POST | `/school/api/admin/buses/tag/{tagId}/verify-otp/` |
| 249 | POST | `/school/api/admin/buses/tag/{tagId}/documents/` |
| 250 | GET | `/api/schoolbus/routes` |
| 251 | POST | `/api/schoolbus/routes` |
| 252 | PUT | `/api/schoolbus/routes/{id}` |
| 253 | DELETE | `/api/schoolbus/routes/{id}` |
| 254 | GET | `/api/schoolbus/routes/{routeId}/stops` |
| 255 | POST | `/api/schoolbus/routes/{routeId}/stops` |
| 256 | PUT | `/api/schoolbus/stops/{stopId}` |
| 257 | DELETE | `/api/schoolbus/stops/{stopId}` |
| 258 | GET | `/school/api/admin/buses/available/` |
| 259 | GET | `/api/schoolbus/routes/options` |
| 260 | GET | `/api/schoolbus/assignments` |
| 261 | POST | `/api/schoolbus/assign` |
| 262 | PUT | `/api/schoolbus/reassign/{busId}` |
| 263 | DELETE | `/api/schoolbus/untag/{busId}` |
| 264 | GET | `/api/schoolbus/parents` |
| 265 | POST | `/api/schoolbus/parents` |
| 266 | PUT | `/api/schoolbus/parents/{parentId}` |
| 267 | DELETE | `/api/schoolbus/parents/{parentId}` |
| 268 | GET | `/api/schoolbus/students` |
| 269 | POST | `/api/schoolbus/students` |
| 270 | PUT | `/api/schoolbus/students/{studentId}` |
| 271 | DELETE | `/api/schoolbus/students/{studentId}` |
| 272 | GET | `/api/schoolbus/tracking/{studentId}` |

---

*Generated from static analysis of `/src/routes/`, `/src/services/`, `/src/actions/`, and `/src/views/` — 2026-05-17*
