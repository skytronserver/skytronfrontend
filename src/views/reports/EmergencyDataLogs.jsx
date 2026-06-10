import React, { useEffect, useState } from 'react'
import HomePageService from 'services/HomePage'
import DynamicDatatables from '../../datatables/DynamicDatatables'
import Grid from "@mui/material/Grid"
import { gridSpacing } from "../../store/constant"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

const EmergencyDataLogs = () => {
    const { t } = useTranslation();
const gpsDataColumns = [
    {
        name: "timestamp",
            label: t('common.timestamp'),
        options: {
            filter: true,
            sort: true,
        },
    },
    {
        name: "rawData",
            label: t('gpsData.rawData'),
        options: {
            filter: true,
            sort: false,
            setCellProps: () => ({ style: { wordBreak: 'break-all', minWidth: '300px' } })
        },
    },
];

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const parseGpsData = (response) => {
        try {
            console.log('Raw data received:', response);
            
            if (!response?.data?.data) {
                return [];
            }

            // Parse the nested data string
            const parsedData = JSON.parse(response.data.data);
            console.log('Parsed data:', parsedData);

            return parsedData.map(item => ({
                id: item.pk,
                timestamp: item.fields.timestamp,
                rawData: item.fields.raw_data,
                gpsDataArray: item.fields.raw_data.split(',')
            }));
        } catch (error) {
            console.error('Error parsing GPS data:', error);
            console.error('Response structure:', response);
            return [];
        }
    }

    const getGpsData = async (search = "") => {
        try {
            setLoading(true);
            const response = await HomePageService.getEmergencyDataLogs({
                search: search
            });
            console.log('API Response:', response);
            const parsedData = parseGpsData(response);
            setData(parsedData);
        } catch (error) {
            console.error('Error fetching GPS data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }
    const handleSearch = (event) => {
        event.preventDefault();
        getGpsData(searchQuery);
    };
    useEffect(() => {
        getGpsData();
    }, []);

    const options = {
        search: false,
        searchPlaceholder: t('gpsData.searchPlaceholder'),
        serverSide: true,
        filter: false,
        sort: false,
        selectableRows: 'none'
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <form onSubmit={handleSearch}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={t('gpsData.searchByImei')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                            >
                                {t('common.search')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
            <Grid item xs={12}>
                {!loading && (
                    <DynamicDatatables
                        tableTitle={t('emergencyData.title')}
                        rows={data}
                        columns={gpsDataColumns}
                        options={options}
                        helperText="Timestamps are in GMT/UTC."
                    />
                )}
            </Grid>
        </Grid>
    )
}

export default EmergencyDataLogs
