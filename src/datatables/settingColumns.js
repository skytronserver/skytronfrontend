import { Button } from "@mui/material";

export const ipSettingColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "state_info",
    label: "State",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.state}</p>
        );
      },
      csvExportKey: "state",

    },
  },
  {
    name: "devicemodel_info",
    label: "Device Model",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.model_name}</p>
        );
      },
      csvExportKey: "model_name",

    },
  },
  {
    name: "ip_tracking",
    label: "Tracking IP1",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "ip_tracking2",
    label: "Tracking IP2",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "ip_sos",
    label: "SOS IP",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "port_tracking",
    label: "Tracking Port1",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "port_tracking2",
    label: "Tracking Port2",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "port_sos",
    label: "SOS Port",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "sms_tracking",
    label: "SMS Tracking Port1",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "sms_tracking2",
    label: "SMS Tracking Port2",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "sms_sos",
    label: "SMS Port",
    options: {
      filter: true,
      sort: false,
    },
  },
]

export const frequencyColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "devicemodel_info",
    label: "Device Model",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.model_name}</p>
        );
      },
      csvExportKey: "model_name",
    },
  },
  {
    name: "freq",
    label: "Frequency",
    options: {
      filter: true,
      sort: false,
    },
  },
];

export const otaColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  // {
  //   name: "devicemodel_info",
  //   label: "Device Model",
  //   options: {
  //     filter: true,
  //     sort: false,
  //     customBodyRender: (value, tableMeta, updateValue) => {
  //       return (
  //         <p>{value?.model_name || "N/A"}</p>
  //       );
  //     },
  //     csvExportKey: "model_name",
  //   },
  // },
  {
    name: "command",
    label: "Command",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "triggered_by_info.created_by_name",
    label: "Triggered By",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value) => <p>{value || "N/A"}</p>,
      csvExportKey: "created_by_name",
    },
  },
  {
    name: "active",
    label: "Active",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value ? "Yes" : "No"}</p>
        );
      },
    },
  },

];

export const firmwareColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "devicemodel_info",
    label: "Device Model",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.model_name}</p>
        );
      },
      csvExportKey: "model_name",
    },
  },
  {
    name: "firmware_vertion",
    label: "Firmware Version",
    options: {
      filter: true,
      sort: false,
    },
  },
]
export const stateColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "state",
    label: "Name",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "status",
    label: "Status",
    options: {
      filter: true,
      sort: false,
    },
  },
];
export const districtColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "state",
    label: "State",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        // value is the state object with state_name property
        let stateName = value?.state_name || '-';
        return (
          <p>{stateName}</p>
        );
      },
      csvExportKey: "state_name",
    },
  },
  {
    name: "district_code",
    label: "District Code",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "district",
    label: "District",
    options: {
      filter: true,
      sort: false,
    },
  },
];
export const vehicleColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "category",
    label: "Category",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "maxSpeed",
    label: "Maximum Speed",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "warnSpeed",
    label: "Speed Warning",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "working_hour_start_time",
    label: "Working Start Time",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "working_hour_end_time",
    label: "Working End Time",
    options: {
      filter: true,
      sort: false,
    },
  }
];

export const getVehicleCategoryCodeColumns = (onEdit, onToggleStatus) => [
  {
    name: "id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "category_code",
    label: "Category Code",
    options: {
      filter: true,
      sort: true,
    },
  },
  {
    name: "details",
    label: "Details",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "is_active",
    label: "Status",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value) => {
        return <p style={{ color: value ? "green" : "red" }}>{value ? "Active" : "Inactive"}</p>;
      },
    },
  },
  {
    name: "actions",
    label: "Action",
    options: {
      filter: false,
      sort: false,
      empty: true,
      customBodyRender: (value, tableMeta) => {
        const rowId = parseInt(tableMeta.rowData[0], 10);
        const currentCode = tableMeta.rowData[1];
        const currentDetails = tableMeta.rowData[2];
        const isActive = tableMeta.rowData[3];
        const rowData = { id: rowId, category_code: currentCode, details: currentDetails, is_active: isActive };
        
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="contained" color="primary" size="small" onClick={() => onEdit(rowData)}>Edit</Button>
            <Button variant="contained" color={isActive ? "error" : "success"} size="small" onClick={() => onToggleStatus(rowData)}>
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        );
      }
    },
  }
];

// ---- Permit Condition Columns ----
// onStatusChange(id, currentStatus) is injected by the page component
export const getPermitConditionColumns = (onStatusChange) => [
  {
    name: "id",
    label: "ID",
    options: { filter: false, sort: false, display: false },
  },
  {
    name: "permit_name",
    label: "Permit Name",
    options: { filter: true, sort: true },
  },
  {
    name: "vehicle_category_name",
    label: "Vehicle Type",
    options: { filter: true, sort: false },
  },
  {
    name: "violation_type",
    label: "Violation Type",
    options: { filter: true, sort: false },
  },
  {
    name: "enforcement_rule_details",
    label: "Enforcement Rule",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value) => (
        <span title={value} style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '-'}
        </span>
      ),
    },
  },
  {
    name: "penalty",
    label: "Penalty",
    options: { filter: true, sort: false },
  },
  {
    name: "status",
    label: "Status",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value) => {
        const colorMap = { created: '#1976d2', active: '#2e7d32', deactive: '#c62828' };
        const bgMap   = { created: '#e3f2fd', active: '#e8f5e9', deactive: '#ffebee' };
        return (
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 12,
            color: colorMap[value] || '#555',
            background: bgMap[value] || '#f5f5f5',
            textTransform: 'capitalize',
            letterSpacing: 0.5,
          }}>
            {value || '-'}
          </span>
        );
      },
    },
  },
  {
    name: "created_by_name",
    label: "Created By",
    options: { filter: false, sort: false },
  },
  {
    name: "create_datetime",
    label: "Created At",
    options: {
      filter: false,
      sort: true,
      customBodyRender: (value) => value ? new Date(value).toLocaleString('en-IN') : '-',
    },
  },
  {
    name: "activation_datetime",
    label: "Activated At",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value) => value ? new Date(value).toLocaleString('en-IN') : '-',
    },
  },
  {
    name: "deactivation_datetime",
    label: "Deactivated At",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value) => value ? new Date(value).toLocaleString('en-IN') : '-',
    },
  },
  {
    name: "actions",
    label: "Action",
    options: {
      filter: false,
      sort: false,
      empty: true,
      customBodyRenderLite: (dataIndex, rowIndex) => {
        // This will be provided by the column builder — actual row data
        // accessed via closure; we use a data-attribute approach
        return null; // Placeholder — overridden per-row in the page component
      },
    },
  },
];

