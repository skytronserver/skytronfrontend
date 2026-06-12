# Skytron Frontend — Functionality & Architecture Reference

> **Purpose:** Canonical reference for all future tasks. Covers platform overview, feature domains, routing, state management, design system, coding conventions, and API patterns.  
> **Last Updated:** 2026-06-12

> **Sections added 2026-06-12:** §18 (Role catalogue), §19 (Role → Page access matrix), §20 (Environment restrictions), §21 (How to add a new role)

---

## 1. Platform Overview

**Skytron** is a GPS-based vehicle tracking and fleet management platform built primarily for Indian public transportation infrastructure. It covers public transport buses, school buses, police patrol vehicles, ambulances, and emergency response fleets.

**Core concerns:**
- Real-time and historical GPS tracking
- Emergency SOS response coordination
- School bus safety with parent visibility
- Public transport scheduling and information (PIS)
- Device lifecycle management (manufacturer → model approval → tagging → activation)
- Multi-stakeholder user management with granular RBAC
- Analytics, reports, and compliance (AIS-140 standard)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.2.0 |
| Routing | React Router v6.3.0 |
| State | Redux + redux-thunk |
| UI Library | Material-UI v5 (@mui/material, @mui/x-data-grid) |
| Forms | Formik + Yup |
| Charts | Chart.js / react-chartjs-2 + Recharts |
| Maps | Leaflet/react-leaflet, OpenLayers (ol v10.5.0), Mappls |
| HTTP | Axios (custom instance with interceptors) |
| CSS | Emotion (CSS-in-JS) + SCSS |
| i18n | i18next + react-i18next (EN / HI / AS) |
| Build | Create React App (Webpack under the hood) |
| Container | Docker + Nginx (port 5003:80) |
| PWA | Service Worker (serviceWorker.js) |

---

## 3. Environment & Configuration

### 3.1 Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `REACT_APP_BASE_URL` | Main REST API base (`https://api.gromed.in/`) |
| `REACT_APP_BHUVAN_URL/V2/V3` | NRSC Bhuvan vector tile endpoints |
| `REACT_APP_BHUVAN_RAS_URL` | Bhuvan raster tile endpoint |
| `REACT_APP_GEOCODING_URL` | Address geocoding service |
| `REACT_APP_GEOSERVER_URL` | GeoServer WMS/WFS endpoint |
| `REACT_APP_TILE_SERVER_URL` | Custom XYZ tile server |
| `REACT_APP_SATELLITE_TILE_URL` | ArcGIS satellite imagery tiles |
| `REACT_APP_SYSTEM_ENV` | `dev` / `prod` / `sos` — controls feature/role availability |

### 3.2 System Environments

| Value | Behaviour |
|---|---|
| `dev` | All roles and features enabled |
| `prod` | Standard production; SOS roles restricted |
| `sos` | Only SOS-related roles and views are accessible |

---

## 4. Source Directory Map

```
src/
├── actions/          Redux async action creators
├── assets/           Fonts, images (vehicle icons by status), global SCSS
├── components/       Shared map wrapper components (Bhuvan, OpenLayers, VideoPlayer)
├── datatables/       MUI-Datatables column/row configuration objects
├── formjson/         JSON-driven form schema definitions (field specs)
├── helper/           Utility functions (encryption, date formatting, model validation)
├── hooks/            Custom React hooks (idle detection, session timeout)
├── layout/           Layout shell components (Main, Minimal, Homepage, Landing)
├── locales/          i18n translation files (en/, hi/, as/)
├── menu-items/       Role-filtered sidebar navigation configuration
├── pages/            Top-level standalone pages (CameraFeedsView)
├── reducers/         Redux reducers (one per domain)
├── routes/           Route definitions split by domain (MainRoutes, UserRoutes, etc.)
├── services/         All API service modules (~35 files, one per domain)
├── store/            Redux store + root reducer + action constants
├── themes/           MUI theme overrides (palette, typography, component styles)
├── ui-component/     Internal component library (forms, modals, alerts, cards)
├── utils/            Misc utilities (incidentImageLoader)
└── views/            All page-level view components (~216 files)
```

---

## 5. Feature Domains

### 5.1 Authentication & Session Management

**Files:** `actions/loginActions.js`, `reducers/loginReducer.js`, `services/OtpServices.js`, `services/CaptchaServices.js`  
**Views:** `views/pages/authentication/`

**Flow:**
1. Username + password submitted → password RSA-OAEP encrypted before transmission
2. CAPTCHA validation on the login form
3. On success → OTP sent via SMS
4. OTP verified with RSA-OAEP encryption → Bearer token returned
5. Token stored in sessionStorage/localStorage; injected into every request via Axios interceptor
6. Session idle detection via `useIdle` / `useIdleTimer` hooks → auto-logout

**Encryption:**
- RSA-OAEP (SHA-1) for password and OTP fields
- Custom symmetric cipher for cookie data encoding
- Cookie format: `${name}-${role}-${mobile}-${userId}`

**Auth Routes:**
- `/login` — login form with CAPTCHA
- `/otp-login` — OTP entry
- `/forgot-password`, `/reset-password/:token`, `/new/:token`

---

### 5.2 Role-Based Access Control (RBAC)

**Files:** `services/RbacService.js`, `reducers/loginReducer.js`, `store/constant.js`

