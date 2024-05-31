const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
 
  export const availableForSalesColumn = [
    {
      name: "device",
      label: "ID",
      options: {
        filter: true,
        sort: false,
        display: false,
        customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <p>{value.id}</p>
            );
          }
      },
    },
    {
      name: "device",
      label: "Device",
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
        name: "dealer",
        label: "Dealer",
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
    