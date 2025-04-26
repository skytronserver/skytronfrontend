import React, { useEffect, useState } from 'react'
import HomePageService from 'services/HomePage'
import DynamicDatatables from '../../datatables/DynamicDatatables'
import Grid from "@mui/material/Grid"
import { gridSpacing } from "../../store/constant"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

const GpsDataLog = () => {
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
        },
    },
];

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const parseGpsData = (text) => {
        try {
            console.log('Raw data received:', text);
            const dataString = text.data;

            if (!dataString) {
                return [];
            }

            const parsedData = JSON.parse(dataString);
            console.log('Parsed JSON data:', parsedData);

            const transformedData = parsedData.map(item => ({
                id: item.pk,
                timestamp: item.fields.timestamp,
                rawData: item.fields.raw_data,
                gpsDataArray: item.fields.raw_data.split(',')
            }));
            return transformedData;
        } catch (error) {
            console.error('Error parsing GPS data:', error);
            return [];
        }
    }

    const getGpsData = async (search = "") => {
        try {
            setLoading(true);
            const response = await HomePageService.getGpsDataLog({
                search: search
            });
            const parsedData = parseGpsData(response.data);
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
                        tableTitle={t('gpsData.title')}
                        rows={data}
                        columns={gpsDataColumns}
                        options={options}
                    />
                )}
            </Grid>
        </Grid>
    )
}

export default GpsDataLog
