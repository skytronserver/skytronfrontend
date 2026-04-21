import { display } from "@mui/system";
import { openFile, getRole } from "../helper";
const user_type = {
  teamlead: "Team Lead",
  desk_ex: "Desk Executive",
  police_ex: "Police Executive",
  ambulance_ex: "Ambulance Executive",
  PCR: "Police Control Room",
  ACR: "Ambulance Control Room",
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const role = getRole();
export const showDeviceColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "imei", label: "IMEI", options: { filter: false, sort: false } },
  { name: "model", label: "Model", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => (<p>{value.model_name}</p>), csvExportKey: "model_name" } },
  { name: "device_esn", label: "ESN", options: { filter: true, sort: false } },
  { name: "esim_validity", label: "M2M Validity", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => (<p>{formatDate(value)}</p>) } },
  {
    name: "esim_provider", label: "M2M Provider", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => (
        <p>{Array.isArray(value) && value[0] ? value[0].company_name : ''}</p>
      ), csvExportKey: "company_name", columnKey: 0
    }
  },
  { name: "iccid", label: "Primary ICCID", options: { filter: false, sort: false } },
  { name: "iccid", label: "Fallback ICCID", options: { filter: false, sort: false } },
  { name: "telecom_provider1", label: "Telecom 1", options: { filter: false, sort: false } },
  { name: "telecom_provider2", label: "Telecom 2", options: { filter: false, sort: false } },
  { name: "msisdn1", label: "Primary MSISDN", options: { filter: false, sort: false } },
  { name: "msisdn2", label: "Fallback MSISDN", options: { filter: false, sort: false } },
  { name: "stock_status", label: "Status", options: { filter: true, sort: false, customBodyRender: (value) => (<p>{value === "Not Assigned" || value === null ? <span style={{ color: "red" }}>Not Assigned</span> : <span style={{ color: "green" }}>{value}</span>}</p>) } },
  { name: "remarks", label: "Remarks", options: { filter: false, sort: false } },
  { name: "created_by", label: "Created By", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => (<p>{value.name}</p>), csvExportKey: "name" } },
  { name: "created", label: "Created", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => (<p>{formatDate(value)}</p>) } },
];

export const dealerListColumn = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  {
    name: "manufacturer", label: "Manufacturer", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.company_name}</p>
        );
      }, csvExportKey: "company_name"
    }
  },
  {
    name: "users", label: "Name", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0]?.name}</p>
        );
      }, csvExportKey: "name"
    }
  },
  {
    name: "users", label: "User Email", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      }, csvExportKey: "email", columnKey: 0
    }
  },
  {
    name: "users", label: "User Mobile", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      }, csvExportKey: "mobile", columnKey: 0
    }
  },
  { name: "company_name", label: "Company Name", options: { filter: true, sort: false } },
  {
    name: "districts", label: "State", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0]?.state_info?.state}</p>
        );
      }, csvExportKey: "state"
    }
  },
  {
    name: "districts", label: "District", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.map((item) => {
            return (
              <p>{item.district}</p>
            )
          })}</p>
        )
      }
    }
  },
  { name: "gstnnumber", label: "GST No.", options: { filter: true, sort: false } },
  { name: "idProofno", label: "ID Proof Number", options: { filter: true, sort: false, display: role === 'superadmin' || role === 'stateadmin' } },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  {
    name: "users", label: "Created By", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      }, csvExportKey: "created_by_name", columnKey: 0
    }
  },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },
];
export const sosListColumn = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  // { name: "user_type", label: "Type", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => { return (
  //   <p>{user_type?.[value] ?? value}</p>
  // ); }, csvExportKey: "Type", columnKey:0 } },
  {
    name: "users", label: "User Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      }, csvExportKey: "name", columnKey: 0
    }
  },
  {
    name: "users", label: "User Mobile", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      }, csvExportKey: "mobile", columnKey: 0
    }
  },
  {
    name: "users", label: "User Email", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      }, csvExportKey: "email", columnKey: 0
    }
  },
  {
    name: "state_info", label: "State", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.state}</p>
        );
      }, csvExportKey: "state"
    }
  },
  { name: "idProofno", label: "ID Proof Number", options: { filter: true, sort: false } },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  {
    name: "users", label: "Created By", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      }, csvExportKey: "created_by_name", columnKey: 0
    }
  },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },

];
export const dtoListColumn = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },

  {
    name: "users", label: "User Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      }, csvExportKey: "name", columnKey: 0
    }
  },
  {
    name: "users", label: "User Email", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      }, csvExportKey: "email", columnKey: 0
    }
  },
  {
    name: "users", label: "User Mobile", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      }, csvExportKey: "mobile", columnKey: 0
    }
  },
  {
    name: "state_info", label: "State", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.state}</p>
        )
      }, csvExportKey: "state"
    }
  },
  { name: "district", label: "District code", options: { filter: false, sort: false } },
  { name: "idProofno", label: "ID Proof Number", options: { filter: true, sort: false } },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  { name: "dto_rto", label: "DTO/RTO", options: { filter: true, sort: false } },
  {
    name: "users", label: "Created By", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      }, csvExportKey: "created_by_name", columnKey: 0
    }
  },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },
];
export const emTeamColumns = [
  { name: "id", label: "ID", options: { filter: true, sort: true, display: false } },
  { name: "name", label: "Team Name", options: { filter: false, sort: false } },
  {
    name: "state", label: "State", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.state}</p>
        );
      }, csvExportKey: "state"
    }
  },
  {
    name: "teamlead", label: "Team Lead", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{(value.users[0].name).toString()}</p>
        );
      }
    }
  },
  {
    name: "members", label: "Team Members", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        const teamMembers = value.map((item) => { return item?.users?.[0].name; }); return (
          <p>{teamMembers.toString()}</p>
        );
      }
    }
  },
  { name: "detail", label: "Shift", options: { filter: true, sort: false } },
  { name: "status", label: "Status", options: { filter: false, sort: false } },
  {
    name: "created_by", label: "Created By", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.createdby_info?.created_by_name}</p>
        )
      }, csvExportKey: "created_by_name"
    }
  },
  { name: "created_at", label: "Created On", options: { filter: true, sort: false } },

];

