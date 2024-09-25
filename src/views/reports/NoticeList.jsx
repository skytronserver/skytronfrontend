import { useDispatch,useSelector } from "react-redux";
import React from "react";
// project imports
import  Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing,CUSTOM_BASE_URL } from "../../store/constant";
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
const docViewStyle={
  padding:"0px"
}
const NoticeList = () => {
  const [load, setLoad] = useState(false);
  const [updateStore,setUpdateStore]=useState(false)
  const [allNotice, setAllNotice] = useState(""); // here
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
            return (
              <div className="cellAction" style={{ display: "flex" }}>
                <Button color="primary" 
                href={`${CUSTOM_BASE_URL}${tableMeta.rowData[3]}`} 
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
        <PageHeader title="Notice List" />
      </Grid>
      <Grid item xs={12}>
        {notices.length >= 1 && (
          <DynamicDatatables
            tableTitle=""
            rows={notices}
            columns={noticeColumn.concat(actionColumn)}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default NoticeList;
