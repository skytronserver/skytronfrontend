export const ipSettingColumns=[
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
    label: "Tracking IP",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "ip_tracking2",
    label: "Tracking IP",
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
    label: "Tracking Port",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "port_tracking2",
    label: "Tracking Port",
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
    label: "SMS Tracking Port",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "sms_tracking2",
    label: "SMS Tracking Port",
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

export const frequencyColumns=[
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

export const otaColumns=[
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
          <p>{value?.model_name || "N/A"}</p>
        );
      },
      csvExportKey: "model_name",
    },
  },
  {
    name: "command",
    label: "Command",
    options: {
      filter: true,
      sort: false,
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

export const firmwareColumns=[
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
export const stateColumns=[
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
export const districtColumns=[
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
          let stateName = value.state;
          return (
            <p>{stateName}</p>
          );
        },
        csvExportKey: "state",
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
    {
      name: "status",
      label: "Status",
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
    }
  ];
  