export const columns = [
  { name: "id", label: "ID", options: { filter: true, sort: true, display: false } },
  { name: "title", label: "Title", options: { filter: true, sort: false } },
  { name: "body", label: "Body", options: { filter: true, sort: false } },
];

export const registeredUserColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "role", label: "Role", options: { filter: true, sort: false, customBodyRender: (value) => {
    if (value === 'superadmin') return <p>System Admin</p>;
    if (value === 'esimprovider') return <p>M2M Provider</p>;
    return <p>{value}</p>;
  } } },
  { name: "name", label: "User Name", options: { filter: false, sort: false } },
  { name: "email", label: "User Email", options: { filter: false, sort: false } },
  { name: "mobile", label: "User Mobile Number", options: { filter: false, sort: false } },
  { name: "status", label: "Status", options: { filter: false, sort: false } },
  {
    name: "created_by_name", label: "Created By", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.replace(/_/g, " ")}</p>
        );
      }
    }
  },
  {
    name: "created", label: "Created On", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{new Date(value).toLocaleDateString("en-GB")}</p>
        );
      }
    }
  },
  {
    name: "is_active", label: "Active Status", options: {
      filter: false, sort: false, display: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value ? "Active" : "Deactivated"}</p>
        );
      }
    }
  },
];

export const manufacturerColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  {
    name: "manufacturer_type", label: "Reference No", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta) => {
        const id = tableMeta.rowData[0];
        const prefix = value === "Vehicle manufacturer" ? "VEHICLE-MANUFACTURER" : value === "Device manufacturer" ? "AIS-140-DEVICE-MANUFACTURER" : "MANUFACTURER";
        return <p>{prefix}/{id}</p>;
      }
    }
  },
  {
    name: "users", label: "Applicant Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      }, csvExportKey: "name", columnKey: 0
    }
  },
  {
    name: "users", label: "Applicant Email Id", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      }, csvExportKey: "email", columnKey: 0
    }
  },
  {
    name: "users", label: "Applicant Mobile", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      }, csvExportKey: "mobile", columnKey: 0
    }
  },
  {
    name: "state", label: "State", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.state}</p>
        );
      }, csvExportKey: "state"
    }
  },
  { name: "idProofno", label: "Applicant ID Proof Number", options: { filter: true, sort: false } },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  {
    name: "users", label: "Applicant Status", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.[0]?.status}</p>
        );
      }, csvExportKey: "status", columnKey: 0
    }
  },

  { name: "company_name", label: "Company Name", options: { filter: false, sort: false } },
  { name: "company_address", label: "Company Address", options: { filter: false, sort: false } },
  { name: "company_pin", label: "Company PIN", options: { filter: false, sort: false } },
  { name: "gstnnumber", label: "GSTN No.", options: { filter: true, sort: false } },
  { name: "panno", label: "PAN No.", options: { filter: false, sort: false } },
  { name: "company_registration_no", label: "Company Registration No", options: { filter: false, sort: false } },
  { name: "assam_office_address", label: "Assam Office Address", options: { filter: false, sort: false, display: true } },
  { name: "assam_office_pin", label: "Assam Office PIN", options: { filter: false, sort: false, display: true } },
  { name: "assam_office_phone", label: "Assam Office Phone", options: { filter: false, sort: false, display: true } },
  { name: "assam_office_lat", label: "Assam Office Lat", options: { filter: false, sort: false, display: true } },
  { name: "assam_office_lon", label: "Assam Office Lon", options: { filter: false, sort: false, display: true } },

  {
    name: "esim_provider", label: "M2M Provider", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0]?.company_name}</p>
        );
      }, csvExportKey: "company_name"
    }
  },
  { name: "manufacturer_type", label: "Manufacturer Type", options: { filter: false, sort: false } },
  { name: "tac_no", label: "TAC No", options: { filter: false, sort: false } },
  { name: "tac_validity", label: "TAC Validity", options: { filter: false, sort: false } },
  { name: "cop_no", label: "COP No", options: { filter: false, sort: false } },
  { name: "cop_validity", label: "COP Validity", options: { filter: false, sort: false } },
  { name: "status", label: "Request Status", options: { filter: false, sort: false } },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },
];
export const serviceProviderCol = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "id", label: "Reference No", options: { filter: true, sort: false, customBodyRender: (value) => { return <p>M2M/{value}</p>; } } },
  { name: "company_name", label: "Company Name", options: { filter: false, sort: false } },
  { name: "company_email", label: "Company Email", options: { filter: false, sort: false } },
  {
    name: "users", label: "Applicant Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      }, csvExportKey: "name", columnKey: 0
    }
  },
  {
    name: "users", label: "Applicant Email", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      }, csvExportKey: "email", columnKey: 0
    }
  },

  {
    name: "users", label: "Applicant Mobile", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      }, csvExportKey: "mobile", columnKey: 0
    }
  },
  {
    name: "state", label: "State", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.state}</p>
        );
      }, csvExportKey: "state"
    }
  },
  { name: "idProofno", label: "Applicant ID Proof Number", options: { filter: true, sort: false } },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  {
    name: "users", label: "Status", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.[0]?.status}</p>
        );
      }, csvExportKey: "status", columnKey: 0
    }
  },

  { name: "company_address", label: "Company Address", options: { filter: false, sort: false } },
  { name: "company_pin", label: "Company PIN", options: { filter: false, sort: false } },
  { name: "gstnnumber", label: "GSTN No.", options: { filter: true, sort: false } },
  { name: "panno", label: "PAN No.", options: { filter: false, sort: false } },
  { name: "company_registration_no", label: "Company Registration No", options: { filter: false, sort: false } },

  {
    name: "telecomProviders", label: "Telecom Providers", options: {
      filter: false, sort: false, customBodyRender: (value) => {
        if (!value) return <p />;
        const arr = Array.isArray(value) ? value : [];
        return <p>{arr.join(", ")}</p>;
      }
    }
  },
  { name: "m2m_reg_certificate_no", label: "M2M Reg Certificate No", options: { filter: false, sort: false } },

  { name: "status", label: "Request Status", options: { filter: false, sort: false } },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },

];
export const stateAdminColumn = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "users", label: "User Name", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => { return (<p>{value[0].name}</p>); }, csvExportKey: "name", columnKey: 0 } },
  { name: "users", label: "User Email Id", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => { return (<p>{value[0].email}</p>); }, csvExportKey: "email", columnKey: 0 } },
  { name: "users", label: "User Mobile", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => { return (<p>{value[0].mobile}</p>); }, csvExportKey: "mobile", columnKey: 0 } },
  { name: "idProofno", label: "ID Proof No", options: { filter: true, sort: false } },
  { name: "state_info", label: "State", options: { filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => { return (<p>{value?.state}</p>); }, csvExportKey: "state" } },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  { name: "users", label: "Created By", options: { filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => { return (<p>{value[0].created_by_name}</p>); }, csvExportKey: "created_by_name", columnKey: 0 } },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },
];