**Roles (partial list):**
`superadmin`, `stateadmin`, `owner` (vehicle owner), `dto`, `rto`, `sosadmin`, `sosexecutive`, `teamlead`, `desk_executive`, `manufacturer`, `dealer`, `m2muser`, `schooladmin`, `schoolbus_driver`

**Permission object shape per module:**
```js
{
  [module_code]: {
    view: bool, create: bool, update: bool,
    delete: bool, filter: bool, menu: bool,
    data_scope: string  // "own" | "all" | "state" etc.
  }
}
```

**Enforcement:**
- `PrivateRoute` component wraps protected routes — redirects to `/not-authorized` on failure
- Menu items filtered by role in `menu-items/index.js`
- `REACT_APP_SYSTEM_ENV` gates entire role sets at runtime

---

### 5.3 Live GPS Tracking

**Files:** `views/direct/LiveTracking.jsx`, `views/MapComponent/`, `components/Map/`  
**Maps used:** OpenLayers, Bhuvan NRSC tiles, Mappls, custom tile server

**Features:**
- Real-time vehicle position display on map
- Vehicle icons keyed to status (moving / idle / stopped / offline) — assets in `assets/images/`
- Speed, heading, altitude, PDOP/HDOP metadata per vehicle
- Multiple map layer providers (street, satellite, hybrid)
- Coordinate projection via proj4 + ol/proj (EPSG transformations)

**Related views:**
- `/live-tracking` — main tracking screen
- `/school-bus-tracking` — school fleet tracking
- `/vehicle-history` — historical data playback
- `/history-playback` — timeline scrub playback
- `/school-live-map`, `/vehicle-selection-map`

---

### 5.4 SOS / Emergency Response System

**Files:** `services/SOSManagement.js`, `views/direct/SOSAlert.jsx`, `views/sosManagement/`, `views/dashboard/super admin dashboard/SOSEmergencyDashboard.jsx`

**Sub-features:**
- SOS alert generation and acknowledgement
- Emergency team creation and listing (`CreateEMTeam.jsx`, `ListEmTeam.jsx`)
- SOS timestamp tracking
- Police dispatch views (`SOSPoliceExe.jsx`, `SosPoliceExp.jsx`)
- Dedicated dashboards: SOS Monitoring, SOS Analytics, SOS Emergency, Police Patrol, Ambulance Fleet

**Routes:**
- `/sos-alert` — alert feed
- `/sos-police-executive` — police command view
- `/sos-lead-exp` — SOS lead experience
- `/create-emergency-team`, `/emergency-team-list`, `/sos-timestamp`
- `/superadmin-dashboard/sos`, `/superadmin-dashboard/sos-analytics`

**Environment:** In `sos` env, the entire platform becomes SOS-only — non-SOS routes are hidden.

---

### 5.5 School Bus Management System

**Files:** `services/SchoolBusService.js` (34KB — most complex service), `views/schoolbus/`, `menu-items/schoolbus.js`

**Sub-features:**
- School onboarding and approval (`SchoolOnboarding.jsx`, `ApproveSchool.jsx`)
- Bus and driver assignment (`BusAssignment.jsx`)
- Route management (`RouteManagement.jsx`)
- Parent live tracking portal (`ParentTracking.jsx`, `ParentLiveMap.jsx`)
- Student/profile management (`ProfileManagement.jsx`)
- Trip creation and management (`CreateTrip.jsx`)
- Holiday calendar (`SchoolHolidays.jsx`)
- Alert center (`AlertsCenter.jsx`)
- Reports (`SchoolReports.jsx`)
- Device tagging for school buses (`SchoolBusTagging.jsx`)

---

### 5.6 Public Information System (PIS)

**Files:** `services/PISServices.js`, `views/pis/`, `menu-items/pis.js`

**Sub-features:**
- Bus stop creation, editing, and management
- Bus route definition
- Bus schedule management
- PIS analytics and reports

**Routes:** `/bus-stop-management`, `/bus-route-management`, `/bus-schedule-management`, `/pis-reports`

---

### 5.7 Route, Trip & POI Management

**Files:** `services/TripService.js`, `services/POIService.js`, `views/direct/`  
**Maps:** OpenLayers (vector geometry drawing)

**Sub-features:**
- Route definition with interactive map drawing (`RouteFixing.jsx`)
- ETA calculation and display (`RouteETA.jsx`)
- Trip planning (`TripPlanning.jsx`)
- Trip viewer (`TripViewer.jsx`)
- Points of Interest (POI) creation, display, and reporting (`POIViewer.jsx`, `/poi-report`)

---

### 5.8 Device Lifecycle Management

**Files:** `services/DeviceModelServices.js`, `services/TaggingService.js`, `services/StockServices.js`  
**Views:** `views/pages/device/`, `views/showDevice/`, `views/tagging/`, `views/detailsview/`  
**Routes:** `routes/DeviceRoutes.js`, `routes/ShowDeviceRoutes.js`, `routes/TaggingRoutes.js`

