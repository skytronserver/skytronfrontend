 
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const showDeviceColumns = [
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
    name: "model",
    label: "Model",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.model_name}</p>
        );
      }
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
    name: "iccid",
    label: "ICCID",
    options: {
      filter: false,
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
    name: "telecom_provider1",
    label: "Telecom 1",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "telecom_provider2",
    label: "Telecom 2",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "msisdn1",
    label: "MSISDN 1",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "msisdn2",
    label: "MSISDN 2",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "imsi1",
    label: "IMSI 1",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "imsi2",
    label: "IMSI 2",
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
  {
    name: "esim_provider",
    label: "ESIM Provider",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "remarks",
    label: "Remarks",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "created",
    label: "Created",
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
  {
    name: "created_by",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.name}</p>
        );
      }
    },
  },
];

export const dealerListColumn = [
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
    name: "company_name",
    label: "Company Name",
    options: {
      filter: true,
      sort: false,
    },
  }
];

export const columns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: true,
      sort: true,
      display: false,
    },
  },
  {
    name: "title",
    label: "Title",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "body",
    label: "Body",
    options: {
      filter: true,
      sort: false,
    },
  },
];

export const registeredUserColumns = [
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
    name: "role",
    label: "Role",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "name",
    label: "Name",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "email",
    label: "Email",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "mobile",
    label: "Mobile No",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "address",
    label: "Address",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "companyName",
    label: "Company Name",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "stateid",
    label: "State Code",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "status",
    label: "Status",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "createdby",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
    },
  },
];



export const manufacturerColumns = [
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
    name: "company_name",
    label: "Company Name",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "email",
    label: "Email",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "mobile",
    label: "<b>Mobile No</b>",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "role",
    label: "Role",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "address",
    label: "Address",
    options: {
      filter: false,
      sort: false,
    },
  },
];

export const userColumns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: true,
      sort: true,
      display: false,
    },
  },
  {
    name: "name",
    label: "Name",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "username",
    label: "Username",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "email",
    label: "Email",
    options: {
      filter: true,
      sort: false,
    },
  },
];
export const deviceModelColumns = [
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
    name: "model_name",
    label: "Model",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "test_agency",
    label: "Test Agency",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "vendor_id",
    label: "Vendor",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "tac_no",
    label: "Tac No",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "tac_validity",
    label: "TAC Validity",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "hardware_version",
    label: "Hardware Version",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "tac_doc_path",
    label: "TAC File",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "status",
    label: "Status",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "created_by",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
    },
  },
];
export const deviceCOPModelColumns = [
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
    name: "cop_no",
    label: "COP No",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "cop_file",
    label: "COP File",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "created_by",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "device_model",
    label: "Device Model",
    options: {
      filter: false,
      sort: false,
    },
  }
];
