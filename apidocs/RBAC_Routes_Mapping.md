# RBAC Module Access Reference with Routes

**Generated:** 2026-06-15  
**Source:** `RolePermissionConfig` table (live DB)  
**Actions legend:** V = View · C = Create · U = Update · D = Delete · F = Filter  
**Scope legend:** `national` → all data · `state` → assigned state · `manufacturer` → own company · `district` → assigned district · `dealer` → own handled · `owner` → own vehicles · `self` → own records only

---

## 1. System Admin (`superadmin`)

**Data scope:** National — all data  
**Total modules:** 142 (full CRUD on every module)

### 1.1 Dashboards
| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V,C,U,D,F | national | `/dashboard` |
| `dashboard_morth` | V,C,U,D,F | national | `/morth-dashboard` |
| `dashboard_central` | V,C,U,D,F | national | `/superadmin-dashboard` |

### 1.2 School Bus System
| Module | Actions | Scope | Route |
|---|---|---|---|
| `sbs_dashboard` | V,C,U,D,F | national | `/schoolbus` |
| `sbs_bus_tagging` | V,C,U,D,F | national | `/schoolbus/bus-tagging` |
| `sbs_route_mgmt` | V,C,U,D,F | national | `/schoolbus/route-management` |
| `sbs_bus_assignment` | V,C,U,D,F | national | `/schoolbus/bus-assignment` |
| `sbs_profile_mgmt` | V,C,U,D,F | national | `/schoolbus/profile-management` |
| `sbs_school_reports` | V,C,U,D,F | national | `/schoolbus/reports` |
| `sbs_create_school` | V,C,U,D,F | national | `/schoolbus/Create-School` |
| `sbs_approve_school` | V,C,U,D,F | national | `/schoolbus/Approve-School` |
| `sbs_bus_tracking` | V,C,U,D,F | national | `/schoolbus/bus-tracking` |
| `sbs_create_trip` | V,C,U,D,F | national | `/schoolbus/create-trip` |
| `sbs_parent_tracking` | V,C,U,D,F | national | `/schoolbus/parent-tracking` |

### 1.3 Test Agency
| Module | Actions | Scope | Route |
|---|---|---|---|
| `ta_create_agency` | V,C,U,D,F | national | `/new/test-agency` |
| `ta_agency_list` | V,C,U,D,F | national | `/test-agency/list` |
| `ta_create_user` | V,C,U,D,F | national | `/new/test-agency-details` |
| `ta_user_list` | V,C,U,D,F | national | `/test-agency/details-list` |
| `ta_view_models` | V,C,U,D,F | national | `/test-agency/assigned-models` |

### 1.4 Create New
| Module | Actions | Scope | Route |
|---|---|---|---|
| `cn_state_admin` | V,C,U,D,F | national | `/user/newStateAdmin` |
| `cn_m2m_provider` | V,C,U,D,F | national | `/user/newM2MUser` |
| `cn_manufacturer` | V,C,U,D,F | national | `/manufacturer/new` |
| `cn_sos_admin` | V,C,U,D,F | national | `/new/sos-admin` |
| `cn_system_admin` | V,C,U,D,F | national | `/new/system-admin` |
| `cn_dto` | V,C,U,D,F | national | `/user/newDto` |
| `cn_dealer` | V,C,U,D,F | national | `/user/newDealerAccount` |
| `cn_sos_user` | V,C,U,D,F | national | `/new/sos-user` |
| `cn_vehicle_owner` | V,C,U,D,F | national | `/new/vehicleOwner` |

### 1.5 M2M & Manufacturer Requests
| Module | Actions | Scope | Route |
|---|---|---|---|
| `m2m_registration` | V,C,U,D,F | national | `/superadmin-dashboard/m2m-registration-requests` |
| `m2m_pending` | V,C,U,D,F | national | `/device/m2m-status` |
| `m2m_rejected` | V,C,U,D,F | national | `/device/m2m-status` |
| `m2m_accepted` | V,C,U,D,F | national | `/device/m2m-status` |
| `mfr_vlt_requests` | V,C,U,D,F | national | `/superadmin-dashboard/vehicle-manufacturer-registration-requests` |
| `mfr_ais140_requests` | V,C,U,D,F | national | `/superadmin-dashboard/ais-140-device-manufacturer-registration-requests` |

