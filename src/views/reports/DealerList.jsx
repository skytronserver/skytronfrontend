import { useDispatch } from "react-redux";
import React from "react";
// project imports
import { Grid } from "@mui/material";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import DealerServices from "services/DealerServices";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { dealerListColumn } from "../../datatables/rowsColumn";

const DealerList = () => {
  const [load, setLoad] = useState(false);

  const [dealerData, setDealerData] = useState(""); // here

  const dispatch = useDispatch();

  useEffect(() => {
    const retrievePosts = async () => {
      const retriveData = await DealerServices.dealerList();
      setDealerData(retriveData.data);
      setLoad(true);
    };
    retrievePosts();
  }, [dispatch]);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Show Dealer" />
      </Grid>
      <Grid item xs={12}>
        {load && dealerData.length > 1 && (
          <DynamicDatatables
            tableTitle="All Device List"
            rows={dealerData}
            columns={dealerListColumn}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DealerList;