export const userColumns = [
  { name: "id", label: "ID", options: { filter: true, sort: true, display: false } },
  { name: "name", label: "User Name", options: { filter: true, sort: false } },
  { name: "username", label: "Username", options: { filter: true, sort: false } },
  { name: "email", label: "User Email", options: { filter: true, sort: false } },
];
export const deviceModelColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "model_name", label: "Model", options: { filter: true, sort: false } },
  {
    name: 'eSimProviders', label: 'M2M Providers', options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0]?.company_name}</p>
        )
      }, csvExportKey: "company_name"
    }
  },
  { name: "tac_no", label: "Tac No", options: { filter: false, sort: false } },
  { name: "test_agency", label: "Test Agency", options: { filter: false, sort: false } },
  { name: "tac_validity", label: "TAC Validity", options: { filter: false, sort: false } },
  { name: "vendor_id", label: "Vendor", options: { filter: false, sort: false } },
  { name: "hardware_version", label: "Hardware Version", options: { filter: false, sort: false } },
  { name: "status", label: "Status", options: { filter: false, sort: false } },
  {
    name: "manufacturer_details", label: "Manufacturer Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.company_name || tableMeta.rowData?.[9]?.name || 'N/A'}</p>
        );
      }, csvExportKey: "company_name"
    }
  },
  { name: "created", label: "Created On", options: { filter: true, sort: false } },
];
export const deviceCOPModelColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "cop_no", label: "COP No", options: { filter: true, sort: false } },
  { name: "cop_file", label: "COP File", options: { filter: false, sort: false } },
  { name: "device_model", label: "Device Model", options: { filter: false, sort: false } },
  {
    name: "manufacturer_details", label: "Manufacturer Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.company_name || tableMeta.rowData?.[4] || 'N/A'}</p>
        );
      }, csvExportKey: "company_name"
    }
  },
];
export const callListColumn = [
  { name: "call_id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "Vehicle", label: "Vehicle No", options: { filter: true, sort: false } },
  { name: "device_imei", label: "Device IMEI", options: { filter: true, sort: false } },
  { name: "status", label: "Status", options: { filter: true, sort: false } },
];
export const awaitingOwnerApproval = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "vehicle_reg_no", label: "Vehicle Registration No", options: { filter: true, sort: false } },
  { name: "engine_no", label: "Engine No", options: { filter: false, sort: false } },
  { name: "chassis_no", label: "Chassis No", options: { filter: false, sort: false } },
  { name: "vehicle_make", label: "Vehicle Make", options: { filter: false, sort: false } },
  { name: "vehicle_model", label: "Vehicle Model", options: { filter: false, sort: false } },
  {
    name: "category",
    label: "Category",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value) => {
        return value ? value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "-";
      }
    }
  },
  {
    name: "rc_file", label: "RC File", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <button onClick={(e) => openFile(e, value)}>View</button>
        );
      }
    }
  },
  { name: "status", label: "Status", options: { filter: false, sort: false } },
  { name: "tagged_by", label: "Tagged By", options: { filter: false, sort: false } },
  { name: "tagged", label: "Tagged Date", options: { filter: false, sort: false } },
  { name: "device", label: "Device", options: { filter: false, sort: false } },
  { name: "vehicle_owner", label: "Vehicle Owner", options: { filter: false, sort: false } },
];

