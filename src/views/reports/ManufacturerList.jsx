import React from 'react';
// project imports
import { Grid,Button } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import ManufacturerServices from 'services/ManufacturerServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {manufacturerColumns} from '../../datatables/rowsColumn';
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
const ManufacturerList = () => {
  const [load,setLoad]=useState(false)
  const [manufacturer,setManufacturer]=useState([]);
  useEffect(()=>{
    const fetchManufacturerList = async () => {
      try {
        const response = await ManufacturerServices.findManufacturer();
        setManufacturer(response.data) 
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
        {load && <DynamicDatatables tableTitle="Manufacturer" rows={manufacturer} columns={manufacturerColumns.concat(actionColumn)}/>}
        </Grid>
    </Grid>
);
}

export default ManufacturerList;