**Lifecycle stages:**
1. **Manufacturer Onboarding** — manufacturer registration and approval
2. **Device Model Creation** — model spec submission (`DeviceModelForm.jsx`)
3. **Technical Onboarding** — TAC/COP certificate validation (`isCertValid()`)
4. **AIS-140 Compliance Review** — admin review of device models against standard
5. **Stock Management** — track available inventory, sales-ready devices
6. **Tagging** — bind device IMEI to vehicle (`ConfigureDevice.jsx`)
7. **SIM Activation** — activate M2M SIM card (`SimActivation.jsx`, `ListSimActivation.jsx`)
8. **Whitelist Management** — device whitelist requests and dashboard

**Key views:** `ShowDevice.jsx`, `AvailableForSale.jsx`, `CombinedStockReport.jsx`, `AllTaggedDevice.jsx`

---

### 5.9 Multi-Stakeholder User Management

**Files:** `services/UserServices.js`, `views/forms/`, `views/user/`  
**Routes:** `routes/UserRoutes.js`

**User types managed:**
- State Admins (`StateAdmin.jsx`)
- DTO/RTO officers
- Vehicle owners
- Dealers (`DealerServices.js`)
- Manufacturers
- M2M providers (`M2MUser.jsx`, `M2MRegistrationAdminReview.jsx`)
- SOS Admins and SOS Users
- Custom module users (`customUserModule.js`)
- Test agency operators

**Patterns:**
- Dynamic form rendering driven by `formjson/` schema files
- `DynamicForm.jsx` and `UpdateForm.jsx` consume JSON schema → generate fields
- Bulk upload (`BulkUpload.jsx`) for mass user/device operations

---

### 5.10 Analytics & Reporting

**Files:** `services/AnalyticsService.js`, `services/ReportServices.js`, `views/state-transport-analytics/`, `views/reports/`

**Analytics dashboards:**
- Trip Analysis, Driving Alerts, Vehicle Alerts Count
- Summary Dashboard, Data Analytics, PIS Summary Analytics
- Resource Performance, Operational Analytics, Comparative Analysis

**Report types:**
- Alert List/Log, Activation Log, GPS Data Log
- Emergency Data Logs, API Data Log
- Device Health Report, User Statistics, Incident Report
- Violation Report, Health Packet Log, POI Report, M2M Status Report
- Activated Device Report, Combined Stock Report

---

### 5.11 Multi-Dashboards (SuperAdmin)

**Path:** `views/dashboard/super admin dashboard/`

| Dashboard | Purpose |
|---|---|
| `PublicTransportDashboard.jsx` | Overall PT fleet stats |
| `PublicSafetyDashboard.jsx` | Safety metrics |
| `PublicTransportVehicleMonitoringDashboard.jsx` | Vehicle health and uptime |
| `ERSSVehiclesDashboard.jsx` | Emergency Response Service System |
| `SOSMonitoringDashboard.jsx` | Live SOS activity |
| `SOSAnalyticsDashboard.jsx` | Historical SOS analytics |
| `SOSEmergencyDashboard.jsx` | Emergency operations center view |
| `PolicePatrolDashboard.jsx` | Police fleet overview |
| `AmbulanceFleetDashboard.jsx` | Ambulance dispatch view |

---

### 5.12 Registration & Onboarding (Public Flow)

**Files:** `views/homepage/`, `views/pages/`  
**Routes:** `routes/HomeRoutes.js`, `routes/LandingRoutes.js`

Public-facing registration and status-tracking for:
- New user registration requests
- Vehicle manufacturer registration
- AIS-140 device manufacturer registration
- M2M provider registration

Admin review counterparts:
- `M2MRegistrationAdminReview.jsx`
- `VehicleManufacturerRegistrationAdminReview.jsx`
- `AIS140DeviceManufacturerRegistrationAdminReview.jsx`

---

### 5.13 Settings & Configuration

**Files:** `views/settings/`, `routes/SettingRoutes.js`, `services/SettingService.js`

- Notification preferences
- Vehicle category and category code management
- Send command to device (remote device control)
- IP/network settings

---

### 5.14 Help & Support

- `/help-desk` — submit support ticket (`HelpDesk.jsx`, `helpDeskServices.js`)
- `/help` — help documentation page
- `/privacy-policy`, `/map-policy` — legal pages

---

## 6. Routing Architecture

Routes are split into domain-specific files, aggregated in `routes/index.js`.

| File | Domain |
|---|---|
| `MainRoutes.js` | All authenticated views (20KB — primary routing file) |
| `AuthenticationRoutes.js` | Login, OTP, password reset |
| `UserRoutes.js` | User creation and management |
| `DeviceRoutes.js` | Device management |
| `SettingRoutes.js` | Settings pages |
| `HomeRoutes.js` | Public homepage and registration |
| `LandingRoutes.js` | Marketing/landing page |
| `TaggingRoutes.js` | Device tagging flow |
| `ShowDeviceRoutes.js` | Device inventory display |
| `accessoriesRoute.js` | Accessories management |

**Route protection pattern:**
```jsx
<PrivateRoute roles={['superadmin', 'stateadmin']}>
  <SomePage />
</PrivateRoute>
```
Redirect target on failure: `/not-authorized`

**Code splitting:** All routes use `React.lazy()` wrapped in `Loadable()` HOC for bundle splitting.

---

## 7. State Management

### 7.1 Redux Store Shape

