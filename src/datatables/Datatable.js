
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

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