### 1.6 Technical Onboarding
| Module | Actions | Scope | Route |
|---|---|---|---|
| `tech_onboarding` | V,C,U,D,F | national | `/superadmin-dashboard/technical-onboarding-requests` |
| `tech_onboarding_final` | V,C,U,D,F | national | `/stateadmin-dashboard/technical-onboarding-requests` |
| `mfr_onboarding_new` | V,C,U,D,F | national | `/manufacturer/technical-onboarding/create` |
| `mfr_onboarding_list` | V,C,U,D,F | national | `/manufacturer/technical-onboarding/list` |

### 1.7 Tracking & Playback
| Module | Actions | Scope | Route |
|---|---|---|---|
| `route_fixing` | V,C,U,D,F | national | `/route-fixing` |
| `live_tracking` | V,C,U,D,F | national | `/live-tracking` |
| `gps_tracking` | V,C,U,D,F | national | `/vehicle-tracking-report` |
| `gps_history` | V,C,U,D,F | national | `/vehicle-history` |
| `gps_clustering` | V,C,U,D,F | national | `/live-tracking` |
| `history_playback` | V,C,U,D,F | national | `/history-playback` |
| `trip_viewer` | V,C,U,D,F | national | `/trip-viewer` |
| `trip_monitor` | V,C,U,D,F | national | `/trip-planning` |
| `trip_management` | V,C,U,D,F | national | `/trip-planning` |
| `route_management` | V,C,U,D,F | national | `/route-fixing` |

### 1.8 VLTD Approval
| Module | Actions | Scope | Route |
|---|---|---|---|
| `vltd_pending_model` | V,C,U,D,F | national | `/device/list` |
| `vltd_pending_cop` | V,C,U,D,F | national | `/deviceCOP/list` |
| `vltd_approved_models` | V,C,U,D,F | national | `/device/approved-models` |
| `vltd_approved_cops` | V,C,U,D,F | national | `/device/approved-cops` |

### 1.9 Whitelist & KYC
| Module | Actions | Scope | Route |
|---|---|---|---|
| `wkyc_requests` | V,C,U,D,F | national | `/device/whitelist/requests` |
| `wkyc_device_dashboard` | V,C,U,D,F | national | `/device/whitelist/dashboard` |

### 1.10 POI
| Module | Actions | Scope | Route |
|---|---|---|---|
| `poi_viewer` | V,C,U,D,F | national | `/poi-viewer` |
| `poi_management` | V,C,U,D,F | national | `/reports/poi-report` |