```js
{
  customization: { isOpen, fontFamily, borderRadius, opened },  // UI theme state
  userData: { ... },           // general user data
  login: {                     // auth state
    user: { isAuthenticated, token, email, otpToken },
    cookiesData: string,
    permissions: { [module_code]: { view, create, update, delete, filter, menu, data_scope } },
    loading: bool,
    error: { message, code }
  },
  users: { ... },              // user list data
  deviceModel: { ... },        // device model catalog
  stock: { ... },              // inventory data
  setting: { ... },            // app settings
  dealer: { ... },             // dealer data
  listAll: { ... }             // generic list data
}
```

### 7.2 Async Pattern (Redux-Thunk)

All API calls follow this pattern:
```js
export const someAction = (params) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await SomeService.endpoint(params);
    dispatch(setData(res.data));
  } catch (err) {
    dispatch(setError(err));
  } finally {
    dispatch(setLoading(false));
  }
};
```

### 7.3 Data Persistence

| Storage | Used for |
|---|---|
| `sessionStorage` | Auth tokens, temporary session state |
| `localStorage` | Permissions, user preferences, dealer district data |
| Encrypted cookie | Encoded identity string (`name-role-mobile-userId`) |

---

## 8. API Integration Layer

### 8.1 Axios Instance (`services/axiosInstance.js`)

- Bearer token injected from localStorage/sessionStorage on every request
- Request interceptor: adds `Authorization: Bearer <token>` header
- Response interceptor: handles 401 → auto-logout redirect
- Supports `multipart/form-data` for file uploads

### 8.2 Service Module Convention

Each domain has a dedicated service file:
```
services/
  UserServices.js       → /api/user_*
  DeviceModelServices.js → /api/device_model_*
  SchoolBusService.js   → /api/school_*
  SOSManagement.js      → /api/sos_*
  TripService.js        → /api/trip_*
  ...
```

### 8.3 Geospatial APIs

| API | Protocol | Use |
|---|---|---|
| Bhuvan NRSC (vec1/2/3) | XYZ tiles | Street/political map layers |
| Bhuvan RAS | Raster tiles | Satellite imagery |
| Custom tile server | XYZ tiles | Custom base map |
| GeoServer | WMS/WFS | Administrative boundaries, geofences |
| Geocoding service | REST | Address ↔ coordinate conversion |
| Mappls | SDK | Commercial Indian maps (mappls-web-maps) |
| ArcGIS | REST tiles | Satellite imagery fallback |

---

## 9. Map Integration

Three map libraries are used for different purposes:

| Library | Where used | Why |
|---|---|---|
| **Leaflet + react-leaflet** | CameraFeedsView | Lightweight, React-friendly |
| **OpenLayers (ol v10.5.0)** | RouteFixing, TripPlanning, RouteETA | Advanced GIS: WMS, vector geometries, proj4 projections |
| **Mappls** | MappslMap.jsx | Indian commercial map provider; alternative to OSM |

**Coordinate system:** WGS84 (EPSG:4326) for data storage; EPSG:3857 (Web Mercator) for rendering. `proj4` handles custom projections.

**Map Component Selector:** `views/MapComponent/Index.jsx` acts as a router that renders the correct map implementation based on context.

---

## 10. UI Component Architecture

### 10.1 Layout System

```
layout/
  MainLayout/     → authenticated shell (Header + Sidebar + content area)
  MinimalLayout/  → auth pages (login, reset password)
  HomepageLayout/ → public homepage shell
  LandingLayout/  → marketing landing shell
```

### 10.2 Internal Component Library (`ui-component/`)

| Component | Purpose |
|---|---|
| `CustomTextField.js` | Enhanced input with validation display (29KB) |
| `CustomModal.jsx` | Reusable dialog wrapper |
| `CustomOTP.jsx` / `OTPField.jsx` | OTP entry inputs |
| `AlertBox.jsx` / `AutoHideAlert.jsx` | Notification alerts |
| `DetailCard.jsx` | Info card layout |
| `MainCard.jsx` | Primary card container |
| `LanguageSwitcher.js` | i18n language toggle |
| `DisplayTable.jsx` | Table wrapper |
| `DialogComponent.jsx` | Generic dialog |
| `Loadable.js` | Lazy-load HOC for routes |
| `Loader.js` / `CustomLoader.jsx` | Loading spinners |
| `CustomStepper.jsx` | Multi-step form stepper |
| `InputComplete.jsx` | Input with autocomplete |

### 10.3 Dynamic Form System

Forms are driven by JSON schema files in `formjson/`:
- `deviceModel.js`, `manufacturer.js`, `M2MUser.js`, `schoolbus.js`, `sosUser.js`
- Consumed by `DynamicForm.jsx` and `UpdateForm.jsx`
- Fields declared with type, label, validation rules, options

### 10.4 Data Table System

- `datatables/Datatable.js` and `DynamicDatatables.js` define column configs
- `datatables/rowsColumn.js` (28KB) — extensive field mappings for all entity types
- Backed by `mui-datatables` library + MUI DataGrid

---

## 11. Design Principles

