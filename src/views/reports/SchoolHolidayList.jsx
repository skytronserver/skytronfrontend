import { useDispatch, useSelector } from "react-redux";
import React from "react";
import Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { useEffect, useState } from "react";
import DynamicDatatables from "../../datatables/DynamicDatatables";
import { Link } from "react-router-dom";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

const docViewStyle = {
  padding: "0px"
};

// Dummy data for holidays
const dummyHolidays = [
  {
    id: 1,
    holidayName: "Summer Vacation",
    startDate: "2023-05-15",
    endDate: "2023-06-30",
    description: "Annual summer break for all students",
    holidayType: "school",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 2,
    holidayName: "Diwali",
    startDate: "2023-11-12",
    endDate: "2023-11-14",
    description: "Festival of lights holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 3,
    holidayName: "Christmas",
    startDate: "2023-12-25",
    endDate: "2023-12-26",
    description: "Christmas holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 4,
    holidayName: "Mid-Term Exams",
    startDate: "2023-09-15",
    endDate: "2023-09-20",
    description: "Mid-term examination period",
    holidayType: "exam",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 5,
    holidayName: "Republic Day",
    startDate: "2023-01-26",
    endDate: "2023-01-26",
    description: "National holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 6,
    holidayName: "Winter Break",
    startDate: "2023-12-20",
    endDate: "2023-12-31",
    description: "Winter vacation for all students",
    holidayType: "school",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 7,
    holidayName: "Independence Day",
    startDate: "2023-08-15",
    endDate: "2023-08-15",
    description: "National holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 8,
    holidayName: "Final Exams",
    startDate: "2023-03-10",
    endDate: "2023-03-20",
    description: "Final examination period",
    holidayType: "exam",
    status: "Active",
    createdBy: "admin"
  }
];

const SchoolHolidayList = () => {
  const [load, setLoad] = useState(false);
  const [updateStore, setUpdateStore] = useState(false);
  const [allHolidays, setAllHolidays] = useState([]);
  const [del, setDel] = useState(false);
  const dispatch = useDispatch();
  const holidays = useSelector((state) => state.listAll.holidayList);

  useEffect(() => {
    const retrieveHolidays = async () => {
      try {
        // Using dummy data instead of API call
        setAllHolidays(dummyHolidays);
        // dispatch(allHolidayList(dummyHolidays));
        setLoad(true);
        setUpdateStore(true);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };
    retrieveHolidays();
  }, [del]);

  const deleteHoliday = async (e, id) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to delete this holiday?");
    if (confirmed) {
      try {
        // Simulating API call with dummy data
        const updatedHolidays = dummyHolidays.filter(holiday => holiday.id !== id);
        setAllHolidays(updatedHolidays);
        alert("Holiday deleted successfully!");
        setDel(prev => !prev);
      } catch (error) {
        alert("Error deleting holiday!");
      }
    }
  };

  const holidayColumns = [
    {
      name: "holidayName",
      label: "Holiday Name",
    },
    {
      name: "startDate",
      label: "Start Date",
      options: {
        customBodyRender: (value) => new Date(value).toLocaleDateString(),
      },
    },
    {
      name: "endDate",
      label: "End Date",
      options: {
        customBodyRender: (value) => new Date(value).toLocaleDateString(),
      },
    },
    {
      name: "holidayType",
      label: "Type",
    },
    {
      name: "status",
      label: "Status",
    },
  ];

  const actionColumn = [
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <Link
                to={`/setting/holiday/${tableMeta.rowData[0]}`}
                style={{ textDecoration: "none" }}
              >
                <div className="viewButton" style={docViewStyle}>
                  <CreateIcon />
                </div>
              </Link>
              <Button
                color="primary"
                onClick={(e) => deleteHoliday(e, tableMeta.rowData[0])}
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
        <PageHeader title="School Holidays List" />
      </Grid>
      <Grid item xs={12}>
        {allHolidays.length >= 1 && (
          <DynamicDatatables
            tableTitle=""
            rows={allHolidays}
            columns={holidayColumns.concat(actionColumn)}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SchoolHolidayList; 