### 1.11 Reports
| Module | Actions | Scope | Route |
|---|---|---|---|
| `reports` | V,C,U,D,F | national | `/reports/*` |
| `report_sos` | V,C,U,D,F | national | `/sos-report` |
| `report_notices` | V,C,U,D,F | national | `/notice/all-notice-list` |
| `report_users` | V,C,U,D,F | national | `/user/registeredUser` |
| `report_state_admin` | V,C,U,D,F | national | `/user/state-admin-list` |
| `report_manufacturer` | V,C,U,D,F | national | `/user/manufacturer-list` |
| `report_sos_admin` | V,C,U,D,F | national | `/user/sos-other-list` |
| `report_m2m_provider` | V,C,U,D,F | national | `/user/m2m-provider-list` |
| `report_dealers` | V,C,U,D,F | national | `/user/dealerList` |
| `report_vehicle_owner` | V,C,U,D,F | national | `/user/vehicle-owner-list` |
| `report_dto` | V,C,U,D,F | national | `/user/dto-user-list` |
| `report_gps_log` | V,C,U,D,F | national | `/reports/gps-data-log` |
| `report_activation_log` | V,C,U,D,F | national | `/reports/activation-log-report` |
| `report_emergency_data` | V,C,U,D,F | national | `/reports/emergency-data-logs` |
| `report_health_packet` | V,C,U,D,F | national | `/reports/health-packet-log` |
| `report_event_data` | V,C,U,D,F | national | `/reports/api-data-log` |
| `report_activated_device` | V,C,U,D,F | national | `/reports/activated-device-report` |
| `report_alert` | V,C,U,D,F | national | `/reports/alert-report` |
| `report_poi` | V,C,U,D,F | national | `/reports/poi-report` |
| `report_incident` | V,C,U,D,F | national | `/reports/incident-report` |
| `report_device_health` | V,C,U,D,F | national | `/reports/device-health-report` |
| `report_user_stats` | V,C,U,D,F | national | `/reports/user-statistics-report` |
| `report_violation` | V,C,U,D,F | national | `/reports/violation-report` |
| `report_sos_users` | V,C,U,D,F | national | `/user/sos-user-list` |
| `report_sos_call_list` | V,C,U,D,F | national | `/sos-call-list` |
| `report_stock` | V,C,U,D,F | national | `/device/combined-stock-report` |
| `report_fitment` | V,C,U,D,F | national | `/device/fit-device` |
| `report_device` | V,C,U,D,F | national | `/device/all-tagged-devices` |

### 1.12 Settings
| Module | Actions | Scope | Route |
|---|---|---|---|
| `settings_management` | V,C,U,D,F | national | `/setting/*` |
| `settings_notice` | V,C,U,D,F | national | `/setting/notice` |
| `settings_send_command` | V,C,U,D,F | national | `/setting/send-command` |
| `settings_vehicle_type` | V,C,U,D,F | national | `/setting/vehicle-category` |
| `settings_vehicle_category` | V,C,U,D,F | national | `/setting/vehicle-category-code` |
| `settings_alert_notif` | V,C,U,D,F | national | `/setting/notification-preferences` |
| `settings_state_district` | V,C,U,D,F | national | `/setting/state-district` |
| `settings_ota_firmware` | V,C,U,D,F | national | `/setting/frequency-firmware` |
| `settings_archive_restore` | V,C,U,D,F | national | `/setting/archive-restore` |
| `settings_ip` | V,C,U,D,F | national | `/setting/ip-settings` |
| `settings_login` | V,C,U,D,F | national | `/setting/login-settings` |
| `settings_permit_cond` | V,C,U,D,F | national | `/setting/permit-conditions` |
| `settings_custom_alerts` | V,C,U,D,F | national | `/setting/custom-alerts` |

### 1.13 Passenger Info System
| Module | Actions | Scope | Route |
|---|---|---|---|
| `pis_bus_stops` | V,C,U,D,F | national | `/pis/bus-stops` |
| `pis_bus_routes` | V,C,U,D,F | national | `/pis/bus-routes` |
| `pis_bus_schedules` | V,C,U,D,F | national | `/pis/bus-schedules` |

### 1.14 State Transport Analytics
| Module | Actions | Scope | Route |
|---|---|---|---|
| `sta_trip_analysis` | V,C,U,D,F | national | `/analytics/trip-analysis` |
| `sta_driving_patterns` | V,C,U,D,F | national | `/analytics/driving-alerts` |
| `sta_vehicle_alerts` | V,C,U,D,F | national | `/analytics/vehicle-alerts` |
| `sta_pis_summary` | V,C,U,D,F | national | `/analytics/pis-summary` |
| `sta_operational` | V,C,U,D,F | national | `/analytics/operational` |
| `sta_comparative` | V,C,U,D,F | national | `/analytics/comparative-analysis` |
| `sta_resource_perf` | V,C,U,D,F | national | `/analytics/resource-performance` |

