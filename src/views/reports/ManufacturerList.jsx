import React from 'react';
// project imports
import { Grid } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import ManufacturerServices from '../../services/ManufacturerServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {manufacturerColumns} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from 'react-i18next';

const ManufacturerList = () => {
  const { t } = useTranslation();
  const [load,setLoad]=useState(false)
  const [manufacturer,setManufacturer]=useState([]);
  useEffect(()=>{
    const fetchManufacturerList = async () => {
      try {
        const response = await ManufacturerServices.findManufacturer();
        const apiData = response && response.data ? response.data : [];
        const mappedData = (Array.isArray(apiData) ? apiData : []).map(row => ({
          ...row,
          tac_no: row.tac_no || row.tac || "",
          model_name: row.model_name || row.device_model_details || "",
          esim_provider: row.esim_provider || row.eSimProviders || row.esimProvider || []
        }));
        setManufacturer(mappedData);
        setLoad(true);
      } catch (error) {
        console.log("Error fetching manufacturers:", error);
        setManufacturer([]);
        setLoad(true);
      }
    };
    fetchManufacturerList();
  }, [])
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
                to={`/user/detail/manufacturer/${tableMeta.rowData[0]}`}
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
        {load && <DynamicDatatables tableTitle={t('manufacturer.listTitle')} rows={manufacturer} columns={manufacturerColumns.concat(actionColumn)} helperText="Timestamps are in GMT/UTC."/>}
        </Grid>
    </Grid>
);
}

export default ManufacturerList;

