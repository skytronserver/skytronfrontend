import { Link } from "react-router-dom";
import { useState } from "react";
import MUIDataTable from "mui-datatables";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
const Datatable = ({ userColumns, userRows,tableTitle }) => {
  const [data, setData] = useState(userRows);

  const handleDelete = (id) => {
    console.log(id)
    // setData(data.filter((item) => item.id !== id));
  };

  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{display:'flex'}}>
              <Link
                to={`/user/view/${tableMeta.rowData[1]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton"><VisibilityIcon/></div>
              </Link>
              <div
                className="deleteButton"
                onClick={() => handleDelete(tableMeta.rowData[1])}
                style={{cursor:"pointer"}}
              >
                <DeleteIcon/>
              </div>
            </div>
          );
        },
      },
    },
  ];
  const options = {
    selectableRows: "none",
    viewColumns: false,
  };
  console.log(tableTitle)
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
