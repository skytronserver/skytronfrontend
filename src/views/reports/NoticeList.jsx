import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import  Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import Notice from "../../services/Notice";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { noticeColumn } from "../../datatables/rowsColumn";
import {allNoticeList} from "../../actions/commonDataActions";
import { Link } from "react-router-dom";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from '@mui/icons-material/Delete';
import {openFile} from "../../helper";
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

const docViewStyle={
  padding:"0px"
}
const NoticeList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [updateStore,setUpdateStore]=useState(false)
  const [allNotice, setAllNotice] = useState("");
  const [del,setDel]=useState(false);
  const dispatch = useDispatch();
  const notices=useSelector((state)=>state.listAll.noticeList);
  
  useEffect(() => {
      const retriveNotice = async () => {
        const retriveData = await Notice.list();
        setAllNotice(retriveData.data);
        dispatch(allNoticeList(retriveData.data))
        setLoad(true);
        setUpdateStore(true);
      };
      retriveNotice();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [del]);
  const deleteNotice = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to delete this notice?");
    if (confirmed) {
      try {
        await Notice.remove({ "id": id });
        alert("Notice deleted successfully!");
        setDel(prev=>!prev)
      } catch (error) {
        alert("Error deleting notice!");
      }
    } else {
      alert("Notice deletion canceled.");
    }
  };
  
  const actionColumn = [
    {
        name: "View",
        label: "File",
        options: {
          filter: false,
          customBodyRender: (value, tableMeta) => {
            // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
            return (
              <div className="cellAction" style={{ display: "flex" }}>
                <Button color="primary" 
                // href={`${process.env.REACT_APP_BASE_URL}${tableMeta.rowData[3]}`}
                onClick={(e)=>openFile(e,tableMeta.rowData[3])}
                target="_blank"
                rel="noopener noreferrer"
                >View</Button>
              </div>
            );
          },
        },
      },
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
                to={`/setting/notice/${tableMeta.rowData[0]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton" style={docViewStyle}>
                  <CreateIcon />
                </div>
              </Link>

             
              <Button color="primary" 
              onClick={(e)=>deleteNotice(e,tableMeta.rowData[0])}
                >
                   <DeleteIcon />
                </Button>
            </div>
          );
        },
      },
    },
    
  ];
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title={t('menu.notice')} />
      </Grid>
      <Grid item xs={12}>
        {notices.length >= 1 ? (
          <DynamicDatatables
            tableTitle=""
            rows={notices}
            columns={noticeColumn.concat(actionColumn)}
            helperText="Timestamps are in GMT/UTC."
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {t('common.no_results_found')}
          </div>
        )}
      </Grid>
    </Grid>
  );
};

export default NoticeList;
