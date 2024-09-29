import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import DealerServices from "../../services/DealerServices";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { dealerListColumn } from "../../datatables/rowsColumn";
import {dealerList} from "../../actions/commonDataActions";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getRole } from '../../helper';
const DealerList = () => {
  const [load, setLoad] = useState(false);
  const [updateStore,setUpdateStore]=useState(false)
  const [dealerData, setDealerData] = useState(""); // here
  const dispatch = useDispatch();
  const dealers=useSelector((state)=>state.dealer.list);
  
  const role = getRole();

  useEffect(() => {
    if(dealers.length<1 && !updateStore){
      const retrievePosts = async () => {
        const retriveData = await DealerServices.dealerList();
        setDealerData(retriveData.data);
        dispatch(dealerList(retriveData.data))
        setLoad(true);
        setUpdateStore(true);
      };
      retrievePosts();
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
                to={`/user/detail/dealer/${tableMeta.rowData[0]}`}
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
  const columns = role === 'superadmin' || role === 'stateadmin' 
  ? dealerListColumn.concat(actionColumn) 
  : dealerListColumn;
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Dealer Report" />
      </Grid>
      <Grid item xs={12}>
        {dealers.length >= 1 && (
          <DynamicDatatables
            tableTitle=""
            rows={dealers}
            columns={columns}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DealerList;
