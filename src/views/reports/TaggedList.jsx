import React from 'react';
// project imports
import Grid from "@mui/material/Grid";
import  Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { gridSpacing } from "../../store/constant";
import StockServices from '../../services/StockServices';
import { useEffect,useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import {taggedColumn} from '../../datatables/deviceColumns';
import { getRole } from '../../helper';
import TaggingService from '../../services/TaggingService';
import { useTranslation } from 'react-i18next';

const TaggedList = () => {
  const { t } = useTranslation();
  const [load,setLoad]=useState(false)
  const [reload,setReload]=useState(false);
  const role=getRole();
  const [tagged,setTagged]=useState([]);
  const [rowTagState,setRowTagState]=useState({});
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    deviceTagId: null,
    vehicleRegNo: "",
    newRegistrationNo: "",
    rcFile: null,
    submitting: false,
  });

  useEffect(()=>{
    const fetchTaggedList = async () => {
      try {
        const filter = {
          is_tagged: "True",
        };
        const response = await StockServices.stockFilter(filter);
        console.log(response.data.data,'pplplplplp')
        const filteredData = response.data.data.filter(item => {
          if (item.stock_status === 'Device_Untagged') return true;
          return item.device_tag_info?.status === 'Owner_Final_OTP_Verified';
        });
        setTagged(filteredData) 
        const initialState = {};
        filteredData.forEach((item) => {
          initialState[item.id] = item.stock_status === 'Device_Untagged' ? 'untagged' : 'tagged';
        });
        setRowTagState(initialState);
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(t('common.noDataFound'));
        } else {
          console.log(t('common.noDataFound'));
        }
      }
    };
    fetchTaggedList();
  },[reload])

  const handleUntag=async (e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm(t('tagged.confirmUntag'));
    if (confirmed) {
     console.log(id);
     try {
      await TaggingService.untagDevice({device_id:id});
      setReload(prev=>!prev);
     } catch (error) {
      console.log(error)
     }
    }
  }

  const getDeviceTagIdFromRow = (row) => {
    const candidates = [
      row?.device_tag_info?.id,
      row?.device_tag_info?.device_tag_id,
      row?.device_tag_info?.tag_id,
      row?.device_tag_id,
      row?.tag_id,
      row?.deviceTagId,
    ];
    for (const c of candidates) {
      if (c !== null && c !== undefined && String(c).trim() !== "") return c;
    }
    return null;
  };
  const handleRetag=async (e,id)=>{
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to retag this device?');
    if (confirmed) {
     try {
      await TaggingService.retagDevice({device_id:id});
      setReload(prev=>!prev);
     } catch (error) {
      console.log(error)
     }
    }
  }

  const openUpdateDialog = ({ deviceTagId, vehicleRegNo }) => {
    setUpdateDialog({
      open: true,
      deviceTagId,
      vehicleRegNo: vehicleRegNo || "",
      newRegistrationNo: "",
      rcFile: null,
      submitting: false,
    });
  };

  const closeUpdateDialog = () => {
    setUpdateDialog({
      open: false,
      deviceTagId: null,
      vehicleRegNo: "",
      newRegistrationNo: "",
      rcFile: null,
      submitting: false,
    });
  };

  const handleSubmitUpdate = async () => {
    if (!updateDialog.deviceTagId) return;
    if (!updateDialog.newRegistrationNo) {
      alert("New Registration No is required");
      return;
    }
    if (!updateDialog.rcFile) {
      alert("RC File is required");
      return;
    }

    setUpdateDialog((prev) => ({ ...prev, submitting: true }));
    try {
      await TaggingService.updateTempRegistration({
        device_tag_id: String(updateDialog.deviceTagId),
        new_registration_no: updateDialog.newRegistrationNo,
        rcFile: updateDialog.rcFile,
      });
      closeUpdateDialog();
      setReload((prev) => !prev);
    } catch (error) {
      console.log(error);
      alert("Update failed");
      setUpdateDialog((prev) => ({ ...prev, submitting: false }));
    }
  };
// console.log(response,"oppolo");

  const actionColumn = [
    
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          const row = tagged?.[dataIndex];
          const id = row?.id;
          const vehicleRegNo = row?.device_tag_info?.vehicle_reg_no;
          const deviceTagId = getDeviceTagIdFromRow(row);

          const isTagged = rowTagState?.[id] !== 'untagged';
          const isTmpVehicle =
            typeof vehicleRegNo === "string" &&
            vehicleRegNo.toUpperCase().includes("TMP");

          return (
            <div className="cellAction" style={{display:'flex'}}>
              <div style={{"marginRight":"5px"}}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={(event) => isTagged ? handleUntag(event, id) : handleRetag(event, id)}
                >
                  {isTagged ? t('tagged.untag') : 'Retag'}
                </Button>
              </div>
              {isTagged && isTmpVehicle && deviceTagId && (
                <div style={{ marginRight: "5px" }}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => openUpdateDialog({ deviceTagId, vehicleRegNo })}
                  >
                    Update
                  </Button>
                </div>
              )}
            </div>
          );
        },
      },
    },
  ];
  const columns = role !== 'devicemanufacture' ? taggedColumn.concat(actionColumn) : taggedColumn;

  return (
    <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle={t('tagged.title')} rows={tagged} columns={columns} helperText="Timestamps are in GMT/UTC."/>}
        </Grid>

        <Dialog open={updateDialog.open} onClose={closeUpdateDialog} fullWidth maxWidth="sm">
          <DialogTitle>Update Temp Registration</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              fullWidth
              label="Current Temp Reg No"
              value={updateDialog.vehicleRegNo}
              disabled
            />
            <TextField
              margin="dense"
              fullWidth
              label="New Registration No"
              value={updateDialog.newRegistrationNo}
              onChange={(e) =>
                setUpdateDialog((prev) => ({
                  ...prev,
                  newRegistrationNo: e.target.value.toUpperCase(),
                }))
              }
            />
            <TextField
              margin="dense"
              fullWidth
              type="file"
              inputProps={{ accept: "application/pdf" }}
              onChange={(e) => {
                const file = e?.target?.files?.[0] || null;
                setUpdateDialog((prev) => ({ ...prev, rcFile: file }));
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeUpdateDialog} disabled={updateDialog.submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              variant="contained"
              disabled={updateDialog.submitting}
            >
              {updateDialog.submitting ? "Updating..." : "Update"}
            </Button>
          </DialogActions>
        </Dialog>
    </Grid>
  );
}

export default TaggedList;

