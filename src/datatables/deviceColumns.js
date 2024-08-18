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
      name: "id",
      label: "ID",
      options: {
        filter: true,
        sort: false,
        display: false,
      },
    },
    {
      name: "device_esn",
      label: "Device",
      options: {
        filter: true,
        sort: false,
      },
    },
      {
        name: "assigned",
        label: "Assigned Date",
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
        name: "shipping_remark",
        label: "Remarks",
        options: {
          filter: true,
          sort: false,
        },
      },
      {
        name: "stock_status",
        label: "Status",
        options: {
          filter: true,
          sort: false,
        },
      }
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
      name: "ceated_by",
      label: "Requested By",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <p>{value.company_name}</p>
          );
        }
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
          }
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
          }
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
          }
        },
      },
      {
        name: "device",
        label: "Device MSISDN 1",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.msisdn1	}</p>
            );
          }
        },
      },
      {
        name: "device",
        label: "Device MSISDN 2",
        options: {
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.msisdn2}</p>
            );
          }
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
          }
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
            <p>{value[0]?.company_name}</p>
          );
        }
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
    