### 1.15 Custom User Module
| Module | Actions | Scope | Route |
|---|---|---|---|
| `cum_custom_roles` | V,C,U,D,F | national | `/setting/rbac/roles` |
| `cum_feature_perms` | V,C,U,D,F | national | `/setting/rbac/permissions` |
| `cum_user_mgmt` | V,C,U,D,F | national | `/setting/rbac/custom-users` |

### 1.16 Complaint Tickets
| Module | Actions | Scope | Route |
|---|---|---|---|
| `complaint` | V,C,U,D,F | national | `/helpdesk/tickets` |
| `ct_my_dashboard` | V,C,U,D,F | national | `/helpdesk/tickets` |
| `ct_create` | V,C,U,D,F | national | `/helpdesk/tickets/new` |
| `ct_all_tickets` | V,C,U,D,F | national | `/staff/tickets` |
| `ct_escalated` | V,C,U,D,F | national | `/helpdesk/tickets` |

### 1.17 Device, Stock & Management
| Module | Actions | Scope | Route |
|---|---|---|---|
| `device_management` | V,C,U,D,F | national | `/device/new` |
| `device_stock` | V,C,U,D,F | national | `/device/show-available-device` |
| `dm_create_model` | V,C,U,D,F | national | `/deviceModel/new` |
| `dm_tac_cop` | V,C,U,D,F | national | `/deviceModel/extension` |
| `ds_individual` | V,C,U,D,F | national | `/device/show-device` |
| `ds_bulk` | V,C,U,D,F | national | `/device/bulkupload` |
| `ds_assign` | V,C,U,D,F | national | `/device/bulk-assign` |
| `dealer_m2m_status` | V,C,U,D,F | national | `/device/m2m-status` |
| `dealer_request_m2m` | V,C,U,D,F | national | `/device/m2m-activation` |
| `dealer_tag_device` | V,C,U,D,F | national | `/device/fit-device` |
| `dealer_untagged` | V,C,U,D,F | national | `/device/show-available-device` |
| `dealer_download_cert` | V,C,U,D,F | national | `/device/show-tagged-device` |
| `dealer_management` | V,C,U,D,F | national | `/user/dealerList` |
| `vehicle_tagging` | V,C,U,D,F | national | `/device/fit-device` |
| `driver_management` | V,C,U,D,F | national | `/new/otherUser` |
| `owner_management` | V,C,U,D,F | national | `/user/vehicle-owner-list` |
| `manufacturer_management` | V,C,U,D,F | national | `/user/manufacturer-list` |
| `esim_management` | V,C,U,D,F | national | `/device/activation-request/:deviceStatus` |

### 1.18 Emergency & SOS
| Module | Actions | Scope | Route |
|---|---|---|---|
| `emergency_management` | V,C,U,D,F | national | `/sos-alert` |
| `emergency_teams` | V,C,U,D,F | national | `/list/em-team` |
| `em_team_create` | V,C,U,D,F | national | `/new/em-team` |
| `em_team_list` | V,C,U,D,F | national | `/list/em-team` |
| `sos_call_list` | V,C,U,D,F | national | `/sos-call-list` |

### 1.19 Other Management
| Module | Actions | Scope | Route |
|---|---|---|---|
| `alerts` | V,C,U,D,F | national | `/alert-list` |
| `notice_management` | V,C,U,D,F | national | `/notice/all-notice-list` |
| `user_management` | V,C,U,D,F | national | `/user/list` |

---

## 2. State Admin (`stateadmin`)

