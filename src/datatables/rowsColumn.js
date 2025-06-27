import { display } from "@mui/system";
import {openFile,getRole} from "../helper";
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
const role=getRole();
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
      },
      csvExportKey: "model_name",
      
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
    name: "assigned",
    label: "Status",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value===null?<span style={{color:"red"}}>Not Assigned</span>:<span style={{color:"green"}}>Assigned</span>}</p>
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
      },
      csvExportKey: "company_name",
      columnKey:0,
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
      },
      csvExportKey: "name",
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
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Email",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
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
          <p>{value?.state}</p>
        );
      },
      csvExportKey: "state",
    },
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.company_name}</p>
        );
      },
      csvExportKey: "company_name",
    },
  },
  {
    name: "gstnnumber",
    label: "GST No.",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "idProofno",
    label: "ID Proof Number",
    options: {
      filter: true,
      sort: false,
      display:role === 'superadmin' || role === 'stateadmin'
    },
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    },
  },
];
export const sosListColumn = [
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
    name: "user_type",
    label: "Type",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{user_type?.[value] ?? value}</p>
        );
      },
      csvExportKey: "Type",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      },
      csvExportKey: "name",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Email",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
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
          <p>{value?.state}</p>
        );
      },
      csvExportKey: "state",
    },
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    },
  },
  {
    name: "created",
    label: "Created On",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "expirydate",
    label: "Expiry Date",
    options: {
      filter: true,
      sort: false,
    },
  },
];
export const dtoListColumn = [
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
    name: "district",
    label: "DTO",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "users",
    label: "Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      },
      csvExportKey: "name",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Email",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
    },
  },
  {
    name: "idProofno",
    label: "ID Proof Number",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    },
  },
];
export const emTeamColumns = [
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
    name: "status",
    label: "Status",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "name",
    label: "Team Name",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "state",
    label: "State",
    options: {
      filter: false,
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
    name: "teamlead",
    label: "Team Lead",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{(value.users[0].name).toString()}</p>
        );
      },
    },
  },
  {
    name: "members",
    label: "Team Members",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        const teamMembers=value.map((item)=>{
          return item?.users?.[0].name;
        })
        return (
          <p>{teamMembers.toString()}</p>
        );
      },
    },
  },
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
    name:"created_by_name",
    label:"Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.replace(/_/g, " ")}</p>
        );
      }
    },

  },
  {
    name:"created",
    label:'Created On',
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{new Date(value).toLocaleDateString("en-GB")}</p>
        );
      }
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
    name: "is_active",
    label: "Active Status",
    options: {
      filter: false,
      sort: false,
      display: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value ? "Active" : "Deactivated"}</p>
        );
      }
    },
  }
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
    name: "users",
    label: "Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      },
      csvExportKey: "name",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Email Id",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
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
      },
      csvExportKey: "company_name",
    },  
  },
  {
    name: "state",
    label: "State",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value?.state}</p>
        );
      },
      csvExportKey: "state",
    },
  },
  {
    name: "gstnnumber",
    label: "GSTN No.",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    },
  },
  {
    name: "created",
    label: "Created On",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "expirydate",
    label: "Expiry Date",
    options: {
      filter: true,
      sort: false,
    },
  },
];
export const serviceProviderCol = [
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
    name: "users",
    label: "Email Id",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      },
      csvExportKey: "name",
      columnKey:0,
    },  
  },
  {
    name: "state_info",
    label: "State",
    options: {
      filter: true,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        console.log(value,"value");
        return (
          <p>{value?.state}</p>
        );
      },
      csvExportKey: "state",
    },
  },
  {
    name: "gstnnumber",
    label: "GSTN No.",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    },
  },
  {
    name: "created",
    label: "Created On",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "expirydate",
    label: "Expiry Date",
    options: {
      filter: true,
      sort: false,
    },
  },
];
export const stateAdminColumn = [
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
    name: "users",
    label: "Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      },
      csvExportKey: "name",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Email Id",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    }, 
  },
  {
    name: "created",
    label: "Created On",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "expirydate",
    label: "Expiry Date",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "idProofno",
    label: "ID Proof No",
    options: {
      filter: true,
      sort: false,
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
          <p>{value?.state}</p>
        );
      },
      csvExportKey: "state",
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
    name: "status",
    label: "Status",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "created_by",
    label: "Manufacturer Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value.name}</p>
        );
      },
      csvExportKey: "name",
      
    }, 
  }
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
export const callListColumn=[
  {
    name: "call_id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "Vehicle",
    label: "Vehicle No",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "device_imei",
    label: "Device IMEI",
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
]
export const awaitingOwnerApproval = [
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
    name: "vehicle_reg_no",
    label: "Vehicle Registration No",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "engine_no",
    label: "Engine No",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "chassis_no",
    label: "Chassis No",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "vehicle_make",
    label: "Vehicle Make",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "vehicle_model",
    label: "Vehicle Model",
    options: {
      filter: false,
      sort: false,
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
    name: "rc_file",
    label: "RC File",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <button onClick={(e)=>openFile(e,value)}>View</button>
        );
      }
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
    name: "tagged_by",
    label: "Tagged By",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "tagged",
    label: "Tagged Date",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "device",
    label: "Device",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "vehicle_owner",
    label: "Vehicle Owner",
    options: {
      filter: false,
      sort: false,
    },
  }
];

export const alertListColumn=[
  {
    name: "call_id",
    label: "ID",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
  {
    name: "Vehicle",
    label: "Vehicle No",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "device_imei",
    label: "Device IMEI",
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
export const vehicleOwnerCols = [
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
    name: "users",
    label: "Name",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].name}</p>
        );
      },
      csvExportKey: "name",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Email Id",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].email}</p>
        );
      },
      csvExportKey: "email",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Mobile",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].mobile}</p>
        );
      },
      csvExportKey: "mobile",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "DOB",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].dob}</p>
        );
      },
      csvExportKey: "dob",
      columnKey:0,
    },  
  },
  {
    name: "idProofno",
    label: "ID Proof No",
    options: {
      filter: true,
      sort: false,
    },
  },
  {
    name: "users",
    label: "Status",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].status}</p>
        );
      },
      csvExportKey: "status",
      columnKey:0,
    },  
  },
  {
    name: "users",
    label: "Created By",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{value[0].created_by_name}</p>
        );
      },
      csvExportKey: "created_by_name",
      columnKey:0,
    },
  },
  {
    name: "users",
    label: "Created On",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta, updateValue) => {
        return (
          <p>{formatDate(value[0].created)}</p>
        );
      },
      csvExportKey: "created",
      columnKey:0,
    },
  },
];

export const noticeColumn = [
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
    name: "title",
    label: "Title",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "detail",
    label: "Details",
    options: {
      filter: false,
      sort: false,
    },
  },
  {
    name: "file",
    label: "Notice FIle",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  }
];
