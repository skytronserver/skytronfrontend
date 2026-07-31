/* eslint-disable no-unused-vars */
import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from "../../services/UserServices";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { dtoListColumn } from "../../datatables/rowsColumn";
import {DTOUserList} from "../../actions/commonDataActions";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from 'react-i18next';

const SOSUserList = () => {
  const { t } = useTranslation();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStore,dispatch]);

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
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
        <PageHeader title={t('dto.listTitle')} />
      </Grid>
      <Grid item xs={12}>
        {dtoUsers.length >= 1 && (
          <DynamicDatatables
            tableTitle={t('dto.listTitle')}
            rows={dtoUsers}
            columns={dtoListColumn.concat(actionColumn)}
            helperText="Timestamps are in GMT/UTC."
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SOSUserList;