export const alertListColumn = [
  { name: "call_id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "Vehicle", label: "Vehicle No", options: { filter: true, sort: false } },
  { name: "device_imei", label: "Device IMEI", options: { filter: true, sort: false } },
  { name: "status", label: "Status", options: { filter: true, sort: false } },
];
export const vehicleOwnerCols = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  {
    name: "users", label: "User Name", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      }, csvExportKey: "name", columnKey: 0
    }
  },
  {
    name: "users", label: "User Email Id", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      }, csvExportKey: "email", columnKey: 0
    }
  },
  {
    name: "users", label: "User Mobile", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      }, csvExportKey: "mobile", columnKey: 0
    }
  },
  {
    name: "users", label: "User Type", options: {
      filter: true, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0]?.address}</p>
        )
      }, csvExportKey: "address"
    }
  },
  { name: "idProofno", label: "ID Proof No", options: { filter: true, sort: false } },
  {
    name: "users", label: "Status", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].status}</p>
        );
      }, csvExportKey: "status", columnKey: 0
    }
  },
  { name: "expirydate", label: "Expiry Date", options: { filter: true, sort: false } },
  {
    name: "users", label: "Created By", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      }, csvExportKey: "created_by_name", columnKey: 0
    }
  },
  {
    name: "users", label: "Created On", options: {
      filter: false, sort: false, customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{formatDate(value[0].created)}</p>
        );
      }, csvExportKey: "created", columnKey: 0
    }
  },
];

export const noticeColumn = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "title", label: "Title", options: { filter: false, sort: false } },
  { name: "detail", label: "Details", options: { filter: false, sort: false } },
  { name: "file", label: "Notice FIle", options: { filter: false, sort: false, display: false } },
];