1. **Role-first design** — every screen, menu item, and action is filtered by the user's role and environment. Never assume a user sees everything.
2. **Environment parity** — dev/prod/sos are distinct behavioral modes, not just API URL switches. Feature gates change between them.
3. **JSON-driven forms** — reuse form schema files; don't hardcode form fields in view components.
4. **Lazy-load everything** — all routes use `Loadable()`. Add new routes the same way.
5. **Encrypted at the boundary** — passwords and OTPs are RSA-encrypted client-side before transmission. Never send plaintext credentials.
6. **Multi-language by default** — all user-visible strings should use i18n keys via `useTranslation()`. Three supported locales: `en`, `hi`, `as`.
7. **Indian mapping priority** — prefer Bhuvan NRSC and Mappls over OpenStreetMap; they carry India-specific road and administrative data.
8. **Service-layer separation** — no direct Axios calls in view components. All API calls go through a service module.

---

## 12. Coding Conventions

1. **File naming:** PascalCase for components and views, camelCase for services and utilities.
2. **Route split:** each domain owns its route file; don't pile into MainRoutes.js.
3. **Redux actions:** async actions in `actions/`; action type constants in `store/actions.js` or `store/constant.js`.
4. **Service files:** one file per domain, named `[Domain]Service.js` or `[Domain]Services.js`.
5. **Permissions check:** use `permissions[module_code]?.view` pattern from Redux store; don't hard-code role checks in JSX.
6. **Map geometry:** use OpenLayers for any route drawing or geometry editing; Leaflet only for simple marker display.
7. **Form validation:** Formik + Yup for all user-facing forms. Schema-driven where possible (see `formjson/`).
8. **Error handling:** surface errors via `AutoHideAlert` or `AlertBox`; set Redux `error` state for global errors.

---

## 13. Custom Hooks

| Hook | File | Purpose |
|---|---|---|
| `useIdle` | `hooks/useIdle.js` | Detect user inactivity |
| `useIdleTimer` | `hooks/useIdleTimer.js` | Trigger auto-logout after idle timeout |
| `useScriptRef` | `hooks/useScriptRef.js` | Track async script loading state |

---

## 14. Internationalization

**Config:** `src/i18n.js` using i18next + react-i18next  
**Locales:** `locales/en/`, `locales/hi/`, `locales/as/`  
**Switcher components:** `LanguageSwitcher.js`, `StickyLanguageSwitcher.js`  
**Usage:** `const { t } = useTranslation(); ... t('key.path')`

---

## 15. Key File Size Signals (complexity indicators)

| File | Size | Why it matters |
|---|---|---|
| `services/SchoolBusService.js` | ~34KB | Most complex service — full school transport lifecycle |
| `ui-component/CustomTextField.js` | ~29KB | Complex field with many validation modes |
| `datatables/rowsColumn.js` | ~28KB | All entity column definitions live here |
| `helper/index.js` | ~25KB | Cross-cutting utilities (encryption, model validation) |
| `routes/MainRoutes.js` | ~20KB | Primary authenticated route tree |
| `services/UserServices.js` | ~11KB | Core user management API layer |

---

## 16. Public Pages (unauthenticated)

| Route | Component | Purpose |
|---|---|---|
| `/` | `Home.jsx` | Public homepage |
| `/user-registration-request` | `UserRegistrationRequest.jsx` | Registration entry point |
| `/registration-status` | `RegistrationStatusTracker.jsx` | Check registration progress |
| `/privacy-policy` | `PrivacyPolicy.jsx` | Legal |
| `/help-desk` | `HelpDesk.jsx` | Support submission |
| `/device-stats` | `DeviceStats.jsx` | Public device statistics |
| `/camera-feeds` | `CameraFeedsView.jsx` | Live camera streams |

---

## 17. Docker / Deployment

- **Dockerfile:** multi-stage build → Nginx serving static React build
- **docker-compose.yml:** exposes port `5003:80`; environment variables injected at container start via `entrypoint.sh`
- **nginx.conf:** SPA fallback routing (`try_files $uri /index.html`)
- **entrypoint.sh:** writes runtime env vars to `window.__env` so the built app can read them without a rebuild

---

---

## 18. User Role Catalogue

The system has **two tiers** of roles:

### 18.1 Hard-coded system roles (built into route definitions)

These are baked into the `roles: [...]` arrays on every route and menu item. They cannot be renamed without editing source code.

| Role key | Display name | Who this is | Environment |
|---|---|---|---|
| `superadmin` | Super Admin | Platform-level administrator; sees everything | dev + prod |
| `stateadmin` | State Admin | State transport authority administrator | dev + prod |
| `owner` | Vehicle Owner | Fleet or vehicle owner with their own tracking | dev + prod |
| `dtorto` | DTO/RTO | District/Regional Transport Officer | dev + prod |
| `dealer` | Dealer | Device dealer — tags devices to vehicles, manages stock | dev + prod |
| `devicemanufacture` | Device Manufacturer | AIS-140 device maker — submits models, manages stock | dev + prod |
| `m2muser` | M2M Provider | SIM/connectivity provider (manages eSIM activation) | dev + prod |
| `esimprovider` | eSIM Provider | Handles SIM activation request queues | dev + prod |
| `testagency` | Test Agency | Approves device models against AIS-140 standard | dev + prod |
| `sosadmin` | SOS Admin | Manages emergency response teams and operations | dev + sos |
| `teamlead` | Team Lead | SOS team leader — restricted in `prod` env | sos only |
| `desk_ex` | Desk Executive | SOS desk operator — restricted in `prod` env | sos only |
| `sosexecutive` | SOS Executive | SOS executive operator — restricted in `prod` env | sos only |
| `schooladmin` | School Admin | Manages a school's bus fleet, routes, and profiles | dev + prod |
| `parentuser` | Parent User | Parent tracking their child's school bus (read-only map) | dev + prod |

