import { formatDate } from '../helper';

export const approvedModelColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "device_model_name", label: "Model Name", options: { filter: true, sort: false } },
  { name: "test_agency", label: "Test Agency", options: { filter: true, sort: false } },
  { name: "vendor_id", label: "Vendor ID", options: { filter: false, sort: false } },
  { name: "tac_no", label: "TAC No", options: { filter: false, sort: false } },
  { name: "tac_validity", label: "TAC Validity", options: { filter: false, sort: false, customBodyRender: (value) => formatDate(value) } },
  { name: "hardware_version", label: "Hardware Version", options: { filter: false, sort: false } },
  { name: "status", label: "Status", options: { filter: true, sort: false } },
  { name: "manufacturer_name", label: "Manufacturer", options: { filter: true, sort: false } },
  { name: "manufacturer_state", label: "State", options: { filter: true, sort: false } },
  { name: "esim_providers", label: "ESIM Providers", options: { 
    filter: true, 
    sort: false,
    customBodyRender: (value) => {
      if (!Array.isArray(value) || value.length === 0) return "No Provider";
      return value.map(provider => provider.company_name).join(", ");
    }
  }},
  { name: "created_by_name", label: "Created By", options: { filter: false, sort: false } },
  { name: "created_date", label: "Created On", options: { filter: false, sort: false, customBodyRender: (value) => formatDate(value) } },
  // { name: "approved_date", label: "Approved On", options: { filter: false, sort: false, customBodyRender: (value) => formatDate(value) } },
]; 