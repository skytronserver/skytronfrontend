import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import Typography from '@mui/material/Typography';

const Datatable = ({ userColumns, userRows, tableTitle, helperText }) => {
  const [data, setData] = useState([]);


  useEffect(() => {
    setData(Array.isArray(userRows) ? userRows : []);
  }, [userRows]);
  const options = {
    selectableRows: "none",
    viewColumns: false,
    responsive: 'standard',
  };

  const shouldShowGmtNote = (() => {
    if (!helperText || helperText !== 'Timestamps are in GMT/UTC.') {
      return false;
    }
    if (!Array.isArray(userColumns) || !userColumns.some((c) => c?.name === 'timestamp')) {
      return false;
    }

    const timestampCol = userColumns.find((c) => c?.name === 'timestamp');
    // If the timestamp is being formatted (e.g. toLocaleString), we are not showing raw GMT/UTC
    if (timestampCol?.options?.customBodyRender) {
      return false;
    }

    if (!Array.isArray(data)) {
      return false;
    }
    // Only show when timestamps look like UTC ISO strings, e.g. 2025-12-31T13:31:34.560Z
    return data.some((r) => typeof r?.timestamp === 'string' && /Z\s*$/.test(r.timestamp));
  })();

  const normalizedColumns = Array.isArray(userColumns)
    ? userColumns.map((col) => {
        if (!shouldShowGmtNote) {
          return col;
        }
        if (col?.name !== 'timestamp') {
          return col;
        }
        const label = col?.label;
        if (typeof label !== 'string') {
          return col;
        }
        if (label.includes('(GMT/UTC)')) {
          return col;
        }
        return {
          ...col,
          label: `${label} (GMT/UTC)`
        };
      })
    : userColumns;

  return (
    <div className="datatable">
      {shouldShowGmtNote && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {helperText}
        </Typography>
      )}
      <MUIDataTable
        title={tableTitle}
        data={data}
        columns={normalizedColumns}
        options={options}
      />
    </div>
  );
};

export default Datatable;
