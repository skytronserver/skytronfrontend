
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

  // const handleDelete = (id) => {
  //   setData(data.filter((item) => item.id !== id));
  // };

  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Link
                to={`/user/view/${tableMeta.rowData[0]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton">
                  <VisibilityIcon />
                </div>
              </Link>
              {/* <div
                className="deleteButton"
                onClick={() => handleDelete(tableMeta.rowData[0])}
                style={{ cursor: "pointer" }}
              >
                <DeleteIcon />
              </div> */}
            </div>
          );
        },
      },
    },
  ];

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
        columns={actionColumn.concat(userColumns)}
        options={options}
      />
    </div>
  );
};

export default Datatable;