**Data scope:** State — assigned state only  
**Total modules:** 33

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V,F | state | `/dashboard` |
| `dashboard_central` | V,F | state | `/superadmin-dashboard` |
| `cn_dto` | V,C,F | state | `/user/newDto` |
| `tech_onboarding_final` | V,C,F | state | `/stateadmin-dashboard/technical-onboarding-requests` |
| `route_fixing` | V,F | state | `/route-fixing` |
| `live_tracking` | V,F | state | `/live-tracking` |
| `gps_tracking` | V,F | state | `/vehicle-tracking-report` |
| `gps_clustering` | V,F | state | `/live-tracking` |
| `alerts` | V,F | state | `/alert-list` |
| `notice_management` | V,C,U,F | state | `/notice/all-notice-list` |
| `report_dealers` | V,F | state | `/user/dealerList` |
| `report_vehicle_owner` | V,F | state | `/user/vehicle-owner-list` |
| `report_dto` | V,F | state | `/user/dto-user-list` |
| `report_activated_device` | V,F | state | `/reports/activated-device-report` |
| `report_alert` | V,F | state | `/reports/alert-report` |
| `report_device_health` | V,F | state | `/reports/device-health-report` |
| `reports` | V,F | state | `/reports/*` |
| `wkyc_requests` | V,C,F | state | `/device/whitelist/requests` |
| `wkyc_device_dashboard` | V,F | state | `/device/whitelist/dashboard` |
| `sta_trip_analysis` | V,F | state | `/analytics/trip-analysis` |
| `sta_driving_patterns` | V,F | state | `/analytics/driving-alerts` |
| `sta_vehicle_alerts` | V,F | state | `/analytics/vehicle-alerts` |
| `sta_pis_summary` | V,F | state | `/analytics/pis-summary` |
| `sta_operational` | V,F | state | `/analytics/operational` |
| `sta_comparative` | V,F | state | `/analytics/comparative-analysis` |
| `sta_resource_perf` | V,F | state | `/analytics/resource-performance` |
| `pis_bus_stops` | V,C,U,F | state | `/pis/bus-stops` |
| `pis_bus_routes` | V,C,U,F | state | `/pis/bus-routes` |
| `pis_bus_schedules` | V,C,U,F | state | `/pis/bus-schedules` |
| `driver_management` | V,F | state | `/new/otherUser` |
| `complaint` | V,U,F | national | `/helpdesk/tickets` |
| `user_management` | V,F | state | `/user/list` |
| `settings_management` | V,F | state | `/setting/*` |

---

## 3. M2M Provider (`esimprovider`)

**Data scope:** Manufacturer — own company's records  
**Total modules:** 10

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | national | `/dashboard` |
| `m2m_pending` | V,U,F | manufacturer | `/device/m2m-status` |
| `m2m_rejected` | V,F | manufacturer | `/device/m2m-status` |
| `m2m_accepted` | V,F | manufacturer | `/device/m2m-status` |
| `wkyc_requests` | V,C,F | manufacturer | `/device/whitelist/requests` |
| `wkyc_device_dashboard` | V,F | manufacturer | `/device/whitelist/dashboard` |
| `device_stock` | V,U,F | national | `/device/show-available-device` |
| `esim_management` | V,C,U,F | national | `/device/activation-request/:deviceStatus` |
| `reports` | V,F | national | `/reports/*` |
| `notice_management` | V | national | `/notice/all-notice-list` |

---

## 4. Manufacturer (`devicemanufacture`)

