import React, { useEffect, useState } from 'react'
import HomePageService from 'services/HomePage'
import DynamicDatatables from '../../datatables/DynamicDatatables'
import Grid from "@mui/material/Grid"
import { gridSpacing } from "../../store/constant"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'

const gpsDataColumns = [
    {
        name: "timestamp",
        label: "Timestamp",
        options: {
            filter: true,
            sort: true,
        },
    },
    {
        name: "rawData",
        label: "Raw Data",
        options: {
            filter: true,
            sort: false,
        },
    },
];

const EmergencyDataLogs = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const parseGpsData = (data) => {
        try {
            console.log('Raw data received:', data);
            
            if (!data || !Array.isArray(data)) {
                console.error('Invalid data format received');
                return [];
            }

            return data.map(item => ({
                id: item.pk,
                timestamp: item.fields.timestamp,
                rawData: item.fields.raw_data,
                gpsDataArray: item.fields.raw_data.split(',')
            }));
        } catch (error) {
            console.error('Error parsing GPS data:', error);
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
        searchPlaceholder: "Search GPS Data...",
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
                                label="Search by IMEI"
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
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
            <Grid item xs={12}>
                <DynamicDatatables
                    tableTitle="GPS Data Log"
                    rows={data}
                    columns={gpsDataColumns}
                    options={{
                        ...options,
                        loading: loading
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default EmergencyDataLogs
