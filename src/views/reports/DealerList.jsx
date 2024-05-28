import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import DealerServices from "services/DealerServices";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { dealerListColumn } from "../../datatables/rowsColumn";
import {dealerList} from "../../actions/commonDataActions";
const DealerList = () => {
  const [load, setLoad] = useState(false);
  const [updateStore,setUpdateStore]=useState(false)
  const [dealerData, setDealerData] = useState(""); // here
  const dispatch = useDispatch();
  const dealers=useSelector((state)=>state.dealer.list);
  useEffect(() => {
    if(dealers.length<1 && !updateStore){
      console.log('Inside useEffect')
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
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Show Dealer" />
      </Grid>
      <Grid item xs={12}>
        {dealers.length >= 1 && (
          <DynamicDatatables
            tableTitle="All Device List"
            rows={dealers}
            columns={dealerListColumn}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DealerList;
