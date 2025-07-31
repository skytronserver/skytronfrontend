import React from 'react';
// project imports
import Grid from "@mui/material/Grid";
import  Button from "@mui/material/Button"
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

  useEffect(()=>{
    const fetchTaggedList = async () => {
      try {
        const filter = {
          is_tagged: "True",
        };
        const response = await StockServices.stockFilter(filter);
        console.log(response.data.data,'pplplplplp')
        setTagged(response.data.data) 
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
      await TaggingService.cancelTagDevice({device_id:id});
      setReload(prev=>!prev)
     } catch (error) {
      console.log(error)
     }
    }
  }

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{display:'flex'}}>
             <div style={{"marginRight":"5px"}}>
             <Button
                          type="submit"
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(event) => handleUntag(event, tableMeta.rowData[0])}
                        >
                          {t('tagged.untag')}
                        </Button>
             </div>
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
        {load && <DynamicDatatables tableTitle={t('tagged.title')} rows={tagged} columns={columns}/>}
        </Grid>
    </Grid>
  );
}

export default TaggedList;