**Data scope:** Manufacturer — own company's devices  
**Total modules:** 29

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | manufacturer | `/dashboard` |
| `cn_dealer` | V,C,F | manufacturer | `/user/newDealerAccount` |
| `dm_create_model` | V,C,U,F | manufacturer | `/deviceModel/new` |
| `dm_tac_cop` | V,C,U,F | manufacturer | `/deviceModel/extension` |
| `mfr_onboarding_new` | V,C,F | manufacturer | `/manufacturer/technical-onboarding/create` |
| `mfr_onboarding_list` | V,F | manufacturer | `/manufacturer/technical-onboarding/list` |
| `ds_individual` | V,C,U,F | manufacturer | `/device/show-device` |
| `ds_bulk` | V,C,U,F | manufacturer | `/device/bulkupload` |
| `ds_assign` | V,C,F | manufacturer | `/device/bulk-assign` |
| `report_dealers` | V,F | manufacturer | `/user/dealerList` |
| `report_device` | V,F | manufacturer | `/device/all-tagged-devices` |
| `report_alert` | V,F | manufacturer | `/reports/alert-report` |
| `reports` | V,F | manufacturer | `/reports/*` |
| `settings_ota_firmware` | V,U,F | manufacturer | `/setting/frequency-firmware` |
| `settings_management` | V | manufacturer | `/setting/*` |
| `ct_my_dashboard` | V,F | manufacturer | `/helpdesk/tickets` |
| `ct_create` | V,C,F | manufacturer | `/helpdesk/tickets/new` |
| `ct_all_tickets` | V,F | manufacturer | `/staff/tickets` |
| `ct_escalated` | V,F | manufacturer | `/helpdesk/tickets` |
| `complaint` | V | manufacturer | `/helpdesk/tickets` |
| `wkyc_requests` | V,C,F | manufacturer | `/device/whitelist/requests` |
| `wkyc_device_dashboard` | V,F | manufacturer | `/device/whitelist/dashboard` |
| `device_management` | V,C,U,F | manufacturer | `/device/new` |
| `device_stock` | V,C,U,F | manufacturer | `/device/show-available-device` |
| `manufacturer_management` | V,C,U,D,F | manufacturer | `/user/manufacturer-list` |
| `alerts` | V,F | manufacturer | `/alert-list` |
| `notice_management` | V | manufacturer | `/notice/all-notice-list` |
| `user_management` | V,C,F | manufacturer | `/user/list` |
| `vehicle_tagging` | V | manufacturer | `/device/fit-device` |

---

## 5. SOS Admin (`sosadmin`)

**Data scope:** National for SOS functions; State for tracking  
**Total modules:** 24

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | state | `/dashboard` |
| `dashboard_central` | V,F | national | `/superadmin-dashboard` |
| `cn_sos_user` | V,C,F | national | `/new/sos-user` |
| `em_team_create` | V,C,U,D,F | national | `/new/em-team` |
| `em_team_list` | V,F | national | `/list/em-team` |
| `report_sos_users` | V,F | national | `/user/sos-user-list` |
| `report_sos` | V,F | national | `/sos-report` |
| `report_sos_call_list` | V,F | national | `/sos-call-list` |
| `ct_my_dashboard` | V,F | national | `/helpdesk/tickets` |
| `ct_create` | V,C,F | national | `/helpdesk/tickets/new` |
| `ct_all_tickets` | V,F | national | `/staff/tickets` |
| `ct_escalated` | V,F | national | `/helpdesk/tickets` |
| `complaint` | V,U,F | national | `/helpdesk/tickets` |
| `emergency_management` | V,C,U,F | state | `/sos-alert` |
| `emergency_teams` | V,C,U,F | state | `/list/em-team` |
| `gps_tracking` | V,F | state | `/vehicle-tracking-report` |
| `gps_history` | V,F | state | `/vehicle-history` |
| `gps_clustering` | V,F | state | `/live-tracking` |
| `poi_management` | V,F | state | `/reports/poi-report` |
| `alerts` | V,F | state | `/alert-list` |
| `reports` | V,F | state | `/reports/*` |
| `notice_management` | V,C | state | `/notice/all-notice-list` |
| `user_management` | V,C,F | state | `/user/list` |
| `vehicle_tagging` | V | state | `/device/fit-device` |

---

## 6. DTO (`dtorto`)

