const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
 
  export const availableForSalesColumnForFitment = [
    {
      name: "id",
      label: "ID",
      options: {
        filter: true,
        sort: false,
        display: false,
      },
    },
    {
      name: "esim_provider",
      label: "ID",
      options: {
        filter: true,
        sort: false,
        display: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return value[0]
        }
      },
    },
    {
      name: "device_esn",
      label: "Device ESN",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "imei",
      label: "IMEI No.",
      options: {
        filter: true,
        sort: false,
      },
    },
      {
        name: "iccid",
        label: "ICCID",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "created",
        label: "Created On",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{formatDate(value)}</p>
            );
          }
        },
      },
      {
        name: "esim_validity",
        label: "ESIM Validity",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{formatDate(value)}</p>
            );
          }
        },
      },
      {
        name: "telecom_provider1",
        label: "Telecom Provier",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "telecom_provider2",
        label: "Telecom Provider",
        options: {
          filter: true,
          sort: false,
        },
      }
  ];
  export const availableForSalesColumn = [
    {
      name: "device_esn",
      label: "Device ESN",
      options: { filter: true, sort: false },
    },
    {
      name: "imei",
      label: "IMEI No.",
      options: { filter: true, sort: false },
    },
    {
      name: "iccid",
      label: "ICCID",
      options: { filter: true, sort: false },
    },
    {
      name: "msisdn1",
      label: "PRIMARY MSISDN",
      options: { filter: true, sort: false },
    },
    {
      name: "msisdn2",
      label: "Fallback MSISDN",
      options: { filter: true, sort: false },
    },
    {
      name: "telecom_provider1",
      label: "Telecom Provider 1",
      options: { filter: true, sort: false },
    },
    {
      name: "telecom_provider2",
      label: "Telecom Provider 2",
      options: { filter: true, sort: false },
    },
    {
      name: "esim_provider",
      label: "ESIM Provider",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => <p>{Array.isArray(value) ? value.join(", ") : value}</p>,
      },
    },
    {
      name: "esim_status",
      label: "ESIM Status",
      options: { filter: true, sort: false },
    },
    {
      name: "esim_validity",
      label: "ESIM Validity",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => <p>{value ? formatDate(value) : ""}</p>,
      },
    },
    {
      name: "imsi1",
      label: "PRIMARY IMSI",
      options: { filter: true, sort: false },
    },
    
    {
      name: "imsi2",
      label: "FALLBACK IMSI",
      options: { filter: true, sort: false },
    },
    {
      name: "model",
      label: "Model",
      options: { filter: true, sort: false },
    },
    {
      name: "stock_status",
      label: "Stock Status",
      options: { filter: true, sort: false },
    },
    {
      name: "assigned",
      label: "Assigned Date",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => <p>{value ? formatDate(value) : ""}</p>,
      },
    },
    {
      name: "assigned_by",
      label: "Assigned By",
      options: { filter: true, sort: false },
    },
    {
      name: "created",
      label: "Created Date",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => <p>{value ? formatDate(value) : ""}</p>,
      },
    },
    {
      name: "created_by",
      label: "Created By",
      options: { filter: true, sort: false },
    },
    {
      name: "dealer",
      label: "Dealer",
      options: { filter: true, sort: false },
    },
    {
      name: "remarks",
      label: "Remarks",
      options: { filter: true, sort: false },
    },
    {
      name: "shipping_remark",
      label: "Shipping Remark",
      options: { filter: true, sort: false },
    },
    {
      name: "id",
      label: "ID",
      options: { filter: false, sort: false, display: false },
    },
  ];
  export const requestList = [
    {
      name: "id",
      label: "ID",
      options: {
        filter: true,
        sort: false,
        display: false,
      },
    },
      {
        name: "device",
        label: "Device IMEI No.",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.imei}</p>
            );
          },
          csvExportKey: "imei",
      
        },
      },
      {
        name: "device",
        label: "Device ESN",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.device_esn}</p>
            );
          },
          csvExportKey: "device_esn",
        },
      },
      {
        name: "device",
        label: "Device ICCID",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.iccid}</p>
            );
          },
          csvExportKey: "iccid",
      
        },
      },
      {
        name: "device",
        label: "Device Primary MSISDN",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.msisdn1	}</p>
            );
          },
          csvExportKey: "msisdn1",
      
        },
      },
      {
        name: "device",
        label: "Device Fallback MSISDN",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.msisdn2}</p>
            );
          },
          csvExportKey: "msisdn2",
      
        },
      },
      {
        name: "device",
        label: "Validity",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{formatDate(value.esim_validity)}</p>
            );
          },
          csvExportKey: "esim_validity",
      
        },
      },
      {
        name: "device",
        label: "Telecom Provider",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.telecom_provider1}</p>
            );
          },
          csvExportKey: "telecom_provider1",
      
        },
      },
      {
        name: "whitelisted_phone_numbers.scn2",
        label: "Whitelisted Number 1",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value) => <p>{value || "-"}</p>,
          csvExportKey: "scn2",
        },
      },
      {
        name: "whitelisted_phone_numbers.escn",
        label: "Whitelisted Number 2",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value) => <p>{value || "-"}</p>,
          csvExportKey: "escn",
        },
      },
      {
        name: "whitelisted_ips.eip",
        label: "Whitelisted IP 1",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value) => <p>{value || "-"}</p>,
          csvExportKey: "eip",
        },
      },
      {
        name: "whitelisted_ips.pip",
        label: "Whitelisted IP 2",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value) => <p>{value || "-"}</p>,
          csvExportKey: "pip",
        },
      },
      {
        name: "ceated_by",
        label: "Requested By",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.company_name}</p>
            );
          },
          csvExportKey: "company_name",
        
        },
      },
        {
          name: "created_at",
          label: "Requested On",
          options: {
            filter: true,
            sort: false,
            customBodyRender: (value, tableMeta, updateValue) => {
              return (
                <p>{formatDate(value)}</p>
              );
            }
          },
        },
  ];
  // export const availableForSalesColumn = [
  //   {
  //     name: "device",
  //     label: "ID",
  //     options: {
  //       filter: true,
  //       sort: false,
  //       display: false,
  //       customBodyRender: (value, tableMeta, updateValue) => {
  //           return (
  //             <p>{value.id}</p>
  //           );
  //         }
  //     },
  //   },
  //   {
  //     name: "device",
  //     label: "Device",
  //     options: {
  //       filter: true,
  //       sort: false,
  //       customBodyRender: (value, tableMeta, updateValue) => {
  //           return (
  //             <p>{value.device_esn}</p>
  //           );
  //         }
  //     },
  //   },
  //   {
  //       name: "dealer",
  //       label: "Dealer",
  //       options: {
  //         filter: true,
  //         sort: false,
  //         customBodyRender: (value, tableMeta, updateValue) => {
  //           return (
  //             <p>{value.company_name}</p>
  //           );
  //         }
  //       },
  //     },
  //     {
  //       name: "assigned",
  //       label: "Assigned Date",
  //       options: {
  //         filter: true,
  //         sort: false,
  //         customBodyRender: (value, tableMeta, updateValue) => {
  //           return (
  //             <p>{formatDate(value)}</p>
  //           );
  //         }
  //       },
  //     },
  //     {
  //       name: "shipping_remark",
  //       label: "Remarks",
  //       options: {
  //         filter: true,
  //         sort: false,
  //       },
  //     },
  //     {
  //       name: "stock_status",
  //       label: "Status",
  //       options: {
  //         filter: true,
  //         sort: false,
  //       },
  //     }
  // ];


  export const taggedColumn = [
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
      name: "device_esn",
      label: "ESN",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "imei",
      label: "IMEI",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "esim_provider",
      label: "ESIM Provider",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <p>{Array.isArray(value) && value[0] ? value[0].company_name : ''}</p>
          );
        },
        csvExportKey: "company_name",
        columnKey:0,
      },
    },
    {
      name: "esim_validity",
      label: "ESIM Validity",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <p>{formatDate(value)}</p>
          );
        }
      },
    },
  ];

export const esimStatusColumns = [
  {
    name: "device_esn",
    label: "ESN",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "imei",
    label: "IMEI",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "device_model",
    label: "Model",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => value?.model_name || 'N/A'
    }
  },
  {
    name: "esim_status",
    label: "Status",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'ESIM_Active_Confirmed':
              return '#4caf50';
            case 'expired':
              return '#f44336';
            case 'expiring_soon':
              return '#ff9800';
            default:
              return '#757575';
          }
        };

        return (
          <div style={{
            backgroundColor: getStatusColor(value),
            padding: '6px 12px',
            borderRadius: '16px',
            color: 'white',
            fontSize: '0.75rem'
          }}>
            {value}
          </div>
        );
      }
    }
  },
  {
    name: "esim_validity",
    label: "Validity",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => {
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    }
  },
  {
    name: "days_until_expiry",
    label: "Days Until Expiry",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "telecom_provider1",
    label: "Telecom Provider 1",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "telecom_provider2",
    label: "Telecom Provider 2",
    options: {
      filter: true,
      sort: true,
    }
  }
];
    
    