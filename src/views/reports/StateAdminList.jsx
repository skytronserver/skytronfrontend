import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {stateAdminColumn} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from 'react-i18next';
import tableTheme from "../../ui-component/customTableUi";
import { ThemeProvider } from "@mui/material/styles";

const StateAdminList = () => {
  const { t } = useTranslation();
  const [load,setLoad]=useState(false)
  const [stateAdmin,setStateAdmin]=useState([]);
  useEffect(()=>{
    const fetchManufacturerList = async () => {
      try {
        const response = await UserServices.fetchStateAdmin();
        setStateAdmin(response.data) 
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No Data Found");
        } else {
          console.log("No Data Found");
        }
      }
    };
    fetchManufacturerList();
  },[])
  //For actions refer AvailableForSale Component
  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Link
                to={`/user/detail/stateadmin/${tableMeta.rowData[0]}`}
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
          <ThemeProvider theme={tableTheme}>
        {load && <DynamicDatatables tableTitle={t('stateAdmin.listTitle')} rows={stateAdmin} columns={stateAdminColumn.concat(actionColumn)} helperText="Timestamps are in GMT/UTC."/>}
        </ThemeProvider>
        </Grid>
    </Grid>
);
}

export default StateAdminList;

