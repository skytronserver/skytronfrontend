import MUIDataTable from "mui-datatables";
const Datatable = ({ columns, rows,tableTitle }) => {
  const options = {
    selectableRows: "none",
    viewColumns: false,
    responsive: 'standard',
    downloadOptions: {
      filename: "exported.csv",
      separator: ",",
      
    },
    // onDownload: (buildHead, buildBody, columns, data) => {
    //   const modifiedData = data.map(row => {
    //     const rowData = row.data.map((cell, index) => {
    //       if (columns[index].name === 'state_info' && typeof cell === 'object') {
    //         return cell.state; 
    //       }
    //       return cell; 
    //     });
    //     return { ...row, data: rowData };
    //   });
    //   return buildHead(columns) + buildBody(modifiedData);
    // },
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
  return (
    <div className="datatable">
      <MUIDataTable
        title={tableTitle}
        data={rows}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default Datatable;