> **Note on `dtorto` vs `dto`:** The codebase uses both spellings inconsistently. In route files `dtorto` is the canonical key; some menu items still use `dto`. When adding routes, use `dtorto`.

### 18.2 Dynamic custom roles (RBAC system)

The platform has a full **dynamic role management system** (`services/RbacService.js`, pages at `/setting/rbac/*`) accessible only to `superadmin`:

| Operation | API endpoint | Effect |
|---|---|---|
| List all roles | `GET /api/rbac/roles/` | Returns all system + custom roles |
| List active roles | `GET /api/rbac/roles/active/` | Dropdown source |
| Create custom role | `POST /api/rbac/roles/create/` | Creates new role with `code` + `display_name` |
| Update role | `POST /api/rbac/roles/update/` | Change display name/description |
| Deactivate role | `POST /api/rbac/roles/deactivate/` | Soft-delete (not permanent) |
| Get permissions | `GET /api/rbac/roles/permissions/?role_code=X` | Per-module permission set |
| Set permissions | `POST /api/rbac/roles/permissions/update/` | Assign view/create/update/delete/filter per module |
| Create custom user | `POST /api/rbac/users/create/` | New user with any role |
| Assign role | `POST /api/rbac/users/assign-role/` | Quick role change |
| Check access | `POST /api/check-user-access/` | Full permission dump on app load |
| Check module | `POST /api/check-module-access/` | Single/batch module permission check |

Custom roles work at the **module-permission level** (view/create/update/delete granularity) but do **not** automatically unlock hard-coded route guards. For a custom role to access a protected route, the route's `roles: []` array must include the custom role's `code`.

---

## 19. Role → Page Access Matrix

### 19.1 Tracking & Map views

