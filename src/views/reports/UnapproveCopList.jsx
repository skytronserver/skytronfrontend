import { useSelector, useDispatch } from "react-redux";
import React from "react";
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "services/DeviceModelServices";
import { useEffect, useState } from "react";
import { fetchCOPDeviceModels } from "../../actions/deviceModelActions";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { deviceCOPModelColumns } from "../../datatables/rowsColumn";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import MUIDataTable from "mui-datatables";
const UnapproveCopList = () => {
  const [load, setLoad] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const retriveDeviceModel = async () => {
      const retriveData = await DeviceModelServices.getAdminAwaitingCOPModels();
      dispatch(fetchCOPDeviceModels(retriveData.data));
      setLoad(true);
    };
    retriveDeviceModel();
  }, [dispatch]);

  const deviceCOPModelList = useSelector(
    (state) => state.deviceModel.deviceCOPModelList
  );
  

 

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
                to={`/deviceCOPModel/view/${tableMeta.rowData[1]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton">
                  <VisibilityIcon />
                </div>
              </Link>
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
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <div className="datatable">
      <MUIDataTable
        title="Device Model List"
        data={deviceCOPModelList}
        columns={actionColumn.concat(deviceCOPModelColumns)}
        options={options}
      />
    </div>
        )}
      </Grid>
    </Grid>
  );
};

export default UnapproveCopList;
