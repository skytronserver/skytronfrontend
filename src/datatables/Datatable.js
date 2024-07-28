import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";

const Datatable = ({ userColumns, userRows, tableTitle }) => {
  const [data, setData] = useState([]);


  useEffect(() => {
    setData(Array.isArray(userRows) ? userRows : []);
  }, [userRows]);
  const options = {
    selectableRows: "none",
    viewColumns: false,
    responsive: 'standard',
  };

  return (
    <div className="datatable">
      <MUIDataTable
        title={tableTitle}
        data={userRows}
        columns={userColumns}
        options={options}
      />
    </div>
  );
};

export default Datatable;
