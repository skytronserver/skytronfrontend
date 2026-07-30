import React from 'react';
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {serviceProviderCol} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from 'react-i18next';

const M2MProviderList = () => {
  const { t } = useTranslation();
  const [load,setLoad]=useState(false)
  const [serviceProvider,setServiceProvider]=useState([]);
  
  useEffect(()=>{
    const fetchServiceProvider = async () => {
      try {
        const response = await UserServices.fetchSimProvider();
        setServiceProvider(response.data) 
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(t('common.noDataFound'));
        } else {
          console.log(t('common.noDataFound'));
        }
      }
    };
    fetchServiceProvider();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

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
                to={`/user/detail/serviceProvider/${tableMeta.rowData[0]}`}
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
        {load && <DynamicDatatables tableTitle={t('esim.serviceProviderTitle')} rows={serviceProvider} columns={serviceProviderCol.concat(actionColumn)} helperText="Timestamps are in GMT/UTC."/>}
        </Grid>
    </Grid>
  );
}

export default M2MProviderList;