| Route | superadmin | stateadmin | owner | dtorto | dealer | devicemanufacture | sosadmin | teamlead | desk_ex | schooladmin | parentuser | esimprovider |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/live-tracking` | ✓ | ✓ | ✓ | ✓ | | | | | | | | |
| `/vehicle-history` | ✓ | ✓ | ✓ | ✓ | | | | | | | | |
| `/history-playback` | ✓ | | ✓ | ✓ | | | | | | | | |
| `/route-fixing` | ✓ | ✓ | ✓ | ✓ | | | | | | | | |
| `/route-eta` | | | ✓ | | | | | | | | | |
| `/trip-planning` | | | ✓ | ✓ | | | | | | | | |
| `/poi-viewer` | ✓ | ✓ | ✓ | ✓ | | | | | | | | |
| `/trip-viewer` | ✓ | ✓ | ✓ | ✓ | | | | | | | | |
| `/camera-feeds` | ✓ | ✓ | | | | | | | | | | |
| `/map` | ✓ | | | | | | | | | | | |

### 19.2 Dashboards

| Route | superadmin | stateadmin | owner | dtorto | sosadmin | teamlead | desk_ex | dealer | devicemanufacture | esimprovider |
|---|---|---|---|---|---|---|---|---|---|---|
| `/dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/morth-dashboard` | ✓ | | | | | | | | | |
| `/superadmin-dashboard/*` | ✓ | | | | | | | | | |
| `/stateadmin-dashboard/*` | | ✓ | | | | | | | | |

### 19.3 SOS & Emergency

| Route | superadmin | sosadmin | teamlead | desk_ex |
|---|---|---|---|---|
| `/sos-alert` | ✓ | ✓ | | |
| `/sos-lead-exp` | ✓ | ✓ | ✓ | |
| `/sos-exe` | ✓ | ✓ | ✓ | ✓ |
| `/sos-call-list` | | ✓ | ✓ | ✓ |
| `/emcall` | ✓ | ✓ | ✓ | ✓ |
| `/sos-call-details/:id` | ✓ | ✓ | ✓ | ✓ |
| `alert-list` | ✓ | ✓ | ✓ | ✓ |
| `/new/em-team` | | ✓ | | |
| `/list/em-team` | | ✓ | | |
| `/sosTimestamp` | ✓ | ✓ | | |
| `/sos-report` | ✓ | ✓ | | |

### 19.4 School Bus System

| Route | superadmin | stateadmin | schooladmin | parentuser |
|---|---|---|---|---|
| `/schoolbus` (dashboard) | ✓ | ✓ | ✓ | |
| `/schoolbus/bus-tagging` | ✓ | ✓ | ✓ | |
| `/schoolbus/bus-tracking` | | | ✓ | |
| `/schoolbus/route-management` | ✓ | ✓ | ✓ | |
| `/schoolbus/bus-assignment` | ✓ | ✓ | ✓ | |
| `/schoolbus/profile-management` | ✓ | ✓ | ✓ | |
| `/schoolbus/create-trip` | | | ✓ | |
| `/schoolbus/holidays` | ✓ | ✓ | ✓ | |
| `/schoolbus/alerts` | ✓ | ✓ | ✓ | |
| `/schoolbus/reports` | ✓ | ✓ | ✓ | |
| `/schoolbus/Create-School` | ✓ | | | |
| `/schoolbus/Approve-School` | ✓ | | | |
| `/schoolbus/onboarding` | ✓ | ✓ | | |
| `/schoolbus/parent-tracking` | | | | ✓ |

### 19.5 Public Information System (PIS)

| Route | superadmin | stateadmin | dtorto | owner |
|---|---|---|---|---|
| `/pis/bus-stops` | ✓ | ✓ | ✓ | |
| `/pis/bus-routes` | ✓ | ✓ | ✓ | |
| `/pis/bus-schedules` | ✓ | ✓ | ✓ | ✓ |
| `/pis/reports` | ✓ | ✓ | ✓ | |

### 19.6 Analytics

| Route | superadmin | stateadmin |
|---|---|---|
| `/analytics/summary` | ✓ | ✓ |
| `/analytics/trip-analysis` | ✓ | ✓ |
| `/analytics/driving-alerts` | ✓ | ✓ |
| `/analytics/vehicle-alerts` | ✓ | ✓ |
| `/analytics/data-analytics` | ✓ | ✓ |
| `/analytics/pis-summary` | ✓ | ✓ |
| `/analytics/resource-performance` | ✓ | ✓ |
| `/analytics/operational` | ✓ | ✓ |
| `/analytics/comparative-analysis` | ✓ | ✓ |

### 19.7 Reports

| Route | superadmin | stateadmin | dtorto | owner | dealer | devicemanufacture | sosadmin |
|---|---|---|---|---|---|---|---|
| `/reports/gps-data-log` | ✓ | ✓ | | | | | |
| `/reports/activation-log-report` | ✓ | ✓ | | | | | |
| `/reports/emergency-data-logs` | ✓ | | | | | | |
| `/reports/api-data-log` | ✓ | | | | | | |
| `/reports/alert-log` | ✓ | ✓ | ✓ | ✓ | | | |
| `/reports/activated-device-report` | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| `/reports/alert-report` | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| `/reports/device-health-report` | ✓ | ✓ | | | | | |
| `/reports/user-statistics-report` | ✓ | | | | | | |
| `/reports/incident-report` | ✓ | | | | | | |
| `/reports/violation-report` | ✓ | ✓ | ✓ | | | | |
| `/reports/health-packet-log` | ✓ | | | | | | |
| `/reports/poi-report` | ✓ | ✓ | | ✓ | | | |
| `/sos-report` | ✓ | | | | | | ✓ |
| `/user/sos-other-list` | | | | | | | ✓ |

### 19.8 User Management

| Route | superadmin | stateadmin | dealer | devicemanufacture | sosadmin |
|---|---|---|---|---|---|
| `/user/newStateAdmin` | ✓ | | | | |
| `/user/newM2MUser` | ✓ | | | | |
| `/user/newManufacturer` | ✓ | | | | |
| `/user/newDto` | | ✓ | | | |
| `/user/newDealerAccount` | | | | ✓ | |
| `/new/vehicleOwner` | | | ✓ | | |
| `/new/sos-admin` | ✓ | | | | |
| `/new/sos-user` | | | | | ✓ |
| `/new/system-admin` | ✓ | | | | |
| `/user/registeredUser` | ✓ | | | | |
| `/user/state-admin-list` | ✓ | | | | |
| `/user/manufacturer-list` | ✓ | | | | |
| `/user/sos-user-list` | ✓ | | | | |
| `/user/m2m-provider-list` | ✓ | | | | |
| `/user/dealerList` | ✓ | ✓ | | ✓ | |
| `/user/vehicle-owner-list` | ✓ | ✓ | ✓ | | |
| `/user/dto-user-list` | | ✓ | | | |
| `/user/detail/:type/:id` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/superadmin-dashboard/m2m-registration-requests` | ✓ | | | | |
| `/superadmin-dashboard/vehicle-manufacturer-registration-requests` | ✓ | | | | |
| `/superadmin-dashboard/ais-140-device-manufacturer-registration-requests` | ✓ | | | | |
| `/stateadmin-dashboard/technical-onboarding-requests` | | ✓ | | | |
| `/superadmin-dashboard/technical-onboarding-requests` | ✓ | | | | |

### 19.9 Device Management

| Route | superadmin | stateadmin | dealer | devicemanufacture | dtorto | esimprovider |
|---|---|---|---|---|---|---|
| `/device/new` | | | | ✓ | | |
| `/device/bulkupload` | | | | ✓ | | |
| `/device/assign-device` | | | | ✓ | | |
| `/device/bulk-assign` | | | | ✓ | | |
| `/deviceModel/new` | | | | ✓ | | |
| `/deviceModel/extension` | | | | ✓ | | |
| `/manufacturer/onboarding` | | | | ✓ | | |
| `/manufacturer/technical-onboarding/create` | | | | ✓ | | |
| `/manufacturer/technical-onboarding/list` | | | | ✓ | | |
| `/device/list` | ✓ | ✓ | | | | |
| `/deviceCOP/list` | ✓ | ✓ | | | | |
| `/device/approved-models` | ✓ | ✓ | | | | |
| `/device/approved-cops` | ✓ | ✓ | | | | |
| `/device/show-device` | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `/device/show-available-device` | ✓ | | ✓ | ✓ | ✓ | |
| `/device/show-tagged-device` | ✓ | | ✓ | ✓ | | |
| `/device/all-tagged-devices` | ✓ | ✓ | | ✓ | | |
| `/device/combined-stock-report` | ✓ | | ✓ | ✓ | ✓ | |
| `/device/m2m-activation` | | | ✓ | | | |
| `/device/m2m-status` | | | ✓ | | | |
| `/device/activation-request/:status` | | | | | | ✓ |
| `/device/whitelist/requests` | ✓ | ✓ | ✓ | ✓ | | ✓ |
| `/device/whitelist/dashboard` | ✓ | ✓ | ✓ | ✓ | | ✓ |
| `/tag/device-vehicle` | | | ✓ | | | |
| `/test-agency/assigned-models` | | | | | | | (testagency) |

### 19.10 Custom RBAC (superadmin only)

| Route | Access |
|---|---|
| `/setting/rbac/roles` | superadmin only |
| `/setting/rbac/permissions` | superadmin only |
| `/setting/rbac/custom-users` | superadmin only |

---

## 20. Environment-Based Role Restrictions

The `PrivateRoute` in [MainRoutes.js](src/routes/MainRoutes.js) enforces environment restrictions on top of role checks.

```
REACT_APP_SYSTEM_ENV = dev  → No extra restriction. All roles work normally.

REACT_APP_SYSTEM_ENV = prod → Restricted roles (teamlead, team_lead, desk_ex, desk_executive,
                               sosexecutive, sos_deskexecutive) are BLOCKED from ALL routes.
                               They see NotAuthorized even if they have the right role.

REACT_APP_SYSTEM_ENV = sos  → ONLY restricted roles (above list) can access routes.
                               All other roles (superadmin, stateadmin, owner, etc.) are BLOCKED.
                               Entire platform becomes SOS-operations-only.
```

**Practical meaning:**
- `dev`: used for development/testing; every role can log in and navigate everywhere their role permits.
- `prod`: SOS desk operators / team leads cannot log in — the platform is for fleet management only.
- `sos`: The platform instance is exclusively for SOS emergency dispatch. Fleet management roles cannot log in.

This means you can run two separate deployments on the same backend:
1. A `prod` instance for state transport / fleet operators
2. A `sos` instance for emergency dispatch teams

---

## 21. How to Add a New Role

### Option A — Custom RBAC role (no code change, module-permission based)

Use this when the new role needs per-module permission control (view/create/update/delete) but can share access to the same pages as an existing role.

1. Log in as `superadmin` → go to `/setting/rbac/roles` → **Create Role** (provide `code` and `display_name`).
2. Go to `/setting/rbac/permissions` → select the new role → assign module permissions.
3. Go to `/setting/rbac/custom-users` → create users with the new role.
4. The new role works through the `checkUserAccess` / `checkModuleAccess` API — the backend enforces it. **No frontend code change needed for module-permission pages.**
5. If the new role also needs access to hard-coded route-guarded pages (see §19), proceed to Option B.

### Option B — Hard-coded route role (code change required)

Use this when the new role needs access to existing guarded routes, or when you are building a new set of pages specifically for this role.

**Step 1 — Add the role string wherever access is needed.**

In each relevant route file (`MainRoutes.js`, `UserRoutes.js`, `DeviceRoutes.js`, etc.), add the new role key to the `roles: []` array of every route the new role should access:

```js
// routes/MainRoutes.js
{
  path: '/live-tracking',
  element: <LiveTracking />,
  roles: ['superadmin', 'stateadmin', 'owner', 'dto', 'newrolekey'],  // ← add here
},
```

**Step 2 — Add it to the sidebar menu.**

In the relevant `menu-items/*.js` file, add `'newrolekey'` to the `roles: []` of each menu item and its parent group that the new role should see:

```js
// menu-items/user.js
{
  id: 'live-tracking',
  title: 'Live Tracking',
  roles: ['superadmin', 'stateadmin', 'owner', 'dtorto', 'newrolekey'],
  ...
}
```

**Step 3 — If this role needs a dedicated creation form,** add a form view and a route:

```js
// views/forms/NewRoleForm.jsx  (new file — follow pattern of DtoRto.jsx)

// routes/UserRoutes.js
{
  path: '/user/newRoleName',
  element: <NewRoleForm />,
  roles: ['superadmin'],  // only superadmin can create users of this type
}
```

**Step 4 — If environment restriction applies,** update the `isRestrictedRole` list in `MainRoutes.js:122`:

```js
const isRestrictedRole = [
  'teamlead', 'team_lead', 'team lead',
  'sos_teamlead', 'desk_ex', 'desk_executive',
  'desk executive', 'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive',
  'newrolekey'  // ← add here if this role should be prod-blocked / sos-only
].includes(normalizedRole);
```

**Step 5 — Add to dashboard menu group roles (if applicable):**

```js
// menu-items/dashboard.js
const dashboard = {
  roles: ['superadmin', 'stateadmin', ..., 'newrolekey'],
  ...
}
```

### Option C — Hybrid (Custom RBAC + route access)

Create the role via Option A (RBAC UI), then perform Step 1 & 2 of Option B to give it access to specific route-guarded pages. This is the most flexible approach for roles that need a unique mix of module permissions and page access.

---

*End of document. Use section numbers as shorthand in future task requests (e.g., "add a route per §6", "follow service conventions in §8.2", "add a new role per §21").*
