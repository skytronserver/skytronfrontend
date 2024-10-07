import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import  Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from "../../services/UserServices";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { sosListColumn } from "../../datatables/rowsColumn";
import {SOSUsers} from "../../actions/commonDataActions";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
const SOSOtherList = () => {
  const [load, setLoad] = useState(false);
  const [updateStore,setUpdateStore]=useState(false)
  const [sosUser, setSosUser] = useState(""); // here
  const dispatch = useDispatch();
  const sosUsers=useSelector((state)=>state.listAll.sosUser);
  useEffect(() => {
    if(sosUsers.length<1 && !updateStore){
      const retrieveUser = async () => {
        const retriveData = await UserServices.fetchSOSUser();
        setSosUser(retriveData.data);
        dispatch(SOSUsers(retriveData.data))
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
                to={`/user/detail/sosOtherUser/${tableMeta.rowData[0]}`}
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
        <PageHeader title="User List" />
      </Grid>
      <Grid item xs={12}>
        {sosUsers.length >= 1 && (
          <DynamicDatatables
            tableTitle="User List"
            rows={sosUsers}
            columns={sosListColumn.concat(actionColumn)}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SOSOtherList;