**Data scope:** District — assigned district  
**Total modules:** 19

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | district | `/dashboard` |
| `route_fixing` | V,F | district | `/route-fixing` |
| `live_tracking` | V,F | district | `/live-tracking` |
| `gps_tracking` | V,F | district | `/vehicle-tracking-report` |
| `gps_history` | V,F | district | `/vehicle-history` |
| `gps_clustering` | V,F | district | `/live-tracking` |
| `history_playback` | V,F | district | `/history-playback` |
| `trip_viewer` | V,F | district | `/trip-viewer` |
| `report_device` | V,F | district | `/device/all-tagged-devices` |
| `report_activated_device` | V,F | district | `/reports/activated-device-report` |
| `report_alert` | V,F | district | `/reports/alert-report` |
| `reports` | V,F | district | `/reports/*` |
| `pis_bus_stops` | V,F | district | `/pis/bus-stops` |
| `pis_bus_routes` | V,F | district | `/pis/bus-routes` |
| `pis_bus_schedules` | V,F | district | `/pis/bus-schedules` |
| `poi_management` | V,F | district | `/reports/poi-report` |
| `alerts` | V,F | district | `/alert-list` |
| `notice_management` | V | district | `/notice/all-notice-list` |
| `vehicle_tagging` | V,F | district | `/device/fit-device` |

---

## 7. Dealer (`dealer`)

**Data scope:** Dealer — own handled devices  
**Total modules:** 21

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | dealer | `/dashboard` |
| `cn_vehicle_owner` | V,C,F | dealer | `/new/vehicleOwner` |
| `dealer_m2m_status` | V,F | dealer | `/device/m2m-status` |
| `dealer_request_m2m` | V,C,F | dealer | `/device/m2m-activation` |
| `dealer_tag_device` | V,C,U,F | dealer | `/device/fit-device` |
| `dealer_untagged` | V,F | dealer | `/device/show-available-device` |
| `dealer_download_cert` | V,F | dealer | `/device/show-tagged-device` |
| `report_stock` | V,F | dealer | `/device/combined-stock-report` |
| `report_fitment` | V,F | dealer | `/device/fit-device` |
| `report_vehicle_owner` | V,F | dealer | `/user/vehicle-owner-list` |
| `reports` | V,F | dealer | `/reports/*` |
| `settings_ip` | V,U,F | dealer | `/setting/ip-settings` |
| `settings_management` | V | dealer | `/setting/*` |
| `wkyc_requests` | V,C,F | dealer | `/device/whitelist/requests` |
| `wkyc_device_dashboard` | V,F | dealer | `/device/whitelist/dashboard` |
| `dealer_management` | V | dealer | `/user/dealerList` |
| `owner_management` | V,C,F | dealer | `/user/vehicle-owner-list` |
| `gps_clustering` | V,F | dealer | `/live-tracking` |
| `alerts` | V,F | dealer | `/alert-list` |
| `notice_management` | V | dealer | `/notice/all-notice-list` |
| `user_management` | V,C,F | dealer | `/user/list` |

---

## 8. Vehicle Owner (`owner`)

**Data scope:** Owner — own vehicles only  
**Total modules:** 22

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | owner | `/dashboard` |
| `route_fixing` | V,F | owner | `/route-fixing` |
| `trip_monitor` | V,F | owner | `/trip-planning` |
| `live_tracking` | V,F | owner | `/live-tracking` |
| `gps_tracking` | V,F | owner | `/vehicle-tracking-report` |
| `gps_history` | V,F | owner | `/vehicle-history` |
| `gps_clustering` | V,F | owner | `/live-tracking` |
| `history_playback` | V,F | owner | `/history-playback` |
| `trip_viewer` | V,F | owner | `/trip-viewer` |
| `trip_management` | V,C,U,F | owner | `/trip-planning` |
| `route_management` | V,C,U,F | owner | `/route-fixing` |
| `poi_viewer` | V,F | owner | `/poi-viewer` |
| `poi_management` | V,C,U,F | owner | `/reports/poi-report` |
| `report_alert` | V,F | owner | `/reports/alert-report` |
| `report_poi` | V,F | owner | `/reports/poi-report` |
| `reports` | V,F | owner | `/reports/*` |
| `pis_bus_schedules` | V,F | owner | `/pis/bus-schedules` |
| `driver_management` | V,C,U,F | owner | `/new/otherUser` |
| `alerts` | V,F | owner | `/alert-list` |
| `notice_management` | V | owner | `/notice/all-notice-list` |
| `owner_management` | V | owner | `/user/vehicle-owner-list` |
| `vehicle_tagging` | V,F | owner | `/device/fit-device` |

