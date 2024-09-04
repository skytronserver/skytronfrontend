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
