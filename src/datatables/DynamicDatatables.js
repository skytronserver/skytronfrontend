import { useState } from "react";
import MUIDataTable from "mui-datatables";
const Datatable = ({ columns, rows,tableTitle }) => {
  const [data, setData] = useState(rows);
  const options = {
    selectableRows: "none",
    viewColumns: false,
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
