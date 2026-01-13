import MUIDataTable from "mui-datatables";
import Typography from '@mui/material/Typography';
const Datatable = ({ columns, rows, tableTitle, options: userOptions, helperText }) => {
  const defaultOptions = {
    selectableRows: "none",
    viewColumns: false,
    responsive: 'vertical',
    tableBodyHeight: 'auto',
    tableBodyMaxHeight: 'auto',
    enableNestedDataAccess: '.',
    downloadOptions: {
      filename: "exported.csv",
      separator: ",",
    },
    onDownload: (buildHead, buildBody, columns, data) => {
      // Dynamically extract specific keys from object values during CSV export
      const modifiedData = data.map(row => {
        const rowData = row.data.map((cell, index) => {
          // Get the column definition to check for 'csvExportKey'
          const column = columns[index];
         
          // Check if the column has a 'csvExportKey' and the cell is an object
          if (typeof cell === 'object' && cell !== null && column?.csvExportKey) {
            if(column?.columnKey!==undefined){              
              return cell[parseInt(column?.columnKey)][column?.csvExportKey]
            }else{
              return cell[column?.csvExportKey];
            }
             // Use the specified key for export
          }
          return cell; // Return non-object values or columns without 'csvExportKey' as is
        });
        return { ...row, data: rowData };
      });
  
      return buildHead(columns) + buildBody(modifiedData);
    },
  };
  
  // Merge the default options with user provided options
  const mergedOptions = { ...defaultOptions, ...userOptions };

  const shouldShowGmtNote = (() => {
    if (!helperText || helperText !== 'Timestamps are in GMT/UTC.') {
      return false;
    }
    if (!Array.isArray(columns) || !columns.some((c) => c?.name === 'timestamp')) {
      return false;
    }

    const timestampCol = columns.find((c) => c?.name === 'timestamp');
    // If the timestamp is being formatted (e.g. toLocaleString), we are not showing raw GMT/UTC
    if (timestampCol?.options?.customBodyRender) {
      return false;
    }
    if (!Array.isArray(rows)) {
      return false;
    }
    // Only show when timestamps look like UTC ISO strings, e.g. 2025-12-31T13:31:34.560Z
    return rows.some((r) => typeof r?.timestamp === 'string' && /Z\s*$/.test(r.timestamp));
  })();

  const normalizedColumns = Array.isArray(columns)
    ? columns.map((col) => {
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
    : columns;
  
  return (
    <div className="datatable" style={{ touchAction: 'manipulation' }}>
      {shouldShowGmtNote && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {helperText}
        </Typography>
      )}
      <MUIDataTable
        title={tableTitle}
        data={rows}
        columns={normalizedColumns}
        options={mergedOptions}
      />
    </div>
  );
};

export default Datatable;
