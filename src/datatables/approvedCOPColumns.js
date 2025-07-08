import { formatDate } from '../helper';

export const approvedCOPColumns = [
  { name: "id", label: "ID", options: { filter: false, sort: false, display: false } },
  { name: "cop_no", label: "COP No", options: { filter: true, sort: false } },
  { name: "device_model", label: "Device Model", options: { 
    filter: true, 
    sort: false,
    customBodyRender: (value) => value?.model_name || '-'
  }},
  { name: "manufacturer_name", label: "Manufacturer", options: { filter: true, sort: false } },
  { name: "manufacturer_state", label: "State", options: { filter: true, sort: false } },
  { name: "status", label: "Status", options: { filter: true, sort: false } },
  { name: "created_by_name", label: "Created By", options: { filter: false, sort: false } },
  { name: "created_date", label: "Created On", options: { filter: false, sort: false, customBodyRender: (value) => formatDate(value) } },
  { name: "approved_date", label: "Approved On", options: { filter: false, sort: false, customBodyRender: (value) => formatDate(value) } },
  { name: "cop_file", label: "COP File", options: { 
    filter: false, 
    sort: false,
    customBodyRender: (value) => value ? (
      <button onClick={() => window.open(value, '_blank')}>View</button>
    ) : 'No File'
  }},
]; 