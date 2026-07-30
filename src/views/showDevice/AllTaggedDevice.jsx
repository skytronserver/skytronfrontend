import React from 'react';
import Grid from "@mui/material/Grid";
import { gridSpacing } from "../../store/constant";
import { useEffect, useState } from 'react';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import TaggingService from '../../services/TaggingService';
import { useTranslation } from 'react-i18next';

const AllTaggedDevice = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [taggedDevices, setTaggedDevices] = useState([]);

  useEffect(() => {
    const fetchTaggedDevices = async () => {
      try {
        const response = await TaggingService.gettaggedDeviceList();
        setTaggedDevices(response.data.data);
        setLoad(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(t('common.noDataFound'));
        } else {
          console.log(t('common.errorOccurred'));
        }
      }
    };
    fetchTaggedDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define columns for the data table
  const columns = [
    {
      name: "device_id",
      label: t('device.deviceId'),
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "vehicle_number",
      label: t('vehicle.vehicleNumber'),
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "owner_name",
      label: t('vehicle.ownerName'),
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "tag_date",
      label: t('tagged.tagDate'),
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "status",
      label: t('common.status'),
      options: {
        filter: true,
        sort: true,
      }
    }
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && (
          <DynamicDatatables 
            tableTitle={t('tagged.allTaggedDevices')} 
            rows={taggedDevices} 
            columns={columns}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default AllTaggedDevice;
