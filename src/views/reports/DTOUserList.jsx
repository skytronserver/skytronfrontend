import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from "services/UserServices";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { dtoListColumn } from "../../datatables/rowsColumn";
import {DTOUserList} from "../../actions/commonDataActions";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
const SOSUserList = () => {
  const [load, setLoad] = useState(false);
  const [updateStore,setUpdateStore]=useState(false)
  const [sosUser, setDTOUser] = useState(""); // here
  const dispatch = useDispatch();
  const dtoUsers=useSelector((state)=>state.listAll.dtoList);
  useEffect(() => {
    if(dtoUsers.length<1 && !updateStore){
      const retrieveUser = async () => {
        const retriveData = await UserServices.fetchDTOList();
        setDTOUser(retriveData.data);
        dispatch(DTOUserList(retriveData.data))
        setLoad(true);
        setUpdateStore(true);
      };
      retrieveUser();
    }
  }, [updateStore,dispatch]);

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
                to={`/user/detail/dtoUser/${tableMeta.rowData[0]}`}
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
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Show DTO List" />
      </Grid>
      <Grid item xs={12}>
        {dtoUsers.length >= 1 && (
          <DynamicDatatables
            tableTitle="DTO List"
            rows={dtoUsers}
            columns={dtoListColumn.concat(actionColumn)}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SOSUserList;
