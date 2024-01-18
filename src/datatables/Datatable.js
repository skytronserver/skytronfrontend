import { Link } from "react-router-dom";
import { useState } from "react";
import MUIDataTable from "mui-datatables";
const Datatable = ({ userColumns, userRows }) => {
  const [data, setData] = useState(userRows);

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction">
              <Link
                to={`/users/test/${tableMeta.rowData[0]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton">View</div>
              </Link>
              <div
                className="deleteButton"
                onClick={() => handleDelete(tableMeta.rowData[0])}
              >
                Delete
              </div>
            </div>
          );
        },
      },
    },
  ];
  const options = {
    filterType: "checkbox",
    viewColumns: false,
  };
  return (
    <div className="datatable">
      <MUIDataTable
        title=""
        data={userRows}
        columns={userColumns.concat(actionColumn)}
        options={options}
      />
    </div>
  );
};

export default Datatable;