---

## 9. Team Lead (`teamleader`)

**Data scope:** State for SOS / complaint; Self for core functions  
**Total modules:** 12

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | self | `/dashboard` |
| `sos_call_list` | V,F | state | `/sos-call-list` |
| `ct_my_dashboard` | V,F | state | `/helpdesk/tickets` |
| `ct_create` | V,C,F | state | `/helpdesk/tickets/new` |
| `ct_all_tickets` | V,F | state | `/staff/tickets` |
| `ct_escalated` | V,F | state | `/helpdesk/tickets` |
| `complaint` | V,U,F | national | `/helpdesk/tickets` |
| `gps_tracking` | V,F | state | `/vehicle-tracking-report` |
| `emergency_management` | V,U,F | self | `/sos-alert` |
| `emergency_teams` | V | self | `/list/em-team` |
| `alerts` | V | self | `/alert-list` |
| `manufacturer_management` | V,F | national | `/user/manufacturer-list` |

---

## 10. Desk Executive (`sosexecutive`)

**Data scope:** Self  
**Total modules:** 9

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | self | `/dashboard` |
| `sos_call_list` | V,F | self | `/sos-call-list` |
| `complaint` | V,U,F | national | `/helpdesk/tickets` |
| `gps_tracking` | V,F | state | `/vehicle-tracking-report` |
| `gps_history` | V | state | `/vehicle-history` |
| `gps_clustering` | V | state | `/live-tracking` |
| `emergency_management` | V,U | self | `/sos-alert` |
| `alerts` | V | self | `/alert-list` |
| `manufacturer_management` | V,F | national | `/user/manufacturer-list` |

---

## 11. Test Agency (`filment`)

**Data scope:** Self / National  
**Total modules:** 5

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | national | `/dashboard` |
| `ta_view_models` | V,F | self | `/test-agency/assigned-models` |
| `device_stock` | V,C,U,F | national | `/device/show-available-device` |
| `vehicle_tagging` | V,F | national | `/device/fit-device` |
| `notice_management` | V | national | `/notice/all-notice-list` |

---

## 12. School Admin (`schooladmin`)

**Data scope:** Self for school modules; Owner scope for shared tracking  
**Total modules:** 17

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | owner | `/dashboard` |
| `sbs_dashboard` | V,F | self | `/schoolbus` |
| `sbs_bus_tagging` | V,C,U,F | self | `/schoolbus/bus-tagging` |
| `sbs_bus_tracking` | V,F | self | `/schoolbus/bus-tracking` |
| `sbs_route_mgmt` | V,C,U,F | self | `/schoolbus/route-management` |
| `sbs_bus_assignment` | V,C,U,F | self | `/schoolbus/bus-assignment` |
| `sbs_profile_mgmt` | V,U,F | self | `/schoolbus/profile-management` |
| `sbs_create_trip` | V,C,F | self | `/schoolbus/create-trip` |
| `sbs_school_reports` | V,F | self | `/schoolbus/reports` |
| `gps_tracking` | V,F | owner | `/vehicle-tracking-report` |
| `gps_history` | V,F | owner | `/vehicle-history` |
| `driver_management` | V,C,U,F | owner | `/new/otherUser` |
| `trip_management` | V,F | owner | `/trip-planning` |
| `vehicle_tagging` | V,F | owner | `/device/fit-device` |
| `alerts` | V,F | owner | `/alert-list` |
| `reports` | V,F | owner | `/reports/*` |
| `notice_management` | V | owner | `/notice/all-notice-list` |

---

## 13. Parent User (`parentuser`)

**Data scope:** Self  
**Total modules:** 2

| Module | Actions | Scope | Route |
|---|---|---|---|
| `dashboard` | V | owner | `/dashboard` |
| `sbs_parent_tracking` | V | self | `/schoolbus/parent-tracking` |
